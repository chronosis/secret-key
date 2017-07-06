# secret-key

[![Actual version published on npm](http://img.shields.io/npm/v/secret-key.svg)](https://www.npmjs.org/package/secret-key)
[![Travis build status](https://travis-ci.org/chronosis/secret-key.svg)](https://www.npmjs.org/package/secret-key)
[![Total npm module downloads](http://img.shields.io/npm/dt/secret-key.svg)](https://www.npmjs.org/package/secret-key)

A simple generator and validator for human-readable Base32-Crockford encoded Secret Keys.

 * Secret Keys are 23 characters in length consisting of 3 groups of 7 characters separated by dashes *(e.g. XXXXXXX-XXXXXXX-XXXXXXX)*
 * They avoids the problem that Base64 encoded values can create
   * Fully upper-case, but treat lower-case for their equivalents *(e.g. a = A)*
   * No tricky characters, but treat them equivalently *(i.e. 0 = O / 1 = L = I )*
   * No characters that inadvertently lead to common profanities *(i.e. letter U is omitted)*

## Installation
You can install `secret-key` with NPM.
```shell
npm install secret-key
```
## Usage
```es2016
const secretKey = require('secret-key');

console.log(secretKey.create('1EEA6DC-JAM4DP2-PHVYPBN-V0XCJ9X'));
```
**Output**:
```
{ secret: 'CDDPMWJ-EYEZXNC-2K39BYN',
  iv: '64d8291b-5ede-4a81-8c29-4decf35f4b85',
  timestamp: 1499292145146 }
```

## Reference

### .check(passphrase, secret, iv, timestamp)
Tests that a `secret` matches the `passphrase`, `iv`, and `timestamp` provided. Throws a `ReferenceError` if any of the parameters are missing.
```es2016
let passphrase = '1EEA6DC-JAM4DP2-PHVYPBN-V0XCJ9X';
let secret = 'CDDPMWJ-EYEZXNC-2K39BYN';
let iv = '64d8291b-5ede-4a81-8c29-4decf35f4b85';
let timestamp = 1499292145146;

secretKey.check(passphrase, secret, iv, timestamp);
```
**Output**:
```
true
```

### .compare(source, target)
Tests that the `source` secret matched the `target` secret. Throws a `ReferenceError` if any of the parameters are missing.
```es2016
let source = 'HQYOT19-JMXGQLH-333GFQK';
let target = 'HQY0T19-JMXGQ1H-333GFQK';

secretKey.compare(source, target);
```
**Output**:
```
true
```

### .create(passphrase[, iv][,  timestamp])
Returns a new UUID and API Key pair. If no `iv` is passed, then a new uuid is used. If no `timestamp` is passed, then current time is used. If no `passphrase` is passed, then a `ReferenceError` is thrown indicating that the required parameter is missing
```es2016
secretKey.create('1EEA6DC-JAM4DP2-PHVYPBN-V0XCJ9X');
```
**Output**:
```
{ secret: 'CDDPMWJ-EYEZXNC-2K39BYN',
  iv: '64d8291b-5ede-4a81-8c29-4decf35f4b85',
  timestamp: 1499292145146 }
```

## License
MIT
