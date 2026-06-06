const { body, param, query } = require("express-validator");

const listExercisesValidation = [
  query("difficulty").optional().isIn(["easy", "medium", "hard"]),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];

const exerciseIdParamValidation = [
  param("exerciseId").isInt({ min: 1 }).withMessage("exerciseId must be a positive integer"),
];

const createExerciseValidation = [
  body("name").trim().notEmpty().withMessage("name is required").isLength({ min: 2, max: 255 }),
  body("description").optional().trim(),
  body("muscleGroup").optional().trim().isLength({ max: 100 }),
  body("difficulty").isIn(["easy", "medium", "hard"]),
  body("equipment").optional().trim().isLength({ max: 100 }),
  body("videoUrl").optional().trim().isURL().withMessage("videoUrl must be a valid URL"),
  body("thumbnail").optional().trim().isURL().withMessage("thumbnail must be a valid URL"),
];

const updateExerciseValidation = [
  ...exerciseIdParamValidation,
  body("name").optional().trim().isLength({ min: 2, max: 255 }),
  body("description").optional().trim(),
  body("muscleGroup").optional().trim().isLength({ max: 100 }),
  body("difficulty").optional().isIn(["easy", "medium", "hard"]),
  body("equipment").optional().trim().isLength({ max: 100 }),
  body("videoUrl").optional().trim().isURL(),
  body("thumbnail").optional().trim().isURL(),
];

module.exports = {
  listExercisesValidation,
  exerciseIdParamValidation,
  createExerciseValidation,
  updateExerciseValidation,
};
