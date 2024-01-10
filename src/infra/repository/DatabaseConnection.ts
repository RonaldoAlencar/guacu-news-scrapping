import mysql from 'mysql2/promise';

export default class DatabaseConnection {
  private connection: mysql.Connection | undefined;

  constructor(private host: string, private user: string, private password: string | undefined, private database: string, readonly logger: any) {
    this.init();
  }

  async init() {
    this.connection = await mysql.createConnection({
      host: this.host,
      user: this.user,
      password: this.password,
      database: this.database
    });
  }

  async getConnection(): Promise<mysql.Connection> {
    if (!this.connection) { await this.init(); }
    this.logger.logInfo("Connected to Database");
    return this.connection!;
  }
}
