import "dotenv/config";
import mysql from "mysql2/promise";

async function seed() {
  if (process.env.CONFIRM_DROP !== "true") {
    console.error("Seed apaga a tabela news. Rode com CONFIRM_DROP=true se for isso mesmo.");
    process.exit(1);
  }

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "127.0.0.1",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "root",
    database: process.env.MYSQL_DATABASE || "news",
  });

  await connection.execute("DROP TABLE IF EXISTS news");
  await connection.execute(`
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

  await connection.end();
}

seed()
  .then(() => console.log("Database seeded!"))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
