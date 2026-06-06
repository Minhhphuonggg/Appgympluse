const { verifyAccessToken } = require("../utils/jwt");
const ApiError = require("../utils/apiError");

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new ApiError(401, "Unauthorized"));
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.sub,
      role: decoded.role,
      email: decoded.email,
    };
    return next();
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired token"));
  }
}

module.exports = {
  authenticate,
};
