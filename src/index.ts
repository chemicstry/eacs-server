// Initialize cmd options
import { options, initOptions } from './options';
initOptions();

import { AuthenticatedSocket, SocketACL } from './socket';
import * as WebSocket from 'ws';
import { readFileSync } from 'fs';
import { IncomingMessage } from 'http';
import * as https from 'https';
import { Log } from 'Log';
import { WSTransport, RPCNode } from 'modular-json-rpc';
import LowDB from 'db/lowdb';
import SequelizeDB from 'db/sequelize';
import bonjour from 'bonjour';
import { initDB } from 'dbInstance';
import InitRPC from 'rpc';

// Load JWT public key
const jwtPublicKey = readFileSync(options.jwtPublicKey, "utf8");

// Setup EACSSocket (websockets with JWT auth)
if (options.tls_cert.length) {
  // With TLS
  var server = https.createServer({
    cert: readFileSync(options.tls_cert),
    key: readFileSync(options.tls_key)
  }).listen(options.port, options.host);

  var socket = new AuthenticatedSocket({
    jwtPubKey: jwtPublicKey,
    jwtRequired: options.jwtRequired,
    server
  });

  Log.info(`Service started on ${options.host}:${options.port} with TLS encryption`)
}
else {
  // Without TLS
  var socket = new AuthenticatedSocket({
    host: options.host,
    port: options.port,
    jwtPubKey: jwtPublicKey,
    jwtRequired: options.jwtRequired
  });

  Log.info(`Service started on ${options.host}:${options.port}`)
}

// Start mdns advertisement
if (options.mdns) {
  bonjour().publish({ name: 'eacs-server', type: 'eacs-server', port: options.port })
  Log.info("Started mDNS advertisement");
}

// Init database
if (options.dbType === "sequelize") {
  initDB(new SequelizeDB({
    url: options.sequelizeURL,
    operatorsAliases: false
  }));
} else if (options.dbType == "lowdb") {
  initDB(new LowDB(options.lowdbFile))
} else {
  Log.error("Unknown database type", options.dbType);
  process.exit(1);
}

socket.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  let acl = <SocketACL>(<any>req).acl;

  Log.info(`index: New connection from ${req.connection.remoteAddress}. Identifier: ${(acl.jwtToken ? acl.jwtToken.identifier : 'n/a')}`);

  // Create RPC transport over websocket
  let transport = new WSTransport(ws);

  // Create bidirectional RPC connection
  let node = new RPCNode(transport);

  // Handle error
  node.on('error', (e) => {
    Log.error("Internal JSONRPC Error", e);
  });
  ws.on('error', (e) => {
    Log.error("WebSocket Error", e);
  });

  // Bind all RPC methods
  InitRPC(node, acl);
});
