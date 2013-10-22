var randomService = angular.module('RandomService', []);

randomService.factory('randomService', function() {
    return {
        // Util for returning a random value from a collection that also isn't the current value
        newRandomValue: function(collection, currentValue){
            var randomValue;
            do {
                randomValue = collection[Math.floor(collection.length * Math.random())];
            } while (randomValue == currentValue);
            return randomValue;
        }
    };
});
