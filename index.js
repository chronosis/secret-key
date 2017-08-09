// index.js

// Dependencies
const
  base32            = require('encode32')
  , bn              = require('bn.js')
  , crypto          = require('crypto')
  , uuidv4          = require('uuid/v4')
  , buffer          = require('buffer')
;

// Secret Keys are a Base32-Crockford encoded representation of timestamps that
// have been large number split into their 32-bit large and small endian and
// then each of the 32-bit values encrypted using aes-256-ctr and the passphrase
// and then the resulting values base32-Crockford encoded and concatenated
class SecretKey {
  constructor() {
  }

  // Splits a timestamp into two 32-bit integers
  splitTimestamp(timestamp) {
    let n;
    let out = { large: null, small: null };
    if (timestamp) {
      n = new bn(timestamp, 10);
      out.small = n.and(new bn('FFFFFFFF', 16)).toNumber();
      out.large = n.shrn(32).toNumber();
    }
    return out;
  }

  // Recombines two 32-bit split ingtegers into a single timestamp
  joinTimestamp(splitTimestamp) {
    let nl, ns;
    let out = null;
    if (splitTimestamp && splitTimestamp.large !== undefined && splitTimestamp.small !== undefined) {
      nl = new bn(splitTimestamp.large, 10);
      ns = new bn(splitTimestamp.small, 10);
      out = nl.shln(32).toNumber() + ns.toNumber();
    }
    return out;
  }

  // Converts a 32-bit integer to a string of raw characters
  intToRawStr(intVal) {
    let i1 = (intVal >>> 24) & 0xFF;
    let i2 = (intVal >>> 16) & 0xFF;
    let i3 = (intVal >>> 8) & 0xFF;
    let i4 = (intVal >>> 0) & 0xFF;
    let s1 = String.fromCharCode(i1);
    let s2 = String.fromCharCode(i2);
    let s3 = String.fromCharCode(i3);
    let s4 = String.fromCharCode(i4);
    return `${s1}${s2}${s3}${s4}`;
  }

  // Converts a string of raw character (only the first 4) to a 32-bit integer
  rawStrToInt(rawStr) {
    let s1 = rawStr.charAt(0);
    let s2 = rawStr.charAt(1);
    let s3 = rawStr.charAt(2);
    let s4 = rawStr.charAt(3);
    let c1 = s1.charCodeAt(0);
    let c2 = s2.charCodeAt(0);
    let c3 = s3.charCodeAt(0);
    let c4 = s4.charCodeAt(0);
    let i1 = (c1 << 24) >>> 0;
    let i2 = (c2 << 16) >>> 0;
    let i3 = (c3 << 8) >>> 0;
    let i4 = (c4 << 0) >>> 0;
    return (i1 + i2 + i3 + i4);
  }

  // Converts a UUID to a string of raw characters
  uuidToRawBuffer(uuid) {
    let s, n, c;
    let buff = [];
    uuid = uuid.replace(/-/g, '');
    for (let i = 0; i < 16; i++) {
      s = uuid.charAt(i*2) + uuid.charAt(i*2 + 1);
      n = Number.parseInt(s, 16);
      buff.push(n);
    }
    let out = Buffer.from(buff);
    return out;
  }

  // Process an int value to a string, AES-256-CTR crypt it with the passphrase, and then process the resulting encrypted string back to an int value
  cryptInt(intVal, passphrase, iv) {
    let out;
    let pass = Buffer.allocUnsafe(32).fill('\u0000');
    Buffer.from(passphrase).copy(pass);
    // Zero fill the Buffer
    if (pass.length < 32) { pass.fill('\u0000', pass.length); }
    let cipher = crypto.createCipheriv('aes-256-ctr', pass, iv);
    let enc = cipher.update(this.intToRawStr(intVal), 'latin1', 'latin1');
    enc += cipher.final('latin1');
    out = this.rawStrToInt(enc);
    return out;
  }

  intToBase32(intVal) {
    return base32.encode32(intVal);
  }

  check(passphrase, secret, iv, timestamp) {
    if (!passphrase) { throw new ReferenceError('The required parameter \'passphrase\' is undefined.'); }
    if (!secret) { throw new ReferenceError('The required parameter \'secret\' is undefined.'); }
    if (!iv) { throw new ReferenceError('The required parameter \'iv\' is undefined.'); }
    if (!timestamp) { throw new ReferenceError('The required parameter \'timestamp\' is undefined.'); }

    return this.compare(secret, this.create(passphrase, iv, timestamp).secret);
  }

  compare(source, target) {
    if (!source) { throw new ReferenceError('The required parameter \'source\' is undefined.'); }
    if (!target) { throw new ReferenceError('The required parameter \'target\' is undefined.'); }

    // Replace tricky characters and move to uppercase only
    source = source.toUpperCase().replace(/O/g, '0').replace(/[LI]/g, '1');
    target = target.toUpperCase().replace(/O/g, '0').replace(/[LI]/g, '1');
    return (source === target);
  }

  create(passphrase, iv, timestamp) {
    if (!passphrase) throw new ReferenceError('The required parameter \'passphrase\' is undefined.');

    let splTime, encLarge, encSmall, encIV, nonce;
    let out = {
      secret: null,
      iv: null,
      timestamp: null
    };
    timestamp = timestamp || Date.now();
    out.iv = iv || uuidv4();
    encIV = this.uuidToRawBuffer(out.iv);
    splTime = this.splitTimestamp(timestamp);
    encLarge = this.intToBase32(this.cryptInt(splTime.large, passphrase, encIV));
    encSmall = this.intToBase32(this.cryptInt(splTime.small, passphrase, encIV));
    nonce = this.intToBase32(splTime.small);        // Nonce is added to preserve uniqueness of values
    out.secret = `${encLarge}-${encSmall}-${nonce}`;
    out.timestamp = timestamp;
    return out;
  }
}

module.exports = new SecretKey();
