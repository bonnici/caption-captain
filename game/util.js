define([],function(){return{randomIndex:function(a){return Math.floor(Math.random()*a.length)},spliceRandom:function(a){var b=this.randomIndex(a),c=a[b];a.splice(b,1);return c}}});