import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Initialise the Cloudinary SDK with credentials from environment variables.
// These values must never be committed to source control.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Uploads a file from the local temp directory to Cloudinary, then removes
// the local copy regardless of success or failure to avoid disk accumulation.
// Returns the Cloudinary response object on success, or null on failure.
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // resource_type: "auto" lets Cloudinary detect images, videos, or raw files.
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: process.env.CLOUDINARY_FOLDER_NAME,
    });

    console.log("file is uploaded on cloudinary ", response.url);
    // Remove the local temp file synchronously after a successful upload.
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // Clean up the local temp file even when the Cloudinary upload fails,
    // using async unlink so a disk error doesn't mask the original error.
    if (localFilePath) {
      fs.unlink(localFilePath, (unlinkError) => {
        if (unlinkError) {
          console.error("Error deleting local file:", unlinkError);
        }
      });
    }
    console.error("Error uploading to Cloudinary:", error);
    return null;
  }
};

export { uploadOnCloudinary };
