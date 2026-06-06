const express = require("express");
const paymentController = require("../controllers/payment.controller");

const router = express.Router();

router.get("/vnpay-return", paymentController.vnpayReturn);

module.exports = router;
