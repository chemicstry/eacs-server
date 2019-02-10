/// <reference types="node" />
interface DesfireKey {
    Get(): Buffer;
    BlockLength(): number;
    KeyLength(): number;
    Version(): number;
    GetAuthCmd(): number;
    GetSessionKey(RndA: Buffer, RndB: Buffer): DesfireKey;
    ResetIV(): void;
    Encrypt(data: Buffer): Buffer;
    Decrypt(data: Buffer): Buffer;
}
declare class DesfireKeyGeneric implements DesfireKey {
    BlockLen: number;
    KeyLen: number;
    IV: Buffer;
    Ver: number;
    Key: Buffer;
    CipherAlgorithm: string;
    Get(): Buffer;
    BlockLength(): number;
    KeyLength(): number;
    Version(): number;
    GetAuthCmd(): number;
    GetSessionKey(RndA: Buffer, RndB: Buffer): DesfireKeyGeneric;
    ResetIV(): void;
    Encrypt(data: Buffer): Buffer;
    Decrypt(data: Buffer): Buffer;
}
declare class DesfireKeyAES extends DesfireKeyGeneric {
    constructor(key?: Buffer, version?: number);
    GetAuthCmd(): number;
    GetSessionKey(RndA: Buffer, RndB: Buffer): DesfireKeyAES;
}
declare class DesfireKey2K3DES extends DesfireKeyGeneric {
    constructor(key?: Buffer, version?: number);
    GetAuthCmd(): number;
    GetSessionKey(RndA: Buffer, RndB: Buffer): DesfireKey2K3DES;
}
declare class DesfireKey2K3DESDefault extends DesfireKey2K3DES {
    constructor(key?: Buffer, version?: number);
    GetSessionKey(RndA: Buffer, RndB: Buffer): DesfireKey2K3DES;
}
declare class DesfireKey3K3DES extends DesfireKeyGeneric {
    constructor(key?: Buffer, version?: number);
    GetAuthCmd(): number;
    GetSessionKey(RndA: Buffer, RndB: Buffer): DesfireKey3K3DES;
}
export { DesfireKey, DesfireKeyGeneric, DesfireKeyAES, DesfireKey2K3DES, DesfireKey2K3DESDefault, DesfireKey3K3DES };
