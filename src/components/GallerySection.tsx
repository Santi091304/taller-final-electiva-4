import React, { useState } from 'react';
import { 
  WORK_PROJECTS 
} from '../data/mockData';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  ArrowLeftRight, 
  ChevronRight,
  Maximize2
} from 'lucide-react';

interface GallerySectionProps {
  onOpenQuote: () => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ onOpenQuote }) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [activeProjectIndex, setActiveProjectIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  const activeProject = WORK_PROJECTS[activeProjectIndex];

  const handleSliderMove = (clientX: number, rect: DOMRect) => {
    const x = clientX - rect.left;
    const percentage = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging && e.buttons !== 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    handleSliderMove(e.clientX, rect);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handleSliderMove(e.touches[0].clientX, rect);
  };

  return (
    <section id="galeria" className="py-20 bg-[#060a14] border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Portafolio de Obras Reales
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">Pintores Homologados</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              Galería de Trabajos & Casos de Éxito
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl">
              Desliza el comparador interactivo para visualizar la transformación estructural lograda con los sistemas de recubrimiento Pintuko Pro.
            </p>
          </div>

          {/* Project Tabs */}
          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
            {WORK_PROJECTS.map((proj, idx) => (
              <button
                key={proj.id}
                onClick={() => setActiveProjectIndex(idx)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeProjectIndex === idx
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {proj.title}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Before & After Showcase Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Interactive Dual Layer Image Slider */}
          <div className="lg:col-span-8">
            <div 
              className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden select-none border border-slate-700 shadow-2xl cursor-ew-resize bg-black"
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
            >
              {/* "After" Image (Full background) */}
              <img
                src={activeProject.afterImage}
                alt="Resultado Final Pintuko Pro"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
              <span className="absolute top-4 right-4 z-10 px-3 py-1 rounded-md bg-emerald-500/90 text-slate-950 font-black text-xs uppercase tracking-wider backdrop-blur-sm shadow-md">
                Después (Pintuko Pro)
              </span>

              {/* "Before" Image (Clipped Left Layer) */}
              <div 
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ width: `${sliderPosition}%` }}
              >
                <img
                  src={activeProject.beforeImage}
                  alt="Estado Inicial Antes"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none max-w-none"
                  style={{ width: '100%', height: '100%' }}
                />
                <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-md bg-slate-900/90 text-amber-300 font-bold text-xs uppercase tracking-wider border border-slate-700 backdrop-blur-sm shadow-md">
                  Antes (Deterioro)
                </span>
              </div>

              {/* Slider Handle Divider Line */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.8)] pointer-events-none z-20"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg pointer-events-auto">
                  <ArrowLeftRight className="w-4 h-4 font-bold" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 mt-3 px-1">
              <span>Arrastra la barra central horizontalmente para comparar</span>
              <span className="font-mono text-amber-300">Posición: {Math.round(sliderPosition)}%</span>
            </div>
          </div>

          {/* Right: Project Dossier & Specifications */}
          <div className="lg:col-span-4 space-y-5">
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  {activeProject.category}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {activeProject.title}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {activeProject.description}
              </p>

              <div className="space-y-2.5 pt-2 border-t border-slate-800 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" /> Ubicación:
                  </span>
                  <strong className="text-slate-100">{activeProject.location}</strong>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" /> Tiempo de ejecución:
                  </span>
                  <strong className="text-slate-100">{activeProject.duration}</strong>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Garantía de obra:
                  </span>
                  <strong className="text-emerald-400">{activeProject.warranty}</strong>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Superficie intervenida:</span>
                  <strong className="text-white font-mono">{activeProject.surfaceArea}</strong>
                </div>
              </div>

              <div className="pt-2">
                <div className="text-[11px] text-slate-400 font-semibold mb-1">Producto Principal:</div>
                <div className="text-xs font-semibold text-blue-300 bg-blue-950/60 p-2.5 rounded-lg border border-blue-900/50">
                  {activeProject.productUsed}
                </div>
              </div>

              <button
                onClick={onOpenQuote}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Cotizar Proyecto Similar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
