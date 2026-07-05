import sha1 from 'js-sha1';

const AlphanumericChars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const TotpStep = 3600; // 1 hour

/**
 * Decodes a base32 string into a Uint8Array
 */
function decodeBase32(input: string): Uint8Array {
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

/**
 * Generates the custom 10-char alphanumeric TOTP
 */
export function generateAlphanumericTotp(secretKey: string): string {
  try {
    const keyBytes = decodeBase32(secretKey);
    const unixTimestamp = Math.floor(Date.now() / 1000);
    const step = Math.floor(unixTimestamp / TotpStep);

    // Convert step to 8-byte big-endian buffer (MATCHES C# long BitConverter)
    const stepBytes = new Uint8Array(8);
    let tempStep = step;
    for (let i = 7; i >= 0; i--) {
      stepBytes[i] = tempStep & 0xff;
      tempStep = Math.floor(tempStep / 256);
    }

    // @ts-ignore - js-sha1 types
    const hmac = sha1.hmac.create(keyBytes);
    hmac.update(stepBytes);
    const hash = new Uint8Array(hmac.array());
    
    const result: string[] = [];

    // ALIGN WITH C# LOGIC:
    // int offset = (i * 2) % (hash.Length - 1);
    // int val = (hash[offset] << 8 | hash[offset + 1]) & 0x7FFF;
    for (let i = 0; i < 10; i++) {
      const offset = (i * 2) % (hash.length - 1);
      const val = ((hash[offset] << 8) | hash[offset + 1]) & 0x7fff;
      result.push(AlphanumericChars[val % AlphanumericChars.length]);
    }

    return result.join('');
  } catch (err) {
    console.error('TOTP Generation Error:', err);
    return 'ERROR';
  }
}

/**
 * Calculates remaining seconds in the current 1-hour window
 */
export function getRemainingSeconds(): number {
  const unixTimestamp = Math.floor(Date.now() / 1000);
  return TotpStep - (unixTimestamp % TotpStep);
}
