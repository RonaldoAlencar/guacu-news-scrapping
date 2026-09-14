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
    readonly logger: LoggerAdapter,
    readonly publish = true,
  ) {}

  async execute(): Promise<void> {
    const useCasesPromises = this.newsScrappersAdapters.map(async (newsScrapperAdapter) => {
      try {
        const getNews = new GetNews(
          this.newsRepository,
          newsScrapperAdapter,
          this.queue,
          this.publish,
        );
        const saved = await getNews.execute();
        this.logger.logInfo(
          `News scrapped from ${newsScrapperAdapter.source}: ${saved} new item(s)`,
        );
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.logError(message);
        this.logger.logError(`Error scrapping news from ${newsScrapperAdapter.source}`);
      }
    });

    await Promise.all(useCasesPromises);
  }
}
