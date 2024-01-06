import mysql from 'mysql2/promise';

async function seed() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'news'
  });

  await connection.execute('DROP TABLE IF EXISTS news');
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS news (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      link VARCHAR(255) NOT NULL,
      posted_at VARCHAR(255) NOT NULL
    )
  `);

  connection.end();
}

seed().then(() => console.log('Database seeded!')).catch(console.error);