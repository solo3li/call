const sha1 = require('js-sha1');

const AlphanumericChars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function decodeBase32(input) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleaned = input.toUpperCase().replace(/=+$/, '');
  const length = cleaned.length;
  const out = new Uint8Array(((length * 5) / 8) | 0);
  let bits = 0;
  let value = 0;
  let index = 0;

  for (let i = 0; i < length; i++) {
    const val = alphabet.indexOf(cleaned[i]);
    if (val === -1) continue;
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      out[index++] = (value >> (bits - 8)) & 0xff;
      bits -= 8;
    }
  }
  return out;
}

function generateAlphanumericTotp(secretKey, step) {
    const keyBytes = decodeBase32(secretKey);

    const stepBytes = new Uint8Array(8);
    let tempStep = step;
    for (let i = 7; i >= 0; i--) {
      stepBytes[i] = tempStep & 0xff;
      tempStep = Math.floor(tempStep / 256);
    }

    const hmac = sha1.hmac.create(keyBytes);
    hmac.update(stepBytes);
    const hash = new Uint8Array(hmac.array());
    
    const result = [];
    for (let i = 0; i < 10; i++) {
      const offset = (i * 2) % (hash.length - 1);
      const val = ((hash[offset] << 8) | hash[offset + 1]) & 0x7fff;
      result.push(AlphanumericChars[val % AlphanumericChars.length]);
    }

    console.log("JS Code: " + result.join(''));
    console.log("JS StepBytes: " + Array.from(stepBytes).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join('-'));
    console.log("JS KeyBytes: " + Array.from(keyBytes).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join('-'));
    console.log("JS Hash: " + Array.from(hash).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join('-'));
}

const secret = "JBSWY3DPEBLW64TMMQQQ====";
generateAlphanumericTotp(secret, 123456789);
