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

  it('key creation (no passphrase error)', () => {
    const fn = (() => { MainClass.create(); });
    expect(fn).to.throw(ReferenceError);
  });

  it('key comparison (matching)', () => {
    const rplStr = testTrickySecret.secret
      .toLowerCase()
      .replace(/O/g, '0')
      .replace(/[LI]/g, '1');
    expect(MainClass.compare(rplStr, testTrickySecret.secret)).to.be.equal(true);
  });

  it('key comparison (non-matching)', () => {
    expect(!MainClass.compare(testSecret.secret, testTrickySecret.secret)).to.be.equal(true);
  });

  it('key comparison error (missing source)', () => {
    const fn = (() => { MainClass.compare(null, testTrickySecret.secret); });
    expect(fn).to.throw(ReferenceError);
  });

  it('key comparison error (missing target)', () => {
    const fn = (() => { MainClass.compare(testSecret.secret, null); });
    expect(fn).to.throw(ReferenceError);
  });

  it('key check (good)', () => {
    expect(MainClass.check(
      testPass,
      testSecret.secret,
      testSecret.iv,
      testSecret.timestamp
    )).to.be.equal(true);
  });

  it('key check (good - lowercase secret)', () => {
    expect(MainClass.check(
      testPass,
      testSecret.secret.toLowerCase(),
      testSecret.iv,
      testSecret.timestamp
    )).to.be.equal(true);
  });

  it('key check (good - tricky characters secret)', () => {
    expect(MainClass.check(
      testPass,
      testTrickySecret.secret,
      testTrickySecret.iv,
      testTrickySecret.timestamp
    )).to.be.equal(true);
  });

  it('key check (bad - wrong timestamp)', () => {
    expect(!MainClass.check(testPass, testSecret.secret, testSecret.iv, badTimestamp)).to.be.equal(true);
  });

  it('key check (bad - wrong iv)', () => {
    expect(!MainClass.check(testPass, testSecret.secret, badIV, testSecret.timestamp)).to.be.equal(true);
  });

  it('key check (bad - wrong passphrase)', () => {
    expect(!MainClass.check(
      badPass,
      testSecret.secret,
      testSecret.iv,
      testSecret.timestamp
    )).to.be.equal(true);
  });

  it('key check error (missing passphrase)', () => {
    const fn = (() => {
      MainClass.check(
        null,
        testSecret.secret,
        testSecret.iv,
        testSecret.timestamp
      );
    });
    expect(fn).to.throw(ReferenceError);
  });

  it('key check error (missing secret)', () => {
    const fn = (() => {
      MainClass.check(
        testPass,
        null,
        testSecret.iv,
        testSecret.timestamp
      );
    });
    expect(fn).to.throw(ReferenceError);
  });

  it('key check error (missing iv)', () => {
    const fn = (() => {
      MainClass.check(
        testPass,
        testSecret.secret,
        null,
        testSecret.timestamp
      );
    });
    expect(fn).to.throw(ReferenceError);
  });

  it('key check error (missing timestamp)', () => {
    const fn = (() => {
      MainClass.check(
        testPass,
        testSecret.secret,
        testSecret.iv,
        null
      );
    });
    expect(fn).to.throw(ReferenceError);
  });

  it('key length', () => {
    let check = true;
    for (let itr = 0; itr < 100; itr++) {
      check = (MainClass.create('Test Phrase').secret.length === expectedLen) && check;
    }
    expect(check).to.be.equal(true);
  });

  it('uuid conversion', () => {
    const key = '63636363-6363-6363-6363-636363636363';
    const value = MainClass.uuidToRawBuffer(key).toString();
    expect(value).to.be.equal('cccccccccccccccc');
  });

  it('splits timestamps', () => {
    const out = MainClass.splitTimestamp(0);
    expect(out.large).to.be.equal(0);
    expect(out.small).to.be.equal(0);

    const out2 = MainClass.splitTimestamp(100000000000);
    expect(out2.large).to.be.equal(23);
    expect(out2.small).to.be.equal(1215752192);
  });

  it('splits timestamps (bad timestamp)', () => {
    const out = MainClass.splitTimestamp();
    expect(out.large).to.be.equal(null);
    expect(out.small).to.be.equal(null);
  });

  it('joins timestamps', () => {
    const out = { large: 0, small: 0 };
    expect(MainClass.joinTimestamp(out)).to.be.equal(0);

    const out2 = { large: 23, small: 1215752192 };
    expect(MainClass.joinTimestamp(out2)).to.be.equal(100000000000);
  });

  it('joins timestamps (bad object)', () => {
    expect(MainClass.joinTimestamp()).to.be.equal(null);
  });

  it('cryptInt', () => {
    const iv = MainClass.uuidToRawBuffer(testSecret.iv);
    const out = MainClass.cryptInt(123, testSecret.secret, iv);
    expect(out).to.be.equal(2268697355);

    const out2 = MainClass.cryptInt(123456, testSecret.secret, iv);
    expect(out2).to.be.equal(2268623152);
  });

  it('cryptInt (short passphrase)', () => {
    const iv = MainClass.uuidToRawBuffer(testSecret.iv);
    const out = MainClass.cryptInt(123, 'ABCDEFG', iv);
    expect(out).to.be.equal(9829824);

    const out2 = MainClass.cryptInt(123456, 'ABCDEFG', iv);
    expect(out2).to.be.equal(9707515);
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
