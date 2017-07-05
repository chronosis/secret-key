const test = require('unit.js');

let testIntConv = '\u0014Æú';
let testTimestamp = { large: 349, small: 348558842 };
let testPass = '1EEA6DC-JAM4DP2-PHVYPBN-V0XCJ9X';
let testSecret = {
  secret: 'CDDPMWJ-EYEZXNC-2K39BYN',
  iv: '64d8291b-5ede-4a81-8c29-4decf35f4b85',
  timestamp: 1499292145146
};
let badPass = '1EEA6DC-JAM4DP2-PHVYPBN-VJXCJ9X';
let badIV = '0b9ca335-92a8-46d8-b277-ec2ed83ac427';
let badTimestamp = 1499287309236;
let expectedLen = 23;

describe('secret-key', () => {

  let MainClass = require('../');

  it('load', () => {
    let myModule = require('../');

    test.assert(typeof myModule == typeof MainClass);
  });

  it('key creation', () => {
    test.object(MainClass.create(testPass));
  });

  it('good key comparison', () => {
    test.assert(MainClass.check(testPass, testSecret.secret, testSecret.iv, testSecret.timestamp));
  });

  it('good key comparison (lowercase secret)', () => {
    test.assert(MainClass.check(testPass, testSecret.secret.toLowerCase(), testSecret.iv, testSecret.timestamp));
  });

  it('bad key comparison (timestamp)', () => {
    test.assert(!MainClass.check(testPass, testSecret.secret, testSecret.iv, badTimestamp));
  });

  it('bad key comparison (iv)', () => {
    test.assert(!MainClass.check(testPass, testSecret.secret, badIV, testSecret.timestamp));
  });

  it('bad key comparison (passphrase)', () => {
    test.assert(!MainClass.check(badPass, testSecret.secret, testSecret.iv, testSecret.timestamp));
  });

  it('key length', () => {
    test.assert(() => {
      let test = true;
      for (let i = 0; i < 100; i++) {
        test = test && (MainClass.create().secret.length == expectedLen);
      }
      return test;
    });
  });

  it('uuid conversion', () => {
    test.assert(MainClass.uuidToRawBuffer('63636363-6363-6363-6363-636363636363').toString() == 'cccccccccccccccc');
  });

  it('int32 to str conversion', () => {
    test.assert(MainClass.intToRawStr(testTimestamp.small) == testIntConv)
  });

  it('str to int32 conversion', () => {
    test.assert(MainClass.rawStrToInt(testIntConv) == testTimestamp.small);
  });

  it('timestamp splitting', () => {
    let split = MainClass.splitTimestamp(testSecret.timestamp);
    test.assert((split.small == testTimestamp.small) && (split.large == testTimestamp.large));
  });
  // it('test bad UUID', () => {
  //   test.assert(!MainClass.isUUID(testKey.apiKey));
  // })

});
