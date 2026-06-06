const express = require("express");
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const membershipPlanRoutes = require("./membershipPlan.routes");
const membershipRoutes = require("./membership.routes");
const exerciseRoutes = require("./exercise.routes");
const checkinRoutes = require("./checkin.routes");
const paymentRoutes = require("./payment.routes");
const aiRoutes = require("./ai.routes");
const uploadRoutes = require("./upload.routes");
const equipmentRoutes = require("./equipment.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use(userRoutes);
router.use("/membership-plans", membershipPlanRoutes);
router.use("/memberships", membershipRoutes);
router.use("/exercises", exerciseRoutes);
router.use("/checkins", checkinRoutes);
router.use("/payments", paymentRoutes);
router.use("/ai", aiRoutes);
router.use("/uploads", uploadRoutes);
router.use("/equipments", equipmentRoutes);

module.exports = router;
