const express = require("express");
const paymentController = require("../controllers/payment.controller");

const router = express.Router();

router.get("/vnpay-return", paymentController.vnpayReturn);
router.get("/vnpay-ipn", paymentController.vnpayIpn);
module.exports = router;
