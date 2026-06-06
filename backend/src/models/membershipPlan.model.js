const { query, execute } = require("./base.model");

async function createPlan(payload) {
  const result = await execute(
    `INSERT INTO membership_plans (name, description, image_url, price, duration_days, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.name,
      payload.description || null,
      payload.imageUrl || null,
      payload.price,
      payload.durationDays,
      payload.status || "active",
      payload.createdBy,
    ]
  );

  return findPlanById(result.insertId);
}

async function findPlanById(id) {
  const rows = await query(
    `SELECT mp.*, u.name AS created_by_name
     FROM membership_plans mp
     LEFT JOIN users u ON u.id = mp.created_by
     WHERE mp.id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

async function listPlans({ status, limit, offset }) {
  const where = [];
  const params = [];

  if (status) {
    where.push("mp.status = ?");
    params.push(status);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

  const totalRows = await query(`SELECT COUNT(*) AS total FROM membership_plans mp ${whereSql}`, params);
  const total = totalRows[0].total;

  const rows = await query(
    `SELECT mp.*, u.name AS created_by_name
     FROM membership_plans mp
     LEFT JOIN users u ON u.id = mp.created_by
     ${whereSql}
     ORDER BY mp.id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { total, rows };
}

async function updatePlanById(id, payload) {
  const map = {
    name: "name",
    description: "description",
    imageUrl: "image_url",
    price: "price",
    durationDays: "duration_days",
    status: "status",
  };

  const updates = [];
  const params = [];

  Object.keys(map).forEach((key) => {
    if (payload[key] !== undefined) {
      updates.push(`${map[key]} = ?`);
      params.push(payload[key]);
    }
  });

  if (updates.length > 0) {
    params.push(id);
    await execute(`UPDATE membership_plans SET ${updates.join(", ")} WHERE id = ?`, params);
  }

  return findPlanById(id);
}

async function deletePlanById(id) {
  await execute("DELETE FROM membership_plans WHERE id = ?", [id]);
}

module.exports = {
  createPlan,
  findPlanById,
  listPlans,
  updatePlanById,
  deletePlanById,
};
