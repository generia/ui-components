angular.module('ContactService', [])

    // A RESTful factory for retrieving contacts from 'contacts.json'
    .factory('contactService', ['$http', function ($http, utils) {
        var path = 'services/contacts.json';
        var factory = {};
        factory.all = function () {
            return $http({
                url:path,
                method:"GET",
                headers:{'Content-Type':'application/json'}
            });
        };
        factory.get = function (id) {
            return contacts.then(function(){
                return utils.findById(contacts, id);
            });
        };
        return factory;
    }])

    .factory('utils', function () {
        return {

            // Util for finding an object by its 'id' property among an array
            findById: function findById(a, id) {
                for (var i = 0; i < a.length; i++) {
                    if (a[i].id == id) return a[i];
                }
                return null;
            },

            // Util for returning a randomKey from a collection that also isn't the current key
            newRandomKey: function newRandomKey(coll, key, currentKey){
                var randKey;
                do {
                    randKey = coll[Math.floor(coll.length * Math.random())][key];
                } while (randKey == currentKey);
                return randKey;
            }
        };
    });