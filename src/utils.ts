import { RPCMethodError } from 'modular-json-rpc/dist/Defines';
import { SocketACL } from './socket';

export enum RPCErrors {
  GENERIC = 0,
  UNSUPPORTED_TAG_TYPE = 1,
  AUTHENTICATE_FAILED = 2,
  INITIALIZE_KEY_FAILED = 3,
  ACCESS_DENIED = 4,
}

export function RequirePermission(acl: SocketACL, permission: string) {
  if (!acl.hasPermission(`${permission}`))
    throw new RPCMethodError(RPCErrors.ACCESS_DENIED, `No permission to call ${permission}`);
}
