/// <reference types="node" />
import { KeyProvider } from './KeyProvider';
interface TagInfo {
    ATQA: [number, number];
    SAK: number;
    UID: Buffer;
    ATS: Buffer;
}
declare type TagTransceiveFn = (data: Buffer) => Promise<Buffer>;
declare abstract class Tag {
    info: TagInfo;
    Transceive: TagTransceiveFn;
    constructor(info: TagInfo, transceiveFn: TagTransceiveFn);
    abstract Authenticate(keyProvider: KeyProvider): Promise<boolean>;
    abstract InitializeKey(keyProvider: KeyProvider): Promise<boolean>;
    static Identify(info: TagInfo): boolean;
}
declare type TagConstructor = {
    new (info: TagInfo, transceiveFn: TagTransceiveFn): Tag;
    Identify(info: TagInfo): boolean;
};
export { TagInfo, TagTransceiveFn, Tag, TagConstructor };
