import { load } from "cheerio";
import NewsScrapperAdapter from "../../domain/adapters/NewsScrapperAdapter";
import { NewsItem } from "../../domain/entities/NewsItem";
import ScrapingHttp from "../http/ScrapingHttp";
import { formatPostedAt } from "../../utils/formatDate";
import { inferCity, matchesLocalCity, normalizeLink } from "../../utils/newsParse";

export type RssSourceConfig = {
  source: string;
  city: string;
  url: string;
  http?: "axios" | "playwright";
  cityFilter?: boolean;
};

export default class RssNewsScraper implements NewsScrapperAdapter {
  readonly source: string;

  constructor(
    private readonly http: ScrapingHttp,
    private readonly config: RssSourceConfig,
  ) {
    this.source = config.source;
  }

  async scrap(): Promise<NewsItem[]> {
    const xml = await this.http.get(this.config.url, this.config.http ?? "axios");
    return this.parse(xml);
  }

  parse(xml: string): NewsItem[] {
    const $ = load(xml, { xml: true });
    const items: NewsItem[] = [];

    $("item").each((_, element) => {
      const $item = $(element);
      const title = $item.find("title").first().text().replace(/\s+/g, " ").trim();
      const link = normalizeLink(
        $item.find("link").first().text().trim() || $item.find("guid").first().text().trim(),
      );
      const postedAt = formatPostedAt($item.find("pubDate").first().text());
      const extra = $item.find("description").first().text();

      if (!title || !link) {
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
