"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var teleport = null;
if (process.env.TELEPORT_ENV === 'development') {
    console.info('teleport-generator-react: LOADING DEV teleport-lib-js');
    // tslint:disable-next-line
    teleport = require('../teleport-lib-js');
}
else {
    // tslint:disable-next-line
    teleport = require('teleport-lib-js');
}
exports.default = teleport;
//# sourceMappingURL=teleport.js.map