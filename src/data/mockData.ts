import { PaintProduct, DiagnosticPreset, OrderStatus } from '../types';

export const HERO_IMAGE = '/src/assets/images/hero_paint_craftsmanship_1794286442660.jpg';
export const CANISTER_IMAGE = '/src/assets/images/product_pintuko_canister_1794286443085.jpg';
export const EPOXY_IMAGE = '/src/assets/images/gallery_epoxy_floor_1794286444257.jpg';
export const WALL_SAMPLE_IMAGE = '/src/assets/images/diagnostic_wall_sample_1794286443839.jpg';

export const PRODUCTS: PaintProduct[] = [
  {
    id: 'vin-01',
    name: 'Viniltex Avanzada Antibacterial',
    category: 'vinilos',
    categoryLabel: 'Vinilos Lavables',
    tagline: 'Máxima lavabilidad antibacterial con tecnología de microesferas cerámicas ultra resistentes.',
    price: 89900,
    originalPrice: 99000,
    rating: 4.9,
    reviewsCount: 342,
    image: CANISTER_IMAGE,
    features: [
      'Más de 10.000 ciclos de lavado sin alterar el color',
      'Cero olor y secado ultra rápido en 45 minutos',
      'Acción antibacterial y antihongos comprobada',
      'Poder cubriente superior en solo 2 manos'
    ],
    coveragePerGallon: 45,
    availableSizes: [
      { label: '1/4 Galón', multiplier: 0.32, sizeName: '1/4 Galón' },
      { label: '1 Galón', multiplier: 1, sizeName: '1 Galón' },
      { label: 'Cuñete 5 Gal', multiplier: 4.4, sizeName: 'Cuñete 5 Gal' }
    ],
    colors: [
      { name: 'Blanco Nieve Puro', hex: '#FFFFFF' },
      { name: 'Gris Ágata Nórdico', hex: '#CBD5E1' },
      { name: 'Arena Colonial', hex: '#E2D9C8' },
      { name: 'Azul Noche Profundo', hex: '#1E293B' },
      { name: 'Verde Eucalipto', hex: '#64748B' },
      { name: 'Amarillo Mostaza', hex: '#F59E0B' }
    ],
    finish: 'Mate',
    durabilityYears: 5,
    washability: 'Extrema',
    dilution: 'Agua potable limpia (máx. 10%)',
    dryingTime: '1 hora al tacto / 3 horas entre manos',
    inStock: true,
    recommendedFor: 'Salas, alcobas, comedores, clínicas y zonas infantiles.'
  },
  {
    id: 'fac-01',
    name: 'Koraza 5 Años Fachadas',
    category: 'fachadas',
    categoryLabel: 'Fachadas Exteriores',
    tagline: 'Barrera elastomérica hidrorrepelente con filtro solar UV y sellador de microfisuras.',
    price: 116900,
    originalPrice: 129000,
    rating: 4.8,
    reviewsCount: 189,
    image: CANISTER_IMAGE,
    features: [
      'Garantía certificada de fábrica por 5 años contra intemperie',
      'Sella microfisuras activas hasta de 0.8 mm',
      'Protección biocida anti-moho y anti-algas',
      'Alta repelencia al agua lluvia torrencial'
    ],
    coveragePerGallon: 38,
    availableSizes: [
      { label: '1/4 Galón', multiplier: 0.35, sizeName: '1/4 Galón' },
      { label: '1 Galón', multiplier: 1, sizeName: '1 Galón' },
      { label: 'Cuñete 5 Gal', multiplier: 4.35, sizeName: 'Cuñete 5 Gal' }
    ],
    colors: [
      { name: 'Blanco Hueso Fachada', hex: '#F1F5F9' },
      { name: 'Terracota Barichara', hex: '#A85547' },
      { name: 'Gris Grafito Exterior', hex: '#334155' },
      { name: 'Beige Sabana', hex: '#DDD6C6' },
      { name: 'Azul Cobalto', hex: '#2563EB' }
    ],
    finish: 'Semimate',
    durabilityYears: 5,
    washability: 'Extrema',
    dilution: 'No requiere dilución (aplicar directo)',
    dryingTime: '2 horas al tacto / 6 horas curado parcial',
    inStock: true,
    recommendedFor: 'Exteriores de casas, edificios, muros de revoque o ladrillo a la vista.'
  },
  {
    id: 'esm-01',
    name: 'Pintulux Esmalte 3 en 1',
    category: 'esmaltes',
    categoryLabel: 'Esmaltes Metales',
    tagline: 'Inhibidor activo de óxido, primario y acabado brillante en una sola aplicación directa.',
    price: 69900,
    originalPrice: 78000,
    rating: 4.7,
    reviewsCount: 224,
    image: CANISTER_IMAGE,
    features: [
      'Aplica directo sobre metal oxidado previamente cepillado',
      'Pigmentación anticorrosiva de fosfato de zinc',
      'Alto brillo y retención del color ante la intemperie',
      'Excelente nivelación para brocha, rodillo o pistola'
    ],
    coveragePerGallon: 42,
    availableSizes: [
      { label: '1/4 Galón', multiplier: 0.32, sizeName: '1/4 Galón' },
      { label: '1 Galón', multiplier: 1, sizeName: '1 Galón' },
      { label: 'Cuñete 5 Gal', multiplier: 4.2, sizeName: 'Cuñete 5 Gal' }
    ],
    colors: [
      { name: 'Negro Brillante Chasis', hex: '#0F172A' },
      { name: 'Blanco Puro Automotriz', hex: '#FFFFFF' },
      { name: 'Gris Platino', hex: '#94A3B8' },
      { name: 'Azul Real Intenso', hex: '#1D4ED8' },
      { name: 'Rojo Carmesí', hex: '#DC2626' },
      { name: 'Verde Bosque', hex: '#15803D' }
    ],
    finish: 'Brillante',
    durabilityYears: 4,
    washability: 'Alta',
    dilution: 'Thinner o Varsol desodorizado Pintuko (10%)',
    dryingTime: '2 horas al tacto / 8 horas secado duro',
    inStock: true,
    recommendedFor: 'Herrería, portones, rejas de seguridad, estructuras metálicas y maquinaria.'
  },
  {
    id: 'epo-01',
    name: 'Pintuko Epóxico Pisos 100% Sólidos',
    category: 'epoxicas',
    categoryLabel: 'Pintura Epóxica Pisos',
    tagline: 'Resistencia química al tráfico de montacargas, aceites, solventes y abrasión severa.',
    price: 189900,
    originalPrice: 215000,
    rating: 5.0,
    reviewsCount: 112,
    image: EPOXY_IMAGE,
    features: [
      'Resistencia a compresión de más de 850 kg/cm²',
      'Acabado espejo autonivelante de fácil desinfección',
      'Apto para clínicas, talleres automotrices y plantas de alimentos',
      'Incluye componente A (resina) y componente B (catalizador poliamida)'
    ],
    coveragePerGallon: 28,
    availableSizes: [
      { label: '1/4 Galón', multiplier: 0.38, sizeName: '1/4 Galón' },
      { label: '1 Galón', multiplier: 1, sizeName: '1 Galón' },
      { label: 'Cuñete 5 Gal', multiplier: 4.5, sizeName: 'Cuñete 5 Gal' }
    ],
    colors: [
      { name: 'Gris Maquinaria', hex: '#64748B' },
      { name: 'Gris Perla Industrial', hex: '#94A3B8' },
      { name: 'Verde Sanitario', hex: '#059669' },
      { name: 'Amarillo Seguridad Vial', hex: '#EAB308' },
      { name: 'Azul Señalización', hex: '#2563EB' }
    ],
    finish: 'Brillante',
    durabilityYears: 10,
    washability: 'Industrial',
    dilution: 'Ajustador Epóxico Pintuko (5-8%)',
    dryingTime: '4 horas al tacto / 24 horas tráfico liviano / 72h curado total',
    inStock: true,
    recommendedFor: 'Parqueaderos, bodegas logísticas, clínicas, laboratorios y concesionarios.'
  },
  {
    id: 'imp-01',
    name: 'TechoShield Fibrado 10 Años',
    category: 'impermeabilizacion',
    categoryLabel: 'Impermeabilización',
    tagline: 'Membrana acrílica elastomérica con fibras de refuerzo incorporadas contra filtraciones.',
    price: 139900,
    originalPrice: 155000,
    rating: 4.9,
    reviewsCount: 178,
    image: CANISTER_IMAGE,
    features: [
      'Microfibras sintéticas que eliminan la necesidad de tela de refuerzo en áreas planas',
      'Elongación superior al 400% que resiste dilataciones térmicas de losas',
      'Propiedad termo-reflectiva que reduce la temperatura interior hasta 4°C',
      'Protección total contra empozamientos y goteras severas'
    ],
    coveragePerGallon: 22,
    availableSizes: [
      { label: '1/4 Galón', multiplier: 0.35, sizeName: '1/4 Galón' },
      { label: '1 Galón', multiplier: 1, sizeName: '1 Galón' },
      { label: 'Cuñete 5 Gal', multiplier: 4.3, sizeName: 'Cuñete 5 Gal' }
    ],
    colors: [
      { name: 'Blanco Termo-Reflectivo', hex: '#F8FAFC' },
      { name: 'Rojo Teja Colonial', hex: '#B91C1C' },
      { name: 'Gris Cemento', hex: '#475569' },
      { name: 'Verde Terraza', hex: '#166534' }
    ],
    finish: 'Mate',
    durabilityYears: 10,
    washability: 'Extrema',
    dilution: 'Primera mano con 20% de agua para imprimar, manos posteriores puras',
    dryingTime: '3 horas entre capas / 24 horas curado impermeable',
    inStock: true,
    recommendedFor: 'Terrazas transitables, losas de concreto, cubiertas de teja de fibrocemento o zinc.'
  },
  {
    id: 'est-01',
    name: 'Acrovinil Plástico Listo',
    category: 'estucos',
    categoryLabel: 'Estuco & Decorativo',
    tagline: 'Pasta lista de máxima blancura y alta plasticidad que no fisura ni desprende polvo.',
    price: 49900,
    originalPrice: 56000,
    rating: 4.8,
    reviewsCount: 95,
    image: CANISTER_IMAGE,
    features: [
      'Listo para usar directamente con llana lisa sin añadir cemento',
      'Lijado ultra suave con mínima emisión de polvo nocivo',
      'Resistente a la intemperie y a la humedad relativa',
      'Base ideal para lograr acabados espejo o texturizados modernos'
    ],
    coveragePerGallon: 18,
    availableSizes: [
      { label: '1/4 Galón', multiplier: 0.32, sizeName: '1/4 Galón' },
      { label: '1 Galón', multiplier: 1, sizeName: '1 Galón' },
      { label: 'Cuñete 5 Gal', multiplier: 3.9, sizeName: 'Cuñete 5 Gal' }
    ],
    colors: [
      { name: 'Blanco Extra Puro', hex: '#FFFFFF' },
      { name: 'Gris Masilla Base', hex: '#E2E8F0' }
    ],
    finish: 'Mate',
    durabilityYears: 8,
    washability: 'Alta',
    dilution: 'No diluir, mezclar suavemente antes de usar',
    dryingTime: '2 a 4 horas para lijar',
    inStock: true,
    recommendedFor: 'Revoques tradicionales, placas de drywall, superboard y muros desportillados.'
  }
];

