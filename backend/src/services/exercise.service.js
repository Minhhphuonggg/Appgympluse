const ApiError = require("../utils/apiError");
const {
  createExercise,
  findExerciseById,
  listExercises,
  updateExerciseById,
  deleteExerciseById,
} = require("../models/exercise.model");

async function getExercises(query) {
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 ? Math.min(Number(query.limit), 100) : 20;
  const offset = (page - 1) * limit;

  const result = await listExercises({
    keyword: query.keyword,
    muscleGroup: query.muscle_group,
    difficulty: query.difficulty,
    limit,
    offset,
  });

  return {
    items: result.rows,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit) || 1,
    },
  };
}

async function getExerciseDetail(exerciseId) {
  const exercise = await findExerciseById(exerciseId);
  if (!exercise) {
    throw new ApiError(404, "Exercise not found");
  }

  return exercise;
}

async function createExerciseItem(payload, actorId) {
  return createExercise({
    ...payload,
    createdBy: actorId,
  });
}

async function updateExerciseItem(exerciseId, payload) {
  const existing = await findExerciseById(exerciseId);
  if (!existing) {
    throw new ApiError(404, "Exercise not found");
  }

  return updateExerciseById(exerciseId, payload);
}

async function removeExerciseItem(exerciseId) {
  const existing = await findExerciseById(exerciseId);
  if (!existing) {
    throw new ApiError(404, "Exercise not found");
  }

  await deleteExerciseById(exerciseId);
}

module.exports = {
  getExercises,
  getExerciseDetail,
  createExerciseItem,
  updateExerciseItem,
  removeExerciseItem,
};
