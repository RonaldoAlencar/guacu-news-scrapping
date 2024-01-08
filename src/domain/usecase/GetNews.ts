import NewsScrapperAdapter from "../adapters/NewsScrapperAdapter";
import Queue from "../adapters/Queue";
import News from "../entities/News";
import NewsRepository from "../repository/NewsRepository";

export default class GetNews {
  constructor(readonly newsRepository: NewsRepository, readonly newsScrapperAdapter: NewsScrapperAdapter, readonly queue: Queue) {}

  async execute(): Promise<void> {
    const news = await this.newsScrapperAdapter.scrapURL(3);
    
    for (const n of news) {
      const newsEntity = new News(n.id, n.title, n.link,  n.postedAt);
      const alreadyExists = await this.newsRepository.findByNewsLink(newsEntity.link);
      if (alreadyExists) { continue; }

      await this.newsRepository.save(newsEntity);
      await this.queue.publish("news", newsEntity);
    }
  }
}
