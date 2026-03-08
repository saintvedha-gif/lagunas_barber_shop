import { Schema, model, Document } from 'mongoose';

export interface IColor extends Document {
  nombre: string;
  hex: string;
}

const colorSchema = new Schema<IColor>(
  {
    nombre: { type: String, required: true, unique: true, trim: true, maxlength: 40 },
    hex:    { type: String, required: true, trim: true, maxlength: 9 },
  },
  { versionKey: false }
);

colorSchema.index({ nombre: 1 });

export const Color = model<IColor>('Color', colorSchema);
