import mysql from 'mysql2/promise';
import NewsRepository from "../../domain/repository/NewsRepository";
import News from '../../domain/entities/News';

export default class NewsRepositoryDatabase implements NewsRepository {
  private connection: mysql.Connection;

  constructor(connection: mysql.Connection) {
    this.connection = connection;
  }

  async save(News: News): Promise<void> {
    this.connection.query("INSERT INTO news (title, link, posted_at) VALUES (?, ?, ?)", [News.title, News.link, News.postedAt]);
  }

  async findByNewsLink(link: string): Promise<News | null> {
    const [rows] = await this.connection.execute<mysql.RowDataPacket[]>("SELECT * FROM news WHERE link = ?", [link]);
    if (rows.length === 0) { return null; }

    const row = rows[0];
    return new News(row.id, row.title, row.link, row.posted_at);
  }
}
