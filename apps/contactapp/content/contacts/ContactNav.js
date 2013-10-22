ui.component('content/contacts', 'ContactNav', {
	menuTip:'=',
	contacts:'=',
    selectedContact:'=',
    onSelect:'~'
}, ['comp', 'randomService', function ContactNavCtrl(comp, randomService) {
    comp.contacts = [];
    comp.selectedContact = null;
    comp.onSelect = function(contact){};
    comp.goToRandom = function() {
        var newContact = randomService.newRandomValue(comp.contacts, comp.selectedContact);
        comp.selectedContact = newContact;
        comp.onSelect(newContact);
    };
}]);
