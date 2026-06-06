const express = require("express");
const membershipController = require("../controllers/membership.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { allowRoles } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { createPaymentUrlValidation } = require("../validations/membership.validation");

const router = express.Router();

router.get("/me", authenticate, allowRoles("user"), membershipController.getMyMemberships);

router.post(
  "/purchase/:planId",
  authenticate,
  allowRoles("user"),
  createPaymentUrlValidation,
  validate,
  membershipController.createPaymentUrl
);

module.exports = router;
