const { query, execute } = require("./base.model");

async function createCheckin(payload) {
  const result = await execute(
    `INSERT INTO checkins (user_id, membership_id, checkin_time, checkin_by, status, note)
     VALUES (?, ?, ?, ?, 'checked_in', ?)`,
    [payload.userId, payload.membershipId, payload.checkinTime, payload.checkinBy, payload.note || null]
  );

  return findCheckinById(result.insertId);
}

async function findCheckinById(id) {
  const rows = await query(
    `SELECT c.*, u.name AS user_name, cb.name AS checkin_by_name, cob.name AS checkout_by_name
     FROM checkins c
     JOIN users u ON u.id = c.user_id
     LEFT JOIN users cb ON cb.id = c.checkin_by
     LEFT JOIN users cob ON cob.id = c.checkout_by
     WHERE c.id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

async function findOpenCheckinByUserId(userId) {
  const rows = await query(
    `SELECT *
     FROM checkins
     WHERE user_id = ?
       AND status = 'checked_in'
     ORDER BY id DESC
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

async function checkoutCheckin(payload) {
  await execute(
    `UPDATE checkins
     SET checkout_time = ?, checkout_by = ?, status = 'checked_out', note = COALESCE(?, note)
     WHERE id = ?`,
    [payload.checkoutTime, payload.checkoutBy, payload.note || null, payload.checkinId]
  );

  return findCheckinById(payload.checkinId);
}

async function listCheckins({ userId, status, limit, offset }) {
  const where = [];
  const params = [];

  if (userId) {
    where.push("c.user_id = ?");
    params.push(userId);
  }

  if (status) {
    where.push("c.status = ?");
    params.push(status);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const totalRows = await query(`SELECT COUNT(*) AS total FROM checkins c ${whereSql}`, params);
  const total = totalRows[0].total;

  const rows = await query(
    `SELECT c.*, u.name AS user_name, cb.name AS checkin_by_name, cob.name AS checkout_by_name
     FROM checkins c
     JOIN users u ON u.id = c.user_id
     LEFT JOIN users cb ON cb.id = c.checkin_by
     LEFT JOIN users cob ON cob.id = c.checkout_by
     ${whereSql}
     ORDER BY c.id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { total, rows };
}

async function listCheckinHistoryByUserId({ userId, status, fromDate, toDate, limit, offset }) {
  const where = ["c.user_id = ?"];
  const params = [userId];

  if (status) {
    where.push("c.status = ?");
    params.push(status);
  }

  if (fromDate) {
    where.push("DATE(c.checkin_time) >= ?");
    params.push(fromDate);
  }

  if (toDate) {
    where.push("DATE(c.checkin_time) <= ?");
    params.push(toDate);
  }

  const whereSql = `WHERE ${where.join(" AND ")}`;

  const totalRows = await query(`SELECT COUNT(*) AS total FROM checkins c ${whereSql}`, params);
  const total = totalRows[0].total;

  const rows = await query(
    `SELECT
       c.id,
       c.user_id,
       c.membership_id,
       c.checkin_time,
       c.checkout_time,
       c.status,
       c.note,
       DATE_FORMAT(c.checkin_time, '%Y-%m-%d') AS training_date,
       TIME_FORMAT(c.checkin_time, '%H:%i') AS checkin_at,
       TIME_FORMAT(c.checkout_time, '%H:%i') AS checkout_at,
       CONCAT(
         TIME_FORMAT(c.checkin_time, '%H:%i'),
         ' - ',
         IFNULL(TIME_FORMAT(c.checkout_time, '%H:%i'), '--:--')
       ) AS time_range,
       TIMESTAMPDIFF(MINUTE, c.checkin_time, COALESCE(c.checkout_time, NOW())) AS duration_minutes
     FROM checkins c
     ${whereSql}
     ORDER BY c.checkin_time DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { total, rows };
}

module.exports = {
  createCheckin,
  findCheckinById,
  findOpenCheckinByUserId,
  checkoutCheckin,
  listCheckins,
  listCheckinHistoryByUserId,
};
