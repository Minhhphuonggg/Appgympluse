const crypto = require("crypto");
const env = require("../config/env");
const ApiError = require("./apiError");

// Hàm format date chuẩn GMT+7
function formatDate(date) {
  // Lấy thời gian đã cộng 7 tiếng
  const vnDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  
  const pad = (num) => String(num).padStart(2, "0");
  return `${vnDate.getUTCFullYear()}${pad(vnDate.getUTCMonth() + 1)}${pad(vnDate.getUTCDate())}${pad(vnDate.getUTCHours())}${pad(vnDate.getUTCMinutes())}${pad(vnDate.getUTCSeconds())}`;
}

function sortObject(input) {
  const sorted = {};
  const keys = Object.keys(input).sort();
  keys.forEach((key) => {
    if (input[key] !== undefined && input[key] !== null && input[key] !== "") {
      sorted[key] = input[key];
    }
  });
  return sorted;
}

function encodeVnpayValue(value) {
  return encodeURIComponent(String(value)).replace(/%20/g, "+");
}

function normalizeParams(input) {
  const normalized = {};
  Object.keys(input).forEach((key) => {
    const value = input[key];
    if (value !== undefined && value !== null && value !== "") {
      normalized[key] = String(value);
    }
  });
  return normalized;
}

function sanitizeOrderInfo(orderInfo) {
  const normalized = String(orderInfo || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^\w\s.,:;/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return normalized || "Thanh toan goi hoi vien";
}

function sanitizeIp(ipAddr) {
  if (!ipAddr) return "127.0.0.1";
  const ip = String(ipAddr).trim();
  if (!ip || ip === "::1") return "127.0.0.1";
  if (ip.startsWith("::ffff:")) return ip.slice(7);
  return ip;
}

// Hàm này CHỈ làm nhiệm vụ nối chuỗi, không sort lại để tránh sai sót
function buildQueryString(sortedParams) {
  return Object.keys(sortedParams)
    .map((key) => `${encodeVnpayValue(key)}=${encodeVnpayValue(sortedParams[key])}`)
    .join("&");
}

function createSecureHash(sortedParams) {
  const signData = buildQueryString(sortedParams);
  return crypto.createHmac("sha512", env.vnpay.hashSecret).update(Buffer.from(signData, "utf-8")).digest("hex");
}

function buildVnpayPaymentUrl({ amount, orderRef, orderInfo, ipAddr }) {
  if (!env.vnpay.tmnCode || !env.vnpay.hashSecret || !env.vnpay.returnUrl) {
    throw new ApiError(500, "VNPAY config is missing");
  }

  const now = new Date();
  const expire = new Date(now.getTime() + 15 * 60 * 1000);

  const params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: env.vnpay.tmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderRef,
    vnp_OrderInfo: sanitizeOrderInfo(orderInfo),
    vnp_OrderType: "other",
    vnp_Amount: Math.round(Number(amount) * 100),
    vnp_ReturnUrl: env.vnpay.returnUrl,
    vnp_IpAddr: sanitizeIp(ipAddr),
    vnp_CreateDate: formatDate(now),
    vnp_ExpireDate: formatDate(expire),
  };

  // 1. Chuẩn hóa và Sắp xếp tham số
  const sortedParams = sortObject(normalizeParams(params));
  
  // 2. Tạo chữ ký từ bộ tham số ĐÃ SẮP XẾP
  sortedParams.vnp_SecureHash = createSecureHash(sortedParams);

  // 3. Xây dựng URL
  return `${env.vnpay.paymentUrl}?${buildQueryString(sortedParams)}`;
}

function verifyVnpayReturn(query) {
  const cloned = normalizeParams(query);
  const secureHash = String(cloned.vnp_SecureHash || "").toLowerCase();

  delete cloned.vnp_SecureHash;
  delete cloned.vnp_SecureHashType;

  // Sắp xếp lại trước khi verify để khớp với lúc tạo
  const sorted = sortObject(cloned);
  const expected = createSecureHash(sorted).toLowerCase();
  
  return secureHash === expected;
}

module.exports = {
  buildVnpayPaymentUrl,
  verifyVnpayReturn,
  sanitizeOrderInfo,
};