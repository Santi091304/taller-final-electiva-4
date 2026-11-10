import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  UploadCloud, 
  Award, 
  Truck,
  Palette
} from 'lucide-react';
import { HERO_IMAGE } from '../data/mockData';

interface HeroSectionProps {
  onSearchSubmit: (term: string) => void;
  onOpenAiModal: () => void;
  onSelectCategoryFilter: (category: string) => void;
  popularSearches: string[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearchSubmit,
  onOpenAiModal,
  onSelectCategoryFilter,
  popularSearches,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearchSubmit(searchTerm.trim());
      // Smooth scroll to catalog
      const catalogEl = document.getElementById('catalogo');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handlePopularClick = (tag: string) => {
    setSearchTerm(tag);
    onSelectCategoryFilter(tag);
    const catalogEl = document.getElementById('catalogo');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="inicio" className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden bg-[#070b16] pt-12 pb-20">
      {/* Background Lighting and Atmospheric Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft Radial Gradient Mesh */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-blue-600/15 via-blue-900/10 to-transparent blur-3xl opacity-70"></div>
        <div className="absolute -top-32 right-10 w-[500px] h-[500px] bg-amber-500/10 blur-[130px] rounded-full"></div>
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full"></div>
        
        {/* Fine Architectural Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center z-10">
        
        {/* Floating Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-inner mb-6 backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-amber-400"></span>
          <span className="text-xs sm:text-sm font-medium text-slate-200 tracking-wide">
            Servicios de Pintura Residencial, Comercial e Industrial
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.15] max-w-4xl text-balance">
          En Pintuko tenemos todo lo que deseas con la{' '}
          <span className="text-amber-400 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent underline decoration-amber-400/40 decoration-wavy decoration-2">
            mejor calidad y precio
          </span>
        </h1>

        {/* Secondary Description */}
        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal">
          Pintores certificados, garantías reales de hasta 5 años y catálogo directo de fábrica para hogares, constructoras y plantas industriales en toda Colombia.
        </p>

        {/* Main Hero Search Bar with Yellow Action Button */}
        <div className="w-full max-w-2xl mt-9">
          <form 
            onSubmit={handleSearchSubmit}
            className="relative flex items-center bg-[#0d1527] border border-slate-700/80 focus-within:border-amber-400/90 rounded-2xl p-2 shadow-2xl shadow-black/60 transition-all focus-within:ring-4 focus-within:ring-amber-400/10"
          >
            <div className="pl-3.5 pr-2 text-slate-400 flex items-center">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar pinturas, impermeabilizantes, esmaltes, epóxicos..."
              className="flex-1 bg-transparent text-slate-100 placeholder-slate-400 text-sm sm:text-base outline-none py-2 px-1 font-medium"
            />
            <button
              type="submit"
              className="px-6 sm:px-8 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-sm sm:text-base transition-all shadow-md shadow-amber-400/20 whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
            >
              <span>Explorar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Popular Searches Pills */}
        <div className="w-full max-w-3xl mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mr-1">
            Búsquedas populares:
          </span>
          {popularSearches.map((tag) => (
            <button
              key={tag}
              onClick={() => handlePopularClick(tag)}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800 hover:text-amber-300 border border-slate-800 hover:border-slate-700 transition-all active:scale-95 shadow-sm"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Featured Interactive Bottom Card (AI Wall Diagnostics & Color Extraction) */}
        <div className="w-full max-w-4xl mt-12">
          <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-blue-950/60 p-6 sm:p-7 border border-blue-500/30 hover:border-blue-400/50 shadow-2xl shadow-blue-950/40 transition-all text-left">
            {/* Subtle light shimmer overlay */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all"></div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              
              <div className="flex items-start gap-4">
                <div className="w-13 h-13 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Tecnología Pintuko Visión IA
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-xs text-slate-400">Diagnóstico instantáneo</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                    ¿Tienes una pared dañada o una foto de inspiración?
                  </h3>
                  <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                    Sube tu foto a <strong className="text-white font-semibold">Pintuko IA</strong>: diagnostica humedad, salitre o grietas y extrae colores ideales con la dosificación exacta de pintura para tu proyecto.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={onOpenAiModal}
                className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 border border-blue-400/40 whitespace-nowrap flex items-center justify-center gap-2 group transition-all cursor-pointer active:scale-95"
              >
                <UploadCloud className="w-5 h-5 text-blue-200 group-hover:scale-110 transition-transform" />
                <span>Subir foto a la IA</span>
                <ArrowRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
              </button>

            </div>
          </div>
        </div>

        {/* Trust Badges Strip (Adjacent Proof) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 w-full max-w-4xl pt-8 border-t border-slate-800/80 text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">Garantía Certificada</div>
              <div className="text-[11px] text-slate-400">5 a 10 años directa</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-blue-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">Envíos Inmediatos</div>
              <div className="text-[11px] text-slate-400">Despacho en 24h a obra</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">Pintores Pro</div>
              <div className="text-[11px] text-slate-400">Mano de obra homologada</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-purple-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">+3.000 Tonos</div>
              <div className="text-[11px] text-slate-400">Colorimetría computarizada</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
