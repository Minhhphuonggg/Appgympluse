const { buildVnpayPaymentUrl, verifyVnpayReturn } = require("../utils/vnpay");

const createPaymentUrl = async (orderData) => {
  // Đảm bảo amount là số nguyên, nếu không hợp lệ thì mặc định là 0 để tránh crash
  const amount = parseInt(orderData.amount) || 0;
  
  if (amount <= 0) {
    throw new Error("Số tiền thanh toán không hợp lệ.");
  }
  
  return buildVnpayPaymentUrl({
    amount: amount,
    orderRef: orderData.order_ref,
    orderInfo: "Thanh toan gym", // Đảm bảo chuỗi này không chứa ký tự đặc biệt lạ
    ipAddr: orderData.ip
  });
};

const handleVnpayCallback = async (query) => {
  // 1. Kiểm tra chữ ký
  const isVerified = verifyVnpayReturn(query);
  if (!isVerified) {
    console.error("DEBUG: Chữ ký không khớp!", query);
    throw new Error("Invalid signature");
  }
  
  // 2. Tại đây bạn viết code update trạng thái đơn hàng vào Database
  // Ví dụ: await Order.update({ status: 'paid' }, { where: { order_ref: query.vnp_TxnRef } });
  
  return { success: true };
};

module.exports = { createPaymentUrl, handleVnpayCallback };