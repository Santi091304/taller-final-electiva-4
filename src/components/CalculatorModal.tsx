import React, { useState, useMemo } from 'react';
import { 
  X, 
  Calculator, 
  Layers, 
  Plus, 
  Minus, 
  ShoppingCart, 
  FileText, 
  Check, 
  Info,
  Maximize2
} from 'lucide-react';
import { PRODUCTS } from '../data/mockData';
import { PaintProduct } from '../types';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: PaintProduct, size: string, color: { name: string; hex: string }, quantity: number) => void;
  onOpenQuoteWithDetails: (areaM2: number, product: PaintProduct, coats: number) => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
  onOpenQuoteWithDetails,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(PRODUCTS[0].id);
  const [calcMode, setCalcMode] = useState<'dimensions' | 'direct'>('dimensions');
  
  // Dimensions mode
  const [width, setWidth] = useState<number>(6);
  const [height, setHeight] = useState<number>(2.6);
  const [wallsCount, setWallsCount] = useState<number>(4);
  const [doorsCount, setDoorsCount] = useState<number>(2);
  const [windowsCount, setWindowsCount] = useState<number>(2);

  // Direct mode
  const [directArea, setDirectArea] = useState<number>(50);

  // Coats
  const [coats, setCoats] = useState<number>(2);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const selectedProduct = useMemo(() => {
    return PRODUCTS.find(p => p.id === selectedProductId) || PRODUCTS[0];
  }, [selectedProductId]);

  // Area calculation
  const netArea = useMemo(() => {
    if (calcMode === 'direct') {
      return Math.max(1, directArea);
    }
    const rawWallArea = width * height * wallsCount;
    const openingsDeduction = (doorsCount * 1.8) + (windowsCount * 1.5);
    return Math.max(1, Math.round((rawWallArea - openingsDeduction) * 10) / 10);
  }, [calcMode, width, height, wallsCount, doorsCount, windowsCount, directArea]);

  // Gallons math
  const calculation = useMemo(() => {
    const totalCoverageNeeded = netArea * coats * 1.1; // 10% technical waste
    const gallonsNeededRaw = totalCoverageNeeded / selectedProduct.coveragePerGallon;
    const totalGallonsRounded = Math.ceil(gallonsNeededRaw);
    
    // Optimal breakdown in Cuñetes (5 gal) and single Gallons
    const cunetes = Math.floor(totalGallonsRounded / 5);
    const remainingGallons = totalGallonsRounded % 5;

    const estimatedCost = (cunetes * selectedProduct.price * 4.4) + (remainingGallons * selectedProduct.price);

    return {
      totalCoverageNeeded: Math.round(totalCoverageNeeded * 10) / 10,
      totalGallons: totalGallonsRounded,
      cunetes,
      remainingGallons,
      estimatedCost: Math.round(estimatedCost),
    };
  }, [netArea, coats, selectedProduct]);

  if (!isOpen) return null;

  const handleAddCalculatedToCart = () => {
    if (calculation.cunetes > 0) {
      onAddToCart(selectedProduct, 'Cuñete (5 Galones)', selectedProduct.colors[0], calculation.cunetes);
    }
    if (calculation.remainingGallons > 0) {
      onAddToCart(selectedProduct, 'Galón (3.785 L)', selectedProduct.colors[0], calculation.remainingGallons);
    }
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0a1024] border border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0e1733]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <Calculator className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Calculadora de Metros Cuadrados m²</h2>
              <p className="text-xs text-slate-400">
                Calcula la cantidad exacta de pintura, cuñetes y galones sin desperdicio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          
          {/* Step 1: Choose Product / Surface */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              1. Selecciona el Tipo de Pintura o Superficie:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PRODUCTS.map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => setSelectedProductId(prod.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedProductId === prod.id
                      ? 'bg-blue-950/80 border-blue-500 text-white shadow-md shadow-blue-950/60'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-100 truncate">{prod.name}</div>
                  <div className="text-[11px] text-amber-400 mt-0.5">Rend: {prod.coveragePerGallon} m²/gal</div>
                  <div className="text-[10px] text-slate-400">{prod.categoryLabel}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Dimensions or Direct M2 Input */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                2. Medidas de la Superficie:
              </span>
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
                <button
                  onClick={() => setCalcMode('dimensions')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    calcMode === 'dimensions' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Por Medidas
                </button>
                <button
                  onClick={() => setCalcMode('direct')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    calcMode === 'direct' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  m² Totales Directos
                </button>
              </div>
            </div>

            {calcMode === 'dimensions' ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-medium">Ancho pared (m)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={width}
                    onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-semibold outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-medium">Alto pared (m)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    value={height}
                    onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-semibold outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-medium">Nº Paredes</label>
                  <input
                    type="number"
                    min="1"
                    value={wallsCount}
                    onChange={(e) => setWallsCount(parseInt(e.target.value) || 1)}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-semibold outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-medium">Restar Puertas</label>
                  <input
                    type="number"
                    min="0"
                    value={doorsCount}
                    onChange={(e) => setDoorsCount(parseInt(e.target.value) || 0)}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-semibold outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-medium">Restar Ventanas</label>
                  <input
                    type="number"
                    min="0"
                    value={windowsCount}
                    onChange={(e) => setWindowsCount(parseInt(e.target.value) || 0)}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-semibold outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div className="max-w-xs">
                <label className="text-[11px] text-slate-400 font-medium">Superficie Total en Metros Cuadrados (m²)</label>
                <div className="relative mt-1">
                  <input
                    type="number"
                    min="1"
                    value={directArea}
                    onChange={(e) => setDirectArea(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-base text-white font-bold outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">m²</span>
                </div>
              </div>
            )}

            {/* Coats selector */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-300">
                <span className="font-semibold text-white">Número de manos recomendadas:</span>
                <span className="text-slate-400 ml-1.5">(2 manos garantizan cubrimiento uniforme y lavabilidad)</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => setCoats(num)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      coats === num
                        ? 'bg-amber-400 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {num} {num === 1 ? 'Mano' : 'Manos'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Detailed Technical Calculation Result */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/70 via-slate-900 to-slate-950 border border-blue-500/40">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                Cálculo de Consumo Pintuko Pro
              </span>
              <span className="text-xs text-slate-400">Incluye 10% de merma técnica</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-medium">Área Neta</div>
                <div className="text-xl font-black text-white mt-1 tabular-nums">
                  {netArea} <span className="text-xs font-normal text-slate-400">m²</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-medium">Total Galones</div>
                <div className="text-xl font-black text-amber-400 mt-1 tabular-nums">
                  {calculation.totalGallons} <span className="text-xs font-normal text-slate-400">Gal</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-medium">Presentación Óptima</div>
                <div className="text-sm font-bold text-blue-300 mt-1.5">
                  {calculation.cunetes > 0 ? `${calculation.cunetes} Cuñete(s)` : ''}
                  {calculation.cunetes > 0 && calculation.remainingGallons > 0 ? ' + ' : ''}
                  {calculation.remainingGallons > 0 ? `${calculation.remainingGallons} Galón(es)` : ''}
                  {calculation.totalGallons === 0 && '0 Gal'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-medium">Costo Material</div>
                <div className="text-xl font-black text-emerald-400 mt-1 tabular-nums">
                  ${calculation.estimatedCost.toLocaleString('es-CO')}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                Precio directo de fábrica con entrega inmediata.
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={handleAddCalculatedToCart}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Añadir Pintura al Carrito</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenQuoteWithDetails(netArea, selectedProduct, coats);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/30"
                >
                  <FileText className="w-4 h-4" />
                  <span>Cotizar con Pintores</span>
                </button>
              </div>
            </div>

            {addedFeedback && (
              <div className="mt-3 p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs text-center font-bold">
                ✓ ¡Cantidad de pintura ({calculation.totalGallons} Galones) agregada a tu carrito!
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
