import { Schema, model, Document } from 'mongoose';

export interface IAccessLog extends Document {
  usuario: string;
  ip: string;
  exitoso: boolean;
  userAgent?: string;
  intentadoEn: Date;
}

const accessLogSchema = new Schema<IAccessLog>(
  {
    usuario:     { type: String, required: true, maxlength: 60 },
    ip:          { type: String, required: true, maxlength: 45 },
    exitoso:     { type: Boolean, default: false },
    userAgent:   { type: String, default: null, maxlength: 300 },
    intentadoEn: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

accessLogSchema.index({ usuario: 1 });
accessLogSchema.index({ ip: 1 });
accessLogSchema.index({ intentadoEn: -1 });

export const AccessLog = model<IAccessLog>('AccessLog', accessLogSchema);
