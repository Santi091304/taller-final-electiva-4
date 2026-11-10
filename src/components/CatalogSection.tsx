import React, { useState, useMemo } from 'react';
import { 
  PaintProduct 
} from '../types';
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  ShieldCheck, 
  Droplet, 
  Info,
  Check,
  Sparkles
} from 'lucide-react';
import { VisualPaintCanister } from './VisualPaintCanister';

interface CatalogSectionProps {
  products: PaintProduct[];
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onAddToCart: (product: PaintProduct, size: string, color: { name: string; hex: string }) => void;
  onToggleFavorite: (product: PaintProduct) => void;
  favoriteIds: string[];
  onOpenProductDetail: (product: PaintProduct) => void;
}

const CATEGORIES: { id: string; label: string }[] = [
  { id: 'todos', label: 'Todos los Productos' },
  { id: 'vinilos', label: 'Vinilos Lavables' },
  { id: 'fachadas', label: 'Fachadas Exteriores' },
  { id: 'epoxicas', label: 'Pintura Epóxica Pisos' },
  { id: 'esmaltes', label: 'Esmaltes Metales' },
  { id: 'impermeabilizacion', label: 'Impermeabilización' },
  { id: 'estucos', label: 'Estuco & Decorativo' },
];

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  products,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onAddToCart,
  onToggleFavorite,
  favoriteIds,
  onOpenProductDetail,
}) => {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [selectedColors, setSelectedColors] = useState<Record<string, { name: string; hex: string }>>({});
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchesCategory = 
        activeCategory === 'todos' || 
        prod.category === activeCategory ||
        prod.categoryLabel.toLowerCase().includes(activeCategory.toLowerCase());

      const matchesSearch = 
        !searchQuery ||
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.recommendedFor.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return b.rating - a.rating;
    });
  }, [products, activeCategory, searchQuery, sortBy]);

  const getSizeForProduct = (prod: PaintProduct) => {
    return selectedSizes[prod.id] || prod.availableSizes[1]?.label || prod.availableSizes[0].label;
  };

  const getColorForProduct = (prod: PaintProduct) => {
    return selectedColors[prod.id] || prod.colors[0];
  };

  const handleSizeChange = (prodId: string, sizeLabel: string) => {
    setSelectedSizes(prev => ({ ...prev, [prodId]: sizeLabel }));
  };

  const handleColorChange = (prodId: string, color: { name: string; hex: string }) => {
    setSelectedColors(prev => ({ ...prev, [prodId]: color }));
  };

  const calculateProductPrice = (prod: PaintProduct) => {
    const selectedSizeLabel = getSizeForProduct(prod);
    const sizeObj = prod.availableSizes.find(s => s.label === selectedSizeLabel) || prod.availableSizes[0];
    return Math.round(prod.price * sizeObj.multiplier);
  };

  return (
    <section id="catalogo" className="py-20 bg-[#080d1a] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Portafolio Especializado
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">Directo de Fábrica Pintuko</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              Catálogo de Pinturas Profesionales
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl">
              Selecciona cualquier color de la paleta para ver la actualización <strong className="text-amber-400 font-semibold">en tiempo real</strong> en el bote de pintura interactivo.
            </p>
          </div>

          {/* Sorter */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="featured">Destacados & Mejor Calificados</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
            </select>
          </div>
        </div>

        {/* Filter Tabs Bar (Functional Buttons) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/40'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Active Search Filter Badge if any */}
        {searchQuery && (
          <div className="mb-6 flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span>Resultados para la búsqueda:</span>
              <strong className="text-amber-300 font-semibold">"{searchQuery}"</strong>
              <span className="text-slate-500">({filteredProducts.length} productos encontrados)</span>
            </div>
            <button 
              onClick={() => onSelectCategory('todos')}
              className="text-slate-400 hover:text-white underline cursor-pointer"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-2xl bg-slate-900/40 border border-slate-800">
            <Droplet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No encontramos productos con esos criterios</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Intenta buscar por categorías como "Vinilos Lavables", "Fachadas", "Epóxicas" o "Impermeabilización".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((product) => {
              const currentSize = getSizeForProduct(product);
              const currentColor = getColorForProduct(product);
              const calculatedPrice = calculateProductPrice(product);
              const isFav = favoriteIds.includes(product.id);

              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col justify-between rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-blue-500/50 shadow-xl hover:shadow-2xl hover:shadow-blue-950/40 transition-all duration-300 overflow-hidden"
                >
                  
                  {/* TOP: INTERACTIVE VISUAL PAINT CANISTER WITH LIVE COLOR CHANGE */}
                  <div className="relative">
                    <VisualPaintCanister
                      colorHex={currentColor.hex}
                      colorName={currentColor.name}
                      productName={product.name}
                      finish={product.finish}
                      sizeLabel={currentSize}
                    />

                    {/* Category unboxed tag */}
                    <div className="absolute top-3 left-3 text-[10px] font-bold tracking-wider uppercase text-amber-300 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                      {product.categoryLabel}
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={() => onToggleFavorite(product)}
                      className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                        isFav 
                          ? 'bg-rose-500 text-white shadow-md shadow-rose-500/40' 
                          : 'bg-slate-950/70 text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                      title={isFav ? "Eliminar de favoritos" : "Guardar en favoritos"}
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Rating & Warranty */}
                      <div className="flex items-center justify-between text-xs mb-2">
                        <div className="flex items-center gap-1 text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span className="font-bold text-slate-200">{product.rating}</span>
                          <span className="text-slate-500">({product.reviewsCount} opiniones)</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{product.durabilityYears} años de garantía</span>
                        </div>
                      </div>

                      {/* Product Name */}
                      <h3 className="font-display font-bold text-lg text-white group-hover:text-amber-300 transition-colors leading-snug">
                        {product.name}
                      </h3>

                      {/* Tagline */}
                      <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {product.tagline}
                      </p>

                      {/* COLOR PALETTE WITH INSTANT COLOR SELECTION */}
                      <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-slate-300 text-[11px]">
                            Color en envase: <strong className="text-white font-bold">{currentColor.name}</strong>
                          </span>
                          <span className="text-[10px] text-amber-400 font-mono">
                            {currentColor.hex}
                          </span>
                        </div>
                        
                        {/* Interactive Color Circles */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {product.colors.map((c) => {
                            const isSelected = currentColor.name === c.name;
                            return (
                              <button
                                key={c.name}
                                type="button"
                                onClick={() => handleColorChange(product.id, c)}
                                className={`relative w-7 h-7 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                                  isSelected
                                    ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 scale-110 border-white shadow-md'
                                    : 'border-slate-700 hover:scale-105 hover:border-slate-400'
                                }`}
                                style={{ backgroundColor: c.hex }}
                                title={`Seleccionar color ${c.name} (${c.hex})`}
                              >
                                {isSelected && (
                                  <span 
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{
                                      backgroundColor: ['#FFFFFF', '#F8FAFC', '#F1F5F9', '#E2D9C8', '#CBD5E1'].includes(c.hex) 
                                        ? '#0f172a' 
                                        : '#ffffff'
                                    }}
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Size Selectors ("1/4 Galón", "1 Galón", "Cuñete 5 Gal") */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1.5">
                          <span>Tamaño del Envase:</span>
                          <span className="text-slate-500">Rendimiento: {product.coveragePerGallon} m²/gal</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {product.availableSizes.map((s) => (
                            <button
                              key={s.label}
                              type="button"
                              onClick={() => handleSizeChange(product.id, s.label)}
                              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                                currentSize === s.label
                                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-400/50'
                                  : 'bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                              }`}
                            >
                              {s.sizeName}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Price and Cart Action */}
                    <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xl font-black text-white tabular-nums tracking-tight">
                          ${calculatedPrice.toLocaleString('es-CO')}{' '}
                          <span className="text-xs font-normal text-slate-400">COP</span>
                        </div>
                        <div className="text-[10px] text-emerald-400 font-medium">
                          Despacho hoy disponible
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenProductDetail(product)}
                          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Ficha técnica completa"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onAddToCart(product, currentSize, currentColor)}
                          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-400/20 cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Agregar</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
