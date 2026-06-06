const ApiError = require("../utils/apiError");

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "Forbidden"));
    }

    return next();
  };
}

module.exports = {
  allowRoles,
};
