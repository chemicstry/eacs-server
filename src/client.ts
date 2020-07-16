import { Transport, RPCNode, WSTransport } from 'modular-json-rpc';
import { SocketACL } from 'socket';
import * as WebSocket from 'ws';
import { Log } from 'Log';

export class Client {
  transport: Transport;
  rpc: RPCNode;
  acl: SocketACL;

  constructor(ws: WebSocket, acl: SocketACL) {
    this.transport = new WSTransport(ws);
    this.rpc = new RPCNode(this.transport);
    this.acl = acl;

    this.rpc.on('error', (e) => {
      Log.error("Internal JSONRPC Error", e);
    });
  }
}

export class ClientRegistry {
  clients: Client[] = [];

  add(client: Client) {
    this.clients.push(client);
  }

  remove(client: Client) {
    this.clients = this.clients.filter(c => c != client);
  }

  findByIdentifier(identifier: string): Client[] {
    return this.clients.filter(c => c.acl.identifier == identifier);
  }
}
