"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = __importStar(require("ws"));
const jwt = __importStar(require("jsonwebtoken"));
class JWTToken {
    constructor(payload) {
        if (typeof payload.identifier != 'string')
            throw new Error('Token payload does not have identifier field');
        if (!Array.isArray(payload.permissions))
            throw new Error('Token payload does not have correct permissions field');
        this.payload = payload;
        this.identifier = payload.identifier;
    }
    hasPermission(perm) {
        return this.payload.permissions.includes(perm);
    }
}
exports.JWTToken = JWTToken;
class SocketACL {
    constructor(token) {
        this.externalPerms = []; // Permissions granted by other means (rpc auth calls)
        this.jwtToken = token;
    }
    get identifier() {
        if (this.externalIdentifier)
            return this.externalIdentifier;
        if (this.jwtToken)
            return this.jwtToken.identifier;
        return 'n/a';
    }
    hasPermission(perm) {
        if (this.jwtToken && this.jwtToken.hasPermission(perm))
            return true;
        if (this.externalPerms.includes(perm))
            return true;
        return false;
    }
}
exports.SocketACL = SocketACL;
class AuthenticatedSocket extends WebSocket.Server {
    constructor(options) {
        options = Object.assign({}, options, { verifyClient: (info, cb) => this.verifyClient(info, cb) });
        super(options);
        this.options = options;
        if (!this.options.jwtPubKey)
            console.log('Warning: not using JWT authentication. Public key is missing.');
        if (!this.options.jwtRequired)
            console.log('Warning: jwt authentication enforcement is disabled');
    }
    // Authenticates new websocket connection using JWT
    verifyClient(info, cb) {
        // Not using authentication
        if (!this.options.jwtPubKey) {
            cb(true);
            return;
        }
        // Get token from headers
        let token = info.req.headers.token;
        if (token) {
            jwt.verify(token, this.options.jwtPubKey, (err, decoded) => {
                if (err) {
                    console.log(`JWT verification failed for ${info.req.connection.remoteAddress}`);
                    cb(false, 401, 'Unauthorized');
                }
                else {
                    try {
                        // Hack typescript to insert additional data
                        let jwtToken = new JWTToken(decoded);
                        info.req.acl = new SocketACL(jwtToken);
                        cb(true);
                    }
                    catch (e) {
                        console.log(`JWT token parsing failed for ${info.req.connection.remoteAddress}: ${e}`);
                        cb(false, 401, 'Unauthorized');
                    }
                }
            });
        }
        else {
            if (this.options.jwtRequired) {
                console.log(`Token not found for ${info.req.connection.remoteAddress}`);
                cb(false, 401, 'Unauthorized');
            }
            else {
                info.req.acl = new SocketACL();
                cb(true);
            }
        }
    }
}
exports.AuthenticatedSocket = AuthenticatedSocket;
