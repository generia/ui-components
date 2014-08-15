ui.component('navigation', 'Menu', {
    active:'=',
    onClick: '~',
    label: '='
}, ['comp', function MenuCtrl(comp) {
    comp.active = true;
    comp.label = "aLabel";
    comp.onClick = null;
}]);