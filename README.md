# secret-key

[![NPM](https://nodei.co/npm/secret-key.png?downloads=true)](https://nodei.co/npm/secret-key/)

[![Actual version published on npm](http://img.shields.io/npm/v/secret-key.svg)](https://www.npmjs.org/package/secret-key)
[![Travis build status](https://travis-ci.org/chronosis/secret-key.svg)](https://www.npmjs.org/package/secret-key)
[![Total npm module downloads](http://img.shields.io/npm/dt/secret-key.svg)](https://www.npmjs.org/package/secret-key)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/e1d4d393c55843f5803e2137a061e4c9)](https://www.codacy.com/app/chronosis/secret-key?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=chronosis/secret-key&amp;utm_campaign=Badge_Grade)
[![Codacy Coverage Badge](https://api.codacy.com/project/badge/Coverage/e1d4d393c55843f5803e2137a061e4c9)](https://www.codacy.com/app/chronosis/secret-key?utm_source=github.com&utm_medium=referral&utm_content=chronosis/secret-key&utm_campaign=Badge_Coverage)

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

## Command Line
`secret-key` installs with a command line tool. The tool is available using the command `secretKeyTool` which can be install globally using:

```
  npm install secret-key -g
```

### Options
```shell
$ secretkeyTool.js

Usage: secretKeyTool [options]

Options:

  -V, --version                output the version number
  -g, --generate               Create a new Secret Key using the encryption key (-e) provided.
  -c, --check                  Check the Secret Key against the Encryption Key, IV, and timestamp
  -e, --enckey <enckey>        Encryption Key to use for generation and checking
  -i, --iv <iv>                Initialization Vector used to create or check a secret key. Note: This should be a UUID.
  -t, --timestamp <timestamp>  Timestamp used to create or check a secret key. Note: This should be a UNIX timestamp integer.
  -s, --secret <secret>        Secret Key to check
  -h, --help                   output usage information
```

### Examples
#### Generation
```shell
$ secretkeyTool.js -g -e MySecret

   EncKey(MySecret)
   Secret(SY9X853-WGJJTF2-5EVFGXR)
       IV(036a41f6-f143-4dcf-bff6-d39381ba2ff6)
timestamp(1508266932343)
```

#### Testing
```shell
$ secretkeyTool.js -c -e 12341234 -t 1508266623562 -i 43c74c93-5a29-486a-adc4-7bbdfd723513 -s XR2WF03-RPVR95E-5ES44JM

Secret & Generation Values [EncKey, IV, Timestamp] match [true]
```

## API Reference

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
Returns a new secret key with iv and timestamp for reverse verification. If no `iv` is passed, then a new uuid created and used. If no `timestamp` is passed, then the current time is used. If no `passphrase` is passed, then a `ReferenceError` is thrown indicating that the required parameter is missing
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
Copyright © 2017, 2018, 2019 Jay Reardon -- Licensed under the MIT license.
