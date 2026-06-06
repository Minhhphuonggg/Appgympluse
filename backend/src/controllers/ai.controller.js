const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const aiService = require("../services/ai.service");

const chat = asyncHandler(async (req, res) => {
  const answer = await aiService.askGymAssistant(req.body.message);

  return sendSuccess(res, {
    message: "AI response generated",
    data: { answer },
  });
});

module.exports = {
  chat,
};
