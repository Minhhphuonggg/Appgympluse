const fs = require("fs");
const path = require("path");
const { createConnection } = require("./db");

async function run() {
  const connection = await createConnection();
  const migrationsDir = path.resolve(process.cwd(), "migrations");

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        file_name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const fileName of files) {
      const [rows] = await connection.query("SELECT id FROM schema_migrations WHERE file_name = ? LIMIT 1", [fileName]);

      if (rows.length > 0) {
        console.log(`Skip migration: ${fileName}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, fileName), "utf8");
      await connection.query(sql);
      await connection.query("INSERT INTO schema_migrations (file_name) VALUES (?)", [fileName]);

      console.log(`Applied migration: ${fileName}`);
    }

    console.log("Migration finished");
  } finally {
    await connection.end();
  }
}

run().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exit(1);
});
