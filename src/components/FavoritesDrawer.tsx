import React from 'react';
import { 
  X, 
  Heart, 
  ShoppingCart, 
  Trash2, 
  ArrowRight 
} from 'lucide-react';
import { PaintProduct } from '../types';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: PaintProduct[];
  onRemoveFavorite: (product: PaintProduct) => void;
  onAddToCart: (product: PaintProduct, size: string, color: { name: string; hex: string }) => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#090f20] border-l border-slate-800 h-full flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#0d162e]">
          <div className="flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h2 className="text-base font-bold text-white">Tus Pinturas Favoritas</h2>
            <span className="text-xs font-mono text-slate-400">({favorites.length})</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {favorites.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800/60 flex items-center justify-center mx-auto text-slate-500">
                <Heart className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-300">No tienes productos en favoritos</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Haz clic en el corazón de cualquier pintura del catálogo para guardarla aquí.
              </p>
            </div>
          ) : (
            favorites.map((product) => (
              <div
                key={product.id}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex gap-3 items-center justify-between"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-14 h-14 rounded-lg object-cover bg-black shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{product.name}</h4>
                  <div className="text-[11px] text-slate-400">{product.categoryLabel}</div>
                  <div className="text-xs font-bold text-amber-400 mt-1 tabular-nums">
                    ${product.price.toLocaleString('es-CO')} COP
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      onAddToCart(product, product.availableSizes[0].label, product.colors[0]);
                    }}
                    className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
                    title="Mover al carrito"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRemoveFavorite(product)}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Quitar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
