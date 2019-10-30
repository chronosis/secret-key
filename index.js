// index.js

// Dependencies
const base32 = require('encode32');
const BN = require('bn.js');
const crypto = require('crypto');
const uuidv4 = require('uuid/v4');

// Secret Keys are a Base32-Crockford encoded representation of timestamps that
// have been large number split into their 32-bit large and small endian and
// then each of the 32-bit values encrypted using aes-256-ctr and the passphrase
// and then the resulting values base32-Crockford encoded and concatenated
class SecretKey {
  constructor() {}

  // Splits a timestamp into two 32-bit integers
  splitTimestamp(timestamp) {
    let num;
    const out = { large: null, small: null };
    if (timestamp !== null && timestamp !== undefined) {
      num = new BN(timestamp, 10);
      out.small = num.and(new BN('FFFFFFFF', 16)).toNumber();
      out.large = num.shrn(32).toNumber();
    }
    return out;
  }

  // Recombines two 32-bit split ingtegers into a single timestamp
  joinTimestamp(splitTimestamp) {
    let nl, ns;
    let out = null;
    if (
      splitTimestamp && splitTimestamp.large !== undefined &&
        splitTimestamp.small !== undefined
    ) {
      nl = new BN(splitTimestamp.large, 10);
      ns = new BN(splitTimestamp.small, 10);
      out = nl.shln(32).toNumber() + ns.toNumber();
    }
    return out;
  }

  // Converts a 32-bit integer to a string of raw characters
  intToRawStr(intVal) {
    const i1 = intVal >>> 24 & 255;
    const i2 = intVal >>> 16 & 255;
    const i3 = intVal >>> 8 & 255;
    const i4 = intVal >>> 0 & 255;
    const s1 = String.fromCharCode(i1);
    const s2 = String.fromCharCode(i2);
    const s3 = String.fromCharCode(i3);
    const s4 = String.fromCharCode(i4);
    return `${s1}${s2}${s3}${s4}`;
  }

  // Converts a string of raw character (only the first 4) to a 32-bit integer
  rawStrToInt(rawStr) {
    const s1 = rawStr.charAt(0);
    const s2 = rawStr.charAt(1);
    const s3 = rawStr.charAt(2);
    const s4 = rawStr.charAt(3);
    const c1 = s1.charCodeAt(0);
    const c2 = s2.charCodeAt(0);
    const c3 = s3.charCodeAt(0);
    const c4 = s4.charCodeAt(0);
    const i1 = c1 << 24 >>> 0;
    const i2 = c2 << 16 >>> 0;
    const i3 = c3 << 8 >>> 0;
    const i4 = c4 << 0 >>> 0;
    return i1 + i2 + i3 + i4;
  }

  // Converts a UUID to a string of raw characters
  uuidToRawBuffer(uuid) {
    let str, num;
    const buff = [];
    uuid = uuid.replace(/-/g, '');
    for (let itr = 0; itr < 16; itr++) {
      str = uuid.charAt(itr * 2) + uuid.charAt(itr * 2 + 1);
      num = Number.parseInt(str, 16);
      buff.push(num);
    }
    const out = Buffer.from(buff);
    return out;
  }

  // Process an int value to a string, AES-256-CTR crypt it with the passphrase,
  // and then process the resulting encrypted string back to an int value
  cryptInt(intVal, passphrase, iv) {
    const pass = Buffer.allocUnsafe(32).fill('\u0000');
    Buffer.from(passphrase).copy(pass);

    const cipher = crypto.createCipheriv('aes-256-ctr', pass, iv);
    let enc = cipher.update(this.intToRawStr(intVal), 'latin1', 'latin1');
    enc += cipher.final('latin1');
    const out = this.rawStrToInt(enc);
    return out;
  }

  intToBase32(intVal) {
    return base32.encode32(intVal);
  }

  check(passphrase, secret, iv, timestamp) {
    if (!passphrase) {
      throw new ReferenceError('The required parameter \'passphrase\' is undefined.');
    }
    if (!secret) {
      throw new ReferenceError('The required parameter \'secret\' is undefined.');
    }
    if (!iv) {
      throw new ReferenceError('The required parameter \'iv\' is undefined.');
    }
    if (!timestamp) {
      throw new ReferenceError('The required parameter \'timestamp\' is undefined.');
    }

    return this.compare(secret, this.create(passphrase, iv, timestamp).secret);
  }

  compare(source, target) {
    if (!source) {
      throw new ReferenceError('The required parameter \'source\' is undefined.');
    }
    if (!target) {
      throw new ReferenceError('The required parameter \'target\' is undefined.');
    }

    // Replace tricky characters and move to uppercase only
    source = source.toUpperCase().replace(/O/g, '0')
      .replace(/[LI]/g, '1');
    target = target.toUpperCase().replace(/O/g, '0')
      .replace(/[LI]/g, '1');
    return source === target;
  }

  create(passphrase, iv, timestamp) {
    if (!passphrase) {
      throw new ReferenceError('The required parameter \'passphrase\' is undefined.');
    }

    const out = { secret: null, iv: null, timestamp: null };
    timestamp = timestamp || Date.now();
    out.iv = iv || uuidv4();
    const encIV = this.uuidToRawBuffer(out.iv);
    const splTime = this.splitTimestamp(timestamp);
    const encLarge = this.intToBase32(this.cryptInt(splTime.large, passphrase, encIV));
    const encSmall = this.intToBase32(this.cryptInt(splTime.small, passphrase, encIV));
    // Nonce is added to preserve uniqueness of values
    const nonce = this.intToBase32(splTime.small);
    out.secret = `${encLarge}-${encSmall}-${nonce}`;
    out.timestamp = timestamp;
    return out;
  }
}

module.exports = new SecretKey();
