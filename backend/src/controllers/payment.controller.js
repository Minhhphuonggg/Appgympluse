const asyncHandler = require("../utils/asyncHandler");
const paymentService = require("../services/payment.service");

const vnpayReturn = asyncHandler(async (req, res) => {
  const data = await paymentService.handleVnpayCallback(req.query);

  return res.status(200).json({
    success: true,
    message: "VNPAY callback processed",
    data,
  });
});

module.exports = {
  vnpayReturn,
};
