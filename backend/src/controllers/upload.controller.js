const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const ApiError = require("../utils/apiError");
const uploadService = require("../services/upload.service");

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Image file is required");
  }

  if (!req.file.mimetype.startsWith("image/")) {
    throw new ApiError(400, "Only image files are allowed");
  }

  const result = await uploadService.uploadImage(req.file.buffer, "gym-app");

  return sendSuccess(res, {
    statusCode: 201,
    message: "Image uploaded",
    data: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });
});

module.exports = {
  uploadImage,
};
