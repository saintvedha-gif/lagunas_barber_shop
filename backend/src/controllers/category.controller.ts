import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { Product } from '../models/Product';

// GET /api/categories
export async function getCategories(req: Request, res: Response): Promise<void> {
  const { seccion } = req.query as { seccion?: string };
  const filter: Record<string, unknown> = { activa: true };
  if (seccion) filter['seccion'] = seccion;
  const categorias = await Category.find(filter).sort({ seccion: 1, nombre: 1 });
  res.json(categorias);
}

// GET /api/categories/with-count  (panel admin)
export async function getCategoriesWithCount(_req: Request, res: Response): Promise<void> {
  const categorias = await Category.find().sort({ seccion: 1, nombre: 1 });
  const conConteo = await Promise.all(
    categorias.map(async (cat) => ({
      ...cat.toObject(),
      totalProductos: await Product.countDocuments({ categoria: cat._id }),
    }))
  );
  res.json(conConteo);
}

// POST /api/categories
export async function createCategory(req: Request, res: Response): Promise<void> {
  const { nombre, seccion } = req.body as { nombre?: string; seccion?: string };

  if (!nombre?.trim() || !seccion) {
    res.status(400).json({ error: 'nombre y seccion son obligatorios.' });
    return;
  }
  if (!['ropa', 'cosmetico'].includes(seccion)) {
    res.status(400).json({ error: 'seccion debe ser "ropa" o "cosmetico".' });
    return;
  }

  try {
    const categoria = await Category.create({ nombre: nombre.trim(), seccion });
    res.status(201).json(categoria);
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      res.status(409).json({ error: 'Ya existe una categoría con ese nombre.' });
      return;
    }
    throw err;
  }
}

// PUT /api/categories/:id
export async function updateCategory(req: Request, res: Response): Promise<void> {
  const { nombre } = req.body as { nombre?: string };
  if (!nombre?.trim()) { res.status(400).json({ error: 'El nombre es obligatorio.' }); return; }

  try {
    const categoria = await Category.findByIdAndUpdate(req.params['id'], { nombre: nombre.trim() }, { new: true });
    if (!categoria) { res.status(404).json({ error: 'Categoría no encontrada.' }); return; }
    res.json(categoria);
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      res.status(409).json({ error: 'Ya existe una categoría con ese nombre.' });
      return;
    }
    throw err;
  }
}

// DELETE /api/categories/:id
export async function deleteCategory(req: Request, res: Response): Promise<void> {
  const totalProductos = await Product.countDocuments({ categoria: req.params['id'] });
  if (totalProductos > 0) {
    res.status(409).json({ error: `No puedes eliminar esta categoría porque tiene ${totalProductos} producto(s) asignados.` });
    return;
  }
  const categoria = await Category.findByIdAndDelete(req.params['id']);
  if (!categoria) { res.status(404).json({ error: 'Categoría no encontrada.' }); return; }
  res.json({ message: 'Categoría eliminada correctamente.' });
}
