"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
class ConstantKeyProvider {
    constructor(key) {
        this.key = key;
    }
    GetKey(keydatalen, OtherInfo) {
        return this.key;
    }
}
exports.ConstantKeyProvider = ConstantKeyProvider;
// Defined in RFC5869 https://tools.ietf.org/html/rfc5869
class HKDF {
    constructor(IKM, hashalgo, salt) {
        // Initial keying material (master key)
        this.IKM = IKM;
        // Hashing algorithm
        this.hashalgo = hashalgo;
        // Hashing algorithm length (in bytes)
        this.hashlen = crypto_1.createHash(this.hashalgo).digest().length;
        // Salt
        this.salt = salt || this.Zeros(this.hashlen);
        // Extract primary keying material (PRK)
        this.PRK = this.Extract();
    }
    Zeros(len) {
        var buf = Buffer.alloc(len);
        buf.fill(0);
        return buf;
    }
    Extract() {
        let hmac = crypto_1.createHmac(this.hashalgo, this.salt);
        hmac.update(this.IKM);
        return hmac.digest();
    }
    Expand(info, size) {
        let prev = Buffer.alloc(0);
        let buffers = [];
        // Get number of blocks to expand
        let blocks = Math.ceil(size / this.hashlen);
        for (let i = 0; i < blocks; ++i) {
            let hmac = crypto_1.createHmac(this.hashalgo, this.PRK);
            hmac.update(prev);
            hmac.update(info);
            hmac.update(Buffer.from(String.fromCharCode(i + 1)));
            prev = hmac.digest();
            buffers.push(prev);
        }
        return Buffer.concat(buffers, size);
    }
    GetKey(keydatalen, OtherInfo) {
        return this.Expand(OtherInfo, keydatalen);
    }
}
exports.HKDF = HKDF;
