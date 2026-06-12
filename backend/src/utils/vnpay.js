const crypto = require("crypto");
const env = require("../config/env");
const qs = require("qs");

function formatDate(date) {
  const vnDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const pad = (num) => String(num).padStart(2, "0");
  return `${vnDate.getUTCFullYear()}${pad(vnDate.getUTCMonth() + 1)}${pad(vnDate.getUTCDate())}${pad(vnDate.getUTCHours())}${pad(vnDate.getUTCMinutes())}${pad(vnDate.getUTCSeconds())}`;
}

// HÀM SORT VÀ ENCODE CHUẨN 100% THEO TÀI LIỆU VNPAY
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    // VNPay yêu cầu encode value và thay thế %20 bằng dấu +
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

function buildVnpayPaymentUrl({ amount, orderRef, orderInfo, ipAddr }) {
  let date = new Date();
  let expireDate = new Date(date.getTime() + 15 * 60 * 1000);

  let ip = ipAddr || "127.0.0.1";
  if (ip === "::1") ip = "127.0.0.1";
  if (ip.startsWith("::ffff:")) ip = ip.slice(7);

  let tmnCode = env.vnpay.tmnCode;
  let secretKey = env.vnpay.hashSecret;
  let vnpUrl = env.vnpay.paymentUrl;
  let returnUrl = env.vnpay.returnUrl;

  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = 'vn';
  vnp_Params['vnp_CurrCode'] = 'VND';
  vnp_Params['vnp_TxnRef'] = orderRef;
  
  // Lọc sạch tiếng Việt có dấu và ký tự lạ để tránh lệch chuỗi hash
  vnp_Params['vnp_OrderInfo'] = String(orderInfo || 'Thanh toan don hang')
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^\w\s]/gi, ' ')
    .trim() || "Thanh toan don hang";
    
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_Amount'] = Math.round(Number(amount) * 100);
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ip;
  vnp_Params['vnp_CreateDate'] = formatDate(date);
  vnp_Params['vnp_ExpireDate'] = formatDate(expireDate);

  // 1. Sort và Encode theo chuẩn VNPay
  vnp_Params = sortObject(vnp_Params);

  // 2. Tạo chuỗi băm (encode: false vì hàm sortObject đã encode rồi)
  let signData = qs.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
  vnp_Params['vnp_SecureHash'] = signed;

  // 3. Nối URL
  vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });
  
  console.log("URL gửi đi:", vnpUrl); // Debug URL
  return vnpUrl;
}

function verifyVnpayReturn(query) {
  let vnp_Params = { ...query };
  let secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);

  let secretKey = env.vnpay.hashSecret;
  let signData = qs.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");     

  return secureHash === signed;
}

module.exports = { buildVnpayPaymentUrl, verifyVnpayReturn };