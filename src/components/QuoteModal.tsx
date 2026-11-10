import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  CheckCircle2, 
  Send, 
  Phone, 
  Mail, 
  User, 
  MapPin, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { QuoteData } from '../types';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialArea?: number;
  initialProduct?: string;
  initialCoats?: number;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  initialArea = 80,
  initialProduct = 'Pintuko Vinilo Max Tipo 1',
  initialCoats = 2,
}) => {
  const [formData, setFormData] = useState<QuoteData>({
    projectType: 'residencial',
    surfaceType: initialProduct,
    areaM2: initialArea,
    coats: initialCoats,
    includeLabor: true,
    city: 'Bogotá D.C.',
    name: '',
    phone: '',
    email: '',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  // Real-time calculation estimate
  const materialRate = formData.projectType === 'industrial' ? 38000 : 18000; // per m2 approx
  const laborRate = formData.includeLabor 
    ? (formData.projectType === 'industrial' ? 35000 : 16000)
    : 0;
  
  const estimatedMaterial = Math.round(formData.areaM2 * materialRate);
  const estimatedLabor = Math.round(formData.areaM2 * laborRate);
  const totalEstimate = estimatedMaterial + estimatedLabor;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#090f20] border border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0d162e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <FileText className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Cotizador Oficial Pintuko Pro</h2>
              <p className="text-xs text-slate-400">
                Presupuesto inmediato de materiales directos de fábrica y mano de obra certificada
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">¡Cotización Enviada al Equipo Pro!</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                Gracias, <strong className="text-white">{formData.name || 'Cliente'}</strong>. Un ingeniero técnico de Pintuko Pro se contactará al <strong className="text-amber-400 font-mono">{formData.phone || 'tu número'}</strong> en menos de 15 minutos para formalizar el pliego y coordinar visita de ser necesario.
              </p>

              {/* Estimate summary */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 max-w-md mx-auto text-left space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Metraje cotizado:</span>
                  <span className="font-mono text-white">{formData.areaM2} m²</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Ciudad de ejecución:</span>
                  <span className="text-white">{formData.city}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Mano de obra certificada:</span>
                  <span className="text-emerald-400 font-semibold">{formData.includeLabor ? 'Incluida con garantía' : 'Solo materiales'}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                  <span>Rango Estimado:</span>
                  <span className="text-amber-400 font-mono text-base">
                    ~${totalEstimate.toLocaleString('es-CO')} COP
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Cerrar Ventana
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Project Type */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  1. Tipo de Proyecto o Inmueble:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'residencial', label: 'Residencial', desc: 'Casa / Apto' },
                    { id: 'comercial', label: 'Comercial', desc: 'Local / Oficina' },
                    { id: 'industrial', label: 'Industrial', desc: 'Pisos / Bodega' },
                    { id: 'conjunto', label: 'Edificio', desc: 'Fachadas' },
                  ].map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setFormData({ ...formData, projectType: t.id as any })}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        formData.projectType === t.id
                          ? 'bg-blue-950/80 border-blue-500 text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">{t.label}</div>
                      <div className="text-[10px] text-slate-500">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dimensions & Labor Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    2. Área Estimada (m²):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="10"
                      value={formData.areaM2}
                      onChange={(e) => setFormData({ ...formData, areaM2: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white outline-none focus:border-blue-500"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-400 font-mono">m²</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    3. Ciudad de la Obra:
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-medium text-white outline-none focus:border-blue-500"
                  >
                    <option value="Bogotá D.C.">Bogotá D.C. y Sabana</option>
                    <option value="Medellín">Medellín y Área Metropolitana</option>
                    <option value="Cali">Cali y Valle del Cauca</option>
                    <option value="Barranquilla">Barranquilla y Costa Atlántica</option>
                    <option value="Bucaramanga">Bucaramanga y Santanderes</option>
                  </select>
                </div>
              </div>

              {/* Labor inclusion toggle */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">¿Incluir mano de obra de Pintores Certificados Pintuko Pro?</div>
                  <div className="text-[11px] text-slate-400">Incluye seguro de riesgos laborales (ARL), preparación de superficie y garantía de 5 años.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, includeLabor: !formData.includeLabor })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    formData.includeLabor
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {formData.includeLabor ? 'Sí, Con Pintores' : 'Solo Pintura'}
                </button>
              </div>

              {/* Contact Data */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  4. Datos de Contacto para Envío de Presupuesto:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Nombre o Razón Social"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      required
                      placeholder="Teléfono Celular / WhatsApp"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="email"
                    required
                    placeholder="Correo Electrónico para envío del PDF formal"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Dynamic Cost Projection */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-blue-950/70 border border-blue-500/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    Estimado Preliminar ({formData.areaM2} m²)
                  </span>
                  <div className="text-xl font-black font-mono text-white">
                    ${totalEstimate.toLocaleString('es-CO')}{' '}
                    <span className="text-xs font-normal text-slate-400">COP</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Precios especiales para contratistas</span>
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Cotización</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Respuesta en menos de 15 minutos en horario hábil · Sin compromiso</span>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};
