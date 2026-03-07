import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin';
import { AccessLog } from '../models/AccessLog';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET     = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const MAX_INTENTOS   = 5;
const BLOQUEO_MS     = 5 * 60 * 1000;

function getIP(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    '0.0.0.0'
  );
}

async function intentosFallidos(ip: string): Promise<number> {
  const desde = new Date(Date.now() - BLOQUEO_MS);
  return AccessLog.countDocuments({ ip, exitoso: false, intentadoEn: { $gte: desde } });
}

// POST /api/auth/login
export async function login(req: Request, res: Response): Promise<void> {
  const ip = getIP(req);
  const ua = (req.headers['user-agent'] || '').slice(0, 300);

  const fallos = await intentosFallidos(ip);
  if (fallos >= MAX_INTENTOS) {
    res.status(429).json({ error: 'Demasiados intentos fallidos. Espera 5 minutos.' });
    return;
  }

  const { usuario, password } = req.body as { usuario?: string; password?: string };

  if (!usuario?.trim() || !password?.trim()) {
    res.status(400).json({ error: 'Completa todos los campos.' });
    return;
  }

  const admin = await Admin.findOne({ usuario: usuario.trim() });
  const esValido = admin && admin.activo && (await bcrypt.compare(password, admin.passwordHash));

  await AccessLog.create({ usuario: usuario.trim(), ip, exitoso: esValido ? true : false, userAgent: ua });

  if (!esValido) {
    res.status(401).json({ error: 'Credenciales incorrectas.' });
    return;
  }

  admin.ultimoAcceso = new Date();
  await admin.save();

  const token = jwt.sign({ adminId: String(admin._id) }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);

  res.json({ token, admin: { id: admin._id, usuario: admin.usuario, nombre: admin.nombre } });
}

// POST /api/auth/logout
export function logout(_req: Request, res: Response): void {
  res.json({ message: 'Sesión cerrada correctamente.' });
}

// POST /api/auth/change-password
export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  const { passwordActual, passwordNuevo } = req.body as {
    passwordActual?: string;
    passwordNuevo?: string;
  };

  if (!passwordActual?.trim() || !passwordNuevo?.trim()) {
    res.status(400).json({ error: 'Completa todos los campos.' });
    return;
  }

  if (passwordNuevo.length < 8) {
    res.status(400).json({ error: 'La contraseña nueva debe tener al menos 8 caracteres.' });
    return;
  }

  const admin = await Admin.findById(req.adminId);
  if (!admin) { res.status(404).json({ error: 'Administrador no encontrado.' }); return; }

  const coincide = await bcrypt.compare(passwordActual, admin.passwordHash);
  if (!coincide) { res.status(401).json({ error: 'La contraseña actual es incorrecta.' }); return; }

  admin.passwordHash = await bcrypt.hash(passwordNuevo, 12);
  await admin.save();
  res.json({ message: 'Contraseña actualizada correctamente.' });
}
