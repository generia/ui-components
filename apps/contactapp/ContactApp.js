var contactApp = angular.module('ContactApp', [
    'ui', 'ng', 'ngAnimate',
    'Navigation', 'Menu', 'Home', 'About', 'Contacts', 'ContactNav', 'ContactList', 'ContactDetail',
    'ContactService', 'RandomService'
], ['$provide', function($provide) {
    $provide.decorator('$rootScope', ['$delegate', '$log', function ($delegate, $log) {
        //$log.info("rootScope-decorator: ", $delegate);
        $delegate.comp = {
            uiName: "ContactApp",
            page: 'none',
            uilog: function(msg) {
                console.log('ui-' + this.uiName, msg);
            }
        };
        return $delegate;
    }]);
}]);

contactApp.factory('debugService', ['$log', '$rootScope', function($log, $rootScope) {
    return {
        logScope: function() {
            var sc = $rootScope;
            var json = angular.toJson(sc, true);
            var toJsonReplacer = function(key, value) {
                var val = value;
                if (/^\$+/.test(key)) {
                    val = undefined;
                }
                return val;
            };

            json = JSON.stringify(sc, toJsonReplacer, true ? '  ' : null);
            $log.info("scope: ", json);
        }
    };
}]);


contactApp.controller('ContactAppCtrl', ['$scope', function ContactAppCtrl($scope) {
    $scope.comp = {
        uiName: "ContactApp",
        page: 'none',
        selectedContact: null,
        uilog: function(msg) {
            console.log('ui-' + this.uiName, msg);
        },
        onSelect: function(contact) {
            $scope.comp.selectedContact = contact;
            if (contact == null) {
                $scope.comp.page = 'contacts';
            } else {
                $scope.comp.page = 'details';
            }
        }
    };
}]);

