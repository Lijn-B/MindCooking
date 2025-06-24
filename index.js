const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  console.log("Start scraper...");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();
  console.log("Bezoek cookidoo...");
  await page.goto("https://cookidoo.be/foundation/nl-BE", {
    waitUntil: "networkidle2",
  });

  // Scroll naar beneden om recepten te activeren
  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight);
  });
  console.log("Scrollen...");
  await new Promise((r) => setTimeout(r, 5000)); // wacht 5 sec na scroll

  // Wacht op recept-tegels
  console.log("Wacht op recept-tegels...");
  await page.waitForFunction(
    () => document.querySelectorAll("a.recipe-tile").length > 0,
    { timeout: 15000 }
  );

  console.log("Zoek recepten...");
  const recepten = await page.evaluate(() => {
    const tiles = document.querySelectorAll("a.recipe-tile");
    return Array.from(tiles).map((el) => {
      const title =
        el.querySelector(".tile__title")?.textContent?.trim() || "";
      const image = el.querySelector("img")?.src || "";
      const href = el.getAttribute("href") || "";
      const link = href.startsWith("/")
        ? `https://cookidoo.be${href}`
        : href;
      return { title, image, link };
    });
  });

  fs.writeFileSync(
    "public/recepten.json",
    JSON.stringify(recepten, null, 2)
  );
  console.log(`✅ ${recepten.length} recepten opgeslagen in recepten.json`);

  // screenshot optioneel
  await page.screenshot({ path: "public/screenshot.png", fullPage: true });

  await browser.close();
  console.log("Scraper klaar!");
})();
