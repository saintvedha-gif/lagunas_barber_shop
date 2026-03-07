import { Schema, model, Document } from 'mongoose';

export type MediaTipo = 'imagen' | 'video';

export interface IBarberMedia extends Document {
  tipo: MediaTipo;
  nombreArchivo?: string;
  urlVideo?: string;
  titulo?: string;
  activo: boolean;
  orden: number;
}

const barberMediaSchema = new Schema<IBarberMedia>(
  {
    tipo:          { type: String, enum: ['imagen', 'video'], required: true },
    nombreArchivo: { type: String, default: null },
    urlVideo:      { type: String, default: null },
    titulo:        { type: String, default: null, maxlength: 200 },
    activo:        { type: Boolean, default: true },
    orden:         { type: Number, default: 0 },
  },
  { versionKey: false }
);

barberMediaSchema.index({ activo: 1, orden: 1 });

export const BarberMedia = model<IBarberMedia>('BarberMedia', barberMediaSchema);
