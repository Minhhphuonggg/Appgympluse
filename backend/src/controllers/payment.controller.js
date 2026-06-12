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

// [ĐÃ THÊM] - Thêm hàm vnpayIpn để Route gọi không bị văng lỗi
const vnpayIpn = asyncHandler(async (req, res) => {
  // Tạm thời trả về thành công để server không chết. 
  // Sau này bạn có thể viết logic xử lý VNPAY IPN thật vào đây.
  return res.status(200).json({
    RspCode: "00",
    Message: "Confirm Success"
  });
});

module.exports = {
  vnpayReturn,
  vnpayIpn, // [ĐÃ THÊM] - Phải export hàm này ra
};