import * as WebSocket from 'ws';
declare class JWTToken {
    payload: any;
    identifier: string;
    constructor(payload: any);
    hasPermission(perm: string): boolean;
}
declare class SocketACL {
    jwtToken: JWTToken | undefined;
    externalPerms: string[];
    externalIdentifier: string | undefined;
    constructor(token?: JWTToken);
    readonly identifier: string;
    hasPermission(perm: string): boolean;
}
interface AuthenticatedSocketOptions extends WebSocket.ServerOptions {
    jwtPubKey?: string;
    jwtRequired: boolean;
}
declare class AuthenticatedSocket extends WebSocket.Server {
    options: AuthenticatedSocketOptions;
    constructor(options: AuthenticatedSocketOptions);
    private verifyClient;
}
export { AuthenticatedSocketOptions, AuthenticatedSocket, SocketACL, JWTToken, };
