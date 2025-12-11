import { chromium } from "playwright";
import { load } from "cheerio";
import { ExtractedPropertyPayload } from "../../../models/types.js";

// NOTE: This scraper targets a fictitious domain examplehomes.test.
// Real portals must be implemented respecting each site's T&C and robots.txt.
export async function scrapeExamplePortal(url: string): Promise<ExtractedPropertyPayload> {
  // Real implementation would handle anti-bot challenges, scrolling galleries, etc.
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  const html = await page.content();
  await browser.close();

  const $ = load(html);
  const title = $("h1.listing-title").text().trim() || "Título no encontrado";
  const priceText = $(".price-tag").text().replace(/[^0-9.,]/g, "");
  const price = priceText ? Number(priceText.replace(/\./g, "").replace(/,/g, ".")) : undefined;
  const currencyMatch = $(".price-tag").text().match(/[A-Z]{2,3}/);
  const currency = currencyMatch ? currencyMatch[0] : undefined;
  const description = $(".description").text().trim();

  const statsText = (selector: string) => {
    const raw = $(selector).first().text();
    const number = Number(raw.replace(/[^0-9]/g, ""));
    return Number.isNaN(number) ? undefined : number;
  };

  const images: string[] = [];
  $(".gallery img").each((_, el) => {
    const src = $(el).attr("src");
    if (src) images.push(src);
  });

  return {
    title,
    description,
    price,
    currency,
    address: $(".address").text().trim(),
    bedrooms: statsText('.stat-bed'),
    bathrooms: statsText('.stat-bath'),
    parking: statsText('.stat-parking'),
    builtArea: statsText('.stat-built'),
    landArea: statsText('.stat-land'),
    extras: $(".amenities li").map((_, el) => $(el).text().trim()).get(),
    images,
  };
}
