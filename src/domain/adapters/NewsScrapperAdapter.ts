import { NewsItem } from "../entities/NewsItem";

export default interface NewsScrapperAdapter {
  readonly source: string;
  scrap(): Promise<NewsItem[]>;
}
