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
    if (val === -1) {
      console.log("Invalid char:", cleaned[i]);
      continue;
    }
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      out[index++] = (value >> (bits - 8)) & 0xff;
      bits -= 8;
    }
  }
  return out;
}

console.log("MANAGER:", decodeBase32("MANAGERSECRETKEY2222222222222222"));
