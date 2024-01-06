import News from "../entities/News";

export default interface NewsRepository {
  save(news: News): Promise<void>;
  findByNewsLink(link: string): Promise<News | null>;
}
