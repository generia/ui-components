ui.component('content/contacts', 'ContactList', {
	menuTip:'@',
    onSelect:'~'
}, ['comp', '$log', 'contactService', function(comp, $log, contactService) {
    comp.contacts = contactService.all();
	//$log.info("contact-list-controller: ", comp);
}]);
