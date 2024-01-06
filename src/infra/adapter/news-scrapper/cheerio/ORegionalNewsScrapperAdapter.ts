import HTTPRequests from "../../../../domain/adapters/HTTPRequests";
import NewsScrapperAdapter from "../../../../domain/adapters/NewsScrapperAdapter";

export type TNews = {
  id: string;
  title: string;
  postedAt: string;
  link: string;
};

export default class ORegionalNewsScrapperAdapter implements NewsScrapperAdapter {
  private readonly url: string = "https://oregional.net/topico/mogiguacu/page/";
  constructor(private readonly httpAdapter: HTTPRequests) {}

  async scrapURL(numOfPages: number): Promise<TNews[]> {
    let news: TNews[] = [];
    for (let i = 1; i <= numOfPages; i += 1) {
      const siteData = await this.getSiteBody(`${this.url}/${i}`);
      const $ = await this.loadSiteBody(siteData);
      const newsList = $('#main-content ul');

      const mapList: TNews[] = newsList
        .find('li')
        .map((_: number, element: string) => {
          return {
            link: $(element).find('a').attr('href'),
            title: $(element).find('a').text().trim(),
            postedAt: $(element).find('.post-date').text().trim(),
            id: $(element).find('a').attr('href'),
          };
        })
        .get();

      news = [...news, ...mapList];
    }
    return news;
  }

  async getSiteBody(siteData: any): Promise<any> {
    const data = await this.httpAdapter.get(siteData);
    return data;
  }

  async loadSiteBody(siteData: any): Promise<any> {
    const cheerio = await import('cheerio');
    return cheerio.load(siteData);
  }
}
