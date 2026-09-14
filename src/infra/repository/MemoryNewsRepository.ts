import News from "../../domain/entities/News";
import NewsRepository from "../../domain/repository/NewsRepository";

export default class MemoryNewsRepository implements NewsRepository {
  private readonly items = new Map<string, News>();

  async save(news: News): Promise<void> {
    this.items.set(news.link, news);
  }

  async findByNewsLink(link: string): Promise<News | null> {
    return this.items.get(link) ?? null;
  }

  async markPublished(link: string): Promise<void> {
    const current = this.items.get(link);
    if (!current) {
      return;
    }
    this.items.set(
      link,
      new News(
        current.id,
        current.title,
        current.link,
        current.postedAt,
        current.source,
        current.city,
        true,
      ),
    );
  }

  all(): News[] {
    return [...this.items.values()];
  }
}
