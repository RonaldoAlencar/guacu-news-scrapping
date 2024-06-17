import HTTPRequests from "../../../../domain/adapters/HTTPRequests";
import NewsScrapperAdapter from "../../../../domain/adapters/NewsScrapperAdapter";
import { TNews } from "./ORegionalNewsScrapperAdapter";

export default class GuacuAgoraAdapter implements NewsScrapperAdapter {
  private readonly url: string = "https://guacuagora.com.br/page/1/?s";

  constructor(private readonly httpAdapter: HTTPRequests) {}

  async scrapURL(numOfPages: number): Promise<TNews[]> {
    let news: TNews[] = [];
    for (let i = 1; i <= numOfPages; i += 1) {
      const siteData = await this.getSiteBody(`${this.url.replace('{pageNumber}', i.toString())}`);
      const $ = await this.loadSiteBody(siteData);
      const newsList = $('.td_block_inner.tdb-block-inner.td-fix-index');

      const mapList: TNews[] = newsList
        .find('.td-module-container.td-category-pos-image')
        .map((_: number, element: string) => {
          return {
            link: $(element).find('.entry-title.td-module-title').find('a').attr('href'),
            title: $(element).find('.entry-title.td-module-title').find('a').text().trim(),
            postedAt: $(element).find('.entry-date.updated.td-module-date').text().trim(),
            id: $(element).find('.entry-title.td-module-title').find('a').attr('href'),
          };
        })
        .get();

      news = [...news, ...mapList];
    }
    return news;
  }

  async getSiteBody(siteURL: any): Promise<any> {
    const data = await this.httpAdapter.get(siteURL);
    return data;
  }

  async loadSiteBody(siteData: string): Promise<any> {
    const cheerio = await import('cheerio');
    return cheerio.load(siteData);
  }

}
