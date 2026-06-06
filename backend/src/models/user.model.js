const { query, execute } = require("./base.model");

function sanitizeUserRow(row) {
  if (!row) return null;
  const { password, ...safeUser } = row;
  return safeUser;
}

async function createUser(payload) {
  const result = await execute(
    `INSERT INTO users (name, email, password, role, phone, avatar, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [payload.name, payload.email, payload.password, payload.role || "user", payload.phone || null, payload.avatar || null, payload.status || "active"]
  );

  return findUserById(result.insertId);
}

async function findUserByEmail(email) {
  const rows = await query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
  return rows[0] || null;
}

async function findUserById(id) {
  const rows = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
  return rows[0] || null;
}

async function listUsers({ role, status, keyword, limit, offset }) {
  const where = [];
  const params = [];

  if (role) {
    where.push("u.role = ?");
    params.push(role);
  }

  if (status) {
    where.push("u.status = ?");
    params.push(status);
  }

  if (keyword) {
    where.push("(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)");
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  const countRows = await query(`SELECT COUNT(*) AS total FROM users u ${whereSql}`, params);
  const total = countRows[0].total;

  const dataRows = await query(
    `SELECT
       u.id,
       u.name,
       u.email,
       u.role,
       u.phone,
       u.avatar,
       u.status,
       u.created_at,
       u.updated_at,
       um.id AS active_membership_id,
       um.status AS active_membership_status,
       um.start_date AS active_membership_start_date,
       um.end_date AS active_membership_end_date,
       um.price AS active_membership_price,
       mp.id AS active_membership_plan_id,
       mp.name AS active_membership_plan_name
     FROM users u
     LEFT JOIN user_memberships um ON um.id = (
       SELECT um2.id
       FROM user_memberships um2
       WHERE um2.user_id = u.id
         AND um2.status = 'active'
         AND um2.end_date >= NOW()
       ORDER BY um2.end_date DESC, um2.id DESC
       LIMIT 1
     )
     LEFT JOIN membership_plans mp ON mp.id = um.plan_id
     ${whereSql}
     ORDER BY u.id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { total, rows: dataRows };
}

async function updateUserById(id, payload) {
  const allowedFields = ["name", "email", "password", "phone", "avatar", "status", "role"];
  const updates = [];
  const params = [];

  allowedFields.forEach((field) => {
    if (payload[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(payload[field]);
    }
  });

  if (updates.length === 0) {
    return findUserById(id);
  }

  params.push(id);

  await execute(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, params);
  return findUserById(id);
}

async function deleteUserById(id) {
  await execute("DELETE FROM users WHERE id = ?", [id]);
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  listUsers,
  updateUserById,
  deleteUserById,
  sanitizeUserRow,
};
