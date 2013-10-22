var ui = (function(angular){

	var uiModule = angular.module('ui', []);

	uiModule.config(['$provide', '$httpProvider', function($provide, $httpProvider) {
	    $provide.decorator('$compile', ['$delegate', '$log', function ($delegate, $log) {
	        //$log.info("compile-decorator: ", $delegate);

	        var compile = function(element, transclude, maxPriority) {
	            //$log.info("decorated compile-function BEG: ", element, transclude, maxPriority);
	            var linkFn = $delegate(element, transclude, maxPriority);
	            var uiLinkFn = function(scope, cloneConnectFn){
	                //$log.info("decorated link-function BEG: ", scope, cloneConnectFn);
	                var o = linkFn(scope, cloneConnectFn);
	                //$log.info("decorated link-function END: ", scope, cloneConnectFn, o);
	                return o;
	            };
	            //$log.info("decorated compile-function END: ", element, transclude, maxPriority, uiLinkFn);
	            return uiLinkFn;
	        };
	        return compile;
	    }]);
	    $provide.decorator('$parse', ['$delegate', '$log', function ($delegate, $log) {
	        //$log.info("parse-decorator: ", $delegate);

	        var parse = function uiParse(expression) {
	            var parts = decodeUuid(expression);
	            if (parts.uuid) {
	              //  $log.info("parse-function BEG:", expression, parts);
	            }
	            var exprFn = $delegate(parts.expr);
	            var exprAssignFn = exprFn.assign;
	            var exprConstant = exprFn.constant;
	            var wrappedFn = function uiParseEval(scope, locals) {
	                var declaringScope = scope;
	                //$log.info("parse-eval-function BEG", expression, scope, locals, "declaring-uuid", parts.uuid, "expr-fn", exprFn);
	                if (parts.uuid) {
	                    declaringScope = getDeclaringScopeByUuid(parts.uuid);
	                }
	                try {
	                    var value = exprFn(declaringScope, locals);
	                    if (parts.uuid) {
	                    }
	                  //  $log.info("parse-eval-function END", expression, scope, locals, "value", value, "declared-uuid", parts.uuid, "declaring-scope", declaringScope);
	                    return value;
	                } catch (e) {
	                    $log.error("parse-eval-function ERR", expression, scope, locals, "declared-uuid", parts.uuid, "declaring-scope", declaringScope, e);
	                    return null;
	                }
	            };
	            wrappedFn.constant = exprConstant;
	            wrappedFn.expression = expression;
	            
	            if (exprAssignFn) {
	                wrappedFn.assign = function(scope, value) {
	                    var declaringScope = scope;
	                    //$log.info("expr-setter BEG", expression, scope, "declaring-uuid", parts.uuid);
	                    if (parts.uuid) {
	                        declaringScope = getDeclaringScopeByUuid(parts.uuid);
	                    }
	                    var result = exprAssignFn(declaringScope, value);
	                    //$log.info("expr-setter END", expression, scope, "value", value, "declared-uuid", parts.uuid, "declaring-scope", declaringScope);
	                    return result;
	                };
	            }
	            if (parts.uuid) {
	               // $log.info("parse-function END:", expression, exprFn, exprFn.assign, "assign", exprAssignFn, wrappedFn.assign);
	            }
	            return wrappedFn;
	        };
	        return parse;
	    }]);
	    $provide.decorator('$interpolate', ['$delegate', '$log', function ($delegate, $log) {
	        //$log.info("interpolate-decorator: ", $delegate);

	        var interpolate = function uiInterpolate(text, mustHaveExpression, trustedContext) {
	            //$log.info("interpolate-function BEG:", text);
	            var parts = decodeUuid(text);
	            var exprFn = $delegate(parts.expr, mustHaveExpression, trustedContext);
	            if (exprFn) {
	                var wrappedFn = function uiInterpolateEval(context, locals) {
	                    if (parts.uuid) {
	                        context = getDeclaringScopeByUuid(parts.uuid);
	                    }
	                    //$log.info("interpolate-expr-function BEG", text, parts.expr, mustHaveExpression, trustedContext, "declared-uuid", parts.uuid, "context", context, "locals", locals, "exprFn", exprFn);
	                    try {
	                        var value = exprFn(context, locals);
	                       // $log.info("interpolate-expr-function END", text, parts.expr, mustHaveExpression, trustedContext, "declared-uuid", parts.uuid, "context", context, "locals", locals, "value", value);
	                        return value;
	                    } catch (e) {
	                        $log.error("interpolate-expr-function ERR", text, parts.expr, mustHaveExpression, trustedContext, "declared-uuid", parts.uuid, "context", context, "locals", locals);
	                        return null;
	                    }
	                };
	                wrappedFn.text = text;
	                //$log.info("interpolate-function END:", text, exprFn);
	                return wrappedFn;
	            }
	            return exprFn;
	        };
	        interpolate.startSymbol = $delegate.startSymbol;
	        interpolate.endSymbol = $delegate.endSymbol;
	        return interpolate;
	    }]);
	    $provide.decorator('$rootScope', ['$delegate', '$log', '$rootElement', function ($delegate, $log, $rootElement) {
	        //$log.info("xrootScope-decorator: ", $delegate, $rootElement);
	        appRootElement = $rootElement;

	        var elementProto = appRootElement.__proto__;
	        (function(data) {
	            elementProto.data = function uiData(key, value) {
	                //console.info("data BEG", "key", key, "value", value, "this", this);
	                var result = data.apply(this, arguments);
	                if (key == '$scope' && !angular.isUndefined(value)) {
	                    value.element = result;
	                    value.declaredUuid = getUuid(result);
	                    var declaringComponent = null;
	                    if (value.declaredUuid) {
	                        appRootScope.uuidScopeMap[value.declaredUuid] = value;
	                        value.declaringUuid = appRootScope.declaredUuidMap[value.declaredUuid];
	                        value.declaringScope = appRootScope.uuidScopeMap[value.declaringUuid];
	                        if (value.declaringScope) {
	                            declaringComponent = value.declaringScope.element;
	                        }
	                    }
	                    //console.info("attaching scope", value, " to ", result, "uuid", getUuid(result), "declaring-uuid", getUuid(declaringComponent), "declaring-scope", value.declaringScope, "declaring-component", declaringComponent, "declared-data", result.data(), "declaring-data", (declaringComponent ? declaringComponent.data() : 'none'));

	                } else {
	                    //console.info("called data(", key, value, ") -> ", result);
	                }
	                //console.info("data END", "key", key, "value", value, "this", this, "->", result);
	                return result;
	            };
	        })(elementProto.data);

	        setUuid(appRootElement, getComponentUuid(appRootElement));

	        var prototype = $delegate.__proto__;
	        (function($new) {
	            prototype.$new = function uiNew(isolate) {
	                var newScope = $new.apply(this, arguments);
	                //console.info("created new scope", newScope, "for parent ", this, " on current declaring-component ", currentDeclaringComponent());
	                return newScope;
	            };
	        })(prototype.$new);
	        $delegate.$new = prototype.$new;

	        (function($watch) {
	            prototype.$watch = function uiWatch(watchExp, listener, objectEquality) {
	                //console.log("Scope.watch BEG", this, "watch-exp", watchExp, "listener", listener);
	                var result = $watch.apply(this, arguments);
	                //console.log("Scope.watch END", this, "watch-exp", watchExp, "listener", listener, " -> ", result);
	                return result;
	            };
	        })(prototype.$watch);
	        $delegate.$watch = prototype.$watch;

	        appRootScope = $delegate;
	        appRootScope.declaredComponentMap = {};
	        appRootScope.declaredUuidMap = {};
	        appRootScope.uuidScopeMap = {};
	        appRootScope.uuidScopeMap[getUuid(appRootElement)] = appRootScope;
	        return $delegate;
	    }]);
	    $provide.decorator('$http', ['$delegate', '$log', 'declaringComponentHolder', function ($delegate, $log, declaringComponentHolder) {
	        //$log.info("httpProvider-decorator: ", $delegate);

	        var getFn = $delegate.get;
	        var wrappedFn = function(url, config) {
	            var parts = decodeUuid(url);
	            if (parts.uuid == null) {
	                return getFn(url, config);
	            }
	            config.declaringUuid = parts.uuid;
	            var future = getFn(parts.expr, config);
	            var successFn = future.success;
	            future.success = function(fn) {
	                var wrappedFn = function(data, status, headers, config) {
	                    var dc = declaringComponentHolder.getDeclaringComponent(url);
	                    //console.log("call success-fn BEG", future, "for url", url, status, "config", config, dc, "declaring-uuid", getUuid(dc));
	                    pushDeclaringComponent(dc);
	                    var o = fn(data, status, headers, config);
	                    popDeclaringComponent();
	                    //console.log("call success-fn END", future, "for url", url, status, "config", config, o);
	                    return o;
	                };
	                return successFn(wrappedFn);
	            };
	            return future;
	        };
	        $delegate.get = wrappedFn;
	        //$log.info("httpProvider-decorator: ", $delegate, $delegate.get);
	        return $delegate;
	    }]);

	    $provide.factory('myHttpInterceptor', ['$q', '$log', 'declaringComponentHolder', function($q, $log, declaringComponentHolder) {
	        return {
	            'request': function(config) {
	                //var dc = declaringComponentHolder.getDeclaringComponent(config.url);
	                //$log.info("http-request", config, $q, dc);
	                return config || $q.when(config);
	            },

	            'requestError': function(rejection) {
	                $log.info("http-requestError", rejection);
	                return $q.reject(rejection);
	            },

	            'response': function(response) {
	                //var dc = declaringComponentHolder.getDeclaringComponent(response.config.url);
	                //$log.info("http-response BEG", response, $q, dc);
	                return response;
	            },

	            'responseError': function(rejection) {
	                $log.info("http-responseError", rejection);
	                return $q.reject(rejection);
	            }
	        };
	    }]);

	    $httpProvider.interceptors.push('myHttpInterceptor');
	}]);

	uiModule.factory('declaringComponentHolder', ['$log', function ($log) {
	    var declaringComponentMap = {};

	    var holder = {};
	    holder.setDeclaringComponent = function (templateUrl, declaringComponent) {
	        declaringComponentMap[templateUrl] = declaringComponent;
	        //$log.info("holder: setting ", templateUrl, " to ", declaringComponent);
	    };
	    holder.getDeclaringComponent = function (templateUrl) {
	        var dc = declaringComponentMap[templateUrl];
	        //$log.info("holder: getting ", templateUrl, " as ", dc);
	        return dc;
	    };
	    return holder;
	}]);


	function dumpScope() {
	    var $injector = angular.injector(['ContactApp']);
	    var sc = $injector.get('$rootScope');
	    logObj(sc);

	    var service = $injector.get('debugService');
	    service.logScope();
	}

	function logObj(obj) {
	    for(i in obj) {
	        console.log("The value of obj." + i + " = " + obj[i]);
	    }
	}
	function logElement(element) {
	    var tree = buildTree(element);
	    console.log("tree: ", tree);
	}

	function buildTree(element) {
	    var tagName = element.tagName;
	    var attrs = {};
	    angular.forEach(element.attributes, function(attr) {
	        attrs[attr.nodeName] = attr.nodeValue;
	    });
	    var children = [];
	    angular.forEach(element.children, function(child) {
	        children.push(buildTree(child));
	    });
	    var data = angular.element(element).data();
	    var info = {
	        tagName: tagName,
	        attrs: attrs,
	        data: data,
	        children: children
	    };
	    return info;
	}

	var appRootElement = null;
	var appRootScope = null;

	var componentIdSequence = 0;
	var declaringComponentStack = [];
	function getComponentUuid(node) {
	    return (componentIdSequence++);
	}
	function pushDeclaringComponent(node) {
	    declaringComponentStack.push(node);
	    //console.log("pushDeclaringComponent:", node);
	}

	function popDeclaringComponent() {
	    var node = declaringComponentStack.pop();
	    //console.log("popDeclaringComponent:", node);
	    return node;
	}

	function currentDeclaringComponent() {
	    if (declaringComponentStack.length > 0) {
	        return declaringComponentStack[declaringComponentStack.length-1];
	    }
	    return appRootElement;
	}


	function encodeUuid(uuid, expression) {
	    return "ui(" + uuid + ")-" + expression;
	}

	function decodeUuid(expression) {
	    var regex = /ui\(([0-9]+)\)-(.*)/;
	    var result = regex.exec(expression);
	    var parts = {uuid: null, expr: expression};
	    if (result == null) {
	        return parts;
	    }
	    var uuid = parseInt(result[1]);
	    var expr = result[2];
	    if (uuid) {
	        parts = {uuid: uuid, expr: expr};
	    }
	    return parts;
	}

	var uuidAttr = '_uuid';

	function getUuid(node) {
	    if (angular.isUndefined(node)) {
	        return null;
	    }
	    var uuid = angular.element(node).attr(uuidAttr);
	    if (uuid) {
	        return uuid;
	    }
	    if (node == null) {
	        //console.warn("can't get uuid for node ", node);
	        return null;
	    }
	    return uuid;
	    
	}

	function setUuid(node, uuid) {
		angular.element(node).attr(uuidAttr, uuid);
	}

	function getMetadataNode(node) {
		var elem = angular.element(node);
		var children = elem.children();
		if (children.length == 1) {
			//return angular.element(children[0]);
		}
		return elem;
	}

	function registerDeclaredComponent(node, attrs) {
	    var declaringComponent = currentDeclaringComponent();
	    if (declaringComponent == null) {
	        declaringComponent = findDeclaringComponent(node);
	    }
	    var declaringUuid = getUuid(declaringComponent);
	    var declaredUuid = getComponentUuid(node);
	    setUuid(node, declaredUuid);
	    attrs[uuidAttr] = declaredUuid;
	    //console.log("registerDeclaredComponent: declared-uuid", declaredUuid, "declaring-uuid", declaringUuid, "declared-node", node[0], "declaring-component", declaringComponent);
	    appRootScope.declaredComponentMap[declaredUuid] = declaringComponent;
	    appRootScope.declaredUuidMap[declaredUuid] = declaringUuid;
	    return declaringComponent;
	}


	function getDeclaringComponent(declaredComponent) {
	    declaredComponent = angular.element(declaredComponent);
	    var declaredUuid = getUuid(declaredComponent);
	    if (declaredUuid == null) {
	       // console.log("no uuid for declared-component", declaredComponent);
	        var dc = findDeclaringComponent(declaredComponent);
	        return dc;
	    }
	    return getDeclaringComponentByUuid(declaredUuid);
	}


	function getDeclaringComponentByUuid(declaredUuid) {
	    var declaringComponent = appRootScope.declaredComponentMap[declaredUuid];
	    if (declaredUuid != 0 && (declaringComponent == null || angular.isUndefined(declaringComponent))) {
	        //console.warn("can't find declaring-component for uuid: ", declaredUuid);
	        declaringComponent = appRootElement;
	    }
	    return declaringComponent;
	}


	function getDeclaringScope(declaredComponent) {
	    var declaringComponent = getDeclaringComponent(declaredComponent);
	    var declaringScope = declaringComponent.data("$scope");
	    return declaringScope ? declaringScope : null;
	}

	function getDeclaringScopeByUuid(declaredUuid) {
	    var declaringScope = null;
	    var declaringUuid = appRootScope.declaredUuidMap[declaredUuid];
	    if (declaringUuid) {
	        declaringScope = appRootScope.uuidScopeMap[declaringUuid];
	    }
	    if (declaringScope == null) {
	        var declaringComponent = getDeclaringComponentByUuid(declaredUuid);
	        //console.warn("declaring-component not found in scope-map, using declaring-component", declaringComponent, "instead");
	        declaringScope = declaringComponent.data("$scope");
	    }
	    return declaringScope ? declaringScope : null;
	}


	function findDeclaringComponent(node) {
	    var context = findParentNode(node, "ng-isolate-scope");
	    if (context == null) {
	        //context = findParentNode(node, "ng-scope");
	    }
	    if (context == null) {
	        context = appRootElement;
	    }
	    return context;
	}

	function findParentNode(node, styleClass) {
	    var parent = node.parent();
	    var cls = parent.attr("class");
	    if (cls && cls.contains(styleClass)) {
	        return parent;
	    }
	    if (parent && parent != node && parent.length > 0) {
	        return findParentNode(parent, styleClass);
	    }
	    return null;
	}

	function logScopes() {
	    logScope(appRootScope, "");
	}
	function logScope(scope, ind) {
	    var declaringScope = scope.declaringScope;
	    var declaredNode = scope.element;
	    var declaringNode = declaringScope ? declaringScope.element : null;
	    var transcluded = scope.$$transcluded ? "transcluded " : "";
	    var uiName = scope.comp ? scope.comp.uiName : "?comp?";
	    //console.log(ind, "declared-uuid", scope.declaredUuid, "declaring-uuid", scope.declaringUuid, "declared-node", declaredNode, "declaring-node", declaringNode, "scope: ", scope, "declaring-scope", scope.declaringScope);
	    console.log(ind, transcluded + uiName, "uuid: ", scope.declaredUuid, "->", scope.declaringUuid, "scope: ", scope.$id, "->", (declaringScope ? declaringScope.$id : "?$id?"), scope, "node: ", declaredNode, "->", declaringNode);
	    var child = scope.$$childHead;
	    while (child != null && child !== scope) {
	        logScope(child, ind + "  ");
	        child = child.$$nextSibling;
	    }
	}


	function attachDeclaringScopes() {
	    appRootElement.find('.ng-scope').each(function(i, elem) {
	        var scope = jQuery(elem).data('$scope');
	        var uuid = getUuid(elem);
	        var declaringComponent = getDeclaringComponent(elem);
	        var declaringUuid = getUuid(declaringComponent);
	        var declaringScope = declaringComponent.data('$scoope');
	        //console.log("elem", i,  elem, "declared-uuid", uuid, "declaring-uuid", declaringUuid, declaringComponent, "scope", scope, "declaring-scope", declaringScope);
	        //appRootScope.uuidScopeMap[uuid] = scope;
	    });

	    angular.forEach(appRootScope.uuidScopeMap, function(scope, uuid){
	        var declaringUuid = appRootScope.declaredUuidMap[uuid];
	        var declaringScope = appRootScope.uuidScopeMap[declaringUuid];
	        //scope.declaringScope = declaringScope;
	        //console.log("declared-uuid", uuid,  "declaring-uuid", declaringUuid,  "scope", scope, "declaring-scope", declaringScope);
	    });
	}

	function decorateController(name, $controller, controller) {
	    return ['$scope', function UiComponentController($scope) {
	        $scope.comp = {
	            uiName: name
	        };
	        var locals = {
	            '$scope': $scope,
	            'comp': $scope.comp
	        };
	        $controller(controller, locals);
	    }];
	}
	function createComponent(pkg, name, tag, attrs, controller) {
	    var ngScope = {};
	    var module = angular.module(name, []);
	    angular.forEach(attrs, function(spec, attr) {
	        if (spec == '=' || spec == '&' || spec == '~') {
	            var directiveName = encodeComponentAttrName(attr);
	            module.directive(directiveName, getAttrDirective(directiveName, attr, spec));
	        } else {
	            ngScope[attr] = spec;
	        }
	    });
	    module.directive(tag, ['declaringComponentHolder', '$controller', function(declaringComponentHolder, $controller){
	        return {
	            restrict: 'E',
	            replace: true,
	            transclude: true,
	            scope: ngScope,
	            templateUrl: function uiTemplateUrl($compileNode, tAttrs) {
	                var declaringComponent = registerDeclaredComponent($compileNode, tAttrs);
	                var uuid = getUuid($compileNode);
	                angular.forEach(ngScope, function(value, key){
	                    if (value != '@') {
	                        tAttrs[key] = encodeUuid(uuid, tAttrs[key]);
	                    }
	                });
	                var templateUrl = encodeUuid(uuid, pkg + '/' + name + '.html');
	                //$compileNode.data('templateUrl', templateUrl);
	                //$compileNode.data('templateAttr', tAttrs);
	                //$compileNode.attr('tmplUrl', templateUrl);
	                //console.log(name + "-template-url: ", $compileNode, tAttrs, "declared-component", getUuid($compileNode), $compileNode, "declaring-component", declaringComponent, getUuid(declaringComponent));
	                declaringComponentHolder.setDeclaringComponent(templateUrl, $compileNode);
	                return templateUrl;
	            },
	            controller: decorateController(name, $controller, controller)
	        };
	    }]);
	}

	function firstUp(name) {
	    if (name.length < 1) {
	        return name.toUpperCase();
	    }
	    return name.substring(0,1).toUpperCase() + name.substring(1);
	}

	function firstDown(name) {
	    if (name.length < 1) {
	        return name.toLowerCase();
	    }
	    return name.substring(0,1).toLowerCase() + name.substring(1);
	}

	function decodeComponentAttrName(attrName) {
	    return attrName;
	}

	function encodeComponentAttrName(attrName) {
	    return attrName;
	}

	function getAttrDirective(directiveName, attrName, mode) {
	    function bindScopes($parse, $log, attr, expr, mode, scope, declaringScope) {
	        var lastValue;
	        var comp = ui.getComp(scope);
	        if (angular.isUndefined(comp)) {
	            $log.warn("bindScopes: comp not defined for directive ", directiveName,attr, expr, scope, declaringScope);
	        }
	        var parentGetOrig = $parse(expr);
	        var parentSetOrig = parentGetOrig.assign || function() {
	            // reset the change, or we will throw this exception on every $digest
	            lastValue = comp[attr] = parentGet(declaringScope);
	            throw $compileMinErr('nonassign', "Expression '{0}' used with directive '{1}' is non-assignable!",
	                attr, "directive: " + directiveName);
	        };
	        var parentGet = function uiParentGet(scope) {
	            var value = parentGetOrig(scope);
	            // $log.log("get ", attr, " in ", scope, " -> ", value);
	            return value;
	        };
	        switch (mode) {

	            case '@': {
	                log.warn("mode '", mode, "' not supported for attribute '", attrName, "'");
	            	/*
	                attrs.$observe(attrName, function(value) {
	                    scope[scopeName] = value;
	                  });
	                  attrs.$$observers[attrName].$$scope = parentScope;
	                  if( attrs[attrName] ) {
	                    // If the attribute has been provided then we trigger an interpolation to ensure the value is there for use in the link fn
	                    scope[scopeName] = $interpolate(attrs[attrName])(parentScope);
	                  }
	                  */
	               // return;
	                // fall through
	            }
	            case '=': {
	                var parentSet = function uiParentSet(scope, value) {
	                    parentSetOrig(scope, value);
	                    $log.log("set ", attr, " to ", value, " in ", scope);
	                };
	                lastValue = comp[attr] = parentGet(declaringScope);
	                var watchFn = function uiCompAttrValueWatch() {
	                    // $log.log("watch BEG", attr, comp, "declaring-scope", declaringScope);
	                    var parentValue = parentGet(declaringScope);

	                    if (parentValue !== comp[attr]) {
	                        // we are out of sync and need to copy
	                        if (parentValue !== lastValue) {
	                            // parent changed and it has precedence
	                            lastValue = comp[attr] = parentValue;
	                        } else {
	                            // if the parent can be assigned then do so
	                            parentSet(declaringScope, parentValue = lastValue = comp[attr]);
	                        }
	                    }
	                    //$log.log("watch END", attr, comp, "declaring-scope", declaringScope, " value ", parentValue);
	                    return parentValue;
	                };
	                watchFn.attr = attr;
	                watchFn.expr = expr;
	                scope.$watch(watchFn);
	                break;
	            }
	            case '&': {
	                // note: this is called in the context of an parsed expression, no scope param here
	                comp[attr] = function uiParentCallback(locals) {
	                   // $log.log("callback ", attr, " in scope", scope, "declaring-scope", declaringScope);
	                    return parentGet(declaringScope, locals);
	                };
	                break;
	            }
	            case '~': {
	                comp[attr] = function uiParentFunction() {
	                    var fn = parentGet(declaringScope);
	                    var declaringComp = ui.getComp(declaringScope);
	                    //$log.log("callback-function BEG: attr", attr, "expr", expr, " in comp", comp, "declaring-comp", declaringComp);
	                    var result = fn.apply(declaringComp, arguments);
	                    //$log.log("callback-function END: attr", attr, "expr", expr, " in comp", comp, "declaring-comp", declaringComp, "->", result);
	                };
	                break;
	            }
	            default: {
	                throw Error('Invalid isolate scope definition for directive ' +
	                    directiveName + ': ' + mode);
	            }
	        }
	    }
	    return ['$parse', '$log', function($parse, $log){
	        return {
	            restrict: 'A',
	            compile: function(tElement, tAttrs, transclude) {
	                var attr = attrName;
	                var expr = tAttrs[directiveName];
	                //console.log("compile-" + attr, tElement, tAttrs, transclude, attr, expr);
	                return {
	                    pre: function uiAttrPreLink(scope, iElement, iAttrs, controller) {
	                        //console.log("link-" + attr + "-pre", scope, tElement, tAttrs, controller, "declaring-scope", ds);
	                    },
	                    post: function uiAttrPostLink(scope, iElement, iAttrs, controller) {
	                        //console.log("link-" + attr + "-post", scope, tElement, tAttrs, controller);
	                        var ds = scope.declaringScope;
	                        bindScopes($parse, $log, attr, expr, mode, scope, ds);
	                        //var expr = iAttrs[attr];
	                        //scope.$evalAsync(expr);
	                    }
	                };
	            }
	        };
	    }];
	}

	uiModule.directive("uid", function(){
	    return {
	        restrict: 'A',
	        compile: function(tElement, tAttrs, transclude) {
	            //console.log("compile-uid", tElement, tAttrs, transclude);
	            return {
	                pre: function uiUidPreLink(scope, iElement, iAttrs, controller) {
	                },
	                post: function uiUidPostLink(scope, iElement, iAttrs, controller) {
	                    var ds = scope.declaringScope;
	                    var uid = iAttrs.uid;
	                    var comp = ui.getComp(scope);
	                    //console.log("link-uid-post", uid, scope, tElement, tAttrs, controller, "declaring-scope", ds, "comp", comp);
	                    ds[uid] = comp;
	                    //console.log("link-uid-post", scope, tElement, tAttrs, controller);
	                }
	            };
	        }
	    };
	});

	uiModule.directive("uiShow", ['$parse', '$animate', function($parse, $animate) {
	    return {
	        restrict: 'A',
	        compile: function(tElement, tAttrs, transclude) {
	            var expr = tAttrs["uiShow"];
	            var uuid = getUuid(tElement);
	            var uiExpr = encodeUuid(uuid, expr);
	            //console.log("compile-uiShow", tElement, tAttrs, transclude, expr, uuid, uiExpr, $animate);
	            return {
	                pre: function(scope, iElement, iAttrs, controller) {
	                    //console.log("link-uid-pre", scope, tElement, tAttrs, controller, "declaring-scope", ds);
	                },
	                post: function(scope, iElement, iAttrs, controller) {
	                    var ds = scope.declaringScope;
	                    //console.log("ui-show-post", scope, tElement, tAttrs, controller, "uuid", getUuid(tElement), "declaring-scope", getUuid(ds), ds);
	                    scope.$watch(uiExpr, function uiShowWatcher(value) {
	                      //  console.log("ui-show-watch", scope, tElement, tAttrs, controller, "uuid", getUuid(tElement), "declaring-scope", getUuid(ds), ds, "->", value);
	                        if (value) {
	                            //iElement.removeClass("ng-hide");
	                        	$animate.removeClass(iElement, 'ng-hide');
	                        } else {
	                        	$animate.addClass(iElement, 'ng-hide');
	                            //iElement.addClass("ng-hide");
	                        }
	                        return value;
	                    });
	                }
	            };
	        }
	    };
	}]);
	
	/**
	 * @exports ui
	 */
	var exports = {
		/**
		 * Creates a ui-component.
		 * @param {string} pkg - The package for this component. This is denoted by the path to the `component.js` and `component.html` files relative to the application folder.
		 * @param {string} name - The name of the component. The name is expected to be a valid camel-case javascript identifier starting with an upper-case letter.
		 * @param {map} attrs - Map of attribute definitions. A map entry consists of the attribute name as key and the binding-specification a value. This follows the convention for 'isolated' scopes as described in section 'Directive Definition Object' for angular [directives]{@link http://docs.angularjs.org/guide/directive}. 
		 * @param {Controller} controller - A controller function using the array-notation of angulars [$injector]{@link http://docs.angularjs.org/api/AUTO.$injector} service.
		 * @returns {Module} The ui-component which comes as angular [module]{@link http://docs.angularjs.org/api/angular.Module}.
		 */
		component: function(pkg, name, attrs, controller) {
			var tag = firstDown(name);
		    return createComponent(pkg, name, tag, attrs, controller);
		},
		/*
		extend: function(src, dst) {
		    return angular.extend(dst, src);
		},
		*/
		/**
		 * Gets the component controller that is declared for the given angular [scope]{@link http://docs.angularjs.org/api/ng.$rootScope.Scope}.
		 * @param {Scope} scope - An angular [scope]{@link http://docs.angularjs.org/api/ng.$rootScope.Scope}.
		 */
		getComp: function(scope) {
		    var comp = scope.comp;
		    var uuid = scope.declaredUuid;
		    while (angular.isUndefined(comp) && uuid == scope.$parent.declaredUuid) {
		        scope = scope.$parent;
		        comp = scope.comp;
		    }
		    return comp;
		},
		/**
		 * Logs the current scope structure to the browser console. 
		 * The log contains also debugging information about the declaring and declared components together with their DOM elements. 
		 */
		logScopes: function() {
			logScopes();
		}
	};
	return exports;
})(angular);
