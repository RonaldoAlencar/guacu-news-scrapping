import { load } from "cheerio";

const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid",
  "igshid",
]);

const CITY_PATTERNS: Array<{ city: string; needles: string[] }> = [
  {
    city: "Mogi Mirim",
    needles: ["mogi mirim", "mogimirim", "mogi-mirim", "mogimiriano"],
  },
  {
    city: "Mogi Guaçu",
    needles: ["mogi guacu", "mogiguacu", "mogi-guacu", "guacuano", "guaçuano"],
  },
  {
    city: "Estiva Gerbi",
    needles: ["estiva gerbi", "estivagerbi", "estiva-gerbi"],
  },
];

export function readableHtmlText(html: string): string {
  const spaced = html.replace(/<[^>]+>/g, " ");
  return load(`<div>${spaced}</div>`)("div")
    .text()
    .replace(/\s+/g, " ")
    .trim();
}

export function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

export function normalizeLink(link: string, baseUrl?: string): string {
  const trimmed = link.trim();
  if (!trimmed) {
    return "";
  }

  try {
    const url = new URL(trimmed, baseUrl);
    TRACKING_PARAMS.forEach((param) => url.searchParams.delete(param));
    url.hash = "";
    let href = url.toString();
    if (href.endsWith("/") && url.pathname !== "/") {
      href = href.slice(0, -1);
    }
    return href;
  } catch {
    return trimmed.split("#")[0];
  }
}

export function haystack(title: string, link: string): string {
  let path = link;
  try {
    path = new URL(link).pathname;
  } catch {
    path = link.replace(/^https?:\/\/[^/]+/i, "");
  }
  return stripDiacritics(`${title} ${path}`);
}

export function inferCity(title: string, link: string, fallback: string, extra = ""): string {
  const text = `${haystack(title, link)} ${stripDiacritics(extra)}`;
  for (const pattern of CITY_PATTERNS) {
    if (pattern.needles.some((needle) => text.includes(stripDiacritics(needle)))) {
      return pattern.city;
    }
  }
  return fallback;
}

export function matchesLocalCity(title: string, link: string, extra = ""): boolean {
  const text = `${haystack(title, link)} ${stripDiacritics(extra)}`;
  return CITY_PATTERNS.some((pattern) =>
    pattern.needles.some((needle) => text.includes(stripDiacritics(needle))),
  );
}

export function looksLikeCloudflare(html: string): boolean {
  const sample = html.slice(0, 4000).toLowerCase();
  return (
    sample.includes("cf-browser-verification") ||
    sample.includes("just a moment") ||
    sample.includes("attention required") ||
    sample.includes("checking your browser") ||
    (sample.includes("cloudflare") && sample.includes("ray id"))
  );
}
