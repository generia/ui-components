ui.component('content/contacts', 'ContactDetail', {
}, ['comp', function ContactDetailCtrl(comp) {
    comp.contact = null;
    comp.state = null;
    comp.selectedItem = null;
    comp.showContact = function(contact) {
        comp.state = null;
        comp.contact = contact;
    };
    comp.show = function(item) {
        comp.state = "show";
        comp.selectedItem = item;
    };
    comp.edit = function() {
        comp.state = "edit";
    };
    comp.done = function() {
        comp.state = "show";
    };
}]);
