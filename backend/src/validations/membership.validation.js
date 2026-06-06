const { param } = require("express-validator");

const createPaymentUrlValidation = [
  param("planId").isInt({ min: 1 }).withMessage("planId must be a positive integer"),
];

module.exports = {
  createPaymentUrlValidation,
};
