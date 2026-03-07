import { Schema, model, Document, Types } from 'mongoose';

export interface IProductImage {
  _id: Types.ObjectId;
  nombreArchivo: string;
  color?: string;
  esPortada: boolean;
  orden: number;
}

export interface IProduct extends Document {
  nombre: string;
  seccion: 'ropa' | 'cosmetico';
  categoria?: Types.ObjectId;
  precio: number;
  precioAnterior?: number;
  enOferta: boolean;
  stock: number;
  tallas?: string[];
  colores?: string[];
  descripcion?: string;
  activo: boolean;
  imagenes: IProductImage[];
  creadoEn: Date;
  actualizadoEn: Date;
}

const productImageSchema = new Schema<IProductImage>(
  {
    nombreArchivo: { type: String, required: true },
    color:         { type: String, default: null },
    esPortada:     { type: Boolean, default: false },
    orden:         { type: Number, default: 0 },
  },
  { _id: true }
);

const productSchema = new Schema<IProduct>(
  {
    nombre:         { type: String, required: true, trim: true, maxlength: 150 },
    seccion:        { type: String, enum: ['ropa', 'cosmetico'], required: true },
    categoria:      { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    precio:         { type: Number, required: true, min: 0 },
    precioAnterior: { type: Number, default: null },
    enOferta:       { type: Boolean, default: false },
    stock:          { type: Number, default: 0, min: 0 },
    tallas:         { type: [String], default: [] },
    colores:        { type: [String], default: [] },
    descripcion:    { type: String, default: null },
    activo:         { type: Boolean, default: true },
    imagenes:       { type: [productImageSchema], default: [] },
    creadoEn:       { type: Date, default: Date.now },
    actualizadoEn:  { type: Date, default: Date.now },
  },
  { versionKey: false }
);

productSchema.index({ seccion: 1 });
productSchema.index({ categoria: 1 });
productSchema.index({ enOferta: 1 });
productSchema.index({ activo: 1 });

productSchema.pre('save', function (next) {
  this.actualizadoEn = new Date();
  next();
});

export const Product = model<IProduct>('Product', productSchema);
