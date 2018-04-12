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
Object.defineProperty(exports, "__esModule", { value: true });
var teleport_lib_js_1 = require("../teleport-lib-js");
var ReactComponentGenerator = /** @class */ (function (_super) {
    __extends(ReactComponentGenerator, _super);
    function ReactComponentGenerator(generator) {
        return _super.call(this, generator) || this;
    }
    ReactComponentGenerator.prototype.generate = function (component, options) {
        return "COMPONENT OUT: " + this.generator.target.name;
    };
    return ReactComponentGenerator;
}(teleport_lib_js_1.ComponentGenerator));
exports.default = ReactComponentGenerator;
//# sourceMappingURL=ComponentGenerator.js.map