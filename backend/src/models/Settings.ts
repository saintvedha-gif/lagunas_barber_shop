import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  clave: string;
  valor: string;
  descripcion?: string;
}

const SettingsSchema = new Schema<ISettings>(
  {
    clave:       { type: String, required: true, unique: true, trim: true },
    valor:       { type: String, required: true },
    descripcion: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<ISettings>('Settings', SettingsSchema);
