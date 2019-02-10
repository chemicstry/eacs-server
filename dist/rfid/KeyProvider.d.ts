/// <reference types="node" />
interface KeyProvider {
    GetKey(keydatalen: number, OtherInfo: Buffer): Buffer;
}
declare class ConstantKeyProvider implements KeyProvider {
    key: Buffer;
    constructor(key: Buffer);
    GetKey(keydatalen: number, OtherInfo: Buffer): Buffer;
}
declare class HKDF implements KeyProvider {
    IKM: Buffer;
    PRK: Buffer;
    hashalgo: string;
    hashlen: number;
    salt: Buffer;
    constructor(IKM: Buffer, hashalgo: string, salt?: Buffer);
    Zeros(len: number): Buffer;
    Extract(): Buffer;
    Expand(info: Buffer, size: number): Buffer;
    GetKey(keydatalen: number, OtherInfo: Buffer): Buffer;
}
export { KeyProvider, ConstantKeyProvider, HKDF };
