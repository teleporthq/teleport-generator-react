"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var renderDependency = function (libraryName, types) {
    return "import { " + types.join(', ') + " } from '" + libraryName + "'";
};
function component(name, jsx, dependencies, styles, props) {
    if (dependencies === void 0) { dependencies = {}; }
    // tslint:disable-next-line:max-line-length
    var dependenciesArray = Object.keys(dependencies).map(function (libraryName) { return renderDependency(libraryName, dependencies[libraryName]); });
    var propsString = '';
    if (props && props.length > 0) {
        propsString = "const { " + props.join(', ') + " } = this.props";
    }
    var stylesString = '';
    if (styles) {
        var styleNames = Object.keys(styles);
        if (styleNames && styleNames.length) {
            var stylesArray_1 = [];
            styleNames.map(function (styleName) {
                var styleLinesArray = JSON.stringify(styles[styleName], null, 4).split('\n');
                // filter out the empty lines
                styleLinesArray = styleLinesArray.filter(function (styleLine) { return styleLine.length; });
                // add the first line in the same line as the name; it will be the opening "{" of the definition
                stylesArray_1.push(styleName + ": " + styleLinesArray[0]);
                // add the rest of the lines, except the last
                // tslint:disable-next-line:max-line-length
                styleLinesArray.slice(1, styleLinesArray.length - 1).map(function (stylePropertyString) { stylesArray_1.push(stylePropertyString); });
                // add the last line, as it needs an extra coma at the end
                stylesArray_1.push(styleLinesArray[styleLinesArray.length - 1] + ",");
            });
            stylesString = "\n        const styles = {\n          " + stylesArray_1.join('\n  ') + "\n        }\n      ";
        }
    }
    return "\n    import React, { Component } from 'react'\n    " + dependenciesArray.join("") + "\n\n    export default class " + _.upperFirst(name) + " extends Component {\n      render () {\n        " + propsString + "\n        return (\n          " + jsx + "\n        )\n      }\n    }\n\n    " + stylesString + "\n  ";
}
exports.default = component;
//# sourceMappingURL=component.js.map