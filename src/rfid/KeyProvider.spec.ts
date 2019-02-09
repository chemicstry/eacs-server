import 'mocha';
import { expect } from 'chai';
import { ConstantKeyProvider, HKDF } from './KeyProvider';

describe('ConstantKeyProvider', () => {
    it('Should provide a valid key', () => {
        let key = Buffer.from('00102030405060708090A0B0B0A09080', 'hex');
        let keyProvider = new ConstantKeyProvider(key);
        let result = keyProvider.GetKey(key.length, Buffer.alloc(0));

        expect(result).to.deep.equal(key);
    })
});

describe('HKDF KeyProvider', () => {
    it('Should provide a valid OKM when given known data', () => {
        // Data provided by https://tools.ietf.org/html/rfc5869
        let IKM = Buffer.from('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b', 'hex');
        let salt = Buffer.from('000102030405060708090a0b0c', 'hex');
        let info = Buffer.from('f0f1f2f3f4f5f6f7f8f9', 'hex');
        let OKM = Buffer.from('3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865', 'hex');

        let hkdf = new HKDF(IKM, 'sha256', salt);
        let result = hkdf.GetKey(OKM.length, info);

        expect(result).to.deep.equal(OKM);
    });

    it('Should generate an empty salt when not given', () => {
        // Data provided by https://tools.ietf.org/html/rfc5869
        let IKM = Buffer.from('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b', 'hex');
        let hkdf = new HKDF(IKM, 'sha256');

        expect(hkdf.salt).to.deep.equal(Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex'));
    });
});
