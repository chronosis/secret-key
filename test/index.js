const test = require('unit.js');

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

    test.assert(typeof myModule === typeof MainClass);
  });

  it('key creation', () => {
    test.object(MainClass.create(testPass));
  });

  it('good key comparison', () => {
    const rplStr = testTrickySecret.secret.toLowerCase()
      .replace(/O/g, '0')
      .replace(/[LI]/g, '1');
    test.assert(MainClass.compare(rplStr, testTrickySecret.secret));
  });

  it('bad key comparison', () => {
    test.assert(!MainClass.compare(testSecret.secret, testTrickySecret.secret));
  });

  it('good key check', () => {
    test.assert(MainClass.check(testPass, testSecret.secret, testSecret.iv, testSecret.timestamp));
  });

  it('good key check (lowercase secret)', () => {
    test.assert(MainClass.check(testPass, testSecret.secret.toLowerCase(), testSecret.iv, testSecret.timestamp));
  });

  it('good key check (tricky characters secret)', () => {
    test.assert(MainClass.check(testPass, testTrickySecret.secret, testTrickySecret.iv, testTrickySecret.timestamp));
  });

  it('bad key check (timestamp)', () => {
    test.assert(!MainClass.check(testPass, testSecret.secret, testSecret.iv, badTimestamp));
  });

  it('bad key check (iv)', () => {
    test.assert(!MainClass.check(testPass, testSecret.secret, badIV, testSecret.timestamp));
  });

  it('bad key check (passphrase)', () => {
    test.assert(!MainClass.check(badPass, testSecret.secret, testSecret.iv, testSecret.timestamp));
  });

  it('key length', () => {
    test.assert(() => {
      let check = true;
      for (let itr = 0; itr < 100; itr++) {
        check = check && (MainClass.create().secret.length === expectedLen);
      }
      return check;
    });
  });

  it('uuid conversion', () => {
    test.assert(MainClass.uuidToRawBuffer('63636363-6363-6363-6363-636363636363').toString() === 'cccccccccccccccc');
  });

  it('int32 to str conversion', () => {
    test.assert(MainClass.intToRawStr(testTimestamp.small) === testIntConv);
  });

  it('str to int32 conversion', () => {
    test.assert(MainClass.rawStrToInt(testIntConv) === testTimestamp.small);
  });

  it('timestamp splitting', () => {
    const split = MainClass.splitTimestamp(testSecret.timestamp);
    test.assert((split.small === testTimestamp.small) && (split.large === testTimestamp.large));
  });
  // it('test bad UUID', () => {
  //   test.assert(!MainClass.isUUID(testKey.apiKey));
  // })

});
