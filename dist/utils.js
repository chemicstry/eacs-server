"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Defines_1 = require("modular-json-rpc/dist/Defines");
var RPCErrors;
(function (RPCErrors) {
    RPCErrors[RPCErrors["GENERIC"] = 0] = "GENERIC";
    RPCErrors[RPCErrors["UNSUPPORTED_TAG_TYPE"] = 1] = "UNSUPPORTED_TAG_TYPE";
    RPCErrors[RPCErrors["AUTHENTICATE_FAILED"] = 2] = "AUTHENTICATE_FAILED";
    RPCErrors[RPCErrors["INITIALIZE_KEY_FAILED"] = 3] = "INITIALIZE_KEY_FAILED";
    RPCErrors[RPCErrors["ACCESS_DENIED"] = 4] = "ACCESS_DENIED";
})(RPCErrors = exports.RPCErrors || (exports.RPCErrors = {}));
function RequirePermission(acl, permission) {
    if (!acl.hasPermission(`${permission}`))
        throw new Defines_1.RPCMethodError(RPCErrors.ACCESS_DENIED, `No permission to call ${permission}`);
}
exports.RequirePermission = RequirePermission;
