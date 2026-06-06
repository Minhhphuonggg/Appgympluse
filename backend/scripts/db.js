const mysql = require("mysql2/promise");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function createConnection() {
  return mysql.createConnection({
    host: required("DB_HOST"),
    port: Number(required("DB_PORT")),
    user: required("DB_USER"),
    password: required("DB_PASSWORD"),
    database: required("DB_NAME"),
    multipleStatements: true,
  });
}

module.exports = {
  createConnection,
};
