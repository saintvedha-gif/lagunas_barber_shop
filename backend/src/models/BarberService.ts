import { Schema, model, Document } from 'mongoose';

export interface IBarberService extends Document {
  nombre: string;
  precio: number;
  descripcion?: string;
  activo: boolean;
  orden: number;
}

const barberServiceSchema = new Schema<IBarberService>(
  {
    nombre:      { type: String, required: true, trim: true, maxlength: 100 },
    precio:      { type: Number, required: true, min: 0 },
    descripcion: { type: String, default: null },
    activo:      { type: Boolean, default: true },
    orden:       { type: Number, default: 0 },
  },
  { versionKey: false }
);

barberServiceSchema.index({ activo: 1, orden: 1 });

export const BarberService = model<IBarberService>('BarberService', barberServiceSchema);
