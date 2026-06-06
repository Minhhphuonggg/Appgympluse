const { query, execute } = require("./base.model");

async function createEquipment(payload) {
  const result = await execute(
    `INSERT INTO equipments (name, brand, quantity, size, weight_kg, image_url, condition_status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.name,
      payload.brand || null,
      payload.quantity,
      payload.size || null,
      payload.weightKg || null,
      payload.imageUrl || null,
      payload.conditionStatus || "good",
      payload.createdBy || null,
    ]
  );

  return findEquipmentById(result.insertId);
}

async function findEquipmentById(id) {
  const rows = await query(
    `SELECT e.*, u.name AS created_by_name
     FROM equipments e
     LEFT JOIN users u ON u.id = e.created_by
     WHERE e.id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

async function listEquipments({ keyword, condition, limit, offset }) {
  const where = [];
  const params = [];

  if (keyword) {
    where.push("(e.name LIKE ? OR e.brand LIKE ? OR e.size LIKE ?)");
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  }

  if (condition) {
    where.push("e.condition_status = ?");
    params.push(condition);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  const totalRows = await query(`SELECT COUNT(*) AS total FROM equipments e ${whereSql}`, params);
  const total = totalRows[0].total;

  const rows = await query(
    `SELECT e.*, u.name AS created_by_name
     FROM equipments e
     LEFT JOIN users u ON u.id = e.created_by
     ${whereSql}
     ORDER BY e.id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { total, rows };
}

async function updateEquipmentById(id, payload) {
  const map = {
    name: "name",
    brand: "brand",
    quantity: "quantity",
    size: "size",
    weightKg: "weight_kg",
    imageUrl: "image_url",
    conditionStatus: "condition_status",
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
    await execute(`UPDATE equipments SET ${updates.join(", ")} WHERE id = ?`, params);
  }

  return findEquipmentById(id);
}

async function deleteEquipmentById(id) {
  await execute("DELETE FROM equipments WHERE id = ?", [id]);
}

module.exports = {
  createEquipment,
  findEquipmentById,
  listEquipments,
  updateEquipmentById,
  deleteEquipmentById,
};
