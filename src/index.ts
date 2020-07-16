// Initialize cmd options
import { options, initOptions } from './options';
initOptions();

import { AuthenticatedServer, SocketACL } from './socket';
import * as WebSocket from 'ws';
import { readFileSync } from 'fs';
import { IncomingMessage } from 'http';
import * as https from 'https';
import { Log } from 'Log';
import LowDB from 'db/lowdb';
import SequelizeDB from 'db/sequelize';
import bonjour from 'bonjour';
import { initDB } from 'dbInstance';
import InitRPC from 'rpc';
import { Client, ClientRegistry } from 'client';

// Load JWT public key
const jwtPublicKey = readFileSync(options.jwtPublicKey, "utf8");

// Setup EACSSocket (websockets with JWT auth)
if (options.tls_cert.length) {
  // With TLS
  var http_server = https.createServer({
    cert: readFileSync(options.tls_cert),
    key: readFileSync(options.tls_key)
  }).listen(options.port, options.host);

  var server = new AuthenticatedServer({
    jwtPubKey: jwtPublicKey,
    jwtRequired: options.jwtRequired,
    clientTracking: true,
    server: http_server
  });

  Log.info(`Service started on ${options.host}:${options.port} with TLS encryption`)
}
else {
  // Without TLS
  var server = new AuthenticatedServer({
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
  initDB(new SequelizeDB(options.sequelizeURL));
} else if (options.dbType == "lowdb") {
  initDB(new LowDB(options.lowdbFile))
} else {
  Log.error("Unknown database type", options.dbType);
  process.exit(1);
}

let registry = new ClientRegistry();

server.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  let acl = <SocketACL>(<any>req).acl;

  Log.info(`New connection from ${req.connection.remoteAddress}. Identifier: ${(acl.jwtToken ? acl.jwtToken.identifier : 'n/a')}`);

  let client = new Client(ws, acl);
  registry.add(client);

  ws.on('error', (e) => {
    Log.error("WebSocket Error", e);
  });

  ws.on('close', () => {
    Log.info(`Client ${req.connection.remoteAddress} disconnected. Identifier: ${(acl.jwtToken ? acl.jwtToken.identifier : 'n/a')}`);
    registry.remove(client);
  })

  // Bind all RPC methods
  InitRPC(client, registry);
});
