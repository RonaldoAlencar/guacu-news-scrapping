import NewsScrapperAdapter from "../domain/adapters/NewsScrapperAdapter";
import Queue from "../domain/adapters/Queue";
import NewsRepository from "../domain/repository/NewsRepository";
import GetNews from "../domain/usecase/GetNews";

export default class App {
    constructor(
      readonly newsRepository: NewsRepository,
      readonly queue: Queue,
      readonly oRegionalNewsScrapperAdapter: NewsScrapperAdapter,
      readonly PortalDaCidadeMogiMirimAdapter: NewsScrapperAdapter,
      readonly guacuAgoraAdapter: NewsScrapperAdapter,
      readonly portalTribunaDoGuacuAdapter: NewsScrapperAdapter,
    ) {}

    async run() {    
      const oRegionalNews = new GetNews(this.newsRepository, this.oRegionalNewsScrapperAdapter, this.queue);
      const portalDaCidadeMogiMirimNews = new GetNews(this.newsRepository, this.PortalDaCidadeMogiMirimAdapter, this.queue);
      const guacuAgoraNews = new GetNews(this.newsRepository, this.guacuAgoraAdapter, this.queue);
      const portalTribunaDoGuacuNews = new GetNews(this.newsRepository, this.portalTribunaDoGuacuAdapter, this.queue);
    
      const useCasesPromises = Promise.all([ 
        oRegionalNews.execute(), 
        portalDaCidadeMogiMirimNews.execute(), 
        guacuAgoraNews.execute(),
        portalTribunaDoGuacuNews.execute(),
      ]).then(() => {
        console.log('All news scrapped');
      }).catch((err) => {
        console.log('Error scrapping news');
        console.log(err);
      });
      await useCasesPromises;
    }
}
