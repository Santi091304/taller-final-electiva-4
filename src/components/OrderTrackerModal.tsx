import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Search, 
  Truck, 
  Package, 
  CheckCircle2, 
  MapPin, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { RECENT_ORDERS } from '../data/mockData';
import { OrderStatus } from '../types';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(RECENT_ORDERS[0].orderId);
  const [searchTracking, setSearchTracking] = useState<string>('');

  if (!isOpen) return null;

  const currentOrder = RECENT_ORDERS.find(o => 
    o.orderId.toLowerCase() === selectedOrderId.toLowerCase() ||
    (searchTracking && o.orderId.toLowerCase().includes(searchTracking.toLowerCase()))
  ) || RECENT_ORDERS[0];

  const getStepActiveIndex = (status: OrderStatus['status']) => {
    switch (status) {
      case 'Preparando': return 0;
      case 'En Tránsito': return 1;
      case 'En Reparto': return 2;
      case 'Entregado': return 3;
      default: return 1;
    }
  };

  const currentStepIdx = getStepActiveIndex(currentOrder.status);

  const steps = [
    { title: 'Preparado en Fábrica', desc: 'Control de calidad y embalaje' },
    { title: 'En Tránsito', desc: 'Despacho interdepartamental' },
    { title: 'En Reparto Express', desc: 'Vehículo Pintuko Pro hacia destino' },
    { title: 'Entregado en Obra', desc: 'Firma y recibido a conformidad' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#090f20] border border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0d162e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <Clock className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Rastreo de Últimos Pedidos & Despachos</h2>
              <p className="text-xs text-slate-400">
                Consulta en vivo el estado logístico de tus compras Pintuko Pro
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
        <div className="p-6 space-y-6">
          
          {/* Order Selector Chips */}
          <div>
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Seleccionar Pedido Reciente:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {RECENT_ORDERS.map((ord) => (
                <button
                  key={ord.orderId}
                  onClick={() => setSelectedOrderId(ord.orderId)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    currentOrder.orderId === ord.orderId
                      ? 'bg-blue-950/80 border-blue-500 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono font-bold text-xs text-amber-300">
                    <span>{ord.orderId}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-sans">
                      {ord.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-1 truncate">{ord.customerName}</div>
                  <div className="text-[10px] text-slate-500">{ord.city}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Order Details Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Guía de Despacho Nacional
                </span>
                <div className="text-base font-black font-mono text-white">
                  {currentOrder.trackingNumber}
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-slate-400 uppercase">Transportadora:</span>
                <div className="text-xs font-bold text-blue-300">{currentOrder.carrier}</div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="py-2">
              <div className="relative flex items-center justify-between">
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-800 z-0" />
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-amber-400 transition-all duration-500 z-0" 
                  style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((st, i) => {
                  const isPast = i <= currentStepIdx;
                  return (
                    <div key={i} className="relative z-10 flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                        isPast ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30' : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}>
                        {isPast ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                      </div>
                      <span className={`text-[11px] font-semibold mt-1.5 hidden sm:block text-center ${
                        isPast ? 'text-slate-200' : 'text-slate-500'
                      }`}>
                        {st.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Estimation Box */}
            <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-xs font-bold text-white">Estimado de Entrega en Obra:</div>
                  <div className="text-[11px] text-blue-300">{currentOrder.estimatedDelivery}</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400">Total Facturado:</span>
                <div className="text-xs font-mono font-bold text-emerald-400">
                  ${currentOrder.total.toLocaleString('es-CO')} COP
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase mb-1.5">
                Productos en este Despacho:
              </div>
              <div className="space-y-1.5">
                {currentOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-xs py-1.5 px-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                    <span className="text-slate-200">{it.name}</span>
                    <span className="font-mono text-slate-400">{it.qty}x ({it.size})</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Soporte de Entregas PBX: (601) 745-9000
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
            >
              Cerrar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