export const POPULAR_SEARCHES = [
  'Vinilos Lavables',
  'Fachadas Exteriores',
  'Pintura Epóxica Pisos',
  'Esmaltes Metales',
  'Impermeabilización',
  'Estuco & Decorativo'
];

export const DIAGNOSTIC_PRESETS: DiagnosticPreset[] = [
  {
    id: 'humedad-salitre',
    title: 'Humedad por Capilaridad & Salitre',
    subtitle: 'Muro con manchas blancas, eflorescencia salina y pintura descascarada',
    imageUrl: WALL_SAMPLE_IMAGE,
    issue: 'Eflorescencia salina & penetración freática',
    severity: 'Crítico',
    rootCause: 'Agua subterránea o fuga interna ascendente que evapora sales minerales en la superficie del revoque, rompiendo la película de pintura.',
    steps: [
      '1. Raspar con espátula de acero y cepillo de cerdas metálicas hasta el revoque firme.',
      '2. Lavar con solución neutra anti-salitre Pintuko y dejar secar 48 horas.',
      '3. Aplicar 2 manos de Imprimante Bloqueador Anti-humedad Pintuko.',
      '4. Enlucir con Estuco Acrílico Exterior y rematar con Pintuko Vinilo Max Tipo 1.'
    ],
    recommendedProductIds: ['est-01', 'vin-01'],
    extractedColors: [
      { name: 'Blanco Salitre', hex: '#EAEBE6' },
      { name: 'Mortero Húmedo', hex: '#A39D90' },
      { name: 'Gris Cemento', hex: '#736F66' },
      { name: 'Gris Sombra', hex: '#3E3B36' }
    ]
  },
  {
    id: 'grieta-asentamiento',
    title: 'Grieta Estructural en Fachada',
    subtitle: 'Fisuras diagonales por dilatación térmica y asentamiento de mampostería',
    imageUrl: WALL_SAMPLE_IMAGE,
    issue: 'Fisuración viva en revoque exterior',
    severity: 'Moderado',
    rootCause: 'Movimientos de dilatación térmica y falta de elasticidad en la película de pintura anterior.',
    steps: [
      '1. Abrir la grieta en forma de "V" con cincel fino.',
      '2. Limpiar polvo y aplicar masilla elastomérica selladora Pintuko Flex.',
      '3. Colocar cinta malla de fibra de vidrio microperforada.',
      '4. Aplicar 2 manos puras de Pintuko Fachada Pro Hidrorrepelente 7 Años.'
    ],
    recommendedProductIds: ['fac-01', 'est-01'],
    extractedColors: [
      { name: 'Caliza Natural', hex: '#E4DFD3' },
      { name: 'Sombra de Fisura', hex: '#4B463C' },
      { name: 'Ocre Mineral', hex: '#A69279' },
      { name: 'Tierra Quemada', hex: '#876D58' }
    ]
  },
  {
    id: 'piso-desgaste',
    title: 'Desprendimiento en Piso de Taller',
    subtitle: 'Descascarillado por contaminación de grasa y falta de anclaje mecánico',
    imageUrl: EPOXY_IMAGE,
    issue: 'Falla de adherencia sobre losa pulida',
    severity: 'Moderado',
    rootCause: 'Pintura aplicada sobre piso contaminado con aceite sin desbaste mecánico ni perfil de rugosidad CSP-2.',
    steps: [
      '1. Desengrasar con solvente desengrasante bio-degradable Pintuko.',
      '2. Desbaste con disco adiamantado para abrir poro al concreto.',
      '3. Aplicar imprimante epóxico penetrante 100% sólidos.',
      '4. Colocar acabado Epóxico Industrial Pintuko autonivelante en 2 capas.'
    ],
    recommendedProductIds: ['epo-01'],
    extractedColors: [
      { name: 'Gris Titanio Showroom', hex: '#707784' },
      { name: 'Gris Asfalto', hex: '#383D48' },
      { name: 'Reflejo Plata', hex: '#A0A7B5' },
      { name: 'Negro Carbón', hex: '#1F242D' }
    ]
  }
];

