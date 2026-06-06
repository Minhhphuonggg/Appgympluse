const ApiError = require("../utils/apiError");
const { signAccessToken } = require("../utils/jwt");
const { hashPassword, comparePassword } = require("../utils/password");
const { createUser, findUserByEmail, sanitizeUserRow } = require("../models/user.model");

async function register(payload) {
  const existing = await findUserByEmail(payload.email);
  if (existing) {
    throw new ApiError(409, "Email already exists");
  }

  const password = await hashPassword(payload.password);
  const user = await createUser({
    name: payload.name,
    email: payload.email,
    password,
    phone: payload.phone,
    role: "user",
  });

  const token = signAccessToken({ sub: user.id, email: user.email, role: user.role });

  return {
    token,
    user: sanitizeUserRow(user),
  };
}

async function login(payload) {
  const user = await findUserByEmail(payload.email);

  if (!user) {
    throw new ApiError(401, "Email or password is incorrect");
  }

  if (user.status !== "active") {
    throw new ApiError(403, "Account is banned");
  }

  const matched = await comparePassword(payload.password, user.password);

  if (!matched) {
    throw new ApiError(401, "Email or password is incorrect");
  }

  const token = signAccessToken({ sub: user.id, email: user.email, role: user.role });

  return {
    token,
    user: sanitizeUserRow(user),
  };
}

module.exports = {
  register,
  login,
};
