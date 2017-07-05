const test = require('unit.js');

let testIntConv = '\u0014|Ë¯';
let testTimestamp = { large: 349, small: 343722927 };
let testPass = '1EEA6DC-JAM4DP2-PHVYPBN-V0XCJ9X';
let testSecret = { secret: 'K20QQDK-HKYV2H6', iv: 'c1149d91-814d-496a-9a6e-fe80106bfba5', timestamp: 1499287309231 };
let badPass = '1EEA6DC-JAM4DP2-PHVYPBN-VJXCJ9X';
let badIV = '0b9ca335-92a8-46d8-b277-ec2ed83ac427';
let badTimestamp = 1499287309236;

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
        test = test && (MainClass.create().secret.length == 15);
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
