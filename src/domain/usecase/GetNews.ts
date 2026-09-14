import NewsScrapperAdapter from "../adapters/NewsScrapperAdapter";
import Queue from "../adapters/Queue";
import News from "../entities/News";
import NewsRepository from "../repository/NewsRepository";
import { normalizeLink } from "../../utils/newsParse";

export default class GetNews {
  constructor(
    readonly newsRepository: NewsRepository,
    readonly newsScrapperAdapter: NewsScrapperAdapter,
    readonly queue: Queue,
    readonly publish = true,
  ) {}

  async execute(): Promise<number> {
    const news = await this.newsScrapperAdapter.scrap();
    let queued = 0;

    for (const item of news) {
      const link = normalizeLink(item.link);
      const title = item.title.trim();
      if (!link || !title) {
        continue;
      }

      let existing = await this.newsRepository.findByNewsLink(link);
      if (existing?.published) {
        continue;
      }

      if (!existing) {
        await this.newsRepository.save(News.fromItem({ ...item, title, link }));
        existing = await this.newsRepository.findByNewsLink(link);
        if (existing?.published) {
          continue;
        }
      }

      if (this.publish) {
        await this.queue.publish(existing ?? News.fromItem({ ...item, title, link }));
      }

      queued += 1;
    }

    return queued;
  }
}