export const RECENT_ORDERS: OrderStatus[] = [
  {
    orderId: 'PK-8942',
    customerName: 'Constructora Bolívar S.A.',
    city: 'Bogotá D.C. (Sede Fontibón)',
    date: 'Hoy, 09:15 AM',
    status: 'En Reparto',
    carrier: 'Flota Pintuko Express Directa',
    trackingNumber: 'EXP-BOG-2026-9812',
    items: [
      { name: 'Pintuko Fachada Pro 7 Años', qty: 8, size: 'Cuñete (5 Gal)' },
      { name: 'Pintuko Estuco Acrílico Listo', qty: 12, size: 'Cuñete (25 kg)' }
    ],
    total: 1395600,
    estimatedDelivery: 'Hoy antes de las 4:00 PM'
  },
  {
    orderId: 'PK-8939',
    customerName: 'Arq. Mateo Valenzuela',
    city: 'Medellín (El Poblado)',
    date: 'Ayer, 04:30 PM',
    status: 'En Tránsito',
    carrier: 'Coordinadora Mercantil',
    trackingNumber: 'CRD-MED-441098',
    items: [
      { name: 'Pintuko Vinilo Tipo 1 Max', qty: 3, size: 'Galón' },
      { name: 'Pintuko Esmalte 3 en 1', qty: 1, size: 'Galón' }
    ],
    total: 335200,
    estimatedDelivery: 'Mañana 10:00 AM'
  },
  {
    orderId: 'PK-8920',
    customerName: 'AutoServicio Cali Norte',
    city: 'Cali (Acopi Yumbo)',
    date: '08 Nov 2026',
    status: 'Entregado',
    carrier: 'Flota Pintuko Express',
    trackingNumber: 'EXP-CALI-7721',
    items: [
      { name: 'Pintuko Epóxico Industrial 100%', qty: 4, size: 'Kit Galón' }
    ],
    total: 759600,
    estimatedDelivery: 'Entregado con firma conforme'
  }
];

