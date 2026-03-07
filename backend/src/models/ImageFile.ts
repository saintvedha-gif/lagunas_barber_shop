import { Schema, model, Document } from 'mongoose';

export interface IImageFile extends Document {
  data: Buffer;
  contentType: string;
  originalName: string;
  size: number;
  creadoEn: Date;
}

const imageFileSchema = new Schema<IImageFile>(
  {
    data:         { type: Buffer, required: true },
    contentType:  { type: String, required: true },
    originalName: { type: String, required: true },
    size:         { type: Number, required: true },
    creadoEn:     { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const ImageFile = model<IImageFile>('ImageFile', imageFileSchema);
