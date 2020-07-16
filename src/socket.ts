import * as WebSocket from 'ws';
import * as jwt from 'jsonwebtoken';
import * as http from 'http';

class JWTToken {
  payload: any;
  identifier: string;

  constructor(payload: any) {
    if (typeof payload.identifier != 'string')
      throw new Error('Token payload does not have identifier field');

    if (!Array.isArray(payload.permissions))
      throw new Error('Token payload does not have correct permissions field');

    this.payload = payload;
    this.identifier = payload.identifier;
  }

  hasPermission(perm: string): boolean {
    return this.payload.permissions.includes(perm);
  }
}

class SocketACL
{
  jwtToken: JWTToken | undefined; // Permissions granted by the JWT token
  externalPerms: string[] = []; // Permissions granted by other means (rpc auth calls)
  externalIdentifier: string | undefined;

  constructor(token?: JWTToken) {
    this.jwtToken = token;
  }
  
  get identifier(): string {
    if (this.externalIdentifier)
      return this.externalIdentifier;
    
    if (this.jwtToken)
      return this.jwtToken.identifier;
    
    return 'n/a';
  }

  hasPermission(perm: string): boolean {
    if (this.jwtToken && this.jwtToken.hasPermission(perm))
      return true; 

    if (this.externalPerms.includes(perm))
      return true;
    
    return false;
  }
}

interface AuthenticatedServerOptions extends WebSocket.ServerOptions {
  jwtPubKey?: string,
  jwtRequired: boolean
}

type wsClientInfo = { origin: string; secure: boolean; req: http.IncomingMessage };
type wsVerifyCallback = (res: boolean, code?: number, message?: string) => void;

class AuthenticatedServer extends WebSocket.Server {
  options: AuthenticatedServerOptions;

  constructor(options: AuthenticatedServerOptions) {
    options = {
      ...options,
      verifyClient: (info, cb) => this.verifyClient(info, cb)
    };

    super(options);
    this.options = options;

    if (!this.options.jwtPubKey)
      console.log('Warning: not using JWT authentication. Public key is missing.');
    
    if (!this.options.jwtRequired)
      console.log('Warning: jwt authentication enforcement is disabled');
  }

  // Authenticates new websocket connection using JWT
  private verifyClient(info: wsClientInfo, cb: wsVerifyCallback) {
    // Not using authentication
    if (!this.options.jwtPubKey) {
      cb(true);
      return;
    }

    // Get token from headers
    let token = info.req.headers.token;

    if (token) {
      jwt.verify(<string>token, this.options.jwtPubKey, (err, decoded) => {
        if (err) {
          console.log(`JWT verification failed for ${info.req.connection.remoteAddress}`);
          cb(false, 401, 'Unauthorized');
        } else {
          try {
            // Hack typescript to insert additional data
            let jwtToken = new JWTToken(decoded);
            (<any>info.req).acl = new SocketACL(jwtToken);
            cb(true);
          } catch (e) {
            console.log(`JWT token parsing failed for ${info.req.connection.remoteAddress}: ${e}`);
            cb(false, 401, 'Unauthorized');
          }
        }
      });
    } else {
      if (this.options.jwtRequired) {
        console.log(`Token not found for ${info.req.connection.remoteAddress}`);
        cb(false, 401, 'Unauthorized');
      } else {
        (<any>info.req).acl = new SocketACL();
        cb(true);
      }
    }
  }
}

export {
  AuthenticatedServerOptions,
  AuthenticatedServer,
  SocketACL,
  JWTToken,
}
