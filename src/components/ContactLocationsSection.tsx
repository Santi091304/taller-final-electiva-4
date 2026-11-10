import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  Building2, 
  ShieldCheck,
  Truck
} from 'lucide-react';
import { LOCATIONS } from '../data/mockData';

export const ContactLocationsSection: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Bogotá D.C.');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setName('');
      setPhone('');
      setMessage('');
    }, 4000);
  };

  return (
    <section id="sedes" className="py-20 bg-[#070b16] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-amber-400 mb-3">
            <Building2 className="w-3.5 h-3.5" />
            <span>Presencia Nacional en Colombia</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Contacto & Sedes de Distribución Pro
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-400">
            Laboratorios de colorimetría computarizada, despacho express a obra y asesoría con ingenieros químicos especialistas en recubrimientos.
          </p>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {LOCATIONS.map((loc) => (
            <div
              key={loc.city}
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                loc.isMain
                  ? 'bg-blue-950/40 border-blue-500/50 shadow-xl shadow-blue-950/40'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  {loc.isMain && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                      Sede Fabril
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-white">{loc.city}</h3>
                <p className="text-xs text-slate-300 mt-1">{loc.address}</p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="font-mono">{loc.phone}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-400 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{loc.schedule}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                    Servicios en Sede:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {loc.services.map((s, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <a
                  href={`https://wa.me/573108904000?text=Hola,%20me%20comunico%20desde%20la%20web%20de%20Pintuko%20Pro%20para%20la%20sede%20${encodeURIComponent(loc.city)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Sede</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Consultation Form Box */}
        <div className="max-w-3xl mx-auto p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white">¿Tienes un proyecto grande o licitación pública?</h3>
            <p className="text-xs text-slate-400 mt-1">
              Envíanos los detalles técnicos de tu pliego. Uno de nuestros ingenieros de especificación te asistirá.
            </p>
          </div>

          {formSubmitted ? (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="text-sm font-bold text-white">¡Mensaje recibido con éxito!</div>
              <p className="text-xs text-emerald-300">
                Nos comunicaremos al número proporcionado a la mayor brevedad.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Tu Nombre o Constructora"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                />
                <input
                  type="tel"
                  required
                  placeholder="Teléfono Celular"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                >
                  <option value="Bogotá D.C.">Bogotá D.C.</option>
                  <option value="Medellín">Medellín</option>
                  <option value="Cali">Cali</option>
                  <option value="Barranquilla">Barranquilla</option>
                  <option value="Bucaramanga">Bucaramanga</option>
                  <option value="Otra Ciudad">Otra Ciudad</option>
                </select>
              </div>

              <textarea
                required
                rows={3}
                placeholder="Describe tu requerimiento (ej. m² a pintar, tipo de sustrato, si requieres certificación de ignifugación o epóxico de alta resistencia)..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 resize-none"
              />

              <div className="flex items-center justify-between pt-1">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tratamiento de datos confidencial según Ley 1581</span>
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Consulta Pro</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </section>
  );
};
