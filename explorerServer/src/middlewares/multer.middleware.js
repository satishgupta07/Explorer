import multer from "multer";

// Store uploaded files to a local /public/temp directory before forwarding
// them to Cloudinary. Using disk storage (vs. memory storage) avoids buffering
// large files in RAM, which matters for avatar / post image uploads.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  // Keep the original filename so the temp file is identifiable during debugging.
  // The file is deleted after a successful (or failed) Cloudinary upload.
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage,
  // Hard-cap uploads at 1 MB to prevent abuse and keep Cloudinary bandwidth reasonable.
  limits: { fileSize: 1 * 1024 * 1024 },
});
