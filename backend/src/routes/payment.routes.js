const express = require("express");
const paymentController = require("../controllers/payment.controller");

const router = express.Router();

// Route nhận kết quả trả về giao diện
router.get("/vnpay-return", paymentController.vnpayReturn);

// Route IPN để VNPAY cập nhật trạng thái đơn hàng ngầm
router.get("/vnpay-ipn", paymentController.vnpayIpn);

module.exports = router;