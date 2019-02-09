"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const commandLineArgs = require("command-line-args");
const commandLineUsage = require("command-line-usage");
const eacs_socket_1 = require("eacs-socket");
const fs_1 = require("fs");
const https = __importStar(require("https"));
const Log_1 = require("./Log");
const modular_json_rpc_1 = require("modular-json-rpc");
const Defines_1 = require("modular-json-rpc/dist/Defines");
const options_1 = __importDefault(require("./options"));
const DB_1 = __importDefault(require("./DB"));
const mdns = __importStar(require("mdns"));
// Options
const options = commandLineArgs(options_1.default);
// Print usage
if (options.help) {
    const sections = [
        {
            header: 'eacs-user-auth',
            content: 'Extensible Access Control System. User Authentication Module.'
        },
        {
            header: 'Options',
            optionList: options_1.default
        }
    ];
    console.log(commandLineUsage(sections));
    process.exit();
}
// Load JWT public key
const jwtPublicKey = fs_1.readFileSync(options.jwtPublicKey, "utf8");
// Setup EACSSocket (websockets with JWT auth)
if (options.tls_cert.length) {
    // With TLS
    var server = https.createServer({
        cert: fs_1.readFileSync(options.tls_cert),
        key: fs_1.readFileSync(options.tls_key)
    }).listen(options.port, options.host);
    var socket = new eacs_socket_1.EACSSocket({
        jwtPubKey: jwtPublicKey,
        server
    });
    Log_1.Log.info(`Service started on ${options.host}:${options.port} with TLS encryption`);
}
else {
    // Without TLS
    var socket = new eacs_socket_1.EACSSocket({
        host: options.host,
        port: options.port,
        jwtPubKey: jwtPublicKey
    });
    Log_1.Log.info(`Service started on ${options.host}:${options.port}`);
}
// Start mdns advertisement
if (options.mdns) {
    var ad = mdns.createAdvertisement(mdns.tcp("eacs-user-auth"), options.port);
    ad.start();
    Log_1.Log.info("Started mDNS advertisement");
}
var RPCErrors;
(function (RPCErrors) {
    RPCErrors[RPCErrors["UNSUPPORTED_TAG_TYPE"] = 1] = "UNSUPPORTED_TAG_TYPE";
    RPCErrors[RPCErrors["AUTHENTICATE_FAILED"] = 2] = "AUTHENTICATE_FAILED";
    RPCErrors[RPCErrors["INITIALIZE_KEY_FAILED"] = 3] = "INITIALIZE_KEY_FAILED";
    RPCErrors[RPCErrors["ACCESS_DENIED"] = 4] = "ACCESS_DENIED";
})(RPCErrors || (RPCErrors = {}));
// Initialize database
const db = new DB_1.default(options.dbFile);
function RequirePermission(token, permission) {
    if (!token.hasPermission(`eacs-user-auth:${permission}`))
        throw new Defines_1.RPCMethodError(RPCErrors.ACCESS_DENIED, `No permission to call ${permission}`);
}
socket.on('connection', (ws, req) => {
    let token = req.token;
    Log_1.Log.info(`index: New connection from ${req.connection.remoteAddress}. Identifier: ${token.identifier}`);
    // Create RPC transport over websocket
    let transport = new modular_json_rpc_1.WSTransport(ws);
    // Create bidirectional RPC connection
    let node = new modular_json_rpc_1.RPCNode(transport);
    // Handle error
    node.on('error', (e) => {
        Log_1.Log.error("Internal JSONRPC Error", e);
    });
    ws.on('error', (e) => {
        Log_1.Log.error("WebSocket Error", e);
    });
    // object - permission (i.e. main door, lights, etc)
    node.bind("auth_uid", (object, uid) => __awaiter(this, void 0, void 0, function* () {
        RequirePermission(token, "auth_uid");
        return db.authUID(uid, object);
    }));
    node.bind("getUsers", () => __awaiter(this, void 0, void 0, function* () {
        RequirePermission(token, "getUsers");
        return db.getUsers();
    }));
    node.bind("upsertUser", (data) => __awaiter(this, void 0, void 0, function* () {
        Log_1.Log.info("upsertUser", data);
        RequirePermission(token, "upsertUser");
        db.upsertUser(data);
        return true;
    }));
    node.bind("deleteUser", (id) => __awaiter(this, void 0, void 0, function* () {
        Log_1.Log.info("deleteUser", id);
        RequirePermission(token, "deleteUser");
        db.deleteUser(id);
        return true;
    }));
    node.bind("getGroups", () => __awaiter(this, void 0, void 0, function* () {
        RequirePermission(token, "getGroups");
        return db.getGroups();
    }));
    node.bind("upsertGroup", (data) => __awaiter(this, void 0, void 0, function* () {
        Log_1.Log.info("upsertGroup", data);
        RequirePermission(token, "upsertGroup");
        db.upsertGroup(data);
        return true;
    }));
    node.bind("deleteGroup", (id) => __awaiter(this, void 0, void 0, function* () {
        Log_1.Log.info("deleteGroup", id);
        RequirePermission(token, "deleteGroup");
        db.deleteGroup(id);
        return true;
    }));
});
