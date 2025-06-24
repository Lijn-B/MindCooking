// 1. HTML parser voor recepten-bron.html naar recepten.json

const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('public/recepten-bron.html', 'utf-8');
const $ = cheerio.load(html);

const recepten = [];

$('wf-image-tile').each((_, el) => {
  const $el = $(el);
  const linkEl = $el.find('a');
  const title = $el.find('.wf-image-tile__title').text().trim();
  const image = linkEl.find('img').attr('src');
  const link = 'https://cookidoo.be' + linkEl.attr('href');

  if (title && image && link) {
    recepten.push({ title, image, link });
  }
});

fs.writeFileSync('public/recepten.json', JSON.stringify(recepten, null, 2));
console.log(`✅ ${recepten.length} recepten opgeslagen in recepten.json`);
