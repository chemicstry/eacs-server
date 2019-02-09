import { createHash, createHmac } from 'crypto';

// Provides arbitraty length diversified keys based on diversification data (OtherInfo)
interface KeyProvider
{
    GetKey(keydatalen: number, OtherInfo: Buffer): Buffer;
}

class ConstantKeyProvider implements KeyProvider
{
    key: Buffer;

    constructor(key: Buffer)
    {
        this.key = key;
    }

    GetKey(keydatalen: number, OtherInfo: Buffer): Buffer
    {
        return this.key;
    }
}

// Defined in RFC5869 https://tools.ietf.org/html/rfc5869
class HKDF implements KeyProvider
{
    IKM: Buffer;
    PRK: Buffer;
    hashalgo: string;
    hashlen: number;
    salt: Buffer;

    constructor(IKM: Buffer, hashalgo: string, salt?: Buffer)
    {
        // Initial keying material (master key)
        this.IKM = IKM;

        // Hashing algorithm
        this.hashalgo = hashalgo;

        // Hashing algorithm length (in bytes)
        this.hashlen = createHash(this.hashalgo).digest().length;

        // Salt
        this.salt = salt || this.Zeros(this.hashlen);

        // Extract primary keying material (PRK)
        this.PRK = this.Extract();
    }

    Zeros(len: number): Buffer
    {
        var buf = Buffer.alloc(len);
        buf.fill(0);
        return buf;
    }

    Extract(): Buffer
    {
        let hmac = createHmac(this.hashalgo, this.salt);
        hmac.update(this.IKM);
        return hmac.digest();
    }

    Expand(info: Buffer, size: number): Buffer
    {
        let prev = Buffer.alloc(0);
        let buffers = [];

        // Get number of blocks to expand
        let blocks = Math.ceil(size / this.hashlen);

        for (let i = 0; i < blocks; ++i)
        {
            let hmac = createHmac(this.hashalgo, this.PRK);
            hmac.update(prev);
            hmac.update(info);
            hmac.update(Buffer.from(String.fromCharCode(i + 1)));
            prev = hmac.digest();
            buffers.push(prev);
        }

        return Buffer.concat(buffers, size);
    }

    GetKey(keydatalen: number, OtherInfo: Buffer): Buffer
    {
        return this.Expand(OtherInfo, keydatalen);
    }
}

export {
    KeyProvider,
    ConstantKeyProvider,
    HKDF
};
