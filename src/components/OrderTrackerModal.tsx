import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Truck,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Package,
} from 'lucide-react';
import { AuthUser } from './AuthModal';
import { fetchUserOrdersFromSupabase, OrderRecord } from '../lib/supabase';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadOrders = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setFetchError(null);

    const { data, error } = await fetchUserOrdersFromSupabase();
    setIsLoading(false);

    if (error) {
      setFetchError(error.message);
      setOrders([]);
      return;
    }

    setOrders(data);
    if (data.length > 0 && !data.some((o) => o.order_number === selectedOrderNumber)) {
      setSelectedOrderNumber(data[0].order_number);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser) {
      loadOrders();
    }
  }, [isOpen, currentUser?.email]);

  if (!isOpen || !currentUser) return null;

  const currentOrder =
    orders.find((o) => o.order_number === selectedOrderNumber) || orders[0] || null;

  const getStepActiveIndex = (status: OrderRecord['status']) => {
    switch (status) {
      case 'preparando':
        return 0;
      case 'en_camino':
        return 1;
      case 'entregado':
        return 3;
      default:
        return 0;
    }
  };

  const formatStatusLabel = (status: OrderRecord['status']) => {
    switch (status) {
      case 'preparando':
        return 'Preparando';
      case 'en_camino':
        return 'En Camino';
      case 'entregado':
        return 'Entregado';
      default:
        return status;
    }
  };

  const steps = [
    { title: 'Preparado en Fábrica', desc: 'Control de calidad y embalaje' },
    { title: 'En Tránsito', desc: 'Despacho interdepartamental' },
    { title: 'En Reparto Express', desc: 'Vehículo Pintuko Pro hacia destino' },
    { title: 'Entregado en Obra', desc: 'Firma y recibido a conformidad' },
  ];

  const currentStepIdx = currentOrder ? getStepActiveIndex(currentOrder.status) : 0;

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
              <h2 className="text-base font-bold text-white">Mis Pedidos & Despachos</h2>
              <p className="text-xs text-slate-400">
                Historial autenticado de <span className="text-slate-200">{currentUser.email}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
              <span>Consultando tus pedidos en Supabase...</span>
            </div>
          ) : fetchError ? (
            <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p>{fetchError}</p>
                <button
                  onClick={loadOrders}
                  className="text-amber-300 font-bold hover:underline cursor-pointer"
                >
                  Reintentar consulta
                </button>
              </div>
            </div>
          ) : !currentOrder ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <Package className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-sm font-bold text-white">Aún no tienes pedidos registrados</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Cuando completes una compra en el Checkout, aparecerá aquí con su guía y estado de despacho en tiempo real.
              </p>
            </div>
          ) : (
            <>
              {/* Order Selector Chips */}
              <div>
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Tus Pedidos Recientes:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {orders.slice(0, 6).map((ord) => (
                    <button
                      key={ord.order_number}
                      onClick={() => setSelectedOrderNumber(ord.order_number)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        currentOrder.order_number === ord.order_number
                          ? 'bg-blue-950/80 border-blue-500 text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono font-bold text-xs text-amber-300">
                        <span>{ord.order_number}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-sans">
                          {formatStatusLabel(ord.status)}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 mt-1 truncate">{ord.client_name}</div>
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
                      Número de Orden
                    </span>
                    <div className="text-base font-black font-mono text-white">
                      {currentOrder.order_number}
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 uppercase">Destino:</span>
                    <div className="text-xs font-bold text-blue-300">
                      {currentOrder.city} · {currentOrder.shipping_address}
                    </div>
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
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                              isPast
                                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                                : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}
                          >
                            {isPast ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                          </div>
                          <span
                            className={`text-[11px] font-semibold mt-1.5 hidden sm:block text-center ${
                              isPast ? 'text-slate-200' : 'text-slate-500'
                            }`}
                          >
                            {st.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery Box */}
                <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-900/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Truck className="w-5 h-5 text-amber-400" />
                    <div>
                      <div className="text-xs font-bold text-white">Estado del Pedido:</div>
                      <div className="text-[11px] text-blue-300">
                        {formatStatusLabel(currentOrder.status)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400">Total Facturado:</span>
                    <div className="text-xs font-mono font-bold text-emerald-400">
                      ${Number(currentOrder.total_amount_cop || 0).toLocaleString('es-CO')} COP
                    </div>
                  </div>
                </div>

                {/* Order Items Summary */}
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase mb-1.5">
                    Detalle de Productos:
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs text-slate-200 leading-relaxed">
                    {currentOrder.items_summary}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Soporte de Entregas PBX: (601) 745-9000
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
