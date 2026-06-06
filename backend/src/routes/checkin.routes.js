const express = require("express");
const checkinController = require("../controllers/checkin.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { allowRoles } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
  listCheckinsValidation,
  myCheckinHistoryValidation,
  checkInValidation,
  checkOutValidation,
} = require("../validations/checkin.validation");

const router = express.Router();

router.get(
  "/me/history",
  authenticate,
  myCheckinHistoryValidation,
  validate,
  checkinController.getMyCheckinHistory
);

router.use(authenticate, allowRoles("admin", "staff"));

router.get("/", listCheckinsValidation, validate, checkinController.listCheckins);
router.post("/check-in", checkInValidation, validate, checkinController.checkIn);
router.post("/check-out/:checkinId", checkOutValidation, validate, checkinController.checkOut);

module.exports = router;
