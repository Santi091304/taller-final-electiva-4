import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Droplet, 
  Layers, 
  Clock, 
  Check, 
  ShoppingCart, 
  FileText 
} from 'lucide-react';
import { PaintProduct } from '../types';

interface ProductDetailModalProps {
  product: PaintProduct | null;
  onClose: () => void;
  onAddToCart: (product: PaintProduct, size: string, color: { name: string; hex: string }) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#090f20] border border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0d162e]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {product.categoryLabel}
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-300">Ficha Técnica Oficial</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <img
              src={product.image}
              alt={product.name}
              className="w-full sm:w-44 aspect-square object-cover rounded-xl bg-black border border-slate-700 shrink-0"
            />
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">{product.name}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{product.tagline}</p>
              
              <div className="flex items-center gap-2 pt-1">
                <span className="text-2xl font-black text-amber-400 tabular-nums">
                  ${product.price.toLocaleString('es-CO')} COP
                </span>
                <span className="text-xs text-slate-400">/ Galón de referencia</span>
              </div>
            </div>
          </div>

          {/* Technical Specs Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden text-xs">
            <div className="px-4 py-2.5 bg-slate-800/80 font-bold text-slate-200 border-b border-slate-800 uppercase tracking-wider">
              Propiedades Físicas & Desempeño
            </div>
            <div className="divide-y divide-slate-800/80">
              <div className="flex px-4 py-2.5 justify-between">
                <span className="text-slate-400">Rendimiento Teórico:</span>
                <strong className="text-white font-mono">{product.coveragePerGallon} m² / Galón a 1 mano</strong>
              </div>
              <div className="flex px-4 py-2.5 justify-between">
                <span className="text-slate-400">Acabado Óptico:</span>
                <strong className="text-white">{product.finish}</strong>
              </div>
              <div className="flex px-4 py-2.5 justify-between">
                <span className="text-slate-400">Lavabilidad ASTM:</span>
                <strong className="text-white">{product.washability}</strong>
              </div>
              <div className="flex px-4 py-2.5 justify-between">
                <span className="text-slate-400">Garantía de Fábrica:</span>
                <strong className="text-emerald-400 font-semibold">{product.durabilityYears} Años Certificada</strong>
              </div>
              <div className="flex px-4 py-2.5 justify-between">
                <span className="text-slate-400">Dilución Recomendada:</span>
                <strong className="text-white">{product.dilution}</strong>
              </div>
              <div className="flex px-4 py-2.5 justify-between">
                <span className="text-slate-400">Tiempo de Secado:</span>
                <strong className="text-white">{product.dryingTime}</strong>
              </div>
              <div className="flex px-4 py-2.5 justify-between">
                <span className="text-slate-400">Superficies Aptas:</span>
                <strong className="text-white max-w-xs text-right">{product.recommendedFor}</strong>
              </div>
            </div>
          </div>

          {/* Key Features List */}
          <div>
            <div className="text-xs font-bold text-slate-300 uppercase mb-2">
              Ventajas Competitivas Pintuko Pro:
            </div>
            <div className="space-y-1.5">
              {product.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action button */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              Disponible en todas nuestras sedes para despacho inmediato.
            </span>
            <button
              onClick={() => {
                onAddToCart(product, product.availableSizes[0].label, product.colors[0]);
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Agregar al Carrito</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
