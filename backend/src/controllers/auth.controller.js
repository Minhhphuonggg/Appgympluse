const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const authService = require("../services/auth.service");

const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: "Register successful",
    data,
  });
});

const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  return sendSuccess(res, {
    message: "Login successful",
    data,
  });
});

module.exports = {
  register,
  login,
};
