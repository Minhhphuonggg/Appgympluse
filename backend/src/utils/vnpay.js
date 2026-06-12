const crypto = require("crypto");
const env = require("../config/env");
const qs = require("qs");

function formatDate(date) {
  const vnDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const pad = (num) => String(num).padStart(2, "0");
  return `${vnDate.getUTCFullYear()}${pad(vnDate.getUTCMonth() + 1)}${pad(vnDate.getUTCDate())}${pad(vnDate.getUTCHours())}${pad(vnDate.getUTCMinutes())}${pad(vnDate.getUTCSeconds())}`;
}

// Hàm sort chuẩn xác: Không encode trước, chỉ sort key
function sortObject(obj) {
  let sorted = {};
  let keys = Object.keys(obj).sort();
  for (let key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}

function buildVnpayPaymentUrl({ amount, orderRef, orderInfo, ipAddr }) {
  let date = new Date();
  let expireDate = new Date(date.getTime() + 15 * 60 * 1000);

  let vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: env.vnpay.tmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: String(orderRef),
    vnp_OrderInfo: "Thanh toan don hang",
    vnp_OrderType: "other",
    vnp_Amount: Math.round(parseInt(amount) * 100),
    vnp_ReturnUrl: env.vnpay.returnUrl,
    vnp_IpAddr: ipAddr || "127.0.0.1",
    vnp_CreateDate: formatDate(date),
    vnp_ExpireDate: formatDate(expireDate),
  };

  // 1. Sort tham số
  vnp_Params = sortObject(vnp_Params);

  // 2. Stringify và tạo hash (dùng encode: true của qs để chuẩn URL)
  let signData = qs.stringify(vnp_Params, { encode: true });
  let hmac = crypto.createHmac("sha512", env.vnpay.hashSecret);
  let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
  
  vnp_Params['vnp_SecureHash'] = signed;

  // 3. Nối URL (dùng encode: true)
  return env.vnpay.paymentUrl + '?' + qs.stringify(vnp_Params, { encode: true });
}

function verifyVnpayReturn(query) {
  let vnp_Params = { ...query };
  let secureHash = vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);
  
  // Quan trọng: Phải dùng encode: true giống lúc tạo hash
  let signData = qs.stringify(vnp_Params, { encode: true });
  let hmac = crypto.createHmac("sha512", env.vnpay.hashSecret);
  let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
  
  return secureHash === signed;
}

module.exports = { buildVnpayPaymentUrl, verifyVnpayReturn };