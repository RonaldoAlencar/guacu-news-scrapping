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
      const useCasesPromises = this.newsScrappersAdapters.map(newsScrapperAdapter => { 
        const getNews = new GetNews(this.newsRepository, newsScrapperAdapter, this.queue);
        return getNews.execute();
      });

      try {
        await Promise.all(useCasesPromises);
        this.logger.logInfo('News scrapped successfully!');
      } catch (error) {
        this.logger.logError(error as string);
        this.logger.logError('Error scrapping news');
      }
    }
}