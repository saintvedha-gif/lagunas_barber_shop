/**
 * Seed via API — Llena la base de datos usando los endpoints del deploy.
 *
 * Uso:  npx ts-node src/seed-api.ts
 *
 * Requiere que el backend esté corriendo (usa el deploy de Render).
 */

const BASE = 'https://lagunas-barber-shop.onrender.com/api';

/* ─── helpers ─────────────────────────────────────────────────────────── */

let TOKEN = '';

async function api<T = unknown>(
  method: string,
  path: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const headers: Record<string, string> = {};
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;
  if (body)  headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data: T;
  try { data = JSON.parse(text); } catch { data = text as unknown as T; }

  if (!res.ok) {
    const msg = typeof data === 'object' && data !== null && 'error' in data
      ? (data as { error: string }).error
      : text;
    // 409 = duplicado → lo tratamos como no-error (idempotente)
    if (res.status === 409) {
      console.log(`   ⚠️  Ya existe: ${msg}`);
      return data;
    }
    throw new Error(`${method} ${path} → ${res.status}: ${msg}`);
  }
  return data;
}

/* ─── login ───────────────────────────────────────────────────────────── */

async function login(): Promise<void> {
  const res = await api<{ token: string }>('POST', '/auth/login', {
    usuario: 'admin',
    password: 'Admin2025!',
  });
  TOKEN = res.token;
  console.log('🔑 Login exitoso\n');
}

/* ─── categorías ──────────────────────────────────────────────────────── */

interface CatResponse { _id: string; nombre: string; seccion: string; subcategorias: string[] }

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

const catMap: Record<string, string> = {}; // nombre → _id

async function seedCategories(): Promise<void> {
  console.log('📂 Categorías');

  // Obtener existentes primero
  const existing = await api<CatResponse[]>('GET', '/categories');
  for (const cat of existing) catMap[cat.nombre] = cat._id;

  for (const def of catDefs) {
    if (!catMap[def.nombre]) {
      const created = await api<CatResponse>('POST', '/categories', {
        nombre: def.nombre,
        seccion: def.seccion,
      });
      if (created._id) {
        catMap[def.nombre] = created._id;
        console.log(`   ✅ ${def.nombre} (${def.seccion})`);
      }
    } else {
      console.log(`   ℹ️  ${def.nombre} ya existe`);
    }

    // Añadir subcategorías faltantes
    const catId = catMap[def.nombre];
    if (!catId) continue;
    const existing2 = (await api<CatResponse[]>('GET', '/categories')).find(c => c._id === catId);
    const existingSubs = existing2?.subcategorias ?? [];

    for (const sub of def.subcategorias) {
      if (!existingSubs.includes(sub)) {
        await api('POST', `/categories/${catId}/subcategorias`, { nombre: sub });
        console.log(`      + subcategoría: ${sub}`);
      }
    }
  }
  console.log('');
}

/* ─── productos ropa ──────────────────────────────────────────────────── */

const ropaData = [
  {
    nombre: 'Camiseta Oversize Urban Black',
    categoria: 'Camisas',
    precio: 65000,
    precioAnterior: 85000,
    enOferta: true,
    stock: 22,
    tallas: 'S,M,L,XL,XXL',
    colores: 'Negro,Blanco',
    descripcion: 'Camiseta oversize con caída relajada y algodón 100% premium. Estampado minimalista en el pecho.',
  },
  {
    nombre: 'Camisa Slim Fit Cuadros Barbershop',
    categoria: 'Camisas',
    precio: 95000,
    stock: 14,
    tallas: 'S,M,L,XL',
    colores: 'Rojo,Azul marino',
    descripcion: 'Camisa slim fit de franela a cuadros estilo barbero clásico. Perfecta para el día a día.',
  },
  {
    nombre: 'Bermuda Cargo Tactical Khaki',
    categoria: 'Bermudas',
    precio: 78000,
    precioAnterior: 95000,
    enOferta: true,
    stock: 18,
    tallas: '28,30,32,34,36',
    colores: 'Khaki,Negro,Verde oliva',
    descripcion: 'Bermuda cargo con 6 bolsillos funcionales. Tela ripstop resistente y ligera.',
  },
  {
    nombre: 'Bermuda Denim Vintage Destroyed',
    categoria: 'Bermudas',
    precio: 72000,
    stock: 10,
    tallas: '28,30,32,34',
    colores: 'Azul claro,Azul oscuro',
    descripcion: 'Bermuda jean con efecto rasgado sutil. Algodón con elastano para mayor comodidad.',
  },
  {
    nombre: "Gorra Snapback Laguna's Edition",
    categoria: 'Gorras',
    precio: 45000,
    stock: 30,
    tallas: 'Única',
    colores: 'Negro/Dorado,Blanco/Negro,Rojo/Negro',
    descripcion: "Gorra edición limitada con logo Laguna's bordado en 3D. Ajuste snapback.",
  },
  {
    nombre: 'Gorra Trucker Barbershop Vintage',
    categoria: 'Gorras',
    precio: 38000,
    precioAnterior: 48000,
    enOferta: true,
    stock: 3,
    tallas: 'Única',
    colores: 'Negro,Gris',
    descripcion: 'Gorra trucker con malla transpirable y diseño retro de barbería. Ajuste trasero de broche.',
  },
  {
    nombre: 'Cadena Cubana Acero Inoxidable 60cm',
    categoria: 'Accesorios',
    precio: 55000,
    stock: 12,
    tallas: '',
    colores: 'Plata,Dorado',
    descripcion: 'Cadena cubana de eslabón grueso en acero inoxidable 316L. Resistente al agua y a la oxidación.',
  },
  {
    nombre: 'Lentes de Sol Aviador Polarizados',
    categoria: 'Accesorios',
    precio: 68000,
    precioAnterior: 85000,
    enOferta: true,
    stock: 8,
    tallas: '',
    colores: 'Negro/Dorado,Negro/Plata',
    descripcion: 'Lentes aviador con protección UV400 y lentes polarizados. Marco metálico premium.',
  },
  {
    nombre: "Hoodie Oversize Laguna's Logo Chest",
    categoria: 'Camisas',
    precio: 120000,
    stock: 15,
    tallas: 'M,L,XL,XXL',
    colores: 'Negro,Gris Oxford',
    descripcion: 'Sudadera oversize con capucha y bolsillo canguro. Logo bordado en pecho. Franela interior.',
  },
  {
    nombre: 'Pulsera Trenzada Cuero y Acero',
    categoria: 'Accesorios',
    precio: 32000,
    stock: 25,
    tallas: '',
    colores: 'Marrón/Plata,Negro/Dorado',
    descripcion: 'Pulsera de cuero trenzado genuino con cierre magnético de acero inoxidable. Estilo masculino.',
  },
];

