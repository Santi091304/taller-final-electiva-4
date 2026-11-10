import React from 'react';
import { 
  Paintbrush, 
  ShieldCheck, 
  Award, 
  Phone, 
  Mail, 
  MapPin, 
  FileCheck,
  CheckCircle2,
  ArrowUp
} from 'lucide-react';

interface FooterProps {
  onOpenCalculator: () => void;
  onOpenAiModal: () => void;
  onOpenQuote: () => void;
  onOpenOrders: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenCalculator,
  onOpenAiModal,
  onOpenQuote,
  onOpenOrders,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#050811] text-slate-400 border-t border-slate-800 text-xs">
      
      {/* Upper Certified Seals Strip */}
      <div className="border-b border-slate-800/80 bg-[#070b16] py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-white font-bold text-xs">Norma Técnica Colombiana NTC 1335</div>
              <div className="text-[11px] text-slate-500">Pinturas al agua Tipo 1 de alta lavabilidad</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-white font-bold text-xs">Certificación ISO 9001:2015 & 14001</div>
              <div className="text-[11px] text-slate-500">Gestión de calidad fabril y sostenibilidad ambiental</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-white font-bold text-xs">Garantía Escrita de Fábrica</div>
              <div className="text-[11px] text-slate-500">Certificados de durabilidad hasta por 10 años</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-amber-400 flex items-center justify-center shadow-lg">
                <Paintbrush className="w-5 h-5 text-slate-950 -rotate-12" />
              </div>
              <span className="font-display font-black text-xl tracking-tight text-white">
                PINTUKO <span className="text-amber-400">PRO</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
              Especialistas líderes en Colombia en manufactura de recubrimientos arquitectónicos, sistemas epóxicos industriales y servicios integrales de pintura con cuadrillas certificadas.
            </p>
            <div className="pt-2 text-[11px] text-slate-500 space-y-1">
              <div>Línea Pro Nacional: <strong>(601) 745-9000</strong></div>
              <div>Correo Oficial: <strong>pro@pintuko.co</strong></div>
              <div>Dirección Fabril: <strong>Av. Calle 80 # 69-45, Bogotá D.C.</strong></div>
            </div>
          </div>

          {/* Catalog Categories */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-3">Líneas de Producto</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#catalogo" className="hover:text-amber-400 transition-colors">Vinilos Tipo 1 Max</a></li>
              <li><a href="#catalogo" className="hover:text-amber-400 transition-colors">Fachadas Hidrorrepelentes</a></li>
              <li><a href="#catalogo" className="hover:text-amber-400 transition-colors">Epóxicos 100% Sólidos</a></li>
              <li><a href="#catalogo" className="hover:text-amber-400 transition-colors">Esmaltes Anticorrosivos</a></li>
              <li><a href="#catalogo" className="hover:text-amber-400 transition-colors">Impermeabilizantes Techo</a></li>
              <li><a href="#catalogo" className="hover:text-amber-400 transition-colors">Estucos Listos Exteriores</a></li>
            </ul>
          </div>

          {/* Tools & Services */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-3">Herramientas Pro</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={onOpenCalculator} className="hover:text-amber-400 transition-colors text-left cursor-pointer">
                  Calculadora m²
                </button>
              </li>
              <li>
                <button onClick={onOpenAiModal} className="hover:text-amber-400 transition-colors text-left cursor-pointer">
                  Diagnóstico IA de Paredes
                </button>
              </li>
              <li>
                <button onClick={onOpenQuote} className="hover:text-amber-400 transition-colors text-left cursor-pointer">
                  Cotizador con Pintores
                </button>
              </li>
              <li>
                <button onClick={onOpenOrders} className="hover:text-amber-400 transition-colors text-left cursor-pointer">
                  Rastreo de Últimos Pedidos
                </button>
              </li>
              <li><a href="#galeria" className="hover:text-amber-400 transition-colors">Antes y Después (Obras)</a></li>
            </ul>
          </div>

          {/* Sedes & Logistics */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-3">Sedes & Logística</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#sedes" className="hover:text-amber-400 transition-colors">Bogotá D.C. (Sede Principal)</a></li>
              <li><a href="#sedes" className="hover:text-amber-400 transition-colors">Medellín (El Poblado)</a></li>
              <li><a href="#sedes" className="hover:text-amber-400 transition-colors">Cali (Autopista)</a></li>
              <li><a href="#sedes" className="hover:text-amber-400 transition-colors">Barranquilla (Vía 40)</a></li>
              <li className="pt-2 text-[11px] text-amber-300 font-semibold">
                Despachos 24h a toda Colombia
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Payment Methods, Legal & Scroll to top */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-[11px] text-slate-500 text-center md:text-left">
            © {new Date().getFullYear()} PINTUKO PRO Colombia S.A.S. Todos los derechos reservados.
            <div className="mt-0.5">Especialistas en pinturas de alto desempeño y servicios profesionales.</div>
          </div>

          {/* Payment Badges */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">Medios de Pago:</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-bold text-[10px] text-slate-300">PSE</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-bold text-[10px] text-slate-300">Bancolombia</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-bold text-[10px] text-slate-300">Nequi</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-bold text-[10px] text-slate-300">Visa / MC</span>
          </div>

          {/* Back to top button */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <span>Subir al inicio</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
