import 'mocha';
import { expect } from 'chai';
import DesfireTag from './DesfireTag';
import { TagInfo } from '../../Tag';

describe('DesfireTag', () => {
    it('Should identify correctly', () => {
        let tagInfo: TagInfo = {
            ATQA: [3, 68],
            SAK: 32,
            UID: Buffer.from('046981BA703A80', 'hex'),
            ATS: Buffer.from('7577810280', 'hex')
        };

        expect(DesfireTag.Identify(tagInfo)).to.equal(true);
    });

    it('Should calculate a valid CRC', () => {
        let data = Buffer.from('C40000102030405060708090A0B0B0A0908010', 'hex');

        let crc = 0xFFFFFFFF;
        for (let i = 0; i < data.length; ++i)
            crc = DesfireTag.DesfireCRC(crc, data[i]);

        expect(Math.abs(crc)).to.equal(0x6BE6C6D2);
    });
});