export const WORK_PROJECTS = [
  {
    id: 'proj-01',
    title: 'Restauración Integral Torres del Parque',
    location: 'Bogotá, Centro Internacional',
    category: 'Residencial de Lujo',
    surfaceArea: '3.400 m²',
    productUsed: 'Pintuko Fachada Pro 7 Años + Sellador Elastomérico',
    duration: '18 días hábiles',
    warranty: '7 Años Certificada',
    beforeImage: WALL_SAMPLE_IMAGE,
    afterImage: HERO_IMAGE,
    description: 'Renovación completa de fachada con tratamiento de fisuras activas y aplicación bicapa hidrorrepelente ante el clima frío de la capital.'
  },
  {
    id: 'proj-02',
    title: 'Pavimento Epóxico Concesionario Alemán',
    location: 'Medellín, Milla de Oro',
    category: 'Comercial & Automotriz',
    surfaceArea: '1.250 m²',
    productUsed: 'Epóxico 100% Sólidos Gris Platino + Uretano Alifático',
    duration: '6 días continuos',
    warranty: '10 Años Tráfico Pesado',
    beforeImage: WALL_SAMPLE_IMAGE,
    afterImage: EPOXY_IMAGE,
    description: 'Aplicación de piso espejo reflectivo antideslizante con alta resistencia química a hidrocarburos y fácil limpieza clínica.'
  }
];

