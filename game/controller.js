define("dojo/_base/array dojo/_base/lang dojo/html dojo/dom dojo/dom-attr dojo/dom-style dojo/dom-class dojo/io-query dojo/on game/util game/imageLoader dojo/query dojobootstrap/Modal".split(" "),function(l,q,h,b,t,f,i,u,d,v,g){var m=["answer-a","answer-b","answer-c"],j=null,r=0,s=0,n=!1,p=!0,e=null,k=null;return{init:function(){var a=window.location.search,a=a.substring(1,a.length);if((a=u.queryToObject(a))&&a.subreddit)g.setSubreddit(a.subreddit),h.set(b.byId("now-showing"),'Now showing: <a href="http://www.reddit.com/r/'+
a.subreddit+'" target="_blank">r/'+a.subreddit+"</a>");this.updateImage();var c=this;d(b.byId("skip"),"click",function(){c.updateImage()});d(b.byId("answers"),".answer:click",function(){q.hitch(c,c.answer(this))});d(b.byId("image-holder"),"load",function(){q.hitch(c,c.imageLoaded())});d(b.byId("subreddit-modal"),"shown",function(){b.byId("subreddit-input").focus()});d(b.byId("subreddit-button"),"click",c.changeSubreddit);d(b.byId("subreddit-input"),"keypress",function(a){13==a.keyCode&&c.changeSubreddit()})},
changeSubreddit:function(){var a=b.byId("subreddit-input").value;a&&(window.location=window.location.protocol+"//"+window.location.host+"/?subreddit="+a)},updateImage:function(){this._setLoading(!0);l.forEach(m,function(a){i.remove(a,"btn-success btn-danger");i.add(a,"btn-primary")});if(null!=g){k=e;e=g.getNextImage();var a=this;null==e?setTimeout(function(){a.updateImage(g)},500):g.imageOk(e)?(t.set("image-holder","src",e.url),j=null,n=!1,l.forEach(m,function(a){this._setCaption(a,e)},this),k&&h.set(b.byId("previously"),
'<em><small>Previously: <a target="_blank" href="'+k.redditUrl+'">'+k.correct+"</a></em></small>")):this._setFailed()}},answer:function(a){if(!n){n=!0;s++;a.id==j&&r++;l.forEach(m,function(a){i.remove(a,"btn-primary");i.add(a,a==j?"btn-success":"btn-danger")});h.set(b.byId("score"),"<strong>Score: "+r+"/"+s+"</strong>");var c=this;setTimeout(function(){c.updateImage()},1500)}},imageLoaded:function(){this._setLoading(!1)},_setFailed:function(){this._setLoading(!1);f.set("main",{display:"none"});f.set("error",
{display:"block"})},_setLoading:function(a){a&&p||!a&&!p||(f.set("loading",{display:a?"block":"none"}),f.set("loaded",{display:a?"none":"block"}),f.set("footer",{display:a?"none":"block"}),p=a)},_setCaption:function(a,c){var d=v.spliceRandom(c.captions);d==c.correct&&(j=a);h.set(b.byId(a),d)}}});