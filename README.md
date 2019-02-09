[![Build Status](https://travis-ci.org/chemicstry/eacs-server.svg?branch=master)](https://travis-ci.org/chemicstry/eacs-server)
[![Coverage Status](https://coveralls.io/repos/github/chemicstry/eacs-server/badge.svg?branch=master)](https://coveralls.io/github/chemicstry/eacs-server?branch=master)

# eacs-server
Extensible Access Control System Server

## options

  -p, --port number       Port number of websocket
  -h, --host string       Host (IP) of websocket
  --tls_cert string       TLS certificate file (leave blank to disable TLS)
  --tls_key string        TLS key file
  --jwtPublicKey string   Public key (in PEM format) used for JWT verification
  --jwtRequired           Forbid connections without a valid JWT token
  --mdns                  Use mdns for service discovery
  --dbType string         Database type (sequelize|lowdb)
  --lowdbFile string      LowDB file for storing user data
  --sequelizeURL string   SQL database connection URI
  --rfidCrypto            Use cryptogtaphy for RFID tag authentication
  --hkdf_ikm string       Initial keying material for HKDF key provider
  --hkdf_salt string      Salt for HKDF key provider
  --help                  Prints usage information

