import puppeteer from 'puppeteer';
import { copyFileSync } from 'fs';
import { join } from 'path';

(async () => {
  const browser = await puppeteer.launch({ 
    headless: true, 
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  
  // Wait for the Next.js app to be fully ready
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Output directory: the artifact directory
  const outDir = 'C:\\Users\\abhit\\.gemini\\antigravity\\brain\\ae6bace3-95c7-4b9a-a464-f8ce704e4087';

  const capture = async (filename, fullPage = false) => {
    const path = join(outDir, filename);
    await page.screenshot({ path, fullPage });
    console.log(`Captured ${filename}`);
  };

  // 1. 1440px desktop
  await page.setViewport({ width: 1440, height: 900 });
  await capture('1440-desktop-full.png', true);

  // 2. Focused sections on desktop
  // Hero (already captured by taking top part, but we can just crop or take a viewport shot)
  await page.setViewport({ width: 1440, height: 900 });
  await capture('hero-focused.png');

  // Selected Works
  const worksHandle = await page.$('#selected-works');
  if (worksHandle) {
    await worksHandle.screenshot({ path: join(outDir, 'selected-works.png') });
  }

  // 3. 1024px tablet
  await page.setViewport({ width: 1024, height: 768 });
  await capture('1024-tablet-full.png', true);

  // 4. 390px mobile
  await page.setViewport({ width: 390, height: 844 });
  await capture('390-mobile-full.png', true);

  // 5. Mobile nav open state
  // Using page.evaluate to click the menu button since it's reliable
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const menuBtn = btns.find(b => b.textContent.includes('Menu'));
    if (menuBtn) menuBtn.click();
  });
  
  // Wait for animation
  await new Promise(r => setTimeout(r, 1000));
  await capture('mobile-nav-open.png');

  await browser.close();
})();
