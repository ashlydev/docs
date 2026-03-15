import * as cheerio from "cheerio";

const BLOCK_SELECTORS = "h1, h2, h3, h4, p, li";
const NOISE_SELECTORS = [
  "script",
  "style",
  "noscript",
  "svg",
  "canvas",
  "iframe",
  "form",
  "nav",
  "footer",
  "header",
  "aside",
  "[role='navigation']",
  "[aria-label*='breadcrumb' i]",
  ".breadcrumb",
  ".breadcrumbs",
  ".cookie-banner",
  ".newsletter",
  ".announcement",
  ".social",
  ".sidebar"
].join(", ");

function normalizeText(input: string) {
  return input
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getContentRoot($: cheerio.CheerioAPI) {
  const candidates = ["main", "article", "[role='main']", ".content", ".article", "body"];

  for (const selector of candidates) {
    const element = $(selector).first();

    if (element.length > 0 && element.text().trim().length > 120) {
      return element;
    }
  }

  return $("body");
}

function getTitle($: cheerio.CheerioAPI, fallbackUrl: string) {
  return (
    $("meta[property='og:title']").attr("content")?.trim() ||
    $("meta[name='twitter:title']").attr("content")?.trim() ||
    $("title").first().text().trim() ||
    fallbackUrl
  );
}

export async function extractReadableContent(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "User-Agent": "SupportBotDemo/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  $(NOISE_SELECTORS).remove();
  $("[class*='nav'], [class*='footer'], [class*='menu']").remove();

  const title = getTitle($, url);
  const contentRoot = getContentRoot($);
  const blocks = contentRoot
    .find(BLOCK_SELECTORS)
    .map((_, element) => $(element).text().trim())
    .get()
    .filter((block) => block.length > 20);

  const text = normalizeText(
    blocks.length > 0 ? blocks.join("\n") : contentRoot.text()
  );

  if (!text) {
    throw new Error(`No readable content extracted for ${url}.`);
  }

  return {
    sourceUrl: url,
    sourceTitle: title,
    text
  };
}
