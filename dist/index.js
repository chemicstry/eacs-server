"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Initialize cmd options
const options_1 = require("./options");
options_1.initOptions();
const socket_1 = require("./socket");
const fs_1 = require("fs");
const https = __importStar(require("https"));
const Log_1 = require("Log");
const modular_json_rpc_1 = require("modular-json-rpc");
const lowdb_1 = __importDefault(require("db/lowdb"));
const sequelize_1 = __importDefault(require("db/sequelize"));
const bonjour_1 = __importDefault(require("bonjour"));
const dbInstance_1 = require("dbInstance");
const rpc_1 = __importDefault(require("rpc"));
// Load JWT public key
const jwtPublicKey = fs_1.readFileSync(options_1.options.jwtPublicKey, "utf8");
// Setup EACSSocket (websockets with JWT auth)
if (options_1.options.tls_cert.length) {
    // With TLS
    var server = https.createServer({
        cert: fs_1.readFileSync(options_1.options.tls_cert),
        key: fs_1.readFileSync(options_1.options.tls_key)
    }).listen(options_1.options.port, options_1.options.host);
    var socket = new socket_1.AuthenticatedSocket({
        jwtPubKey: jwtPublicKey,
        jwtRequired: options_1.options.jwtRequired,
        server
    });
    Log_1.Log.info(`Service started on ${options_1.options.host}:${options_1.options.port} with TLS encryption`);
}
else {
    // Without TLS
    var socket = new socket_1.AuthenticatedSocket({
        host: options_1.options.host,
        port: options_1.options.port,
        jwtPubKey: jwtPublicKey,
        jwtRequired: options_1.options.jwtRequired
    });
    Log_1.Log.info(`Service started on ${options_1.options.host}:${options_1.options.port}`);
}
// Start mdns advertisement
if (options_1.options.mdns) {
    bonjour_1.default().publish({ name: 'eacs-server', type: 'eacs-server', port: options_1.options.port });
    Log_1.Log.info("Started mDNS advertisement");
}
// Init database
if (options_1.options.dbType === "sequelize") {
    dbInstance_1.initDB(new sequelize_1.default({
        url: options_1.options.sequelizeURL,
        operatorsAliases: false
    }));
}
else if (options_1.options.dbType == "lowdb") {
    dbInstance_1.initDB(new lowdb_1.default(options_1.options.lowdbFile));
}
else {
    Log_1.Log.error("Unknown database type", options_1.options.dbType);
    process.exit(1);
}
socket.on('connection', (ws, req) => {
    let acl = req.acl;
    Log_1.Log.info(`index: New connection from ${req.connection.remoteAddress}. Identifier: ${(acl.jwtToken ? acl.jwtToken.identifier : 'n/a')}`);
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
    // Bind all RPC methods
    rpc_1.default(node, acl);
});
