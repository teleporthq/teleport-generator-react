"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function jsx(name, childrenJSX, styles) {
    var stylesString = '';
    if (styles) {
        if (styles.length > 0) {
            stylesString = "style={" + styles + "}";
        }
        else {
            stylesString = "style={[" + styles + "]}";
        }
    }
    if (childrenJSX && childrenJSX.length > 0) {
        return "<" + name + " " + stylesString + ">" + childrenJSX + "</" + name + ">";
    }
    else {
        return "<" + name + " " + stylesString + "/>";
    }
}
exports.default = jsx;
//# sourceMappingURL=jsx.js.map