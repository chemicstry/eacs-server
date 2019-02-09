"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = [
    {
        name: 'port',
        alias: 'p',
        type: Number,
        defaultValue: 3000,
        description: 'Port number of websocket'
    },
    {
        name: 'host',
        alias: 'h',
        type: String,
        defaultValue: '::',
        description: 'Host (IP) of websocket'
    },
    {
        name: 'tls_cert',
        type: String,
        defaultValue: 'tls_cert.pem',
        description: 'TLS certificate file (leave blank to disable TLS)'
    },
    {
        name: 'tls_key',
        type: String,
        defaultValue: 'tls_key.pem',
        description: 'TLS key file'
    },
    {
        name: 'jwtPublicKey',
        type: String,
        defaultValue: 'jwt.pem',
        description: 'Public key (in PEM format) used for JWT verification'
    },
    {
        name: 'mdns',
        type: Boolean,
        defaultValue: true,
        description: 'Use mdns for service discovery'
    },
    {
        name: 'dbFile',
        type: String,
        defaultValue: 'db.json',
        description: 'LowDB file for storing user data'
    },
    {
        name: 'help',
        type: Boolean,
        description: 'Prints usage information'
    }
];
