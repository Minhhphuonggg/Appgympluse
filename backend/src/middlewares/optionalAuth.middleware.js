const { verifyAccessToken } = require("../utils/jwt");

function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme === "Bearer" && token) {
    try {
      const decoded = verifyAccessToken(token);
      req.user = {
        id: decoded.sub,
        role: decoded.role,
        email: decoded.email,
      };
    } catch (error) {
      // Keep this route public: ignore invalid token and continue.
    }
  }

  next();
}

module.exports = {
  optionalAuthenticate,
};
