const { body, param, query } = require("express-validator");

const conditionOptions = ["good", "maintenance", "broken"];

const listEquipmentsValidation = [
  query("condition").optional().isIn(conditionOptions),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];

const equipmentIdParamValidation = [
  param("equipmentId").isInt({ min: 1 }).withMessage("equipmentId must be a positive integer"),
];

const createEquipmentValidation = [
  body("name").trim().notEmpty().withMessage("name is required").isLength({ min: 2, max: 255 }),
  body("brand").optional({ values: "falsy" }).trim().isLength({ max: 255 }),
  body("quantity").isInt({ min: 0 }).withMessage("quantity must be >= 0"),
  body("size").optional({ values: "falsy" }).trim().isLength({ max: 100 }),
  body("weightKg").optional({ values: "falsy" }).isFloat({ gt: 0 }).withMessage("weightKg must be > 0"),
  body("imageUrl").optional({ values: "falsy" }).trim().isURL().withMessage("imageUrl must be a valid URL"),
  body("conditionStatus").optional().isIn(conditionOptions).withMessage("conditionStatus is invalid"),
];

const updateEquipmentValidation = [
  ...equipmentIdParamValidation,
  body("name").optional().trim().isLength({ min: 2, max: 255 }),
  body("brand").optional({ values: "falsy" }).trim().isLength({ max: 255 }),
  body("quantity").optional().isInt({ min: 0 }).withMessage("quantity must be >= 0"),
  body("size").optional({ values: "falsy" }).trim().isLength({ max: 100 }),
  body("weightKg").optional({ values: "falsy" }).isFloat({ gt: 0 }).withMessage("weightKg must be > 0"),
  body("imageUrl").optional({ values: "falsy" }).trim().isURL().withMessage("imageUrl must be a valid URL"),
  body("conditionStatus").optional().isIn(conditionOptions).withMessage("conditionStatus is invalid"),
];

module.exports = {
  conditionOptions,
  listEquipmentsValidation,
  equipmentIdParamValidation,
  createEquipmentValidation,
  updateEquipmentValidation,
};
