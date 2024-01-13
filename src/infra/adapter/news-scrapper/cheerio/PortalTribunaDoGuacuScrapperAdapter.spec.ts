import HTTPRequests from "../../../../domain/adapters/HTTPRequests";
import NewsScrapperAdapter from "../../../../domain/adapters/NewsScrapperAdapter";
import CloudscrapperAdapter from "../../cloudscrapper/CloudscrapperAdapter"
import PortalTribunaDoGuacuScrapper from "./PortalTribunaDoGuacuScrapperAdapter"

describe('PortalTribunaDoGuacuScrapperAdapter', () => {
  let url: string;
  let httpAdapter: HTTPRequests;
  let portalTribunaDoGuacu: NewsScrapperAdapter;

  beforeEach(() => {
    url = 'https://portaltribunadoguacu.com.br/noticias'
    httpAdapter = new CloudscrapperAdapter()
    portalTribunaDoGuacu = new PortalTribunaDoGuacuScrapper(httpAdapter)
  })

  it('should return html body', async () => {
    const siteBody = await portalTribunaDoGuacu.getSiteBody(url)
    expect(siteBody).toBeTruthy()
    expect(siteBody).toContain('</div>')
    expect(siteBody).toContain('</span>')
  })

  it('should return html imported in cheerio', async () => {
    const siteBody = await portalTribunaDoGuacu.getSiteBody(url)
    const $ = await portalTribunaDoGuacu.loadSiteBody(siteBody)
    expect($).toBeTruthy()
    expect($).toHaveProperty('html')
  })

  it('should scrap news from PortalTribunaDoGuacu', async () => {
    const news = await portalTribunaDoGuacu.scrapURL(1)
    expect(news[0].link).toContain('https://portaltribunadoguacu.com.br')
    expect(news[0].title).toBeTruthy()
    expect(news[0].postedAt).toBeTruthy()
    expect(news[0].id).toBeTruthy()
  })
})