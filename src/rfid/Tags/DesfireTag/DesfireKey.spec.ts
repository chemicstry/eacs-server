import 'mocha';
import { expect } from 'chai';
import { DesfireKey, DesfireKeyAES, DesfireKey2K3DES, DesfireKey3K3DES, DesfireKey2K3DESDefault } from './DesfireKey';

describe('DesfireKeyAES', () => {
    it('Should encrypt correctly', () => {
        let key = new DesfireKeyAES(Buffer.from('3034dde848b8eea59c8f207f070ad021', 'hex'));
        let plaintext = Buffer.from('b1b1058fd13e8422aa0770bfeec0d93d', 'hex');
        let ciphertext = key.Encrypt(plaintext);
        expect(ciphertext).to.deep.equal(Buffer.from('d80e701906ff4b875ad4e9edc6b805e4', 'hex'));
    })

    it('Should decrypt correctly', () => {
        let key = new DesfireKeyAES(Buffer.from('3034dde848b8eea59c8f207f070ad021', 'hex'));
        let ciphertext = Buffer.from('b1b1058fd13e8422aa0770bfeec0d93d', 'hex');
        let plaintext = key.Decrypt(ciphertext);
        expect(plaintext).to.deep.equal(Buffer.from('1d8595be2cb30a0934d97ed5f554a03d', 'hex'));
    });

    it('Should provide a valid session key', () => {
        let RndA = Buffer.from('a5b687a14330211738639bd6167034e2', 'hex');
        let RndB = Buffer.from('17f74023a33afe2cac297f77dc826b0f', 'hex');
        let SessionKey = (new DesfireKeyAES).GetSessionKey(RndA, RndB).Get();
        expect(SessionKey).to.deep.equal(Buffer.from('a5b687a117f74023167034e2dc826b0f', 'hex'));
    });

    it('Should return block length of 16', () => {
        let key = new DesfireKeyAES();
        expect(key.BlockLength()).to.equal(16);
    });

    it('Should return key length of 16', () => {
        let key = new DesfireKeyAES();
        expect(key.KeyLength()).to.equal(16);
    });

    it('Should return 0xAA auth cmd', () => {
        let key = new DesfireKeyAES();
        expect(key.GetAuthCmd()).to.equal(0xAA);
    });

    it('Should return correct version', () => {
        let key = new DesfireKeyAES(Buffer.from('3034dde848b8eea59c8f207f070ad021', 'hex'), 0x12);
        expect(key.Version()).to.equal(0x12);
    });

    it('Should return correct key', () => {
        let key = new DesfireKeyAES(Buffer.from('3034dde848b8eea59c8f207f070ad021', 'hex'));
        expect(key.Get()).to.deep.equal(Buffer.from('3034dde848b8eea59c8f207f070ad021', 'hex'));
    });

    it('Should correctly reset IV', () => {
        let key = new DesfireKeyAES(Buffer.from('3034dde848b8eea59c8f207f070ad021', 'hex'));
        let plaintext = Buffer.from('b1b1058fd13e8422aa0770bfeec0d93d', 'hex');
        let ciphertext = key.Encrypt(plaintext);
        key.ResetIV();
        expect(key.IV).to.deep.equal(Buffer.from('00000000000000000000000000000000', 'hex'));
    });
});

describe('DesfireKey2K3DES', () => {
    it('Should encrypt correctly', () => {
        let key = new DesfireKeyAES(Buffer.from('3034dde848b8eea59c8f207f070ad021', 'hex'));
        let plaintext = Buffer.from('b1b1058fd13e8422aa0770bfeec0d93d', 'hex');
        let ciphertext = key.Encrypt(plaintext);
        expect(ciphertext).to.deep.equal(Buffer.from('d80e701906ff4b875ad4e9edc6b805e4', 'hex'));
    })

    it('Should decrypt correctly', () => {
        let key = new DesfireKey2K3DES(Buffer.from('3034dde848b8eea59c8f207f070ad021', 'hex'));
        let ciphertext = Buffer.from('b1b1058fd13e8422aa0770bfeec0d93d', 'hex');
        let plaintext = key.Decrypt(ciphertext);
        expect(plaintext).to.deep.equal(Buffer.from('3ecad433f70c56c7a3fc5ffe0b585698', 'hex'));
    });

    it('Should provide a valid session key', () => {
        let RndA = Buffer.from('a5b687a143302117', 'hex');
        let RndB = Buffer.from('17f74023a33afe2c', 'hex');
        let SessionKey = (new DesfireKey2K3DES).GetSessionKey(RndA, RndB).Get();
        expect(SessionKey).to.deep.equal(Buffer.from('a5b687a117f7402343302117a33afe2c', 'hex'));
    });

    it('Should return 0x1A auth cmd', () => {
        let key = new DesfireKey2K3DES();
        expect(key.GetAuthCmd()).to.equal(0x1A);
    });
});

describe('DesfireKey2K3DESDefault', () => {
    it('Should provide a valid session key', () => {
        let RndA = Buffer.from('a5b687a143302117', 'hex');
        let RndB = Buffer.from('17f74023a33afe2c', 'hex');
        let SessionKey = (new DesfireKey2K3DESDefault).GetSessionKey(RndA, RndB).Get();
        expect(SessionKey).to.deep.equal(Buffer.from('a5b687a117f74023a5b687a117f74023', 'hex'));
    });
});

describe('DesfireKey3K3DES', () => {
    it('Should encrypt correctly', () => {
        let key = new DesfireKey3K3DES(Buffer.from('3034dde848b8eea59c8f207f070ad021a5b687a143302117', 'hex'));
        let plaintext = Buffer.from('b1b1058fd13e8422aa0770bfeec0d93d', 'hex');
        let ciphertext = key.Encrypt(plaintext);
        expect(ciphertext).to.deep.equal(Buffer.from('b57e7efba9f6b6e83fac0fe3f784379e', 'hex'));
    })

    it('Should decrypt correctly', () => {
        let key = new DesfireKey3K3DES(Buffer.from('3034dde848b8eea59c8f207f070ad021a5b687a143302117', 'hex'));
        let ciphertext = Buffer.from('b57e7efba9f6b6e83fac0fe3f784379e', 'hex');
        let plaintext = key.Decrypt(ciphertext);
        expect(plaintext).to.deep.equal(Buffer.from('b1b1058fd13e8422aa0770bfeec0d93d', 'hex'));
    });

    it('Should provide a valid session key', () => {
        let RndA = Buffer.from('b1b1058fd13e8422aa0770bfeec0d93d', 'hex');
        let RndB = Buffer.from('b57e7efba9f6b6e83fac0fe3f784379e', 'hex');
        let SessionKey = (new DesfireKey3K3DES).GetSessionKey(RndA, RndB).Get();
        expect(SessionKey).to.deep.equal(Buffer.from('b1b1058fb57e7efb8422aa07b6e83faceec0d93df784379e', 'hex'));
    });

    it('Should return 0x1A auth cmd', () => {
        let key = new DesfireKey3K3DES();
        expect(key.GetAuthCmd()).to.equal(0x1A);
    });
});
