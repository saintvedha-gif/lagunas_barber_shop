import { Schema, model, Document } from 'mongoose';

export type Seccion = 'ropa' | 'cosmetico';

export interface ICategory extends Document {
  nombre: string;
  seccion: Seccion;
  activa: boolean;
}

const categorySchema = new Schema<ICategory>(
  {
    nombre:  { type: String, required: true, unique: true, trim: true, maxlength: 80 },
    seccion: { type: String, enum: ['ropa', 'cosmetico'], required: true },
    activa:  { type: Boolean, default: true },
  },
  { versionKey: false }
);

categorySchema.index({ seccion: 1 });

export const Category = model<ICategory>('Category', categorySchema);
