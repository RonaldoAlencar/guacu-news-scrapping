import mysql from "mysql2/promise";
import LoggerAdapter from "../../domain/adapters/LoggerAdapter";
import DatabaseConnection from "../repository/DatabaseConnection";

const LOCK_NAME = "guacu-news-scrape";

export default class ScrapeLock {
  private running = false;

  constructor(
    private readonly database: DatabaseConnection,
    private readonly logger: LoggerAdapter,
    private readonly dryRun: boolean,
  ) {}

  async run(task: () => Promise<void>): Promise<void> {
    if (this.running) {
      this.logger.logWarning("Scrape skipped: already running in this process");
      return;
    }

    this.running = true;
    let connection: mysql.PoolConnection | undefined;

    try {
      if (!this.dryRun) {
        const pool = await this.database.getPool();
        connection = await pool.getConnection();
        const [rows] = await connection.query<mysql.RowDataPacket[]>(
          "SELECT GET_LOCK(?, 0) AS taken",
          [LOCK_NAME],
        );
        if (Number(rows[0]?.taken) !== 1) {
          this.logger.logWarning("Scrape skipped: another instance holds the lock");
          return;
        }
      }

      await task();
    } finally {
      if (connection) {
        try {
          await connection.query("SELECT RELEASE_LOCK(?)", [LOCK_NAME]);
        } catch (error) {
          this.logger.logError(
            `Could not release scrape lock: ${error instanceof Error ? error.message : String(error)}`,
          );
        } finally {
          connection.release();
        }
      }
      this.running = false;
    }
  }
}
