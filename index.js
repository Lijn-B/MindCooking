
const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('https://cookidoo.be/foundation/nl-BE/explore', { waitUntil: 'networkidle2' });

  const recepten = await page.evaluate(() => {
    const items = [];
    document.querySelectorAll('.wf-bento-grid__item').forEach((item) => {
      const link = item.querySelector('a')?.href;
      const img = item.querySelector('img')?.src;
      const title = item.querySelector('.wf-bento-grid__header')?.innerText;

      if (link && img && title) {
        items.push({ title: title.trim(), img, url: link });
      }
    });
    return items.slice(0, 10);
  });

  fs.mkdirSync('public', { recursive: true });
  fs.writeFileSync('public/recepten.json', JSON.stringify(recepten, null, 2));
  console.log('✅ recepten.json gegenereerd');

  await browser.close();
})();
