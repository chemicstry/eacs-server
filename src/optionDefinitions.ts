export default [
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
        name: 'jwtRequired',
        type: Boolean,
        defaultValue: false,
        description: 'Forbid connections without a valid JWT token'
    },
    {
        name: 'mdns',
        type: Boolean,
        defaultValue: true,
        description: 'Use mdns for service discovery'
    },
    {
        name: 'dbType',
        type: String,
        defaultValue: 'sequelize',
        description: 'Database type (sequelize|lowdb)'
    },
    {
        name: 'lowdbFile',
        type: String,
        defaultValue: 'db.json',
        description: 'LowDB file for storing user data'
    },
    {
        name: 'sequelizeURL',
        type: String,
        defaultValue: 'postgres://eacs:eacs@localhost/eacs',
        description: 'SQL database connection URI'
    },
    {
        name: 'rfidCrypto',
        type: Boolean,
        defaultValue: true,
        description: 'Use cryptogtaphy for RFID tag authentication'
    },
    {
        name: 'hkdf_ikm',
        type: String,
        defaultValue: '00102030405060708090A0B0B0A09080',
        description: 'Initial keying material for HKDF key provider'
    },
    {
        name: 'hkdf_salt',
        type: String,
        defaultValue: 'eacs',
        description: 'Salt for HKDF key provider'
    },
    {
        name: 'help',
        type: Boolean,
        description: 'Prints usage information'
    }
];