/* ─── productos cosméticos ────────────────────────────────────────────── */

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

/* ─── servicios de barbería ───────────────────────────────────────────── */

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
  { nombre: "Combo VIP (Corte + Barba + Cejas + Black Mask)", precio: 65000, descripcion: "El paquete completo: corte, barba con navaja, cejas y mascarilla facial. La experiencia Laguna's." },
];

/* ─── seed de productos (genérico) ────────────────────────────────────── */

async function seedProducts(
  seccion: 'ropa' | 'cosmetico',
  items: typeof ropaData,
  emoji: string,
): Promise<void> {
  console.log(`${emoji} Productos ${seccion}`);

  // Verificar si ya existen suficientes
  const check = await api<{ total: number; productos: { nombre: string }[] }>(
    'GET', `/products?seccion=${seccion}&limit=50`,
  );
  if (check.total >= items.length) {
    console.log(`   ℹ️  Ya hay ${check.total} productos de ${seccion}, se omite.\n`);
    return;
  }
  const existingNames = new Set(check.productos.map(p => p.nombre));

  for (let i = 0; i < items.length; i++) {
    const d = items[i];
    if (existingNames.has(d.nombre)) {
      console.log(`   ℹ️  #${i + 1}: ${d.nombre} ya existe`);
      continue;
    }
    // El endpoint usa multer (multipart), pero si no mandamos archivos
    // podemos mandar JSON porque multer lo deja pasar (campos de texto).
    // Usaremos FormData nativa de Node 18+.
    const form = new FormData();
    form.append('nombre', d.nombre);
    form.append('seccion', seccion);
    if (catMap[d.categoria]) form.append('categoria', catMap[d.categoria]);
    form.append('precio', String(d.precio));
    if (d.precioAnterior) form.append('precioAnterior', String(d.precioAnterior));
    if (d.enOferta) form.append('enOferta', '1');
    form.append('stock', String(d.stock));
    if ('tallas' in d && d.tallas) form.append('tallas', d.tallas);
    if ('colores' in d && d.colores) form.append('colores', d.colores);
    form.append('descripcion', d.descripcion);

    const res = await fetch(`${BASE}/products`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TOKEN}` },
      body: form,
    });

    if (!res.ok) {
      const err = await res.text();
      console.log(`   ❌ ${d.nombre}: ${err}`);
    } else {
      console.log(`   ✅ #${i + 1}: ${d.nombre}`);
    }
  }
  console.log('');
}

/* ─── seed de servicios ───────────────────────────────────────────────── */

async function seedServices(): Promise<void> {
  console.log('✂️  Servicios');

  // Verificar existentes
  const existing = await api<{ nombre: string }[]>('GET', '/barber/services');
  if (existing.length > 0) {
    console.log(`   ℹ️  Ya hay ${existing.length} servicios, se omite.\n`);
    return;
  }

  for (let i = 0; i < serviciosData.length; i++) {
    const d = serviciosData[i];
    await api('POST', '/barber/services', {
      nombre: d.nombre,
      precio: d.precio,
      descripcion: d.descripcion,
    });
    console.log(`   ✅ #${i + 1}: ${d.nombre}`);
  }
  console.log('');
}

/* ─── main ────────────────────────────────────────────────────────────── */

async function main(): Promise<void> {
  console.log(`\n🌱 Seed API → ${BASE}\n`);

  await login();
  await seedCategories();
  await seedProducts('ropa', ropaData, '👕');
  await seedProducts('cosmetico', cosmeticosData as typeof ropaData, '🧴');
  await seedServices();

  console.log('🎉 Seed completado exitosamente.');
}

main().catch(err => {
  console.error('❌ Error:', err.message ?? err);
  process.exit(1);
});
