import { SocketACL } from './socket';
export declare enum RPCErrors {
    GENERIC = 0,
    UNSUPPORTED_TAG_TYPE = 1,
    AUTHENTICATE_FAILED = 2,
    INITIALIZE_KEY_FAILED = 3,
    ACCESS_DENIED = 4
}
export declare function RequirePermission(acl: SocketACL, permission: string): void;
