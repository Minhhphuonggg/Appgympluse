const express = require("express");
const aiController = require("../controllers/ai.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { allowRoles } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { aiChatValidation } = require("../validations/ai.validation");

const router = express.Router();

router.post("/chat", authenticate, allowRoles("user"), aiChatValidation, validate, aiController.chat);

module.exports = router;
