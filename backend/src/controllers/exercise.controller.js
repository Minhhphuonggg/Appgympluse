const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const exerciseService = require("../services/exercise.service");

const listExercises = asyncHandler(async (req, res) => {
  const data = await exerciseService.getExercises(req.query);
  return sendSuccess(res, { message: "Exercises fetched", data });
});

const getExerciseDetail = asyncHandler(async (req, res) => {
  const data = await exerciseService.getExerciseDetail(Number(req.params.exerciseId));
  return sendSuccess(res, { message: "Exercise fetched", data });
});

const createExercise = asyncHandler(async (req, res) => {
  const data = await exerciseService.createExerciseItem(req.body, req.user.id);
  return sendSuccess(res, {
    statusCode: 201,
    message: "Exercise created",
    data,
  });
});

const updateExercise = asyncHandler(async (req, res) => {
  const data = await exerciseService.updateExerciseItem(Number(req.params.exerciseId), req.body);
  return sendSuccess(res, { message: "Exercise updated", data });
});

const deleteExercise = asyncHandler(async (req, res) => {
  await exerciseService.removeExerciseItem(Number(req.params.exerciseId));
  return sendSuccess(res, { message: "Exercise deleted" });
});

module.exports = {
  listExercises,
  getExerciseDetail,
  createExercise,
  updateExercise,
  deleteExercise,
};
