const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('public/recepten-bron.html', 'utf-8');
const $ = cheerio.load(html);

const recepten = [];

$('.wf-bento-grid__item').each((_, el) => {
  const $el = $(el);
  const title = $el.find('.tile__title').text().trim();
  const image = $el.find('img').attr('src');
  const link = 'https://cookidoo.be' + $el.find('a').attr('href');

  if (title && image && link) {
    recepten.push({ title, image, link });
  }
});

fs.writeFileSync('public/recepten.json', JSON.stringify(recepten, null, 2));
console.log(`✅ ${recepten.length} recepten opgeslagen in recepten.json`);
