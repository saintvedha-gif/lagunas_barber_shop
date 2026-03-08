import { v2 as cloudinary } from 'cloudinary';

// CLOUDINARY_URL tiene formato: cloudinary://api_key:api_secret@cloud_name
// El SDK la lee automáticamente. Si no existe, usa las variables individuales.
if (!process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const cfg = cloudinary.config();
console.log(`☁️  Cloudinary: cloud_name=${cfg.cloud_name || 'NO CONFIGURADO'}`);

export default cloudinary;
