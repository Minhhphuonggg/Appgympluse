const { body } = require("express-validator");

const registerValidation = [
  body("name").trim().notEmpty().withMessage("name is required").isLength({ min: 2, max: 255 }),
  body("email").trim().notEmpty().withMessage("email is required").isEmail().withMessage("invalid email"),
  body("password").notEmpty().withMessage("password is required").isLength({ min: 6 }).withMessage("password must be at least 6 chars"),
  body("phone").optional().trim().isLength({ max: 20 }),
];

const loginValidation = [
  body("email").trim().notEmpty().withMessage("email is required").isEmail().withMessage("invalid email"),
  body("password").notEmpty().withMessage("password is required"),
];

module.exports = {
  registerValidation,
  loginValidation,
};
