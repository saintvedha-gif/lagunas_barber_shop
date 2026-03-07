import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose, { Types } from 'mongoose';
import { connectDB } from './config/database';
import { Admin } from './models/Admin';
import { Category, ICategory } from './models/Category';
import { Product } from './models/Product';
import { BarberService } from './models/BarberService';

/* ───────────────────────────────────────────────────────────────────────────
   SEED — Laguna's Barber & Shop
   Crea: admin, categorías, 10 ropa, 10 cosméticos, 10 servicios barbería.
   Es idempotente: si los datos ya existen, no los duplica.
   ─────────────────────────────────────────────────────────────────────────── */

async function seed(): Promise<void> {
  await connectDB();

  // ── 1. Admin ────────────────────────────────────────────────────────────
  const existeAdmin = await Admin.findOne({ usuario: 'admin' });
  if (!existeAdmin) {
    const hash = await bcrypt.hash('Admin2025!', 12);
    await Admin.create({
      usuario:      'admin',
      passwordHash: hash,
      nombre:       'Administrador Principal',
    });
    console.log('✅ Admin creado  →  usuario: admin | contraseña: Admin2025!');
  } else {
    console.log('ℹ️  Admin ya existe, se omite.');
  }

  // ── 2. Categorías ──────────────────────────────────────────────────────
  const catDefs = [
    { nombre: 'Camisas',          seccion: 'ropa',      subcategorias: ['Oversize', 'Slim Fit', 'Estampadas'] },
    { nombre: 'Bermudas',         seccion: 'ropa',      subcategorias: ['Cargo', 'Denim', 'Clásicas'] },
    { nombre: 'Gorras',           seccion: 'ropa',      subcategorias: ['Snapback', 'Trucker', 'Dad Hat'] },
    { nombre: 'Accesorios',       seccion: 'ropa',      subcategorias: ['Cadenas', 'Pulseras', 'Lentes'] },
    { nombre: 'Shampoo',          seccion: 'cosmetico', subcategorias: ['Anticaída', 'Hidratante', 'Anticaspa'] },
    { nombre: 'Ceras y Pomadas',  seccion: 'cosmetico', subcategorias: ['Brillo alto', 'Efecto mate', 'Fijación fuerte'] },
    { nombre: 'Aceites de Barba', seccion: 'cosmetico', subcategorias: ['Con vitamina E', 'Aroma madera', 'Ultra hidratante'] },
    { nombre: 'Colonias',         seccion: 'cosmetico', subcategorias: ['After Shave', 'Eau de Cologne', 'Spray corporal'] },
  ] as const;

  const catMap: Record<string, ICategory> = {};
  for (const def of catDefs) {
    let cat = await Category.findOne({ nombre: def.nombre });
    if (!cat) {
      cat = await Category.create({
        nombre:        def.nombre,
        seccion:       def.seccion,
        subcategorias: [...def.subcategorias],
      });
      console.log(`✅ Categoría: ${def.nombre} (${def.seccion})`);
    } else {
      // Asegurar subcategorías
      const missing = def.subcategorias.filter(s => !cat!.subcategorias.includes(s));
      if (missing.length) {
        cat.subcategorias.push(...missing);
        await cat.save();
      }
    }
    catMap[def.nombre] = cat;
  }

  // ── 3. Productos de Ropa (10) ──────────────────────────────────────────
  const ropaData = [
    {
      nombre: 'Camiseta Oversize Urban Black',
      categoria: 'Camisas',
      precio: 65000,
      precioAnterior: 85000,
      enOferta: true,
      stock: 22,
      tallas: ['S', 'M', 'L', 'XL', 'XXL'],
      colores: ['Negro', 'Blanco'],
      descripcion: 'Camiseta oversize con caída relajada y algodón 100% premium. Estampado minimalista en el pecho.',
    },
    {
      nombre: 'Camisa Slim Fit Cuadros Barbershop',
      categoria: 'Camisas',
      precio: 95000,
      stock: 14,
      tallas: ['S', 'M', 'L', 'XL'],
      colores: ['Rojo', 'Azul marino'],
      descripcion: 'Camisa slim fit de franela a cuadros estilo barbero clásico. Perfecta para el día a día.',
    },
    {
      nombre: 'Bermuda Cargo Tactical Khaki',
      categoria: 'Bermudas',
      precio: 78000,
      precioAnterior: 95000,
      enOferta: true,
      stock: 18,
      tallas: ['28', '30', '32', '34', '36'],
      colores: ['Khaki', 'Negro', 'Verde oliva'],
      descripcion: 'Bermuda cargo con 6 bolsillos funcionales. Tela ripstop resistente y ligera.',
    },
    {
      nombre: 'Bermuda Denim Vintage Destroyed',
      categoria: 'Bermudas',
      precio: 72000,
      stock: 10,
      tallas: ['28', '30', '32', '34'],
      colores: ['Azul claro', 'Azul oscuro'],
      descripcion: 'Bermuda jean con efecto rasgado sutil. Algodón con elastano para mayor comodidad.',
    },
    {
      nombre: 'Gorra Snapback Laguna\'s Edition',
      categoria: 'Gorras',
      precio: 45000,
      stock: 30,
      tallas: ['Única'],
      colores: ['Negro/Dorado', 'Blanco/Negro', 'Rojo/Negro'],
      descripcion: 'Gorra edición limitada con logo Laguna\'s bordado en 3D. Ajuste snapback.',
    },
    {
      nombre: 'Gorra Trucker Barbershop Vintage',
      categoria: 'Gorras',
      precio: 38000,
      precioAnterior: 48000,
      enOferta: true,
      stock: 3,
      tallas: ['Única'],
      colores: ['Negro', 'Gris'],
      descripcion: 'Gorra trucker con malla transpirable y diseño retro de barbería. Ajuste trasero de broche.',
    },
    {
      nombre: 'Cadena Cubana Acero Inoxidable 60cm',
      categoria: 'Accesorios',
      precio: 55000,
      stock: 12,
      tallas: [],
      colores: ['Plata', 'Dorado'],
      descripcion: 'Cadena cubana de eslabón grueso en acero inoxidable 316L. Resistente al agua y a la oxidación.',
    },
    {
      nombre: 'Lentes de Sol Aviador Polarizados',
      categoria: 'Accesorios',
      precio: 68000,
      precioAnterior: 85000,
      enOferta: true,
      stock: 8,
      tallas: [],
      colores: ['Negro/Dorado', 'Negro/Plata'],
      descripcion: 'Lentes aviador con protección UV400 y lentes polarizados. Marco metálico premium.',
    },
    {
      nombre: 'Hoodie Oversize Laguna\'s Logo Chest',
      categoria: 'Camisas',
      precio: 120000,
      stock: 15,
      tallas: ['M', 'L', 'XL', 'XXL'],
      colores: ['Negro', 'Gris Oxford'],
      descripcion: 'Sudadera oversize con capucha y bolsillo canguro. Logo bordado en pecho. Franela interior.',
    },
    {
      nombre: 'Pulsera Trenzada Cuero y Acero',
      categoria: 'Accesorios',
      precio: 32000,
      stock: 25,
      tallas: [],
      colores: ['Marrón/Plata', 'Negro/Dorado'],
      descripcion: 'Pulsera de cuero trenzado genuino con cierre magnético de acero inoxidable. Estilo masculino.',
    },
  ];

  const existingRopa = await Product.countDocuments({ seccion: 'ropa' });
  if (existingRopa === 0) {
    for (let i = 0; i < ropaData.length; i++) {
      const d = ropaData[i];
      await Product.create({
        nombre:         d.nombre,
        seccion:        'ropa',
        categoria:      catMap[d.categoria]?._id ?? null,
        precio:         d.precio,
        precioAnterior: d.precioAnterior ?? null,
        enOferta:       d.enOferta ?? false,
        stock:          d.stock,
        tallas:         d.tallas,
        colores:        d.colores,
        descripcion:    d.descripcion,
        imagenes:       [],
      });
      console.log(`  👕 Ropa #${i + 1}: ${d.nombre}`);
    }
    console.log('✅ 10 productos de ropa creados');
  } else {
    console.log(`ℹ️  Ya hay ${existingRopa} productos de ropa, se omite.`);
  }

  // ── 4. Productos Cosméticos (10) ───────────────────────────────────────
  const cosmeticosData = [
    {
      nombre: 'Shampoo Anticaída con Biotina y Keratina 400ml',
      categoria: 'Shampoo',
      precio: 42000,
      stock: 35,
      descripcion: 'Fórmula con biotina, keratina y extracto de romero. Fortalece desde la raíz y reduce la caída.',
    },
    {
      nombre: 'Shampoo Carbón Activado Detox 300ml',
      categoria: 'Shampoo',
      precio: 38000,
      precioAnterior: 48000,
      enOferta: true,
      stock: 20,
      descripcion: 'Limpieza profunda con carbón activado. Elimina grasa y residuos sin resecar el cabello.',
    },
    {
      nombre: 'Pomada Mate Fijación Extrema 120g',
      categoria: 'Ceras y Pomadas',
      precio: 35000,
      stock: 28,
      descripcion: 'Acabado mate natural con fijación fuerte todo el día. Reformulable con agua. Aroma cítrico.',
    },
    {
      nombre: 'Cera Brillo Premium Water-Based 100g',
      categoria: 'Ceras y Pomadas',
      precio: 32000,
      stock: 22,
      descripcion: 'Pomada a base de agua con brillo alto y fijación media. Ideal para peinados clásicos tipo slick back.',
    },
    {
      nombre: 'Aceite de Barba Premium Sándalo y Cedro 50ml',
      categoria: 'Aceites de Barba',
      precio: 48000,
      precioAnterior: 60000,
      enOferta: true,
      stock: 16,
      descripcion: 'Mezcla de aceite de argán, jojoba y vitamina E. Aroma amaderado de sándalo y cedro.',
    },
    {
      nombre: 'Bálsamo Suavizante para Barba 60g',
      categoria: 'Aceites de Barba',
      precio: 38000,
      stock: 19,
      descripcion: 'Bálsamo con manteca de karité y cera de abejas. Doma, hidrata y da forma a la barba.',
    },
    {
      nombre: 'Colonia After Shave Classic 250ml',
      categoria: 'Colonias',
      precio: 28000,
      stock: 40,
      descripcion: 'After shave clásico de barbería con mentol y aloe vera. Refresca, tonifica y desinfecta.',
    },
    {
      nombre: 'Eau de Cologne Sport Fresh 200ml',
      categoria: 'Colonias',
      precio: 52000,
      precioAnterior: 65000,
      enOferta: true,
      stock: 2,
      descripcion: 'Fragancia fresca deportiva con notas de limón, vetiver y almizcle blanco. Duración 6-8h.',
    },
    {
      nombre: 'Kit Cuidado Barba Completo (Aceite + Bálsamo + Peine)',
      categoria: 'Aceites de Barba',
      precio: 85000,
      precioAnterior: 110000,
      enOferta: true,
      stock: 10,
      descripcion: 'Kit premium con aceite de argán 30ml, bálsamo suavizante 40g y peine de madera artesanal.',
    },
    {
      nombre: 'Spray Fijador Texturizante Sea Salt 200ml',
      categoria: 'Ceras y Pomadas',
      precio: 30000,
      stock: 30,
      descripcion: 'Spray con sal marina para textura playera y volumen. Fijación ligera y acabado mate natural.',
    },
  ];

  const existingCos = await Product.countDocuments({ seccion: 'cosmetico' });
  if (existingCos === 0) {
    for (let i = 0; i < cosmeticosData.length; i++) {
      const d = cosmeticosData[i];
      await Product.create({
        nombre:         d.nombre,
        seccion:        'cosmetico',
        categoria:      catMap[d.categoria]?._id ?? null,
        precio:         d.precio,
        precioAnterior: d.precioAnterior ?? null,
        enOferta:       d.enOferta ?? false,
        stock:          d.stock,
        tallas:         [],
        colores:        [],
        descripcion:    d.descripcion,
        imagenes:       [],
      });
      console.log(`  🧴 Cosmético #${i + 1}: ${d.nombre}`);
    }
    console.log('✅ 10 productos cosméticos creados');
  } else {
    console.log(`ℹ️  Ya hay ${existingCos} cosméticos, se omite.`);
  }

  // ── 5. Servicios de Barbería (10) ──────────────────────────────────────
  const serviciosData = [
    { nombre: 'Corte Clásico',            precio: 20000, descripcion: 'Corte tradicional con tijera y máquina. Incluye lavado y secado.' },
    { nombre: 'Corte Fade / Degradado',   precio: 25000, descripcion: 'Degradado bajo, medio o alto a elección. Acabado impecable con navaja.' },
    { nombre: 'Corte + Barba Completa',   precio: 40000, descripcion: 'Corte de cabello + perfilado y afeitado de barba con toalla caliente y aceite.' },
    { nombre: 'Afeitado Clásico Navaja',  precio: 22000, descripcion: 'Afeitado al ras con navaja barbera, toalla caliente, pre-shave y after shave.' },
    { nombre: 'Diseño de Barba',          precio: 18000, descripcion: 'Perfilado y diseño de barba con navaja. Definición de líneas y contornos.' },
    { nombre: 'Corte Infantil (3-12 años)', precio: 15000, descripcion: 'Corte para niños con paciencia y cariño. Todos los estilos.' },
    { nombre: 'Cejas (Perfilado)',        precio: 10000, descripcion: 'Definición de cejas con navaja para look limpio y simétrico.' },
    { nombre: 'Tratamiento Capilar Hidratante', precio: 35000, descripcion: 'Masaje craneal con aceites esenciales + mascarilla hidratante profunda 15 min.' },
    { nombre: 'Black Mask Facial',        precio: 15000, descripcion: 'Mascarilla negra de carbón activado para limpieza profunda de poros. 10 min.' },
    { nombre: 'Combo VIP (Corte + Barba + Cejas + Black Mask)', precio: 65000, descripcion: 'El paquete completo: corte, barba con navaja, cejas y mascarilla facial. La experiencia Laguna\'s.' },
  ];

  const existingSrv = await BarberService.countDocuments();
  if (existingSrv === 0) {
    for (let i = 0; i < serviciosData.length; i++) {
      const d = serviciosData[i];
      await BarberService.create({
        nombre:      d.nombre,
        precio:      d.precio,
        descripcion: d.descripcion,
        orden:       i,
      });
      console.log(`  ✂️  Servicio #${i + 1}: ${d.nombre}`);
    }
    console.log('✅ 10 servicios de barbería creados');
  } else {
    console.log(`ℹ️  Ya hay ${existingSrv} servicios, se omite.`);
  }

  console.log('\n🎉 Seed completado.');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Error en seed:', err);
  process.exit(1);
});
