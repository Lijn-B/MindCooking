const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();

await page.setUserAgent(
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.1 Safari/537.36"
);
await page.setViewport({ width: 1280, height: 800 });

await page.goto('https://cookidoo.be/foundation/nl-BE', {
  waitUntil: 'networkidle2', // iets minder streng dan 'networkidle0'
  timeout: 0
});

// ✅ Debug output
const content = await page.content();
require('fs').mkdirSync('public', { recursive: true });
require('fs').writeFileSync('public/debug.html', content);

// Nu pas wachten op recepten

await page.waitForSelector('.wf-bento-grid__container', { timeout: 60000 });
await new Promise(resolve => setTimeout(resolve, 3000));
await page.evaluate(async () => {
  window.scrollBy(0, 1000); // forceer scroll
  await new Promise(resolve => setTimeout(resolve, 2000));
});

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


