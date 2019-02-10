"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const DFEV1_INS_AUTHENTICATE_ISO = 0x1A;
const DFEV1_INS_AUTHENTICATE_AES = 0xAA;
// Not usable directly, just a base class to prevent boilerplate code
class DesfireKeyGeneric {
    constructor() {
        this.BlockLen = 0;
        this.KeyLen = 0;
        this.IV = Buffer.alloc(this.BlockLen);
        this.Ver = 0x00;
        this.Key = Buffer.alloc(this.KeyLen);
        this.CipherAlgorithm = '';
    }
    Get() {
        return this.Key;
    }
    BlockLength() {
        return this.BlockLen;
    }
    KeyLength() {
        return this.KeyLen;
    }
    Version() {
        return this.Ver;
    }
    /* istanbul ignore next */
    GetAuthCmd() {
        return 0x00;
    }
    /* istanbul ignore next */
    GetSessionKey(RndA, RndB) {
        return new DesfireKeyGeneric();
    }
    ResetIV() {
        this.IV.fill(0x00);
    }
    Encrypt(data) {
        let cipher = crypto_1.createCipheriv(this.CipherAlgorithm, this.Key, this.IV);
        cipher.setAutoPadding(false);
        var enc = cipher.update(data);
        var final = cipher.final();
        enc = Buffer.concat([enc, final]);
        this.IV = enc.slice(enc.length - this.BlockLen, enc.length);
        return enc;
    }
    Decrypt(data) {
        let decipher = crypto_1.createDecipheriv(this.CipherAlgorithm, this.Key, this.IV);
        decipher.setAutoPadding(false);
        var dec = decipher.update(data);
        var final = decipher.final();
        this.IV = data.slice(data.length - this.BlockLen, data.length);
        return Buffer.concat([dec, final]);
    }
}
exports.DesfireKeyGeneric = DesfireKeyGeneric;
class DesfireKeyAES extends DesfireKeyGeneric {
    constructor(key = Buffer.from('00000000000000000000000000000000', 'hex'), version = 0x00) {
        super();
        this.KeyLen = 16;
        this.BlockLen = 16;
        this.Key = key;
        this.IV = Buffer.alloc(this.BlockLen);
        this.Ver = version;
        this.CipherAlgorithm = 'aes-128-cbc';
    }
    GetAuthCmd() {
        return DFEV1_INS_AUTHENTICATE_AES;
    }
    GetSessionKey(RndA, RndB) {
        let buf = Buffer.alloc(this.KeyLen);
        let i = 0;
        i += RndA.copy(buf, i, 0, 4);
        i += RndB.copy(buf, i, 0, 4);
        i += RndA.copy(buf, i, 12, 16);
        i += RndB.copy(buf, i, 12, 16);
        return new DesfireKeyAES(buf);
    }
}
exports.DesfireKeyAES = DesfireKeyAES;
;
class DesfireKey2K3DES extends DesfireKeyGeneric {
    constructor(key = Buffer.from('00000000000000000000000000000000', 'hex'), version = 0x00) {
        super();
        this.KeyLen = 16;
        this.BlockLen = 8;
        this.Key = key;
        this.IV = Buffer.alloc(this.BlockLen);
        this.Ver = version;
        this.CipherAlgorithm = 'des-ede-cbc';
    }
    GetAuthCmd() {
        return DFEV1_INS_AUTHENTICATE_ISO;
    }
    GetSessionKey(RndA, RndB) {
        let buf = Buffer.alloc(this.KeyLen);
        let i = 0;
        i += RndA.copy(buf, i, 0, 4);
        i += RndB.copy(buf, i, 0, 4);
        i += RndA.copy(buf, i, 4, 8);
        i += RndB.copy(buf, i, 4, 8);
        return new DesfireKey2K3DES(buf);
    }
}
exports.DesfireKey2K3DES = DesfireKey2K3DES;
;
// Default key uses different session key construct (WHY???)
class DesfireKey2K3DESDefault extends DesfireKey2K3DES {
    constructor(key = Buffer.from('00000000000000000000000000000000', 'hex'), version = 0x00) {
        super(key, version);
    }
    GetSessionKey(RndA, RndB) {
        let buf = Buffer.alloc(this.KeyLen);
        let i = 0;
        i += RndA.copy(buf, i, 0, 4);
        i += RndB.copy(buf, i, 0, 4);
        i += RndA.copy(buf, i, 0, 4);
        i += RndB.copy(buf, i, 0, 4);
        return new DesfireKey2K3DES(buf);
    }
}
exports.DesfireKey2K3DESDefault = DesfireKey2K3DESDefault;
;
class DesfireKey3K3DES extends DesfireKeyGeneric {
    constructor(key = Buffer.from('000000000000000000000000000000000000000000000000', 'hex'), version = 0x00) {
        super();
        this.KeyLen = 24;
        this.BlockLen = 8;
        this.Key = key;
        this.IV = Buffer.alloc(this.BlockLen);
        this.Ver = version;
        this.CipherAlgorithm = 'des-ede3-cbc';
    }
    GetAuthCmd() {
        return DFEV1_INS_AUTHENTICATE_ISO;
    }
    GetSessionKey(RndA, RndB) {
        let buf = Buffer.alloc(this.KeyLen);
        let i = 0;
        i += RndA.copy(buf, i, 0, 4);
        i += RndB.copy(buf, i, 0, 4);
        i += RndA.copy(buf, i, 6, 10);
        i += RndB.copy(buf, i, 6, 10);
        i += RndA.copy(buf, i, 12, 16);
        i += RndB.copy(buf, i, 12, 16);
        return new DesfireKey3K3DES(buf);
    }
}
exports.DesfireKey3K3DES = DesfireKey3K3DES;
;
