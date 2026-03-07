import { Request, Response } from 'express';
import Settings from '../models/Settings';

/** GET /api/settings  → devuelve { clave: valor } para todo el público */
export async function getPublicSettings(_req: Request, res: Response): Promise<void> {
  try {
    const arr = await Settings.find({}).lean();
    const data: Record<string, string> = {};
    arr.forEach((s) => { data[s.clave] = s.valor; });
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
}

/** PUT /api/settings/:clave  (requiere auth) → upsert */
export async function upsertSetting(req: Request, res: Response): Promise<void> {
  try {
    const { clave } = req.params;
    const { valor, descripcion } = req.body as { valor?: string; descripcion?: string };

    if (!valor || !valor.trim()) {
      res.status(400).json({ error: 'El campo "valor" es requerido' });
      return;
    }

    const doc = await Settings.findOneAndUpdate(
      { clave },
      { valor: valor.trim(), ...(descripcion !== undefined ? { descripcion } : {}) },
      { upsert: true, new: true }
    );
    res.json(doc);
  } catch {
    res.status(500).json({ error: 'Error al guardar configuración' });
  }
}
