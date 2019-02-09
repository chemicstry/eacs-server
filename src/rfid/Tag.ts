import { KeyProvider } from './KeyProvider';

// Info provided when a new tag is detected (used to determine tag type)
interface TagInfo
{
    ATQA: [number, number],
    SAK: number,
    UID: Buffer,
    ATS: Buffer,
}

// Function used to transceive raw data with tag
type TagTransceiveFn = (data: Buffer) => Promise<Buffer>;

abstract class Tag
{
    info: TagInfo;
    Transceive: TagTransceiveFn;

    constructor(info: TagInfo, transceiveFn: TagTransceiveFn)
    {
        this.info = info;
        this.Transceive = transceiveFn;
    }

    // Authenticates with the key from KeyProvider
    abstract async Authenticate(keyProvider: KeyProvider): Promise<boolean>;

    // Initializes blank kard with a key from KeyProvider
    abstract async InitializeKey(keyProvider: KeyProvider): Promise<boolean>;

    // returns true if taginfo matches the specific card type
    static Identify(info: TagInfo): boolean
    {
        return false;
    }
}

type TagConstructor = {
    new (info: TagInfo, transceiveFn: TagTransceiveFn): Tag;
    Identify(info: TagInfo): boolean;
}

export {
    TagInfo,
    TagTransceiveFn,
    Tag,
    TagConstructor
};
