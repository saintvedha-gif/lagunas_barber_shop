import { Request, Response } from 'express';
import { Color } from '../models/Color';

// GET /api/colors
export async function getColors(_req: Request, res: Response): Promise<void> {
  const colores = await Color.find().sort({ nombre: 1 });
  res.json(colores);
}

// POST /api/colors
export async function createColor(req: Request, res: Response): Promise<void> {
  const { nombre, hex } = req.body as { nombre?: string; hex?: string };
  if (!nombre?.trim() || !hex?.trim()) {
    res.status(400).json({ error: 'nombre y hex son obligatorios.' });
    return;
  }
  try {
    const color = await Color.create({ nombre: nombre.trim(), hex: hex.trim() });
    res.status(201).json(color);
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      res.status(409).json({ error: 'Ya existe un color con ese nombre.' });
      return;
    }
    throw err;
  }
}

// PUT /api/colors/:id
export async function updateColor(req: Request, res: Response): Promise<void> {
  const { nombre, hex } = req.body as { nombre?: string; hex?: string };
  const update: Record<string, string> = {};
  if (nombre) update['nombre'] = nombre.trim();
  if (hex)    update['hex']    = hex.trim();

  try {
    const color = await Color.findByIdAndUpdate(req.params['id'], update, { new: true });
    if (!color) { res.status(404).json({ error: 'Color no encontrado.' }); return; }
    res.json(color);
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      res.status(409).json({ error: 'Ya existe un color con ese nombre.' });
      return;
    }
    throw err;
  }
}

// DELETE /api/colors/:id
export async function deleteColor(req: Request, res: Response): Promise<void> {
  const color = await Color.findByIdAndDelete(req.params['id']);
  if (!color) { res.status(404).json({ error: 'Color no encontrado.' }); return; }
  res.json({ message: 'Color eliminado correctamente.' });
}
