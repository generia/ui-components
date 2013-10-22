ui.component('example1', 'HelloWorld', {
    salutation:'=',
    message:'='
}, ['comp', function HelloWorldController(comp) {
    comp.salutation = "";
    comp.message = "";
}]);
