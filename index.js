const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://cookidoo.be/foundation/nl-BE', {
    waitUntil: 'networkidle0'
  });

  await page.waitForSelector('.wf-bento-grid__item');

  const recepten = await page.evaluate(() => {
    const items = document.querySelectorAll('.wf-bento-grid__item');
    return Array.from(items).map(item => {
      const title = item.querySelector('.tile__title')?.innerText || '';
      const image = item.querySelector('img')?.src || '';
      const link = item.querySelector('a')?.href || '';
      return { title, image, link };
    });
  });

  const fs = require('fs');
  fs.mkdirSync('public', { recursive: true });
  fs.writeFileSync('public/recepten.json', JSON.stringify(recepten, null, 2));

  await browser.close();
})();
