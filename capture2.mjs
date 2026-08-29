import puppeteer from 'puppeteer';
import { join } from 'path';

(async () => {
  const browser = await puppeteer.launch({ 
    headless: true, 
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  
  const outDir = 'C:\\Users\\abhit\\.gemini\\antigravity\\brain\\ae6bace3-95c7-4b9a-a464-f8ce704e4087';

  const capture = async (url, filename, viewport) => {
    await page.setViewport(viewport);
    await page.goto(url, { waitUntil: 'networkidle0' });
    const path = join(outDir, filename);
    await page.screenshot({ path, fullPage: true });
    console.log(`Captured ${filename}`);
  };

  const urlBase = 'http://localhost:3000';

  // Project Index
  await capture(`${urlBase}/projects`, 'projects-index-desktop.png', { width: 1440, height: 900 });
  await capture(`${urlBase}/projects`, 'projects-index-tablet.png', { width: 1024, height: 768 });
  await capture(`${urlBase}/projects`, 'projects-index-mobile.png', { width: 390, height: 844 });

  // Project Detail
  await capture(`${urlBase}/projects/the-glass-pavilion`, 'project-detail-desktop.png', { width: 1440, height: 900 });
  await capture(`${urlBase}/projects/the-glass-pavilion`, 'project-detail-tablet.png', { width: 1024, height: 768 });
  await capture(`${urlBase}/projects/the-glass-pavilion`, 'project-detail-mobile.png', { width: 390, height: 844 });

  await browser.close();
})();
