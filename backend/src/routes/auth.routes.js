const express = require("express");
const authController = require("../controllers/auth.controller");
const { validate } = require("../middlewares/validate.middleware");
const { registerValidation, loginValidation } = require("../validations/auth.validation");

const router = express.Router();

router.post("/register", registerValidation, validate, authController.register);
router.post("/login", loginValidation, validate, authController.login);

module.exports = router;
