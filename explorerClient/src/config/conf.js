// Centralised config object that reads Vite environment variables.
// All VITE_* variables are injected at build time and exposed on import.meta.env.
// Add a .env file at explorerClient/ root with the values listed in .env.example.
const conf = {
  serverUrl: String(import.meta.env.VITE_SERVER_URI),              // backend API base URL
  cloudName: String(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME),  // Cloudinary cloud identifier
  cloudinaryApiKey: String(import.meta.env.VITE_CLOUDINARY_API_KEY),
  cloudinaryApiSecret: String(import.meta.env.VITE_CLOUDINARY_API_SECRET),
  cloudinaryUploadPreset: String(import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET), // unsigned upload preset
};

export default conf;
