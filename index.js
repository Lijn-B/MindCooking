const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.1 Safari/537.36"
  );

  await page.setViewport({ width: 1280, height: 2000 });

  await page.goto("https://cookidoo.be/foundation/nl-BE", {
    waitUntil: "networkidle2",
    timeout: 0
  });

  // Scroll rustig naar beneden (langzamer + verder dan eerst)
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 200;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight > 2500) {
          clearInterval(timer);
          resolve();
        }
      }, 300);
    });
  });

  // Schrijf volledige HTML naar bestand
  fs.mkdirSync("public", { recursive: true });
  fs.writeFileSync("public/recepten-bron.html", await page.content());

  await browser.close();
})();
