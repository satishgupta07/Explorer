const conf = {
    cloudName: String(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME),
    cloudinaryApiKey: String(import.meta.env.VITE_CLOUDINARY_API_KEY),
    cloudinaryApiSecret: String(import.meta.env.VITE_CLOUDINARY_API_SECRET),
    cloudinaryUploadPreset: String(import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET),
}

export default conf