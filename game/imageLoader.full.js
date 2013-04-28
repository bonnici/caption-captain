define(["dojo/_base/array", "game/util", "dojo/request/script", "dojo/promise/all"], 
	function(array, util, script, all) {


	var _images = []; // List of unseen images and their caption
	var _captions = []; // List of all captions from the most recent load
	var _numAnswers = 3;
	var _nextImage = null;
	var _imagesLoading = false;
	var _subreddit = "reactiongifs";
	var _jsonpTimeoutMS = 15000;
	var _loadFailed = "failed";

	return {

		setSubreddit: function(subreddit) {
			_subreddit = subreddit;
		},

		// Callers must check for null and set timer to wait until it returns non-null
		getNextImage: function() {
			if (_imagesLoading) {
				return null;
			}
			else if (_nextImage == null) {
				this._loadImages();
				return null;
			}
			else {
				var image = _nextImage;
				this._prepareNextImage();
				return image;
			}
		},

		imageOk: function(image) {
			return image != _loadFailed;
		},

		_prepareNextImage: function() {
			if (_imagesLoading) {
				return;
			}
			if (_images.length == 0) {
				_nextImage = null;
				this._loadImages();
			}
			else {
				_nextImage = this._extractRandomImage();
			}
		},

		// Asynchronous load, sets _nextImage when loaded, sets it to "failed" when failed
		_loadImages: function() {
			if (_imagesLoading) {
				return;
			}

			_imagesLoading = true;

			_images = [];
			_captions = [];

			var urlPrefix = "http://www.reddit.com/r/" + _subreddit + "/";

			var defs = [
				this._getDataFromReddit(urlPrefix + ".json"),
				this._getDataFromReddit(urlPrefix + "new.json"),
				this._getDataFromReddit(urlPrefix + "top.json", "top", "day"),
				this._getDataFromReddit(urlPrefix + "top.json", "top", "hour"),
				this._getDataFromReddit(urlPrefix + "top.json", "top", "week")
			];

			var loader = this;
			all(defs).then(function(results){

				array.forEach(results, function(links) {
					array.forEach(links, function(link) {
						if (loader._isGoodLink(link)) {
							if (array.indexOf(_captions, link.data.title) == -1) {
								_images.push({ url: link.data.url, caption: link.data.title, redditUrl: "http://reddit.com/" + link.data.permalink});
								_captions.push(link.data.title);
							}
						}
					});
				});

				_nextImage = loader._extractRandomImage();

				if (!_nextImage) {
					_nextImage = _loadFailed;
				}

				//console.log(["finished loading ", _images, _captions, _nextImage]);
				_imagesLoading = false;
			});

		},

		_extractRandomImage: function() {
			if (_images.length == 0 || _captions.length < _numAnswers) {
				return null;
			}

			var image = util.spliceRandom(_images);
			var captions = this._getRandomCaptions(_numAnswers, image.caption);

			return { url: image.url, correct: image.caption, redditUrl: image.redditUrl, captions: captions };
		},

		_getRandomCaptions: function(amount, include) {
			var captions = [include];
			while (captions.length < amount) {
				var index = util.randomIndex(_captions);
				var caption = _captions[index];

				// If not already in list of captions 
				if (array.indexOf(captions, caption) == -1) {
					captions.push(caption);
				}
			}
			return captions;
		},

		_getDataFromReddit: function(url, sort, t) {
			//console.log(["_getDataFromReddit ", url, sort, t]);

			var query = { limit: "100" };
			if (sort != null) {
				query.sort = sort;
			}
			if (t != null) {
				query.t = t;
			}

			return script.get(url, {
				jsonp: "jsonp",
				query: query,
				timeout: _jsonpTimeoutMS
			}).then(function(response) {
				//console.log(["Got response", url, sort, t, response]);
				return response.data.children;
			}, function(err) {
				//console.log(["Error getting response", url, sort, t, err]);
				return [];
			});
		},

		/*
		tests: function() {
			console.log(["jpg", this._isGoodLink({data: { url: "x.jpg", title: "x", score: 5 }})]);
			console.log(["jpeg", this._isGoodLink({data: { url: "x.jpeg", title: "x", score: 5 }})]);
			console.log(["png", this._isGoodLink({data: { url: "x.png", title: "x", score: 5 }})]);
			console.log(["gif", this._isGoodLink({data: { url: "x.gif", title: "x", score: 5 }})]);
			console.log(["bmp", this._isGoodLink({data: { url: "x.bmp", title: "x", score: 5 }})]);
			console.log(["tiff", this._isGoodLink({data: { url: "x.tiff", title: "x", score: 5 }})]);
			console.log(["tif", this._isGoodLink({data: { url: "x.tif", title: "x", score: 5 }})]);
			console.log(["JPG", this._isGoodLink({data: { url: "x.JPG", title: "x", score: 5 }})]);
			console.log(["jpgx", this._isGoodLink({data: { url: "x.jpgx", title: "x", score: 5 }})]);
			console.log(["http://imgur.com/kNc0K", this._isGoodLink({data: { url: "http://imgur.com/kNc0K", title: "x", score: 5 }})]);
			console.log(["http://i.imgur.com/kNc0K.gif", this._isGoodLink({data: { url: "http://i.imgur.com/kNc0K.gif", title: "x", score: 5 }})]);
		},
		*/

		_isGoodLink: function(link) {
			if (!link || !link.data || !link.data.url || !link.data.title || !link.data.score) {
				return false;
			}

			// check score - possibly expand this later
			if (link.data.score <= 1) {
				return false;
			}

			// Stolen from RES
			var hashRe = /^https?:\/\/(?:[i.]|[edge.]|[www.])*imgur.com\/(?:r\/[\w]+\/)?([\w]{5,}(?:[&,][\w]{5,})?)(\.[\w]{3,4})?(?:#(\d*))?(?:\?(?:\d*))?$/i;
			var href = link.data.url.split('?')[0];
			var groups = hashRe.exec(href);
			if (groups && groups[1].search(/[&,]/) <= -1 && !groups[2]) {
				var oldUrl = link.data.url;
				link.data.url = 'http://i.imgur.com/'+groups[1]+'.jpg';
				return true;
			}

			if (/.jpe?g$/.test(link.data.url.toLowerCase()) ||
				/.png$/.test(link.data.url.toLowerCase()) ||
				/.gif$/.test(link.data.url.toLowerCase()) ||
				/.bmp$/.test(link.data.url.toLowerCase()) ||
				/.tiff?$/.test(link.data.url.toLowerCase())) {
				return true;
			}

			return false;
		}
	};
});