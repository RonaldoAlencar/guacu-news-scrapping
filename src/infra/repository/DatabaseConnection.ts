import mysql from "mysql2/promise";
import LoggerAdapter from "../../domain/adapters/LoggerAdapter";
import { formatPostedAt } from "../../utils/formatDate";
import { AppConfig } from "../config/env";

export default class DatabaseConnection {
  private pool: mysql.Pool | undefined;

  constructor(
    private readonly config: AppConfig["mysql"],
    private readonly logger: LoggerAdapter,
  ) {}

  async getPool(): Promise<mysql.Pool> {
    if (!this.pool) {
      await this.ensureDatabase();
      this.pool = mysql.createPool({
        host: this.config.host,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        waitForConnections: true,
        connectionLimit: 10,
        enableKeepAlive: true,
      });
      await this.ensureSchema(this.pool);
      const connection = await this.pool.getConnection();
      connection.release();
      this.logger.logInfo("Connected to Database");
    }
    return this.pool;
  }

  private async ensureDatabase(): Promise<void> {
    const connection = await mysql.createConnection({
      host: this.config.host,
      user: this.config.user,
      password: this.config.password,
    });
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${this.config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    await connection.end();
  }

  private async ensureSchema(pool: mysql.Pool): Promise<void> {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS news (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(512) NOT NULL,
        link VARCHAR(512) NOT NULL,
        posted_at VARCHAR(255) NOT NULL,
        source VARCHAR(128) NOT NULL DEFAULT '',
        city VARCHAR(128) NOT NULL DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        published TINYINT(1) NOT NULL DEFAULT 0,
        UNIQUE KEY uq_news_link (link)
      )
    `);

    await this.addColumnIfMissing(pool, "source", "VARCHAR(128) NOT NULL DEFAULT ''");
    await this.addColumnIfMissing(pool, "city", "VARCHAR(128) NOT NULL DEFAULT ''");
    await this.addColumnIfMissing(pool, "published", "TINYINT(1) NOT NULL DEFAULT 1");
    await this.ensureUniqueLink(pool);
    await this.normalizePostedAt(pool);
  }

  private async ensureUniqueLink(pool: mysql.Pool): Promise<void> {
    const [rows] = await pool.query<mysql.RowDataPacket[]>(
      `SELECT INDEX_NAME, NON_UNIQUE
       FROM information_schema.STATISTICS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'news' AND COLUMN_NAME = 'link'`,
      [this.config.database],
    );
    if (rows.some((row) => Number(row.NON_UNIQUE) === 0)) {
      return;
    }
    try {
      await pool.query("ALTER TABLE news ADD UNIQUE KEY uq_news_link (link)");
    } catch (error) {
      this.logger.logError(
        `Could not add unique key on news.link: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async normalizePostedAt(pool: mysql.Pool): Promise<void> {
    const [rows] = await pool.query<mysql.RowDataPacket[]>("SELECT id, posted_at FROM news");
    let updated = 0;
    for (const row of rows) {
      const current = String(row.posted_at ?? "");
      const next = formatPostedAt(current);
      if (next === current) {
        continue;
      }
      await pool.query("UPDATE news SET posted_at = ? WHERE id = ?", [next, row.id]);
      updated += 1;
    }
    if (updated > 0) {
      this.logger.logInfo(`Normalized posted_at on ${updated} news rows`);
    }
  }

  private async addColumnIfMissing(pool: mysql.Pool, column: string, definition: string): Promise<void> {
    const [rows] = await pool.query<mysql.RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'news' AND COLUMN_NAME = ?`,
      [this.config.database, column],
    );
    if (Number(rows[0]?.total ?? 0) === 0) {
      await pool.query(`ALTER TABLE news ADD COLUMN ${column} ${definition}`);
    }
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = undefined;
    }
  }
}
