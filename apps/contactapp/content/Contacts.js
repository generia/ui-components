ui.component('content', 'Contacts', {
    dummy:"="
}, ['comp', '$scope', function(comp, $scope) {
    comp.selectedContact = null;

    comp.showDetail = function(contact) {
        comp.selectedContact = contact;
        var detail = $scope.detail;
        detail.showContact(contact);
    };
    comp.getMenuTip = function() {
        if (comp.selectedContact != null) {
            return "Contact-ID: " + comp.selectedContact.id;
        }
        return null;
    };
}]);

