import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov'];

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, unique);
  },
});

const imageFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${ext}. Solo imágenes.`));
  }
};

const mediaFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void => {
  const ext = path.extname(file.originalname).toLowerCase();
  if ([...ALLOWED_EXTENSIONS, ...ALLOWED_VIDEO_EXTENSIONS].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${ext}`));
  }
};

export const uploadProductImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_SIZE_BYTES, files: 20 },
}).array('imagenes', 20);

export const uploadBarberMedia = multer({
  storage,
  fileFilter: mediaFilter,
  limits: { fileSize: 50 * 1024 * 1024, files: 1 },
}).single('archivo');
