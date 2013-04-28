define(["dojo/_base/array", "dojo/_base/lang", "dojo/html", "dojo/dom", "dojo/dom-attr", "dojo/dom-style", "dojo/dom-class", "dojo/io-query", "dojo/on", "game/util", "game/imageLoader", "dojo/query", "dojobootstrap/Modal"], 
	function(array, lang, html, dom, attr, style, domClass, ioQuery, on, util, imageLoader, query) {

	var _gifHolderId = "image-holder";
	var _answerIds = ["answer-a", "answer-b", "answer-c"];
	var _answersId = "answers";
	var _skipId = "skip";
	var _scoreId = "score";
	var _loadingId = "loading";
	var _loadedId = "loaded";
	var _mainId = "main";
	var _errorId = "error";
	var _footerId = "footer";
	var _subredditInputId = "subreddit-input";
	var _subredditModalId = "subreddit-modal";
	var _subredditButtonId = "subreddit-button";
	var _previouslyId = "previously";
	var _nowShowingId = "now-showing";
	var _correct = null;
	var _numCorrect = 0;
	var _numTotal = 0;
	var _haveAnswered = false;
	var _isLoading = true;
	var _answerDelay = 1500;
	var _curImage = null;
	var _prevImage = null;
	var _imageLoadDelay = 500;

	return {
		init: function() {
			var search = window.location.search;
			var query = search.substring(1, search.length);
			query = ioQuery.queryToObject(query);

			if (query && query.subreddit) {
				imageLoader.setSubreddit(query.subreddit);
				html.set(dom.byId(_nowShowingId), 'Now showing: <a href="http://www.reddit.com/r/' + query.subreddit + '" target="_blank">r/' + query.subreddit + '</a>');
			}

			this.updateImage();

			var controller = this;

			// Skip link
			on(dom.byId(_skipId), "click", function() {
				controller.updateImage();
			});

			// Answer buttons
			on(dom.byId(_answersId), ".answer:click", function() {
				lang.hitch(controller, controller.answer(this));
			});

			// Show page when the image has finished loading
			on(dom.byId(_gifHolderId), "load", function() {
				lang.hitch(controller, controller.imageLoaded());
			});

			// Focus on subreddit name input when modal is shown
			on(dom.byId(_subredditModalId), "shown", function(e) {
				dom.byId(_subredditInputId).focus();
			});

			// Change subreddit when button is clicked
			on(dom.byId(_subredditButtonId), "click", controller.changeSubreddit);

			// Change subreddit when enter is pressed
			on(dom.byId(_subredditInputId), "keypress", function(e) {
				if (e.keyCode == 13) { // Enter
					controller.changeSubreddit();
				}
			});
		},

		changeSubreddit: function() {
			var subreddit = dom.byId(_subredditInputId).value
			if (subreddit) {
				var baseurl = window.location.protocol + "//" + window.location.host;
				var forwardurl = baseurl + "/?subreddit=" + subreddit;
				window.location = forwardurl;
			}
		},

		updateImage: function() {
			this._setLoading(true);

			array.forEach(_answerIds, function(id) {
				domClass.remove(id, "btn-success btn-danger");
				domClass.add(id, "btn-primary");
			});

			if (imageLoader == null) {
				return;
			}

			_prevImage = _curImage;
			_curImage = imageLoader.getNextImage();
			var controller = this;
			if (_curImage == null) {
				// Keep trying until _curImage is set
				setTimeout(function() { controller.updateImage(imageLoader); }, _imageLoadDelay);
				return;
			}

			if (!imageLoader.imageOk(_curImage)) {
				this._setFailed();
			}
			else {
				attr.set(_gifHolderId, "src", _curImage.url);

				_correct = null;
				_haveAnswered = false;
				array.forEach(_answerIds, function(id){
					this._setCaption(id, _curImage);
				}, this);

				if (_prevImage) {
					html.set(dom.byId(_previouslyId), '<em><small>Previously: <a target="_blank" href="' + _prevImage.redditUrl + '">' + _prevImage.correct + '</a></em></small>');
				}
			}
		},

		answer: function(div) {
			if (_haveAnswered) {
				return;
			}

			_haveAnswered = true;
			_numTotal++;

			if (div.id == _correct) {
				_numCorrect++;
			}

			array.forEach(_answerIds, function(id) {
				domClass.remove(id, "btn-primary");
				domClass.add(id, id == _correct ? "btn-success" : "btn-danger");
			});

			html.set(dom.byId(_scoreId), "<strong>Score: " + _numCorrect + "/" + _numTotal + "</strong>");

			var controller = this;
			setTimeout(function() { controller.updateImage(); }, _answerDelay);
		},

		imageLoaded: function(div) {
			this._setLoading(false);
		},

		_setFailed: function() {
			this._setLoading(false);
			style.set(_mainId, { display: "none" });
			style.set(_errorId, { display: "block" });
		},

		_setLoading: function(loading) {
			if ((loading && _isLoading) || (!loading && !_isLoading)) {
				return;
			}

			style.set(_loadingId, { display: (loading ? "block" : "none") });
			style.set(_loadedId, { display: (loading ? "none" : "block") });
			style.set(_footerId, { display: (loading ? "none" : "block") });

			_isLoading = loading;
		},

		_setCaption: function(id, image) {
			var caption = util.spliceRandom(image.captions);
			if (caption == image.correct) {
				_correct = id
			}
			html.set(dom.byId(id), caption);
		}
	};
});