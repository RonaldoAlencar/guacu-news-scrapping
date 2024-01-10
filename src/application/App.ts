import LoggerAdapter from "../domain/adapters/LoggerAdapter";
import NewsScrapperAdapter from "../domain/adapters/NewsScrapperAdapter";
import Queue from "../domain/adapters/Queue";
import NewsRepository from "../domain/repository/NewsRepository";
import GetNews from "../domain/usecase/GetNews";

export default class App {
    constructor(
      readonly newsRepository: NewsRepository,
      readonly queue: Queue,
      readonly newsScrappersAdapters: NewsScrapperAdapter[],
      readonly logger: LoggerAdapter
    ) {}

    async execute() {
      const useCasesPromises = this.newsScrappersAdapters.map(async newsScrapperAdapter => { 
        try {
          const getNews = new GetNews(this.newsRepository, newsScrapperAdapter, this.queue);
          await getNews.execute();
          this.logger.logInfo(`News scrapped from ${newsScrapperAdapter.constructor.name}`);
        } catch (error: any) {
          this.logger.logError(error);
          this.logger.logError(`Error scrapping news from ${newsScrapperAdapter.constructor.name}`);
        }
      });

      await Promise.all(useCasesPromises);
    }
}