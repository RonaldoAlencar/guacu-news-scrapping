import HTTPRequests from "../../../../domain/adapters/HTTPRequests";
import NewsScrapperAdapter from "../../../../domain/adapters/NewsScrapperAdapter";
import { TNews } from "./ORegionalNewsScrapperAdapter";

export default class PortalDaCidadeMogiMirimNewsScrapperAdapter implements NewsScrapperAdapter {
  private readonly url: string = 'https://mogimirim.portaldacidade.com/noticias';

  constructor(private readonly httpAdapter: HTTPRequests) {}

  async scrapURL(): Promise<TNews[]> {
    const response = await this.httpAdapter.get(this.url);
    const $ = await this.loadSiteBody(response);
    const listTopics = $('section article .js-results .news-flex a');

    const topics: any = listTopics
      .map((_: number, element: string) => {
        return {
          link: $(element).attr('href'),
          title: $(element).find('h2').text().trim(),
          postedAt: $(element).find('.news-item--post-date').text().trim(),
          id: $(element).attr('href'),
        };
      })
      .get();

    return topics;
  }
  async getSiteBody(siteData: any): Promise<any> {
    const data = await this.httpAdapter.get(siteData, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3' },
    });
    return data;
  }
  async loadSiteBody(siteData: any): Promise<any> {
    const cheerio = await import('cheerio');
    return cheerio.load(siteData);
  }
}
