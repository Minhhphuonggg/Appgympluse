const { body, param, query } = require("express-validator");

const updateMeValidation = [
  body("name").optional().trim().isLength({ min: 2, max: 255 }),
  body("phone").optional().trim().isLength({ max: 20 }),
  body("avatar").optional({ values: "falsy" }).trim().isURL().withMessage("avatar must be a valid URL"),
];

const listUsersValidation = [
  query("role").optional().isIn(["admin", "staff", "user"]),
  query("status").optional().isIn(["active", "banned"]),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];

const userIdParamValidation = [
  param("userId").isInt({ min: 1 }).withMessage("userId must be a positive integer"),
];

const createUserValidation = [
  body("name").trim().notEmpty().withMessage("name is required").isLength({ min: 2, max: 255 }),
  body("email").trim().notEmpty().withMessage("email is required").isEmail().withMessage("invalid email"),
  body("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 chars"),
  body("phone").optional({ values: "falsy" }).trim().isLength({ max: 20 }),
  body("avatar").optional({ values: "falsy" }).trim().isURL().withMessage("avatar must be a valid URL"),
  body("role").optional().isIn(["admin", "staff", "user"]),
  body("status").optional().isIn(["active", "banned"]),
];

const updateUserValidation = [
  ...userIdParamValidation,
  body("name").optional().trim().isLength({ min: 2, max: 255 }),
  body("email").optional().trim().isEmail().withMessage("invalid email"),
  body("password").optional().isLength({ min: 6 }).withMessage("password must be at least 6 chars"),
  body("phone").optional({ values: "falsy" }).trim().isLength({ max: 20 }),
  body("avatar").optional({ values: "falsy" }).trim().isURL().withMessage("avatar must be a valid URL"),
  body("role").optional().isIn(["admin", "staff", "user"]),
  body("status").optional().isIn(["active", "banned"]),
];

const updateUserStatusValidation = [
  ...userIdParamValidation,
  body("status").isIn(["active", "banned"]),
];

const updateUserRoleValidation = [
  ...userIdParamValidation,
  body("role").isIn(["admin", "staff", "user"]),
];

const assignMembershipValidation = [
  ...userIdParamValidation,
  body("planId").isInt({ min: 1 }).withMessage("planId must be a positive integer"),
  body("price").optional().isFloat({ gt: 0 }).withMessage("price must be greater than 0"),
];

module.exports = {
  updateMeValidation,
  listUsersValidation,
  userIdParamValidation,
  createUserValidation,
  updateUserValidation,
  assignMembershipValidation,
  updateUserStatusValidation,
  updateUserRoleValidation,
};
