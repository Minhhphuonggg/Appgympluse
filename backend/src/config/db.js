const mysql = require("mysql2/promise");
const env = require("./env");

const dbPool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: env.db.connectionLimit,
  queueLimit: 0,
  namedPlaceholders: true,
});

async function connectDatabase() {
  const connection = await dbPool.getConnection();
  try {
    await connection.query("SELECT 1");
  } finally {
    connection.release();
  }
}

module.exports = {
  dbPool,
  connectDatabase,
};
