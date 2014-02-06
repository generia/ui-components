ui.component('content/contacts', 'ContactList', {
	menuTip:'@',
    onSelect:'~'
}, ['comp', '$log', 'contactService', function(comp, $log, contactService) {
    contactService.all().then(function (resp) {
    	//console.log("all-resp", resp);
        comp.contacts = resp.data.contacts;
    });
	//$log.info("contact-list-controller: ", comp);
}]);
