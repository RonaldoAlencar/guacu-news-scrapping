import { TNews } from "../../infra/adapter/news-scrapper/cheerio/ORegionalNewsScrapperAdapter";

export default interface NewsScrapperAdapter {
  scrapURL(numOfPages: number): Promise<TNews[]>;
  getSiteBody(url: string): Promise<string>;
  loadSiteBody(siteBody: string): void;
}
