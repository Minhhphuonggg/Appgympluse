const crypto = require("crypto");
const env = require("../config/env");
const ApiError = require("./apiError");

function formatDate(date) {
  const vnDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const pad = (num) => String(num).padStart(2, "0");
  return `${vnDate.getUTCFullYear()}${pad(vnDate.getUTCMonth() + 1)}${pad(vnDate.getUTCDate())}${pad(vnDate.getUTCHours())}${pad(vnDate.getUTCMinutes())}${pad(vnDate.getUTCSeconds())}`;
}

function sortObject(input) {
  const sorted = {};
  Object.keys(input).sort().forEach((key) => {
    if (input[key] !== undefined && input[key] !== null && input[key] !== "") {
      sorted[key] = input[key];
    }
  });
  return sorted;
}

function encodeVnpayValue(value) {
  return encodeURIComponent(String(value)).replace(/%20/g, "+");
}

function buildQueryString(sortedParams) {
  return Object.keys(sortedParams)
    .map((key) => `${encodeVnpayValue(key)}=${encodeVnpayValue(sortedParams[key])}`)
    .join("&");
}

function createSecureHash(sortedParams) {
  const signData = buildQueryString(sortedParams);
  return crypto.createHmac("sha512", env.vnpay.hashSecret).update(Buffer.from(signData, "utf-8")).digest("hex");
}

function sanitizeOrderInfo(orderInfo) {
  const normalized = String(orderInfo || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").replace(/[^\w\s.,:;/-]/g, " ").replace(/\s+/g, " ").trim();
  return normalized || "Thanh toan goi hoi vien";
}

function sanitizeIp(ipAddr) {
  if (!ipAddr) return "127.0.0.1";
  const ip = String(ipAddr).trim();
  if (!ip || ip === "::1") return "127.0.0.1";
  if (ip.startsWith("::ffff:")) return ip.slice(7);
  return ip;
}

function buildVnpayPaymentUrl({ amount, orderRef, orderInfo, ipAddr }) {
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

  const sortedParams = sortObject(params);
  sortedParams.vnp_SecureHash = createSecureHash(sortedParams);

  return `${env.vnpay.paymentUrl}?${buildQueryString(sortedParams)}`;
}

function verifyVnpayReturn(query) {
  // 1. Chỉ lấy các tham số bắt đầu bằng vnp_
  const rawParams = {};
  Object.keys(query).forEach(key => {
    if (key.startsWith('vnp_')) {
      rawParams[key] = query[key];
    }
  });

  const secureHash = String(rawParams.vnp_SecureHash || "").toLowerCase();
  delete rawParams.vnp_SecureHash;
  delete rawParams.vnp_SecureHashType;

  // 2. Sắp xếp đúng theo chuẩn VNPay
  const sorted = sortObject(rawParams);
  const expected = createSecureHash(sorted).toLowerCase();
  
  // LOG ĐỂ KIỂM TRA TRÊN RENDER
  console.log("VNPay Hash:", secureHash);
  console.log("Calculated Hash:", expected);
  
  return secureHash === expected;
}

module.exports = { buildVnpayPaymentUrl, verifyVnpayReturn, sanitizeOrderInfo };