import 'mocha';
import { expect } from 'chai';
import { KeyProvider } from './KeyProvider';
import { TagInfo, Tag } from './Tag';

describe('Tag', () => {
    it('Should initialize with correct values', async () => {
        class TestTag extends Tag
        {
            async Authenticate(keyProvider: KeyProvider): Promise<boolean>
            {
                return false;
            }
            async InitializeKey(keyProvider: KeyProvider): Promise<boolean>
            {
                return false;
            }
        };

        let tagInfo: TagInfo = {
            ATQA: [3, 68],
            SAK: 32,
            UID: Buffer.from('046981BA703A80', 'hex'),
            ATS: Buffer.from('7577810280', 'hex')
        };

        let tag = new TestTag(tagInfo, async (data) => {
            return data;
        });

        expect(tag.info).to.deep.equal(tagInfo);

        let data = await tag.Transceive(Buffer.from('FF', 'hex'));
        expect(data).to.deep.equal(Buffer.from('FF', 'hex'));
    });

    it('Should always identify with false', () => {
        let tagInfo: TagInfo = {
            ATQA: [3, 68],
            SAK: 32,
            UID: Buffer.from('046981BA703A80', 'hex'),
            ATS: Buffer.from('7577810280', 'hex')
        };

        expect(Tag.Identify(tagInfo)).to.equal(false);
    });
});
