import mysql from "mysql2/promise";
import News from "../../domain/entities/News";
import NewsRepository from "../../domain/repository/NewsRepository";

function isDuplicateKey(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "errno" in error &&
    Number((error as { errno: number }).errno) === 1062
  );
}

export default class NewsRepositoryDatabase implements NewsRepository {
  constructor(private readonly pool: mysql.Pool) {}

  async save(news: News): Promise<void> {
    try {
      await this.pool.query(
        "INSERT INTO news (title, link, posted_at, source, city, published) VALUES (?, ?, ?, ?, ?, 0)",
        [news.title, news.link, news.postedAt, news.source, news.city],
      );
    } catch (error) {
      if (isDuplicateKey(error)) {
        return;
      }
      throw error;
    }
  }

  async findByNewsLink(link: string): Promise<News | null> {
    const [rows] = await this.pool.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM news WHERE link = ?",
      [link],
    );
    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return new News(
      String(row.id),
      row.title,
      row.link,
      row.posted_at,
      row.source ?? "",
      row.city ?? "",
      Number(row.published) === 1,
    );
  }

  async markPublished(link: string): Promise<void> {
    await this.pool.query("UPDATE news SET published = 1 WHERE link = ?", [link]);
  }
}
