import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/database';
import { Admin } from './models/Admin';
import { Category } from './models/Category';

async function seed(): Promise<void> {
  await connectDB();

  // ── Admin ──────────────────────────────────────────────────
  const existe = await Admin.findOne({ usuario: 'admin' });
  if (!existe) {
    const hash = await bcrypt.hash('Admin2025!', 12);
    await Admin.create({
      usuario:      'admin',
      passwordHash: hash,
      nombre:       'Administrador Principal',
    });
    console.log('✅ Admin creado  →  usuario: admin | contraseña: Admin2025!');
    console.log('⚠️  ¡Cambia la contraseña inmediatamente después de hacer login!');
  } else {
    console.log('ℹ️  Admin ya existe, se omite.');
  }

  // ── Categorías ─────────────────────────────────────────────
  const cats = [
    { nombre: 'Camisas',          seccion: 'ropa' },
    { nombre: 'Bermudas',         seccion: 'ropa' },
    { nombre: 'Gorras',           seccion: 'ropa' },
    { nombre: 'Accesorios',       seccion: 'ropa' },
    { nombre: 'Shampoo',          seccion: 'cosmetico' },
    { nombre: 'Ceras y Pomadas',  seccion: 'cosmetico' },
    { nombre: 'Aceites de Barba', seccion: 'cosmetico' },
    { nombre: 'Colonias',         seccion: 'cosmetico' },
  ] as const;

  for (const cat of cats) {
    const existe = await Category.findOne({ nombre: cat.nombre });
    if (!existe) {
      await Category.create(cat);
      console.log(`✅ Categoría creada: ${cat.nombre} (${cat.seccion})`);
    }
  }

  console.log('\n🎉 Seed completado.');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Error en seed:', err);
  process.exit(1);
});
