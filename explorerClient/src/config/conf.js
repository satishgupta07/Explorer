// Centralised config object that reads Vite environment variables.
// All VITE_* variables are inlined into the client bundle at build time —
// NEVER put secrets here. Cloudinary's apiKey/apiSecret were previously
// exposed; signed uploads must run on the server, not the browser.
const conf = {
  serverUrl: String(import.meta.env.VITE_SERVER_URI),              // backend API base URL
  cloudName: String(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME),   // Cloudinary cloud identifier (public)
  cloudinaryUploadPreset: String(import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET), // unsigned upload preset (public)
};

export default conf;
