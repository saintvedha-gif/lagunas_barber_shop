import { Request, Response, NextFunction } from 'express';
import { Product, IProductImage } from '../models/Product';
import { Types } from 'mongoose';
import { uploadToCloudinary, deleteFromCloudinary } from '../helpers/image';

// GET /api/products
export async function getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { seccion, categoria, oferta, q, page = '1', limit = '50' } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = { activo: true };
    if (seccion)        filter['seccion']   = seccion;
    if (categoria)      filter['categoria'] = categoria;
    if (oferta === '1') filter['enOferta']  = true;
    if (q)              filter['nombre']    = { $regex: q, $options: 'i' };

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, parseInt(limit, 10));
    const skip     = (pageNum - 1) * limitNum;

    const [productos, total] = await Promise.all([
      Product.find(filter)
        .populate('categoria', 'nombre seccion')
        .sort({ enOferta: -1, creadoEn: -1 })
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({ productos, total, page: pageNum, limit: limitNum });
  } catch (err) { next(err); }
}

// GET /api/products/:id
export async function getProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const producto = await Product.findById(req.params['id']).populate('categoria', 'nombre seccion');
    if (!producto) { res.status(404).json({ error: 'Producto no encontrado.' }); return; }
    res.json(producto);
  } catch (err) { next(err); }
}

// POST /api/products
export async function createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { nombre, seccion, categoria, precio, precioAnterior, enOferta, stock, tallas, colores, descripcion } =
      req.body as Record<string, string>;

    if (!nombre?.trim() || !seccion || !precio) {
      res.status(400).json({ error: 'nombre, seccion y precio son obligatorios.' });
      return;
    }

    if (!['ropa', 'cosmetico'].includes(seccion)) {
      res.status(400).json({ error: 'seccion debe ser "ropa" o "cosmetico".' });
      return;
    }

    const files = (req.files as Express.Multer.File[]) || [];
    const portadaIdx = parseInt(req.body.portadaIdx ?? '0', 10);
    const imagenes: IProductImage[] = [];
    for (let idx = 0; idx < files.length; idx++) {
      const file = files[idx];
      const { publicId } = await uploadToCloudinary(file.buffer, 'products');
      imagenes.push({
        _id:           new Types.ObjectId(),
        nombreArchivo: publicId,
        color:         req.body[`color_${idx}`] || null,
        esPortada:     idx === portadaIdx,
        orden:         idx,
      });
    }

    const producto = await Product.create({
      nombre:         nombre.trim(),
      seccion,
      categoria:      categoria || null,
      precio:         parseFloat(precio),
      precioAnterior: precioAnterior ? parseFloat(precioAnterior) : null,
      enOferta:       enOferta === '1' || enOferta === 'true',
      stock:          parseInt(stock || '0', 10),
      tallas:         tallas ? tallas.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      colores:        colores ? colores.split(',').map((c: string) => c.trim()).filter(Boolean) : [],
      descripcion:    descripcion?.trim() || null,
      imagenes,
    });

    res.status(201).json(producto);
  } catch (err) { next(err); }
}

// PUT /api/products/:id
export async function updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const producto = await Product.findById(req.params['id']);
    if (!producto) { res.status(404).json({ error: 'Producto no encontrado.' }); return; }

    const { nombre, seccion, categoria, precio, precioAnterior, enOferta, stock, tallas, colores, descripcion } =
      req.body as Record<string, string>;

    if (nombre)   producto.nombre  = nombre.trim();
    if (seccion)  producto.seccion = seccion as 'ropa' | 'cosmetico';
    if (categoria !== undefined) producto.categoria = categoria ? new Types.ObjectId(categoria) : undefined;
    if (precio)   producto.precio  = parseFloat(precio);
    if (precioAnterior !== undefined) producto.precioAnterior = precioAnterior ? parseFloat(precioAnterior) : undefined;
    if (enOferta !== undefined) producto.enOferta = enOferta === '1' || enOferta === 'true';
    if (stock !== undefined)    producto.stock    = parseInt(stock, 10);
    if (tallas)   producto.tallas  = tallas.split(',').map((t: string) => t.trim()).filter(Boolean);
    if (colores)  producto.colores = colores.split(',').map((c: string) => c.trim()).filter(Boolean);
    if (descripcion !== undefined) producto.descripcion = descripcion?.trim() || undefined;

    const portadaExistenteId = (req.body.portadaExistenteId as string | undefined) || "";
    const portadaIdxRaw = req.body.portadaIdx as string | undefined;
    const portadaIdx = portadaIdxRaw !== undefined && portadaIdxRaw !== ""
      ? parseInt(portadaIdxRaw, 10) : null;
    if (portadaExistenteId || portadaIdx !== null) {
      producto.imagenes.forEach(img => { img.esPortada = false; });
      if (portadaExistenteId) {
        const portadaImg = producto.imagenes.find(i => String(i._id) === portadaExistenteId);
        if (portadaImg) portadaImg.esPortada = true;
      }
    }
    const files = (req.files as Express.Multer.File[]) || [];
    const hayPortada = producto.imagenes.some(img => img.esPortada);
    const baseLen = producto.imagenes.length;
    for (let idx = 0; idx < files.length; idx++) {
      const file = files[idx];
      const { publicId } = await uploadToCloudinary(file.buffer, 'products');
      producto.imagenes.push({
        _id:           new Types.ObjectId(),
        nombreArchivo: publicId,
        color:         req.body[`color_${idx}`] || null,
        esPortada:     portadaIdx !== null ? idx === portadaIdx : (!hayPortada && idx === 0),
        orden:         baseLen + idx,
      });
    }

    await producto.save();
    res.json(producto);
  } catch (err) { next(err); }
}

// DELETE /api/products/:id
export async function deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const producto = await Product.findById(req.params['id']);
    if (!producto) { res.status(404).json({ error: 'Producto no encontrado.' }); return; }

    for (const img of producto.imagenes) {
      await deleteFromCloudinary(img.nombreArchivo);
    }

    await producto.deleteOne();
    res.json({ message: 'Producto eliminado correctamente.' });
  } catch (err) { next(err); }
}

// DELETE /api/products/:id/images/:imgId
export async function deleteProductImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const producto = await Product.findById(req.params['id']);
    if (!producto) { res.status(404).json({ error: 'Producto no encontrado.' }); return; }

    const imgIndex = producto.imagenes.findIndex(img => String(img._id) === req.params['imgId']);
    if (imgIndex === -1) { res.status(404).json({ error: 'Imagen no encontrada.' }); return; }

    const img = producto.imagenes[imgIndex];
    await deleteFromCloudinary(img.nombreArchivo);

    producto.imagenes.splice(imgIndex, 1);
    if (img.esPortada && producto.imagenes.length > 0) producto.imagenes[0].esPortada = true;

    await producto.save();
    res.json({ message: 'Imagen eliminada.', imagenes: producto.imagenes });
  } catch (err) { next(err); }
}
