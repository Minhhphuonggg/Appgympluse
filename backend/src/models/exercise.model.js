const { query, execute } = require("./base.model");

async function createExercise(payload) {
  const result = await execute(
    `INSERT INTO exercises (name, description, muscle_group, difficulty, equipment, video_url, thumbnail, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.name,
      payload.description || null,
      payload.muscleGroup || null,
      payload.difficulty,
      payload.equipment || null,
      payload.videoUrl || null,
      payload.thumbnail || null,
      payload.createdBy,
    ]
  );

  return findExerciseById(result.insertId);
}

async function findExerciseById(id) {
  const rows = await query(
    `SELECT e.*, u.name AS created_by_name
     FROM exercises e
     LEFT JOIN users u ON u.id = e.created_by
     WHERE e.id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

async function listExercises({ keyword, muscleGroup, difficulty, limit, offset }) {
  const where = [];
  const params = [];

  if (keyword) {
    where.push("(e.name LIKE ? OR e.description LIKE ?)");
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  if (muscleGroup) {
    where.push("e.muscle_group = ?");
    params.push(muscleGroup);
  }

  if (difficulty) {
    where.push("e.difficulty = ?");
    params.push(difficulty);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  const totalRows = await query(`SELECT COUNT(*) AS total FROM exercises e ${whereSql}`, params);
  const total = totalRows[0].total;

  const rows = await query(
    `SELECT e.*, u.name AS created_by_name
     FROM exercises e
     LEFT JOIN users u ON u.id = e.created_by
     ${whereSql}
     ORDER BY e.id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { total, rows };
}

async function updateExerciseById(id, payload) {
  const map = {
    name: "name",
    description: "description",
    muscleGroup: "muscle_group",
    difficulty: "difficulty",
    equipment: "equipment",
    videoUrl: "video_url",
    thumbnail: "thumbnail",
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
    await execute(`UPDATE exercises SET ${updates.join(", ")} WHERE id = ?`, params);
  }

  return findExerciseById(id);
}

async function deleteExerciseById(id) {
  await execute("DELETE FROM exercises WHERE id = ?", [id]);
}

module.exports = {
  createExercise,
  findExerciseById,
  listExercises,
  updateExerciseById,
  deleteExerciseById,
};
