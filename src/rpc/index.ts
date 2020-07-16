import InitRFIDRPC from './rfid';
import InitAdminRPC from './admin';
import { RPCNode } from 'modular-json-rpc';
import { SocketACL } from 'socket';
import { Client, ClientRegistry } from 'client';

export default function InitRPC(client: Client, registry: ClientRegistry) {
  InitRFIDRPC(client, registry);
  InitAdminRPC(client, registry);
}
