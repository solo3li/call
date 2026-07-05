const puppeteer = require('puppeteer');
const sha1 = require('js-sha1');

const AlphanumericChars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function decodeBase32(input) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleaned = input.toUpperCase().replace(/=+$/, '');
  const length = cleaned.length;
  const out = new Uint8Array(((length * 5) / 8) | 0);
  let bits = 0, value = 0, index = 0;
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

function generate(secret) {
  const keyBytes = decodeBase32(secret);
  const unixTimestamp = Math.floor(Date.now() / 1000);
  const step = Math.floor(unixTimestamp / 3600);
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
  return result.join('');
}

(async () => {
  const secret = 'STLIHS7YRHK4HWKKLPCHOYN5IG2WR4BN';
  const totpCode = generate(secret);
  console.log('Using TOTP Code:', totpCode);

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  // Set viewport to a mobile-like size
  await page.setViewport({ width: 375, height: 812 });

  console.log('Navigating to login page...');
  await page.goto('http://scanner.68.183.13.154.nip.io/login', { waitUntil: 'networkidle2' });

  console.log('Entering TOTP code...');
  await page.waitForSelector('input');
  await page.type('input', totpCode);

  console.log('Clicking login...');
  // Find the button with text "تسجيل الدخول" or just the first button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('div[role="button"]'));
    const loginBtn = btns.find(b => b.textContent.includes('تسجيل الدخول') || b.textContent.includes('Login'));
    if (loginBtn) loginBtn.click();
  });

  console.log('Waiting for navigation to camera...');
  await page.waitForTimeout(3000); // Wait for API call and redirect

  console.log('Taking Camera UI screenshot...');
  const basePath = '/root/.gemini/antigravity-ide/brain/03ae6c1f-e578-48c7-8bbe-5d0962d3243e';
  await page.screenshot({ path: `${basePath}/scanner_camera_ui.png` });

  console.log('Navigating to History...');
  // Assuming there is a bottom tab bar with "السجل" or "History"
  await page.goto('http://scanner.68.183.13.154.nip.io/history', { waitUntil: 'networkidle2' });
  await page.waitForTimeout(2000); // Wait for history to load
  
  console.log('Taking History UI screenshot...');
  await page.screenshot({ path: `${basePath}/scanner_history_ui.png` });

  console.log('Done!');
  await browser.close();
})();
