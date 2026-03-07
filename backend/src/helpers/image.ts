import sharp from 'sharp';
import { ImageFile } from '../models/ImageFile';

const MAX_WIDTH  = 1200;
const MAX_HEIGHT = 1200;
const QUALITY    = 80;

/**
 * Procesa un buffer de imagen (redimensiona + webp) y lo guarda en MongoDB.
 * Retorna el _id como string (será el "nombreArchivo" en Product.imagenes).
 */
export async function saveImageToDb(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
): Promise<string> {
  console.log('[saveImageToDb] Inicio:', { originalName, mimeType, bufferSize: buffer.length });

  // Videos: guardar tal cual sin procesar con sharp
  if (mimeType.startsWith('video/')) {
    const doc = await ImageFile.create({
      data: buffer,
      contentType: mimeType,
      originalName,
      size: buffer.length,
    });
    console.log('[saveImageToDb] Video guardado, _id:', String(doc._id));
    return String(doc._id);
  }

  // Imágenes: optimizar con sharp → webp
  console.log('[saveImageToDb] Procesando con sharp...');
  const optimized = await sharp(buffer)
    .resize(MAX_WIDTH, MAX_HEIGHT, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer();
  console.log('[saveImageToDb] Sharp OK, tamaño optimizado:', optimized.length);

  const doc = await ImageFile.create({
    data: optimized,
    contentType: 'image/webp',
    originalName,
    size: optimized.length,
  });
  console.log('[saveImageToDb] Guardado en MongoDB, _id:', String(doc._id));

  return String(doc._id);
}

/**
 * Elimina una imagen de MongoDB por su _id.
 */
export async function deleteImageFromDb(id: string): Promise<void> {
  await ImageFile.findByIdAndDelete(id);
}
