const { query, execute } = require("./base.model");

async function createUserMembership(payload) {
  const result = await execute(
    `INSERT INTO user_memberships (user_id, plan_id, start_date, end_date, price, qr_code, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [payload.userId, payload.planId, payload.startDate, payload.endDate, payload.price, payload.qrCode || null, payload.status || "active"]
  );

  return findUserMembershipById(result.insertId);
}

async function findUserMembershipById(id) {
  const rows = await query(
    `SELECT um.*, mp.name AS plan_name, u.name AS user_name
     FROM user_memberships um
     JOIN membership_plans mp ON mp.id = um.plan_id
     JOIN users u ON u.id = um.user_id
     WHERE um.id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

async function listUserMemberships(userId) {
  return query(
    `SELECT um.*, mp.name AS plan_name, mp.duration_days
     FROM user_memberships um
     JOIN membership_plans mp ON mp.id = um.plan_id
     WHERE um.user_id = ?
     ORDER BY um.id DESC`,
    [userId]
  );
}

async function findActiveMembershipByUserId(userId) {
  const rows = await query(
    `SELECT um.*, mp.name AS plan_name
     FROM user_memberships um
     JOIN membership_plans mp ON mp.id = um.plan_id
     WHERE um.user_id = ?
       AND um.status = 'active'
       AND um.end_date >= NOW()
     ORDER BY um.end_date DESC
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

async function deactivateActiveMembershipsByUserId(userId, nextStatus = "cancelled") {
  await execute(
    `UPDATE user_memberships
     SET status = ?
     WHERE user_id = ?
       AND status = 'active'
       AND end_date >= NOW()`,
    [nextStatus, userId]
  );
}

module.exports = {
  createUserMembership,
  findUserMembershipById,
  listUserMemberships,
  findActiveMembershipByUserId,
  deactivateActiveMembershipsByUserId,
};
