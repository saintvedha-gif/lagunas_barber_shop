import { Request, Response } from 'express';
import path from 'path';
import { BarberService } from '../models/BarberService';
import { BarberMedia } from '../models/BarberMedia';
import { uploadToCloudinary, deleteFromCloudinary } from '../helpers/image';

// GET /api/barber/services
export async function getServices(_req: Request, res: Response): Promise<void> {
  const servicios = await BarberService.find({ activo: true }).sort({ orden: 1 });
  res.json(servicios);
}

// POST /api/barber/services
export async function createService(req: Request, res: Response): Promise<void> {
  const { nombre, precio, descripcion } = req.body as Record<string, string>;
  if (!nombre?.trim() || precio === undefined) {
    res.status(400).json({ error: 'nombre y precio son obligatorios.' });
    return;
  }
  const totalOrden = await BarberService.countDocuments();

  let imagen: string | null = null;
  const file = req.file;
  if (file) {
    const { publicId } = await uploadToCloudinary(file.buffer, 'services');
    imagen = publicId;
  }

  const servicio = await BarberService.create({
    nombre: nombre.trim(),
    precio: parseFloat(precio),
    descripcion: descripcion?.trim() || null,
    imagen,
    orden: totalOrden,
  });
  res.status(201).json(servicio);
}

// PUT /api/barber/services/:id
export async function updateService(req: Request, res: Response): Promise<void> {
  const { nombre, precio, descripcion } = req.body as Record<string, string>;

  const updateData: Record<string, unknown> = {
    ...(nombre && { nombre: nombre.trim() }),
    ...(precio !== undefined && { precio: parseFloat(precio) }),
    ...(descripcion !== undefined && { descripcion: descripcion.trim() || null }),
  };

  const file = req.file;
  if (file) {
    // Borrar imagen anterior si existe
    const existing = await BarberService.findById(req.params['id']);
    if (existing?.imagen) await deleteFromCloudinary(existing.imagen);
    const { publicId } = await uploadToCloudinary(file.buffer, 'services');
    updateData.imagen = publicId;
  }

  const servicio = await BarberService.findByIdAndUpdate(
    req.params['id'],
    updateData,
    { new: true }
  );
  if (!servicio) { res.status(404).json({ error: 'Servicio no encontrado.' }); return; }
  res.json(servicio);
}

// DELETE /api/barber/services/:id
export async function deleteService(req: Request, res: Response): Promise<void> {
  const servicio = await BarberService.findByIdAndDelete(req.params['id']);
  if (!servicio) { res.status(404).json({ error: 'Servicio no encontrado.' }); return; }
  if (servicio.imagen) await deleteFromCloudinary(servicio.imagen);
  res.json({ message: 'Servicio eliminado.' });
}

// GET /api/barber/media
export async function getMedia(_req: Request, res: Response): Promise<void> {
  const media = await BarberMedia.find({ activo: true }).sort({ orden: 1 });
  res.json(media);
}

// POST /api/barber/media
export async function createMedia(req: Request, res: Response): Promise<void> {
  const { titulo, tipoMedia, urlVideo } = req.body as Record<string, string>;
  const totalOrden = await BarberMedia.countDocuments();

  if (tipoMedia === 'video_url') {
    if (!urlVideo?.trim()) { res.status(400).json({ error: 'Proporciona la URL del video.' }); return; }

    let url = urlVideo.trim();
    const ytMatch =
      url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/) ||
      url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (ytMatch) url = `https://www.youtube.com/embed/${ytMatch[1]}`;

    const media = await BarberMedia.create({
      tipo: 'video', urlVideo: url, nombreArchivo: null,
      titulo: titulo?.trim() || null, orden: totalOrden,
    });
    res.status(201).json(media);
    return;
  }

  const file = req.file;
  if (!file) { res.status(400).json({ error: 'Debes subir un archivo o proporcionar una URL de video.' }); return; }

  const ext  = path.extname(file.originalname).toLowerCase();
  const tipo: 'imagen' | 'video' = ['.mp4', '.webm', '.mov'].includes(ext) ? 'video' : 'imagen';

  const resourceType = tipo === 'video' ? 'video' : 'image';
  const { publicId } = await uploadToCloudinary(file.buffer, 'barber', resourceType);

  const media = await BarberMedia.create({
    tipo, nombreArchivo: publicId, urlVideo: null,
    titulo: titulo?.trim() || null, orden: totalOrden,
  });
  res.status(201).json(media);
}

// DELETE /api/barber/media/:id
export async function deleteMedia(req: Request, res: Response): Promise<void> {
  const media = await BarberMedia.findByIdAndDelete(req.params['id']);
  if (!media) { res.status(404).json({ error: 'Media no encontrada.' }); return; }

  if (media.nombreArchivo) {
    const isVideo = media.tipo === 'video';
    await deleteFromCloudinary(media.nombreArchivo, isVideo ? 'video' : 'image');
  }
  res.json({ message: 'Media eliminada.' });
}
