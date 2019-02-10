"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rfid_1 = __importDefault(require("./rfid"));
const admin_1 = __importDefault(require("./admin"));
function InitRPC(node, acl) {
    rfid_1.default(node, acl);
    admin_1.default(node, acl);
}
exports.default = InitRPC;
