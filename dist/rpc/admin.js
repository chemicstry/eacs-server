"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dbInstance_1 = require("dbInstance");
const Log_1 = require("Log");
const Defines_1 = require("modular-json-rpc/dist/Defines");
const utils_1 = require("utils");
function InitAdminRPC(node, acl) {
    node.bind("admin:getUsers", () => __awaiter(this, void 0, void 0, function* () {
        utils_1.RequirePermission(acl, "admin:getUsers");
        try {
            return dbInstance_1.db.getUsers();
        }
        catch (err) {
            Log_1.Log.error("getUsers error", err);
            throw new Defines_1.RPCMethodError(utils_1.RPCErrors.GENERIC, err);
        }
    }));
    node.bind("admin:upsertUser", (data) => __awaiter(this, void 0, void 0, function* () {
        Log_1.Log.info("admin:upsertUser", data);
        utils_1.RequirePermission(acl, "admin:upsertUser");
        try {
            dbInstance_1.db.upsertUser(data);
            return true;
        }
        catch (err) {
            Log_1.Log.error("upserUser error", err);
            throw new Defines_1.RPCMethodError(utils_1.RPCErrors.GENERIC, err);
        }
    }));
    node.bind("admin:deleteUser", (id) => __awaiter(this, void 0, void 0, function* () {
        Log_1.Log.info("admin:deleteUser", id);
        utils_1.RequirePermission(acl, "admin:deleteUser");
        try {
            dbInstance_1.db.deleteUser(id);
            return true;
        }
        catch (err) {
            Log_1.Log.error("admin:deleteUser error", err);
            throw new Defines_1.RPCMethodError(utils_1.RPCErrors.GENERIC, err);
        }
    }));
    node.bind("admin:getGroups", () => __awaiter(this, void 0, void 0, function* () {
        utils_1.RequirePermission(acl, "admin:getGroups");
        try {
            return dbInstance_1.db.getGroups();
        }
        catch (err) {
            Log_1.Log.error("admin:getGroups error", err);
            throw new Defines_1.RPCMethodError(utils_1.RPCErrors.GENERIC, err);
        }
    }));
    node.bind("admin:upsertGroup", (data) => __awaiter(this, void 0, void 0, function* () {
        Log_1.Log.info("admin:upsertGroup", data);
        utils_1.RequirePermission(acl, "admin:upsertGroup");
        try {
            dbInstance_1.db.upsertGroup(data);
            return true;
        }
        catch (err) {
            Log_1.Log.error("admin:upsertGroup error", err);
            throw new Defines_1.RPCMethodError(utils_1.RPCErrors.GENERIC, err);
        }
    }));
    node.bind("admin:deleteGroup", (id) => __awaiter(this, void 0, void 0, function* () {
        Log_1.Log.info("admin:deleteGroup", id);
        utils_1.RequirePermission(acl, "admin:deleteGroup");
        try {
            dbInstance_1.db.deleteGroup(id);
            return true;
        }
        catch (err) {
            Log_1.Log.error("admin:deleteGroup error", err);
            throw new Defines_1.RPCMethodError(utils_1.RPCErrors.GENERIC, err);
        }
    }));
}
exports.default = InitAdminRPC;
