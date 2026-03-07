import { Schema, model, Document } from 'mongoose';

export interface IAdmin extends Document {
  usuario: string;
  passwordHash: string;
  nombre: string;
  activo: boolean;
  ultimoAcceso?: Date;
  creadoEn: Date;
}

const adminSchema = new Schema<IAdmin>(
  {
    usuario:      { type: String, required: true, unique: true, trim: true, maxlength: 60 },
    passwordHash: { type: String, required: true },
    nombre:       { type: String, required: true, default: '', maxlength: 100 },
    activo:       { type: Boolean, default: true },
    ultimoAcceso: { type: Date, default: null },
    creadoEn:     { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const Admin = model<IAdmin>('Admin', adminSchema);
