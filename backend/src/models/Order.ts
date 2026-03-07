import { Schema, model, Document, Types } from 'mongoose';

export type EstadoPedido = 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado';

export interface IOrderItem {
  producto?: Types.ObjectId;
  nombre: string;
  talla?: string;
  color?: string;
  precioUnit: number;
  cantidad: number;
  subtotal: number;
}

export interface IOrder extends Document {
  codigo: string;
  nombreCliente?: string;
  telefono?: string;
  estado: EstadoPedido;
  total: number;
  notas?: string;
  items: IOrderItem[];
  creadoEn: Date;
  actualizadoEn: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    producto:   { type: Schema.Types.ObjectId, ref: 'Product', default: null },
    nombre:     { type: String, required: true, maxlength: 150 },
    talla:      { type: String, default: null },
    color:      { type: String, default: null },
    precioUnit: { type: Number, required: true },
    cantidad:   { type: Number, required: true, min: 1 },
    subtotal:   { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    codigo:        { type: String, required: true, unique: true },
    nombreCliente: { type: String, default: null },
    telefono:      { type: String, default: null },
    estado:        {
      type: String,
      enum: ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'],
      default: 'pendiente',
    },
    total:         { type: Number, required: true, default: 0 },
    notas:         { type: String, default: null },
    items:         { type: [orderItemSchema], default: [] },
    creadoEn:      { type: Date, default: Date.now },
    actualizadoEn: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

orderSchema.index({ estado: 1 });
orderSchema.index({ creadoEn: -1 });

orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const year = new Date().getFullYear();
    const count = await Order.countDocuments();
    this.codigo = `LAG-${year}${String(count + 1).padStart(4, '0')}`;
  }
  this.actualizadoEn = new Date();
  next();
});

export const Order = model<IOrder>('Order', orderSchema);
