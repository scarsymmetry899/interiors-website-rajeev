import puppeteer from 'puppeteer';
import { join } from 'path';

(async () => {
  const browser = await puppeteer.launch({ 
    headless: true, 
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  
  const outDir = 'C:\\Users\\abhit\\.gemini\\antigravity\\brain\\ae6bace3-95c7-4b9a-a464-f8ce704e4087';

  // 390px mobile Project Detail
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/projects/the-glass-pavilion', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: join(outDir, 'project-detail-mobile-hardened.png'), fullPage: true });

  await browser.close();
})();
