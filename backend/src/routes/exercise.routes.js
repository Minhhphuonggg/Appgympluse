const express = require("express");
const exerciseController = require("../controllers/exercise.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { allowRoles } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
  listExercisesValidation,
  exerciseIdParamValidation,
  createExerciseValidation,
  updateExerciseValidation,
} = require("../validations/exercise.validation");

const router = express.Router();

router.get("/", listExercisesValidation, validate, exerciseController.listExercises);
router.get("/:exerciseId", exerciseIdParamValidation, validate, exerciseController.getExerciseDetail);

router.post(
  "/",
  authenticate,
  allowRoles("admin", "staff"),
  createExerciseValidation,
  validate,
  exerciseController.createExercise
);

router.patch(
  "/:exerciseId",
  authenticate,
  allowRoles("admin", "staff"),
  updateExerciseValidation,
  validate,
  exerciseController.updateExercise
);

router.delete(
  "/:exerciseId",
  authenticate,
  allowRoles("admin", "staff"),
  exerciseIdParamValidation,
  validate,
  exerciseController.deleteExercise
);

module.exports = router;