export const LOCATIONS = [
  {
    city: 'Bogotá D.C. - Sede Central & Fábrica',
    address: 'Av. Calle 80 # 69-45, Zona Industrial',
    phone: '(601) 745-9000',
    whatsapp: '+57 310 890 4000',
    schedule: 'Lun - Vie: 7:00 AM - 6:00 PM | Sáb: 7:30 AM - 2:00 PM',
    services: ['Despacho Express 2h', 'Laboratorio de Colorimetría', 'Equipo de Pintores Certificados'],
    isMain: true
  },
  {
    city: 'Medellín - Centro de Distribución Occidente',
    address: 'Carrera 48 # 10-45, El Poblado / Las Vegas',
    phone: '(604) 448-3200',
    whatsapp: '+57 312 450 3300',
    schedule: 'Lun - Vie: 7:30 AM - 5:30 PM | Sáb: 8:00 AM - 1:00 PM',
    services: ['Colorimetría Digital por Espectrofotómetro', 'Asesoría en Obra'],
    isMain: false
  },
  {
    city: 'Cali - Sede Valle del Cauca',
    address: 'Calle 13 # 66-20, Autopista Suroriental',
    phone: '(602) 380-1500',
    whatsapp: '+57 315 670 9900',
    schedule: 'Lun - Vie: 7:30 AM - 5:30 PM | Sáb: 8:00 AM - 1:00 PM',
    services: ['Entrega a Obra', 'Soporte Epóxicos Industriales'],
    isMain: false
  },
  {
    city: 'Barranquilla - Sede Caribe & Costa',
    address: 'Vía 40 # 73-12, Sector Industrial Las Flores',
    phone: '(605) 316-2200',
    whatsapp: '+57 318 220 8800',
    schedule: 'Lun - Vie: 7:00 AM - 5:00 PM | Sáb: 7:30 AM - 12:30 PM',
    services: ['Pinturas Marinas & Anti-Salitre Costero', 'Despacho Directo'],
    isMain: false
  }
];
