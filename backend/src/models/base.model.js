const { dbPool } = require("../config/db");

async function query(sql, params = []) {
  const [rows] = await dbPool.query(sql, params);
  return rows;
}

async function execute(sql, params = []) {
  const [result] = await dbPool.execute(sql, params);
  return result;
}

module.exports = {
  query,
  execute,
  dbPool,
};
