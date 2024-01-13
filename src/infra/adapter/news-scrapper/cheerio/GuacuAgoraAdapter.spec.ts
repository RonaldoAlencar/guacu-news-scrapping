import HTTPRequests from "../../../../domain/adapters/HTTPRequests";
import NewsScrapperAdapter from "../../../../domain/adapters/NewsScrapperAdapter";
import CloudscrapperAdapter from "../../cloudscrapper/CloudscrapperAdapter"
import GuacuAgoraAdapter from "./GuacuAgoraAdapter"

describe('GuacuAgora', () => {
  let url: string;
  let httpAdapter: HTTPRequests;
  let guacuAgora: NewsScrapperAdapter;

  beforeEach(() => {
    url = 'https://guacuagora.com.br/?s='
    httpAdapter = new CloudscrapperAdapter()
    guacuAgora = new GuacuAgoraAdapter(httpAdapter)
  })

  it('should return html body', async () => {
    const siteBody = await guacuAgora.getSiteBody(url)
    expect(siteBody).toBeTruthy()
    expect(siteBody).toContain('</div>')
    expect(siteBody).toContain('</span>')
  })

  it('should return html imported in cheerio', async () => {
    const siteBody = await guacuAgora.getSiteBody(url)
    const $ = await guacuAgora.loadSiteBody(siteBody)
    expect($).toBeTruthy()
    expect($).toHaveProperty('html')
  })

  it('should scrap news from guacuagora and return an array of news', async () => {
    const news = await guacuAgora.scrapURL(1)
    expect(news[0].link).toContain('https://guacuagora.com.br/')
    expect(news[0].title).toBeTruthy()
    expect(news[0].postedAt).toBeTruthy()
    expect(news[0].id).toBeTruthy()
  })
})