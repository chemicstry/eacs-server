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
const options_1 = require("options");
const KeyProvider_1 = require("rfid/KeyProvider");
const TagFactory_1 = require("rfid/TagFactory");
// Initial keying material used to derive keys
const IKM = Buffer.from(options_1.options.hkdf_ikm, 'hex');
// HKDF key provider
const keyProvider = new KeyProvider_1.HKDF(IKM, 'sha256', Buffer.from(options_1.options.hkdf_salt));
// Returns tag object bound to RPC transceive function
function GetTag(tagInfoRPC, transceive) {
    // Parse arguments
    const taginfo = {
        ATQA: tagInfoRPC.ATQA,
        SAK: tagInfoRPC.SAK,
        UID: Buffer.from(tagInfoRPC.UID, 'hex'),
        ATS: Buffer.from(tagInfoRPC.ATS, 'hex')
    };
    var TagClass;
    try {
        TagClass = TagFactory_1.TagFactory.Identify(taginfo);
    }
    catch (e) {
        throw new Defines_1.RPCMethodError(utils_1.RPCErrors.UNSUPPORTED_TAG_TYPE, "Unsupported tag type");
    }
    // Initialize tag
    return new TagClass(taginfo, (buf) => transceive(buf));
}
function InitRFIDRPC(node, acl) {
    // Exchanges data with remote tag
    function Transceive(buf) {
        return __awaiter(this, void 0, void 0, function* () {
            // Call remote transceive function
            var result = yield node.call("rfid:transceive", buf.toString('hex'));
            // Convert result to buffer
            return Buffer.from(result, 'hex');
        });
    }
    // Returns list of permissions authenticated user has
    function RFIDAuthenticate(tagInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            let tag = GetTag(tagInfo, Transceive);
            // Authenticate RFID with crypto if enabled
            if (options_1.options.rfidCrypto) {
                try {
                    if (!(yield tag.Authenticate(keyProvider)))
                        return {
                            userId: '',
                            permissions: []
                        };
                }
                catch (e) {
                    Log_1.Log.error(`rfid:auth(): Authentication error: ${e.message}`, e);
                    throw new Defines_1.RPCMethodError(utils_1.RPCErrors.AUTHENTICATE_FAILED, `Error authenticating: ${e.message}`);
                }
            }
            // Authenticate via database
            try {
                var userId = yield dbInstance_1.db.findUserIdByTag(tagInfo.UID.toString('hex'));
                var permissions = yield dbInstance_1.db.getUserPermissions(userId);
                return { userId, permissions };
            }
            catch (err) {
                Log_1.Log.error("auth:uid error", err);
                throw new Defines_1.RPCMethodError(utils_1.RPCErrors.GENERIC, err);
            }
        });
    }
    // Authenticates users against socket identifier (JWT token identifier)
    node.bind("rfid:auth", (tagInfo) => __awaiter(this, void 0, void 0, function* () {
        Log_1.Log.debug("rfid:auth()", tagInfo);
        var authResult = yield RFIDAuthenticate(tagInfo);
        dbInstance_1.db.logEvent("rfid:auth", acl.identifier, authResult.userId, authResult);
        return authResult.permissions.includes(acl.identifier);
    }));
    // Authenticates tag and returns user info
    node.bind("rfid:tagInfo", (tagInfo) => __awaiter(this, void 0, void 0, function* () {
        utils_1.RequirePermission(acl, "rfid:tagInfo");
        Log_1.Log.debug("rfid:tagInfo()", tagInfo);
        let tag = GetTag(tagInfo, Transceive);
        var info = {
            UID: tagInfo.UID,
            cryptoAuth: false,
            userId: null,
            permissions: null,
            user: {}
        };
        // Test if tag has correct keys
        try {
            if (yield tag.Authenticate(keyProvider))
                info.cryptoAuth = true;
        }
        catch (e) { }
        // Check if tag is associated with user
        try {
            info.userId = yield dbInstance_1.db.findUserIdByTag(tagInfo.UID.toString('hex'));
            info.permissions = yield dbInstance_1.db.getUserPermissions(info.userId);
            var users = yield dbInstance_1.db.getUsers();
            info.user = users.find((u) => u.id == info.userId);
        }
        catch (err) {
            console.log(err);
        }
        return info;
    }));
    node.bind("rfid:initKey", (tagInfo) => __awaiter(this, void 0, void 0, function* () {
        utils_1.RequirePermission(acl, "rfid:initKey");
        let tag = GetTag(tagInfo, Transceive);
        // Initialize key
        try {
            var res = yield tag.InitializeKey(keyProvider);
            dbInstance_1.db.logEvent("rfid:initKey", acl.identifier, '', {});
        }
        catch (e) {
            Log_1.Log.error(`rfid:initKey(): error: ${e.message}`, e);
            throw new Defines_1.RPCMethodError(utils_1.RPCErrors.INITIALIZE_KEY_FAILED, e.message);
        }
        return res;
    }));
    // authenticate rfid tag and append user permission to socket permissions
    node.bind("rfid:authSocket", (tagInfo) => __awaiter(this, void 0, void 0, function* () {
        Log_1.Log.debug("rfid:authSocket()", tagInfo);
        console.log(tagInfo);
        // Authenticate and append received permissions
        var authResult = yield RFIDAuthenticate(tagInfo);
        acl.externalPerms = authResult.permissions;
        dbInstance_1.db.logEvent("rfid:authSocket", acl.identifier, authResult.userId, authResult);
        // return granted permissions
        return authResult.permissions;
    }));
}
exports.default = InitRFIDRPC;
