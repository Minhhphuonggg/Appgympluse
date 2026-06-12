const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

function requireEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function toCsv(value) {
  if (!value) return [];
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function toNonNegativeInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return (Number.isNaN(parsed) || parsed < 0) ? fallback : parsed;
}

function toPositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return (Number.isNaN(parsed) || parsed <= 0) ? fallback : parsed;
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: toNumber(process.env.PORT, 3000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  db: {
    host: requireEnv("DB_HOST"),
    port: toNumber(requireEnv("DB_PORT"), 3306),
    user: requireEnv("DB_USER"),
    password: requireEnv("DB_PASSWORD"),
    database: requireEnv("DB_NAME"),
    connectionLimit: toNumber(process.env.DB_CONNECTION_LIMIT, 10),
  },
  jwt: {
    secret: requireEnv("JWT_SECRET"),
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  vnpay: {
    // Sửa lại theo đúng tên biến trên Render
    tmnCode: process.env.VNPAY_TMNCODE || "",
    hashSecret: process.env.VNPAY_HASHSECRET || "",
    paymentUrl: process.env.VNPAY_PAYMENT_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    returnUrl: process.env.VNPAY_RETURN_URL || "",
  },
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY || "",
    baseUrl: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
    model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
    fallbackModels: toCsv(process.env.OPENROUTER_FALLBACK_MODELS || ""),
    timeoutMs: toNumber(process.env.OPENROUTER_TIMEOUT_MS, 20000),
    maxRetries: toNonNegativeInteger(process.env.OPENROUTER_MAX_RETRIES, 2),
    maxOutputTokens: toPositiveInteger(process.env.OPENROUTER_MAX_OUTPUT_TOKENS, 2048),
    appName: process.env.OPENROUTER_APP_NAME || "Gym App API",
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
};

// Kiểm tra nhanh khi khởi động server
if (!env.vnpay.tmnCode || !env.vnpay.hashSecret) {
  console.error("!!! LỖI: VNPAY_TMNCODE hoặc VNPAY_HASHSECRET chưa được tải từ biến môi trường !!!");
} else {
  console.log(">>> VNPAY Config loaded successfully!");
}

module.exports = env;