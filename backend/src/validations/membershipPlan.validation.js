const { body, param, query } = require("express-validator");

const listPlansValidation = [
  query("status").optional().isIn(["active", "inactive"]),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];

const planIdParamValidation = [
  param("planId").isInt({ min: 1 }).withMessage("planId must be a positive integer"),
];

const createPlanValidation = [
  body("name").trim().notEmpty().withMessage("name is required").isLength({ min: 2, max: 255 }),
  body("description").optional().trim(),
  body("imageUrl").optional({ values: "falsy" }).trim().isURL().withMessage("imageUrl must be a valid URL"),
  body("price").isFloat({ gt: 0 }).withMessage("price must be > 0"),
  body("durationDays").isInt({ min: 1 }).withMessage("durationDays must be >= 1"),
  body("status").optional().isIn(["active", "inactive"]),
];

const updatePlanValidation = [
  ...planIdParamValidation,
  body("name").optional().trim().isLength({ min: 2, max: 255 }),
  body("description").optional().trim(),
  body("imageUrl").optional({ values: "falsy" }).trim().isURL().withMessage("imageUrl must be a valid URL"),
  body("price").optional().isFloat({ gt: 0 }),
  body("durationDays").optional().isInt({ min: 1 }),
  body("status").optional().isIn(["active", "inactive"]),
];

module.exports = {
  listPlansValidation,
  planIdParamValidation,
  createPlanValidation,
  updatePlanValidation,
};
