import HTTPRequests from "../../../../domain/adapters/HTTPRequests";
import NewsScrapperAdapter from "../../../../domain/adapters/NewsScrapperAdapter";
import { TNews } from "./ORegionalNewsScrapperAdapter";

export default class PortalTribunaDoGuacuScrapper implements NewsScrapperAdapter {
  private readonly url: string = "https://portaltribunadoguacu.com.br/noticias";

  constructor(private readonly httpAdapter: HTTPRequests) {}

  async scrapURL(numOfPages: number): Promise<TNews[]> {
    let news: TNews[] = [];
    for (let i = 1; i <= numOfPages; i += 1) {
      const siteData = await this.getSiteBody(`${this.url}/page-${i}`);
      const $ = await this.loadSiteBody(siteData);
      const newsList = $('.box-listar');

      const mapList: TNews[] = newsList
        .find('li')
        .map((_: number, element: string) => {
          return {
            link: $(element).find('a').attr('href'),
            title: $(element).find('.row_1').text().trim(),
            postedAt: $(element).find('.row_4').text().trim(),
            id: $(element).find('a').attr('href'),
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
