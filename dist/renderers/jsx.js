"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function jsx(name, childrenJSX, styles, props) {
    var stylesString = '';
    if (styles) {
        if (styles.length > 0) {
            stylesString = "style={" + styles + "}";
        }
        else {
            stylesString = "style={[" + styles + "]}";
        }
    }
    var propsArray = [];
    if (props) {
        Object.keys(props).map(function (propName) {
            var propValue = props[propName];
            propsArray.push(propName + "={" + JSON.stringify(propValue) + "}");
        });
    }
    var propsString = (propsArray.length ? ' ' + propsArray.join(' ') : '');
    if (childrenJSX && childrenJSX.length > 0) {
        return "<" + name + " " + stylesString + " " + propsString + ">" + childrenJSX + "</" + name + ">";
    }
    else {
        return "<" + name + " " + stylesString + " " + propsString + "/>";
    }
}
exports.default = jsx;
//# sourceMappingURL=jsx.js.map