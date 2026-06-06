const { body, param, query } = require("express-validator");

const listCheckinsValidation = [
  query("user_id").optional().isInt({ min: 1 }),
  query("status").optional().isIn(["checked_in", "checked_out"]),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];

const myCheckinHistoryValidation = [
  query("status").optional().isIn(["checked_in", "checked_out"]),
  query("from_date").optional().isISO8601({ strict: true }).withMessage("from_date must be YYYY-MM-DD"),
  query("to_date").optional().isISO8601({ strict: true }).withMessage("to_date must be YYYY-MM-DD"),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];

const checkInValidation = [
  body("userId").isInt({ min: 1 }).withMessage("userId is required"),
  body("note").optional().trim(),
];

const checkOutValidation = [
  param("checkinId").isInt({ min: 1 }).withMessage("checkinId must be a positive integer"),
  body("note").optional().trim(),
];

module.exports = {
  listCheckinsValidation,
  myCheckinHistoryValidation,
  checkInValidation,
  checkOutValidation,
};
