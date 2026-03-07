import multer from 'multer';
import path from 'path';
import { Request } from 'express';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;       // 5 MB
const MAX_MEDIA_SIZE = 50 * 1024 * 1024;       // 50 MB
const ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const ALLOWED_VIDEO_EXTS = ['.mp4', '.webm', '.mov'];

// ── Almacenamiento en memoria (luego se guarda en MongoDB) ───────────────────
const storage = multer.memoryStorage();

const imageFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_IMAGE_EXTS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${ext}. Solo imágenes.`));
  }
};

const mediaFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void => {
  const ext = path.extname(file.originalname).toLowerCase();
  if ([...ALLOWED_IMAGE_EXTS, ...ALLOWED_VIDEO_EXTS].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${ext}`));
  }
};

export const uploadProductImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_IMAGE_SIZE, files: 20 },
}).array('imagenes', 20);

export const uploadBarberMedia = multer({
  storage,
  fileFilter: mediaFilter,
  limits: { fileSize: MAX_MEDIA_SIZE, files: 1 },
}).single('archivo');
