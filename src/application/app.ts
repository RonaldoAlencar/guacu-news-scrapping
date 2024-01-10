import NewsScrapperAdapter from "../domain/adapters/NewsScrapperAdapter";
import Queue from "../domain/adapters/Queue";
import NewsRepository from "../domain/repository/NewsRepository";
import GetNews from "../domain/usecase/GetNews";

export default class App {
    constructor(
      readonly newsRepository: NewsRepository,
      readonly queue: Queue,
      readonly newsScrappersAdapters: NewsScrapperAdapter[],
    ) {}

    async execute() {
      const useCasesPromises = this.newsScrappersAdapters.map(newsScrapperAdapter => { 
        const getNews = new GetNews(this.newsRepository, newsScrapperAdapter, this.queue);
        return getNews.execute();
      });

      try {
        await Promise.all(useCasesPromises);
        console.log('All news scrapped!');
      } catch (error) {
        console.error(error);
        console.log('Error scrapping news!');
      }
    }
}