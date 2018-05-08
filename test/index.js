const chai = require('chai');
const expect = chai.expect;

const testIntConv = '\u0014Æú';
const testTimestamp = { large: 349, small: 348558842 };
const testPass = '1EEA6DC-JAM4DP2-PHVYPBN-V0XCJ9X';
const testSecret = {
  secret: 'CDDPMWJ-EYEZXNC-2K39BYN',
  iv: '64d8291b-5ede-4a81-8c29-4decf35f4b85',
  timestamp: 1499292145146
};
const testTrickySecret = {
  secret: 'HQYOT19-JMXGQLH-333GFQK',
  iv: '8ee8a69b-da65-4866-bf48-ae7578b2142c',
  timestamp: 1499359283166
};
const badPass = '1EEA6DC-JAM4DP2-PHVYPBN-VJXCJ9X';
const badIV = '0b9ca335-92a8-46d8-b277-ec2ed83ac427';
const badTimestamp = 1499287309236;
const expectedLen = 23;

describe('secret-key', () => {
  const MainClass = require('../');
  it('load', () => {
    const myModule = require('../');
    expect(myModule.constructor.name).to.be.equal(MainClass.constructor.name);
  });

  it('key creation', () => {
    expect(MainClass.create(testPass)).to.be.an('object');
  });

  it('good key comparison', () => {
    const rplStr = testTrickySecret.secret
      .toLowerCase()
      .replace(/O/g, '0')
      .replace(/[LI]/g, '1');
    expect(MainClass.compare(rplStr, testTrickySecret.secret)).to.be.equal(true);
  });

  it('bad key comparison', () => {
    expect(!MainClass.compare(testSecret.secret, testTrickySecret.secret)).to.be.equal(true);
  });

  it('good key check', () => {
    expect(MainClass.check(
      testPass,
      testSecret.secret,
      testSecret.iv,
      testSecret.timestamp
    )).to.be.equal(true);
  });

  it('good key check (lowercase secret)', () => {
    expect(MainClass.check(
      testPass,
      testSecret.secret.toLowerCase(),
      testSecret.iv,
      testSecret.timestamp
    )).to.be.equal(true);
  });

  it('good key check (tricky characters secret)', () => {
    expect(MainClass.check(
      testPass,
      testTrickySecret.secret,
      testTrickySecret.iv,
      testTrickySecret.timestamp
    )).to.be.equal(true);
  });

  it('bad key check (timestamp)', () => {
    expect(!MainClass.check(testPass, testSecret.secret, testSecret.iv, badTimestamp)).to.be.equal(true);
  });

  it('bad key check (iv)', () => {
    expect(!MainClass.check(testPass, testSecret.secret, badIV, testSecret.timestamp)).to.be.equal(true);
  });

  it('bad key check (passphrase)', () => {
    expect(!MainClass.check(
      badPass,
      testSecret.secret,
      testSecret.iv,
      testSecret.timestamp
    )).to.be.equal(true);
  });

  it('key length', () => {
    let check = true;
    for (let itr = 0; itr < 100; itr++) {
      check = (MainClass.create('Test Phrase').secret.length === expectedLen) && check;
    }
    expect(check).to.be.equal(true);
  });

  it('uuid conversion', () => {
    expect(MainClass
      .uuidToRawBuffer('63636363-6363-6363-6363-636363636363')
      .toString() ===
        'cccccccccccccccc').to.be.equal(true);
  });

  it('int32 to str conversion', () => {
    expect(MainClass.intToRawStr(testTimestamp.small) === testIntConv).to.be.equal(true);
  });

  it('str to int32 conversion', () => {
    expect(MainClass.rawStrToInt(testIntConv) === testTimestamp.small).to.be.equal(true);
  });

  it('timestamp splitting', () => {
    const split = MainClass.splitTimestamp(testSecret.timestamp);
    expect(split.small === testTimestamp.small && split.large === testTimestamp.large).to.be.equal(true);
  }); // it('test bad UUID', () => { //   expect(!MainClass.isUUID(testKey.apiKey)); // })
});
