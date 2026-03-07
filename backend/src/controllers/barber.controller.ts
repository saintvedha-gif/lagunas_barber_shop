import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { BarberService } from '../models/BarberService';
import { BarberMedia } from '../models/BarberMedia';

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

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
  const servicio = await BarberService.create({
    nombre: nombre.trim(),
    precio: parseFloat(precio),
    descripcion: descripcion?.trim() || null,
    orden: totalOrden,
  });
  res.status(201).json(servicio);
}

// PUT /api/barber/services/:id
export async function updateService(req: Request, res: Response): Promise<void> {
  const { nombre, precio, descripcion } = req.body as Record<string, string>;
  const servicio = await BarberService.findByIdAndUpdate(
    req.params['id'],
    {
      ...(nombre && { nombre: nombre.trim() }),
      ...(precio !== undefined && { precio: parseFloat(precio) }),
      ...(descripcion !== undefined && { descripcion: descripcion.trim() || null }),
    },
    { new: true }
  );
  if (!servicio) { res.status(404).json({ error: 'Servicio no encontrado.' }); return; }
  res.json(servicio);
}

// DELETE /api/barber/services/:id
export async function deleteService(req: Request, res: Response): Promise<void> {
  const servicio = await BarberService.findByIdAndDelete(req.params['id']);
  if (!servicio) { res.status(404).json({ error: 'Servicio no encontrado.' }); return; }
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

  const media = await BarberMedia.create({
    tipo, nombreArchivo: file.filename, urlVideo: null,
    titulo: titulo?.trim() || null, orden: totalOrden,
  });
  res.status(201).json(media);
}

// DELETE /api/barber/media/:id
export async function deleteMedia(req: Request, res: Response): Promise<void> {
  const media = await BarberMedia.findByIdAndDelete(req.params['id']);
  if (!media) { res.status(404).json({ error: 'Media no encontrada.' }); return; }

  if (media.nombreArchivo) {
    const ruta = path.join(UPLOADS_DIR, media.nombreArchivo);
    if (fs.existsSync(ruta)) fs.unlinkSync(ruta);
  }
  res.json({ message: 'Media eliminada.' });
}
