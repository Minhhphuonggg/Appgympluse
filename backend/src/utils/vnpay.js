const crypto = require("crypto");
const env = require("../config/env");
const ApiError = require("./apiError");

// Hàm format date chuẩn GMT+7
function formatDate(date) {
  // Cộng thêm 7 tiếng vào thời gian UTC để ra giờ VN
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

  if (!normalized) {
    return "Thanh toan goi hoi vien";
  }

  return normalized.slice(0, 255);
}

function sanitizeIp(ipAddr) {
  if (!ipAddr) return "127.0.0.1";

  const ip = String(ipAddr).trim();
  if (!ip) return "127.0.0.1";
  if (ip === "::1") return "127.0.0.1";
  if (ip.startsWith("::ffff:")) return ip.slice(7);

  return ip;
}

function buildQueryString(params) {
  // Chú ý: buildQueryString này dùng sortObject riêng nội bộ
  const sorted = sortObject(normalizeParams(params));

  return Object.keys(sorted)
    .map((key) => `${encodeVnpayValue(key)}=${encodeVnpayValue(sorted[key])}`)
    .join("&");
}

function createSecureHash(params) {
  const signData = buildQueryString(params);
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

  const vnpParams = sortObject(params);
  vnpParams.vnp_SecureHash = createSecureHash(vnpParams);

  return `${env.vnpay.paymentUrl}?${buildQueryString(vnpParams)}`;
}

function verifyVnpayReturn(query) {
  const cloned = normalizeParams(query);
  const secureHash = String(cloned.vnp_SecureHash || "").toLowerCase();

  delete cloned.vnp_SecureHash;
  delete cloned.vnp_SecureHashType;

  const expected = createSecureHash(cloned).toLowerCase();
  return secureHash === expected;
}

module.exports = {
  buildVnpayPaymentUrl,
  verifyVnpayReturn,
  sanitizeOrderInfo,
};