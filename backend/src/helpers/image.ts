import cloudinary from '../config/cloudinary';

/**
 * Sube un buffer a Cloudinary dentro de la carpeta `lagunas/`.
 * Retorna el public_id (ej: "lagunas/products/abc123").
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,         // ej: "products", "barber"
  resourceType: 'image' | 'video' = 'image',
): Promise<{ publicId: string; url: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `lagunas/${folder}`,
        resource_type: resourceType,
        // Cloudinary optimiza automáticamente (formato, calidad)
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload falló'));
        resolve({ publicId: result.public_id, url: result.secure_url });
      },
    );
    stream.end(buffer);
  });
}

/**
 * Elimina un recurso de Cloudinary por su public_id.
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'video' = 'image',
): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
