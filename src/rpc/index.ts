import InitRFIDRPC from './rfid';
import InitAdminRPC from './admin';
import { RPCNode } from 'modular-json-rpc';
import { SocketACL } from 'socket';

export default function InitRPC(node: RPCNode, acl: SocketACL) {
  InitRFIDRPC(node, acl);
  InitAdminRPC(node, acl);
}
