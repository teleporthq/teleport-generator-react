"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var teleport_lib_js_1 = require("@teleporthq/teleport-lib-js");
var upperFirst_1 = require("lodash/upperFirst");
var union_1 = require("lodash/union");
var prettier = require("prettier-standalone");
var jsx_1 = require("../renderers/jsx");
var component_1 = require("../renderers/component");
var prettier_1 = require("../options/prettier");
function findNextIndexedKeyInObject(object, key) {
    if (!object[key])
        return key;
    var i = 1;
    while (object[key + '_' + i] !== undefined) {
        i++;
    }
    return key + '_' + i;
}
var ReactComponentGenerator = /** @class */ (function (_super) {
    __extends(ReactComponentGenerator, _super);
    function ReactComponentGenerator(generator) {
        return _super.call(this, generator) || this;
    }
    ReactComponentGenerator.prototype.processStyles = function (componentContent, styles) {
        var _this = this;
        var content = JSON.parse(JSON.stringify(componentContent));
        if (content.style) {
            var styleName = findNextIndexedKeyInObject(styles, content.name || content.type);
            styles[styleName] = content.style;
            content.style = [styleName];
            // @todo: handle platform
        }
        // if has children, do the same for children
        if (content.children && content.children.length > 0) {
            if (typeof content.children !== 'string') {
                content.children = content.children.map(function (child) {
                    var childStyledResults = _this.processStyles(child, styles);
                    styles = __assign({}, styles, childStyledResults.styles);
                    return childStyledResults.content;
                });
            }
        }
        return { styles: styles, content: content };
    };
    ReactComponentGenerator.prototype.computeDependencies = function (content) {
        var _this = this;
        var _a, _b;
        var dependencies = {};
        var source = content.source, type = content.type, children = content.children;
        if (source && type) {
            if (source === 'components') {
                return _a = {},
                    _a["components/" + type] = [type],
                    _a;
            }
            if (source === 'pages') {
                return _b = {},
                    _b["pages/" + type] = [type],
                    _b;
            }
            var mapping = this.generator.target.map(source, type);
            if (mapping) {
                if (mapping.library) {
                    // if the library is not yet in the dependecnies, add it
                    if (!dependencies[mapping.library])
                        dependencies[mapping.library] = [];
                    // if the type is not yet in the deps for the current library, add it
                    if (dependencies[mapping.library].indexOf(mapping.type) < 0)
                        dependencies[mapping.library].push(mapping.type);
                }
            }
            else {
                // tslint:disable:no-console
                console.error("could not map '" + type + "' from '" + source + "' for target '" + this.generator.targetName + "'");
            }
        }
        // if there are childrens, get their deps and merge them with the current ones
        if (children && children.length > 0 && typeof children !== 'string') {
            var childrenDependenciesArray = children.map(function (child) { return _this.computeDependencies(child); });
            if (childrenDependenciesArray.length) {
                childrenDependenciesArray.forEach(function (childrenDependency) {
                    Object.keys(childrenDependency).forEach(function (childrenDependencyLibrary) {
                        if (!dependencies[childrenDependencyLibrary])
                            dependencies[childrenDependencyLibrary] = [];
                        dependencies[childrenDependencyLibrary] = union_1.default(dependencies[childrenDependencyLibrary], childrenDependency[childrenDependencyLibrary]);
                    });
                });
            }
        }
        return dependencies;
    };
    ReactComponentGenerator.prototype.renderComponentJSX = function (content) {
        var _this = this;
        var source = content.source, type = content.type, props = __rest(content
        // retieve the target type from the lib
        , ["source", "type"]);
        // retieve the target type from the lib
        var mapping = null;
        var mappedType = type;
        if (source !== 'components' && source !== 'pages') {
            mapping = this.generator.target.map(source, type);
            if (mapping)
                mappedType = mapping.type;
        }
        var styleNames = null;
        if (props.style)
            styleNames = props.style;
        delete props.style;
        // there are cases when no children are passed via structure, so the deconstruction will fail
        var children = null;
        if (props.children)
            children = props.children;
        // remove the children from props
        delete props.children;
        var childrenJSX = [];
        if (children && children.length > 0) {
            childrenJSX = typeof children === 'string' ? children : children.map(function (child) { return _this.renderComponentJSX(child); });
        }
        if (Array.isArray(childrenJSX)) {
            childrenJSX = childrenJSX.join('');
        }
        styleNames = styleNames ? styleNames.map(function (style) { return 'styles.' + style; }).join(', ') : null;
        var name = props.name, componentProps = props.props, otherProps = __rest(props, ["name", "props"]); // this is to cover img uri props; aka static props
        var mappedProps = __assign({}, componentProps, otherProps);
        if (mapping && typeof mapping.props === 'function') {
            mappedProps = mapping.props(mappedProps);
        }
        return jsx_1.default(mappedType, childrenJSX, styleNames, mappedProps);
    };
    ReactComponentGenerator.prototype.generate = function (component, options) {
        if (options === void 0) { options = {}; }
        var name = component.name;
        var content = component.content;
        var dependencies = this.computeDependencies(content);
        var stylingResults = this.processStyles(content, {});
        var styles = stylingResults.styles;
        content = stylingResults.content;
        var jsx = this.renderComponentJSX(content);
        var props = component.editableProps ? Object.keys(component.editableProps) : null;
        var result = new teleport_lib_js_1.FileSet();
        result.addFile(upperFirst_1.default(component.name) + ".js", prettier.format(component_1.default(name, jsx, dependencies, styles, props), prettier_1.default));
        return result;
    };
    return ReactComponentGenerator;
}(teleport_lib_js_1.ComponentGenerator));
exports.default = ReactComponentGenerator;
//# sourceMappingURL=component.js.map