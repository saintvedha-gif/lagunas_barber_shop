import { Request, Response } from 'express';
import { Order, EstadoPedido } from '../models/Order';

const ESTADOS_VALIDOS: EstadoPedido[] = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'];

// GET /api/orders
export async function getOrders(req: Request, res: Response): Promise<void> {
  const { estado, page = '1', limit = '20' } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};
  if (estado) filter['estado'] = estado;

  const pageNum  = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, parseInt(limit, 10));

  const [pedidos, total] = await Promise.all([
    Order.find(filter).sort({ creadoEn: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    Order.countDocuments(filter),
  ]);

  res.json({ pedidos, total, page: pageNum, limit: limitNum });
}

// GET /api/orders/:id
export async function getOrder(req: Request, res: Response): Promise<void> {
  const pedido = await Order.findById(req.params['id']);
  if (!pedido) { res.status(404).json({ error: 'Pedido no encontrado.' }); return; }
  res.json(pedido);
}

// POST /api/orders  (cliente — sin auth)
export async function createOrder(req: Request, res: Response): Promise<void> {
  const { nombreCliente, telefono, notas, items } = req.body as {
    nombreCliente?: string;
    telefono?: string;
    notas?: string;
    items?: Array<{ producto?: string; nombre: string; talla?: string; color?: string; precioUnit: number; cantidad: number }>;
  };

  if (!items || items.length === 0) {
    res.status(400).json({ error: 'El pedido debe tener al menos un item.' });
    return;
  }

  const itemsConSubtotal = items.map(item => ({ ...item, subtotal: item.precioUnit * item.cantidad }));
  const total = itemsConSubtotal.reduce((acc, item) => acc + item.subtotal, 0);

  const pedido = await Order.create({
    nombreCliente: nombreCliente?.trim() || null,
    telefono:      telefono?.trim() || null,
    notas:         notas?.trim() || null,
    items:         itemsConSubtotal,
    total,
  });

  res.status(201).json(pedido);
}

// PUT /api/orders/:id/status
export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  const { estado } = req.body as { estado?: string };

  if (!estado || !ESTADOS_VALIDOS.includes(estado as EstadoPedido)) {
    res.status(400).json({ error: `Estado inválido. Valores válidos: ${ESTADOS_VALIDOS.join(', ')}` });
    return;
  }

  const pedido = await Order.findByIdAndUpdate(
    req.params['id'],
    { estado, actualizadoEn: new Date() },
    { new: true }
  );

  if (!pedido) { res.status(404).json({ error: 'Pedido no encontrado.' }); return; }
  res.json(pedido);
}
