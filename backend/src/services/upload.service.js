const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");
const env = require("../config/env");
const ApiError = require("../utils/apiError");

async function uploadImage(fileBuffer, folder = "gym-app") {
  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
    throw new ApiError(500, "Cloudinary config is missing");
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(new ApiError(500, "Failed to upload image"));
          return;
        }
        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
}

module.exports = {
  uploadImage,
};
