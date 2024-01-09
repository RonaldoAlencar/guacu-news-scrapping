import CloudscrapperAdapter from "../../cloudscrapper/CloudscrapperAdapter"
import GuacuAgoraAdapter from "./GuacuAgoraAdapter"

describe('GuacuAgora', () => {
  const url = 'https://guacuagora.com.br/?s='
  const httpAdapter = new CloudscrapperAdapter()
  const guacuAgora = new GuacuAgoraAdapter(httpAdapter)

  describe('getSiteBody', () => {
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
})