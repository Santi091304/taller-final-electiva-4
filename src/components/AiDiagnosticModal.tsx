import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  UploadCloud, 
  AlertTriangle, 
  CheckCircle2, 
  ShoppingCart, 
  Copy, 
  Check, 
  RefreshCw, 
  Layers, 
  Eye, 
  Info,
  ArrowRight
} from 'lucide-react';
import { DiagnosticPreset, PaintProduct } from '../types';
import { DIAGNOSTIC_PRESETS, PRODUCTS } from '../data/mockData';

interface AiDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: PaintProduct, size: string, color: { name: string; hex: string }) => void;
  onOpenQuote: () => void;
}

export const AiDiagnosticModal: React.FC<AiDiagnosticModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
  onOpenQuote,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<DiagnosticPreset>(DIAGNOSTIC_PRESETS[0]);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(true);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [addedToast, setAddedToast] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomImage(url);
      triggerScan();
    }
  };

  const triggerScan = () => {
    setIsScanning(true);
    setHasScanned(false);
    setTimeout(() => {
      setIsScanning(false);
      setHasScanned(true);
    }, 1200);
  };

  const handleSelectPreset = (preset: DiagnosticPreset) => {
    setCustomImage(null);
    setSelectedPreset(preset);
    triggerScan();
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const currentImg = customImage || selectedPreset.imageUrl;
  const recommendedProducts = PRODUCTS.filter(p => selectedPreset.recommendedProductIds.includes(p.id));

  const handleAddAllRecommended = () => {
    recommendedProducts.forEach(prod => {
      onAddToCart(prod, prod.availableSizes[0].label, prod.colors[0]);
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#090f20] border border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0d162e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Pintuko Visión IA</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Diagnóstico & Colorimetría
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Análisis patológico de superficies y extracción de armonías cromáticas
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

        {/* Content Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          
          {/* Preset Selector & Upload Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Selecciona un caso patológico de prueba o sube tu propia foto:
              </span>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 border border-slate-700 transition-colors">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Cargar foto de mi pared</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {DIAGNOSTIC_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3 text-left rounded-xl border transition-all text-xs ${
                    !customImage && selectedPreset.id === preset.id
                      ? 'bg-blue-950/70 border-blue-500 text-white shadow-md shadow-blue-950/50'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold mb-0.5 text-slate-100 flex items-center justify-between">
                    <span>{preset.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      preset.severity === 'Crítico' ? 'text-rose-400 bg-rose-500/10' : 'text-amber-400 bg-amber-500/10'
                    }`}>
                      {preset.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{preset.subtitle}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Visual Scanner Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Image with Scan Overlay */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-700 bg-black shadow-inner">
                <img
                  src={currentImg}
                  alt="Análisis patológico"
                  className="w-full h-full object-cover"
                />

                {/* Laser Scanning Animation */}
                {isScanning && (
                  <div className="absolute inset-0 bg-blue-500/10 flex flex-col justify-between">
                    <div className="w-full h-1 bg-amber-400 shadow-[0_0_15px_#f59e0b] animate-[bounce_1.5s_infinite]"></div>
                    <div className="p-3 bg-black/70 backdrop-blur-sm text-center text-xs font-bold text-amber-300">
                      Escaneando rugosidad, humedad freática y espectro de color...
                    </div>
                  </div>
                )}

                {/* Detected Bounding Box */}
                {!isScanning && (
                  <div className="absolute inset-8 border-2 border-dashed border-amber-400/80 rounded-lg bg-amber-400/10 pointer-events-none flex items-start justify-between p-2">
                    <span className="text-[10px] font-mono font-bold bg-amber-400 text-slate-950 px-1 rounded">
                      ANOMALÍA DETECTADA (98.4%)
                    </span>
                    <span className="text-[10px] font-mono text-white bg-slate-900/80 px-1 rounded">
                      pH: 8.2 | Humedad: 26%
                    </span>
                  </div>
                )}
              </div>

              {/* Extracted Color Palette */}
              <div className="mt-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-2">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    Paleta de Color Extraída (Pintuko Swatch)
                  </span>
                  <span className="text-[10px] text-slate-400">Click para copiar HEX</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {selectedPreset.extractedColors.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => handleCopyHex(c.hex)}
                      className="group flex flex-col items-center p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 transition-all border border-slate-700/60"
                      title={`Copiar ${c.hex}`}
                    >
                      <div 
                        className="w-full h-7 rounded shadow-inner mb-1 border border-white/20 transition-transform group-hover:scale-105"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-[10px] font-medium text-slate-200 line-clamp-1">{c.name}</span>
                      <span className="text-[9px] font-mono text-slate-400 flex items-center gap-0.5 mt-0.5">
                        {copiedHex === c.hex ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                        {c.hex}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Technical Diagnostic Findings & Recommended Protocol */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Diagnosis Summary Card */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-slate-300 uppercase">Resultado Diagnóstico</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                    selectedPreset.severity === 'Crítico' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    Severidad: {selectedPreset.severity}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mb-1">
                  {selectedPreset.issue}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedPreset.rootCause}
                </p>
              </div>

              {/* Step-by-Step Restoration Protocol */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xs font-bold text-slate-300 uppercase mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Protocolo Técnico de Reparación Recomendado
                </div>
                <div className="space-y-1.5">
                  {selectedPreset.steps.map((st, i) => (
                    <div key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></span>
                      <span>{st}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Pintuko Products to solve the issue */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300 uppercase">
                    Productos Pintuko Pro Formulados para este caso:
                  </span>
                </div>
                <div className="space-y-2">
                  {recommendedProducts.map((prod) => (
                    <div 
                      key={prod.id} 
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={prod.image} 
                          alt={prod.name} 
                          className="w-10 h-10 object-cover rounded-lg bg-black"
                        />
                        <div>
                          <div className="text-xs font-bold text-white">{prod.name}</div>
                          <div className="text-[11px] text-amber-400 font-semibold tabular-nums">
                            ${prod.price.toLocaleString('es-CO')} COP / Galón
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onAddToCart(prod, prod.availableSizes[0].label, prod.colors[0])}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Añadir</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Action Bar Footer */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-400" />
              ¿Prefieres que un pintor certificado Pintuko Pro aplique la solución en tu obra?
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleAddAllRecommended}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 transition-all flex items-center justify-center gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Agregar Kit Completo</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenQuote();
                }}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Cotizar con Mano de Obra</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {addedToast && (
            <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs text-center font-bold animate-in fade-in">
              ✓ ¡Kit de solución técnica añadido a tu carrito de compras con éxito!
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
