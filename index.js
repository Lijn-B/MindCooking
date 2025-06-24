const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  try {
    console.log("Start scraper...");

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.1 Safari/537.36"
    );

    await page.setViewport({ width: 1280, height: 800 });

    console.log("Bezoek cookidoo...");
    await page.goto("https://cookidoo.be/foundation/nl-BE", {
      waitUntil: "networkidle2",
      timeout: 0,
    });

    console.log("Scrollen...");
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 300;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 250);
      });
    });

    console.log("Wacht na scroll...");
    await new Promise((resolve) => setTimeout(resolve, 3000));
	console.log("Wacht extra lang op mogelijke lazy loading...");
	await new Promise((resolve) => setTimeout(resolve, 8000));

    console.log("Sla HTML op voor controle...");
    const rawHtml = await page.content();
    fs.mkdirSync("public", { recursive: true });
    fs.writeFileSync("public/html-voor-scrape.html", rawHtml);
    console.log("Eerste 500 tekens HTML:", rawHtml.slice(0, 500));
    await page.screenshot({ path: "public/screenshot.png", fullPage: true });
    console.log("📸 Screenshot opgeslagen.");

    console.log("Zoek recepten...");
    const recepten = await page.evaluate(() => {
      const items = document.querySelectorAll("a.recipe-tile");
      return Array.from(items).map((item) => {
        const title = item.querySelector(".tile__title")?.innerText.trim() || "";
        const image = item.querySelector("img")?.src || "";
        const href = item.getAttribute("href");
        const link = href?.startsWith("/")
          ? `https://cookidoo.be${href}`
          : href || "";
        return { title, image, link };
      });
    });

    console.log("Aantal recepten gevonden:", recepten.length);
    fs.writeFileSync("public/recepten.json", JSON.stringify(recepten, null, 2));

    await browser.close();
    console.log("Scraper klaar!");
  } catch (error) {
    console.error("❌ Fout in scraper:", error);
    process.exit(1);
  }
})();
