const express = require("express");
const membershipPlanController = require("../controllers/membershipPlan.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { optionalAuthenticate } = require("../middlewares/optionalAuth.middleware");
const { allowRoles } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
  listPlansValidation,
  planIdParamValidation,
  createPlanValidation,
  updatePlanValidation,
} = require("../validations/membershipPlan.validation");

const router = express.Router();

router.get("/", optionalAuthenticate, listPlansValidation, validate, membershipPlanController.listPlans);
router.get("/:planId", planIdParamValidation, validate, membershipPlanController.getPlanDetail);

router.post(
  "/",
  authenticate,
  allowRoles("admin", "staff"),
  createPlanValidation,
  validate,
  membershipPlanController.createPlan
);

router.patch(
  "/:planId",
  authenticate,
  allowRoles("admin", "staff"),
  updatePlanValidation,
  validate,
  membershipPlanController.updatePlan
);

router.delete(
  "/:planId",
  authenticate,
  allowRoles("admin", "staff"),
  planIdParamValidation,
  validate,
  membershipPlanController.deletePlan
);

module.exports = router;
