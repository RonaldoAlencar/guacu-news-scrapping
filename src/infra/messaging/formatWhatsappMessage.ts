import { NewsItem } from "../../domain/entities/NewsItem";
import { formatPostedAt } from "../../utils/formatDate";

export function formatWhatsappMessage(news: Pick<NewsItem, "source" | "title" | "link" | "postedAt">): string {
  const source = news.source ? `[${news.source}] ` : "";
  const postedAt = formatPostedAt(news.postedAt);
  const date = postedAt ? `\n${postedAt}` : "";
  return `📰 ${source}${news.title}\n\n${news.link}${date}`;
}
