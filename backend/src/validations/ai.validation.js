const { body } = require("express-validator");

const aiChatValidation = [
  body("message")
    .trim()
    .notEmpty()
    .withMessage("message is required")
    .isLength({ min: 2, max: 2000 })
    .withMessage("message length must be from 2 to 2000 chars"),
];

module.exports = {
  aiChatValidation,
};
