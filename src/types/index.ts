export type ProductCategory = 
  | 'todos'
  | 'vinilos'
  | 'fachadas'
  | 'epoxicas'
  | 'esmaltes'
  | 'impermeabilizacion'
  | 'estucos';

export interface PaintProduct {
  id: string;
  name: string;
  category: ProductCategory;
  categoryLabel: string;
  tagline: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  features: string[];
  coveragePerGallon: number; // m2 per gallon
  availableSizes: {
    label: string;
    multiplier: number;
    sizeName: string;
  }[];
  colors: {
    name: string;
    hex: string;
  }[];
  finish: 'Mate' | 'Satinado' | 'Brillante' | 'Semimate';
  durabilityYears: number;
  washability: 'Alta' | 'Extrema' | 'Industrial' | 'Estándar';
  dilution: string;
  dryingTime: string;
  inStock: boolean;
  recommendedFor: string;
}

export interface CartItem {
  id: string; // unique item id
  product: PaintProduct;
  selectedSize: string;
  sizePrice: number;
  selectedColor: {
    name: string;
    hex: string;
  };
  quantity: number;
}

export interface QuoteData {
  projectType: 'residencial' | 'comercial' | 'industrial' | 'conjunto';
  surfaceType: string;
  areaM2: number;
  coats: number;
  includeLabor: boolean;
  city: string;
  name: string;
  phone: string;
  email: string;
  notes?: string;
}

export interface DiagnosticPreset {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  issue: string;
  severity: 'Bajo' | 'Moderado' | 'Crítico';
  rootCause: string;
  steps: string[];
  recommendedProductIds: string[];
  extractedColors: { name: string; hex: string }[];
}

export interface OrderStatus {
  orderId: string;
  customerName: string;
  city: string;
  date: string;
  status: 'Preparando' | 'En Tránsito' | 'Entregado' | 'En Reparto';
  carrier: string;
  trackingNumber: string;
  items: { name: string; qty: number; size: string }[];
  total: number;
  estimatedDelivery: string;
}
