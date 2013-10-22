# Ui-Components

> Build angular applications from a business point of view.

Ui-components serve as a central building block for constructing angular applications.
They are based on the widget idea presented in [Creating Components](http://docs.angularjs.org/guide/directive#creating-components) of the [directive](http://docs.angularjs.org/guide/directive) tutorial.

The key concept behind ui-components is the strong orientation on the business view of the applications functionality.
With ui-components the development can focus on business requirements without being entangled in technical details.
In order to achieve this ui-components come with a conceptional framework for defining the structure and interaction of components.
The implementation of the ui-components maps this abstraction then onto the angular framework.

A *ui-component* follows the model-view-controller pattern (MVC).
It has a defined interface consisting of a list of properties holding values and a list of methods exposing special functionality to other components.
This interface forms the model and controller of the components. The view of the component serves as a template specifying how the component is presented.
Furthermore the view describes how the component is composed by other sub-components. Finally the component can take a sub-tree as *component-parameter*.
 
The following figure gives an overview how model, view and controller work together via event- and value-bindings and it shows their overall integration into a business-application.

![MVC-Pattern](https://raw.github.com/generia/ui-components/master/doc/img/mvc-pattern.png)

## Example-1: `SampleApp` Application using `HelloWorld` Component ([Run](http://www.generia.de/ui-components/apps/sampleapp/SampleApp.html))

The first example defines a simple `HelloWorld` component that exposes two properties as its interface.
This component is used then in the `SampleApp` angular application. This application consists of the following files:

    SampleApp.css
    SampleApp.html
    SampleApp.js
    example1/HelloWorld.html
    example1/HelloWorld.js

The starting point is the `SampleApp.html` it contains the actual HTML page and the angular `ng-app` directive.
It includes all necessary js- and css-files and instantiates the `HelloWorld` component in the page-body.

`SampleApp.html`: The application´s main page.

    
```html
<!doctype html>
<html ng-app="SampleApp">
    <head>
        <title>Sample App</title>
        <link rel="stylesheet" type="text/css" href="SampleApp.css">
        <script src="../../../lib/angular.js"></script>
        <script src="../ui-components.js"></script>
        <script src="SampleApp.js"></script>
        <script src="example1/HelloWorld.js"></script>
    </head>
    <body>
        <hello-world salutation="'Hello'" message="'World'"/>
    </body>
</html>
```

`SampleApp.js`: Defines the angular app-module with the required the depending modules.

```JavaScript
    angular.module('SampleApp', ['ng', 'ui', 'HelloWorld']);
```

`SampleApp.css`: Have a little style for the component.

```css
    .HelloWorld {
        border: 1px solid green;
        padding: 5px;
    }
```

The `HelloWorld` component resides in the `example1` folder and has two model-properties `salutation` and `message` as defined by the`ui.component` call.
The controller of the component is defined by the `HelloWorldController` function.
The function is provided in the array-notation used by the angular [$injector](http://docs.angularjs.org/api/AUTO.$injector).
By this the component-controller gets access to providers and services configured in the angular application.

In the example a `comp` parameter is injected. This parameter is a special variable the gives access to the controller-object.
It is very similar to angular´s [$scope](http://docs.angularjs.org/guide/scope) variable but with a slightly different twist as described later on.

`HelloWorld.js`: The component-definition with model and controller

```JavaScript
    ui.component('example1', 'HelloWorld', 'helloWorld', {
        salutation:'=',
        message:'='
    }, ['comp', function HelloWorldController(comp) {
        comp.salutation = "";
        comp.message = "";
    }]);
```

The `comp` variable is then available in the view of the component and gives access to the model-values.

`HelloWorld.html`: The view-definition of the component with model binding.

```html
    <span class="HelloWorld">
        {{comp.salutation}} {{comp.message}}.
    </span>
```




## Ui-Component Features

The features that ui-components provide are a defined file structure for placing components and a specific interaction scheme based on the [mediator-pattern](http://en.wikipedia.org/wiki/Mediator_pattern).


### Component File Structure

The basic idea is to show the functional decomposition of the application via the folder-structure for the components.
The individual component-parts (model, view and controller) form a functional unit that is reflected by the file structure.
In general a ui-component is defined by two files:

1. `<component>.js`: This file defines the ui-component with it's properties and configures the controller with it's methods.
2. `<component>.html`: This file holds the view of the component which interacts with the controller via template-expressions and composes sub-components.

Both files are placed in a folder next to each other. Then the components can be organized in folders and sub-folders according to the functional decomposition of the application.
For example the top-level folders can be organized after the menu-structure of the application.

On the top-level the application itself is placed. This forms the entry point of the application. Typically there are three files defining the application:

1. `<app-controller>.js`: This file contains the initial configuration of the angular application together with the list of required components.
2. `<app-style>.css`: This file contains the styles for all components in the application.
3. `<app-view>.html`: This is the main entry-point, it includes the `<app-controller.js>` and `<app-style>.css` and all dependent `<component>.js` files

This structure is not mandatory for using ui-components. Any other layout can be chosen. But this has proven to be useful in real-world projects.
An example is the folder-structure of the contact-application described in <...>.


### Component Interaction using the Mediator-Pattern

The view-part of a component defines the parent-child structure of the component and it's sub-components.
The sub-components can be ordinary HTML-tags, angular directives or again nested ui-components.
When constructing a browser-page from the view-definitions the ui-components finally result in the tree of DOM elements for that page.
This parent-child relation in now used to organize the component-interaction according to the mediator pattern.
The basic idea is that the communication between components always goes along the component-tree.
By this the parent-component takes the role of the mediator for all its child-components as shown in the following figure.

![Mediator-Function](https://raw.github.com/generia/ui-components/master/doc/img/mediator-function.png)

The child-components do not know each other, only the common parent-component takes care for dispatching values and events to the relevant child-components.
Using this approach every sub-tree of the component-tree is always self-contained. All incoming and outgoing dependencies are controlled by the root-component of a sub-tree.
This simplifies the readability very much because just just looking at the static view-definition it will be clear how the interaction works.


### Identification of Child-Components in a View

Every child-component used inside a parent-components view-definition can have a *component-id*. Via this component-id the component can be referenced in the view or the controller.
By this properties and/or methods of child-components can be accessed by the parent-component to fulfill it's mediator-role.

By using component-parameters we get two views on the component-tree: the static view of the view-definitions at design-time and the dynamic view of the component-tree at runtime.

Here, three view-declarations are shown for the components P, Q and D. The P component can take component-parameters an inserts them for the placeholder marked with `<children>` into it's sub-tree.
The D component uses the P component and passes two instances q1 and a2 of the Q component as component-parameter. This is shown in the following figure.

![Component-Identification](https://raw.github.com/generia/ui-components/master/doc/img/component-identification.png)
 
For displaying the D component a component-tree is built at runtime as shown in the previous figure.
By this every node in the tree gets an absolute path that is built from the ids of the respective components.

| Path | Type | Declaring Component | Parent Component |
|------|------|---------------------|------------------| 
| d	| D	 | - | - |
|d.c | C | d | d |
|d.p | P | d | d |
|d.p.a | A | d.p | d.p |
|d.p.q1 | Q | d | d.p |
|d.p.q1.x | X | d.p.q1 | d.p.q1 |
|d.p.q1.y | Y | d.p.q1 | d.p.q1 |
|d.p.q2 | Q | d | d.p | 
|d.p.q2.x | X | d.p.q2 | d.p.q2 |
|d.p.q2.y | Y | d.p.q2 | d.p.q2 |
|d.p.b | B | d.p | d.p |

The interesting location are the path `d.p.q1` and `d.p.q2`. Here, the declaring component d differs from the parent-component `d.p` in the component-tree.
In the following table the declared component-ids are listed for each view-declaration.

| View-Declaration | Declared-Component |
|------------------|--------------------| 
| D | c, p, q1, q2 |
| P | a, b |
| Q | x, y |

The reason for the explicit differentiation of parent- and declaring-components is the usage of the component-binding.
All sub-components used inside a declaring component bind their property-access of event to the declaring component.
When the sub-components are passed as component-parameters, the sub-components are moved in the component-tree.
This can even happen in a nested way. Due to this it is always necessary that a declared component knows its declaring component in order to resolve the bindings properly.

For accessing the declaring component in a view-declaration the special `comp` variable is provided that always hold the reference to the declaring component of the view-declaration at hand.


## Example-2: `ContactApp` Application ([Run](http://www.generia.de/ui-components/apps/contactapp/ContactApp.html))

The contact application example was taken from the [sample](https://github.com/angular-ui/ui-router/tree/master/sample) of the [ui-router](https://github.com/angular-ui/ui-router) project.
While the ui-router uses an centralized state-machine to keep track of the current view state, the ui-components approach favours a decentralized state encapsulated in reusable components.

The contact application gives an overview on the different features provide by ui-components based on a working example.
The component-file-structure is shown in the following figure:

	- contactapp/
		bootstrap.min.css
		ContactApp.css
		ContactApp.html
		ContactApp.js
		- content/
			About.html
			About.js
			Contacts.html
			Contacts.js
			Home.html
			Home.js
			- contacts/
				ContactDetail.html
				ContactDetail.js
				ContactList.html
				ContactList.js
				ContactNav.html
				ContactNav.js
		- navigation/
			Menu.html
			Menu.js
			Navigation.html
			Navigation.js
		- services/
			contacts.json
			ContactService.js
			RandomService.js
