function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function toSqlDateTime(date) {
  return new Date(date).toISOString().slice(0, 19).replace("T", " ");
}

module.exports = {
  addDays,
  toSqlDateTime,
};
