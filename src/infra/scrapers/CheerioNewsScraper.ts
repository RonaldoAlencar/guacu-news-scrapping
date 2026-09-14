import { load } from "cheerio";
import NewsScrapperAdapter from "../../domain/adapters/NewsScrapperAdapter";
import { NewsItem } from "../../domain/entities/NewsItem";
import ScrapingHttp from "../http/ScrapingHttp";
import { formatPostedAt } from "../../utils/formatDate";
import { inferCity, matchesLocalCity, normalizeLink, readableHtmlText } from "../../utils/newsParse";

export type CheerioSourceConfig = {
  source: string;
  city: string;
  http: "axios" | "playwright";
  pages?: number;
  listingUrls: (page: number) => string[];
  itemSelector: string;
  titleSelector: string;
  linkSelector: string;
  dateSelector?: string;
  extraSelector?: string;
  cityFilter?: boolean;
  baseUrl: string;
};

export default class CheerioNewsScraper implements NewsScrapperAdapter {
  readonly source: string;

  constructor(
    private readonly http: ScrapingHttp,
    private readonly config: CheerioSourceConfig,
  ) {
    this.source = config.source;
  }

  async scrap(): Promise<NewsItem[]> {
    const pages = this.config.pages ?? 1;
    const collected: NewsItem[] = [];

    for (let page = 1; page <= pages; page += 1) {
      for (const url of this.config.listingUrls(page)) {
        const html = await this.http.get(url, this.config.http);
        collected.push(...this.parse(html));
      }
    }

    return this.dedupe(collected);
  }

  parse(html: string): NewsItem[] {
    const $ = load(html);
    const items: NewsItem[] = [];

    $(this.config.itemSelector).each((_, element) => {
      const $el = $(element);
      const href = this.firstAttr($el, this.config.linkSelector, "href");
      const title = this.firstText($el, this.config.titleSelector);
      const postedAt = this.config.dateSelector
        ? formatPostedAt(
            this.firstAttr($el, this.config.dateSelector, "content"),
            this.firstAttr($el, this.config.dateSelector, "datetime"),
            this.firstText($el, this.config.dateSelector),
          )
        : "";
      const extra = this.config.extraSelector
        ? this.joinText($el, this.config.extraSelector)
        : $el.text();

      const link = normalizeLink(href, this.config.baseUrl);
      if (!title || !link || this.isLegalNotice(title)) {
        return;
      }

      if (this.config.cityFilter && !matchesLocalCity(title, link, extra)) {
        return;
      }

      items.push({
        title,
        link,
        postedAt,
        source: this.config.source,
        city: inferCity(title, link, this.config.city, extra),
      });
    });

    return this.dedupe(items);
  }

  // cheerio selection for a matched node
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private firstText($el: any, selector: string): string {
    if (selector === ".") {
      return this.nodeText($el);
    }
    for (const part of selector.split(",").map((item) => item.trim())) {
      const node = $el.find(part).first();
      const text =
        this.nodeText(node) ||
        (node.attr("content") || node.attr("datetime") || node.attr("title") || "")
          .replace(/\s+/g, " ")
          .trim();
      if (text) {
        return text;
      }
    }
    return "";
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private nodeText($node: any): string {
    const html = $node.html();
    if (typeof html === "string" && html.length > 0) {
      return readableHtmlText(html);
    }
    return String($node.text() || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private firstAttr($el: any, selector: string, attr: string): string {
    if (selector === ".") {
      return $el.attr(attr) || "";
    }
    for (const part of selector.split(",").map((item) => item.trim())) {
      const node = $el.find(part).first();
      const value = node.attr(attr) || ($el.is(part) ? $el.attr(attr) : undefined);
      if (value) {
        return value;
      }
    }
    if ($el.is("a")) {
      return $el.attr(attr) || "";
    }
    return $el.find("a").first().attr(attr) || "";
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private joinText($el: any, selector: string): string {
    return selector
      .split(",")
      .map((part: string) => this.nodeText($el.find(part.trim())))
      .filter(Boolean)
      .join(" ");
  }

  private isLegalNotice(title: string): boolean {
    const normalized = title.toLowerCase();
    return (
      normalized.includes("edital de convocação") ||
      normalized.includes("edital de convocacao") ||
      normalized.includes("balanço patrimonial") ||
      normalized.includes("balanco patrimonial")
    );
  }

  private dedupe(items: NewsItem[]): NewsItem[] {
    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item.link)) {
        return false;
      }
      seen.add(item.link);
      return true;
    });
  }
}
