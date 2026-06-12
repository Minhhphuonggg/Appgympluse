const asyncHandler = require("../utils/asyncHandler");
const paymentService = require("../services/payment.service");

// 1. Hàm xử lý Return URL (Dành cho giao diện người dùng)
const vnpayReturn = asyncHandler(async (req, res) => {
  const data = await paymentService.handleVnpayCallback(req.query);

  return res.status(200).json({
    success: true,
    message: "VNPAY callback processed",
    data,
  });
});

// 2. Hàm xử lý IPN URL (Dành cho hệ thống VNPAY gọi ngầm)
const vnpayIpn = asyncHandler(async (req, res) => {
  try {
    // Gọi hàm xử lý và cập nhật DB giống hệt Return
    await paymentService.handleVnpayCallback(req.query);
    
    // VNPAY bắt buộc IPN phải trả về format này nếu thành công
    return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
  } catch (error) {
    // Nếu có lỗi (ví dụ: sai chữ ký), báo lại cho VNPAY
    return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
});

// BẮT BUỘC PHẢI EXPORT CẢ 2 HÀM
module.exports = {
  vnpayReturn,
  vnpayIpn, 
};