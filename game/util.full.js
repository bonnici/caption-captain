define([], function() {

    return {
        randomIndex: function(arr) {
            var random = Math.floor((Math.random()*arr.length));
            return random;
        },

        spliceRandom: function(arr) {
            var index = this.randomIndex(arr);
            var item = arr[index];
            arr.splice(index, 1);
            return item;
        }
    };
});