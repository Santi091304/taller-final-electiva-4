import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [selectedCity, setSelectedCity] = useState('Bogotá D.C.');
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderCode, setOrderCode] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + (item.sizePrice * item.quantity), 0);
  const freeShippingThreshold = 180000;
  const shippingCost = subtotal >= freeShippingThreshold || items.length === 0 ? 0 : 18000;
  const total = subtotal + shippingCost;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleCheckout = () => {
    const code = `PK-${Math.floor(1000 + Math.random() * 9000)}`;
    setOrderCode(code);
    setOrderCompleted(true);
  };

  const handleFinish = () => {
    onClearCart();
    setOrderCompleted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#090f20] border-l border-slate-800 h-full flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#0d162e]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Tu Carrito de Pinturas</h2>
            <span className="text-xs font-mono text-slate-400">({items.length} ítems)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderCompleted ? (
          /* Order Confirmation View */
          <div className="p-6 flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">¡Pedido Registrado con Éxito!</h3>
            <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
              Hemos generado tu orden de despacho directo de fábrica con transporte express para <strong className="text-white">{selectedCity}</strong>.
            </p>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 w-full">
              <span className="text-[11px] text-slate-400 uppercase font-medium">Código de Despacho:</span>
              <div className="text-lg font-black font-mono text-amber-400 mt-0.5">{orderCode}</div>
              <span className="text-[10px] text-emerald-400">Entrega programada en menos de 24 horas</span>
            </div>
            <button
              onClick={handleFinish}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              Aceptar y Cerrar
            </button>
          </div>
        ) : (
          <>
            {/* Free Shipping Progress Indicator */}
            <div className="p-4 bg-slate-900/90 border-b border-slate-800/80">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  {subtotal >= freeShippingThreshold
                    ? '¡Felicidades! Tienes Envío Gratis a Obra'
                    : `Faltan $${(freeShippingThreshold - subtotal).toLocaleString('es-CO')} para Envío Gratis`}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-amber-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-16 space-y-3 px-4">
                  <div className="w-14 h-14 rounded-full bg-slate-800/60 flex items-center justify-center mx-auto text-slate-500 border border-slate-700/60">
                    <ShoppingBag className="w-7 h-7 text-amber-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Tu carrito está completamente vacío</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Aún no has agregado pinturas a tu pedido. Elige tus colores y tamaños favoritos en el catálogo interactivo.
                  </p>
                  <a
                    href="#catalogo"
                    onClick={() => onClose()}
                    className="inline-flex items-center gap-2 mt-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    <span>Explorar Catálogo de Pinturas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex gap-3 items-center justify-between"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-14 h-14 rounded-lg object-cover bg-black shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">
                        {item.product.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="font-medium text-slate-300">{item.selectedSize}</span>
                        <span>·</span>
                        <div className="flex items-center gap-1">
                          <span 
                            className="w-2.5 h-2.5 rounded-full border border-white/20"
                            style={{ backgroundColor: item.selectedColor.hex }}
                          />
                          <span className="truncate">{item.selectedColor.name}</span>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-amber-400 mt-1 tabular-nums">
                        ${(item.sizePrice * item.quantity).toLocaleString('es-CO')} COP
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex items-center border border-slate-700 rounded-lg bg-slate-950">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-white font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Checkout Footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-slate-800 bg-[#0d162e] space-y-3">
                
                {/* Destination City */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Ciudad de entrega:</span>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 outline-none font-medium"
                  >
                    <option value="Bogotá D.C.">Bogotá D.C. (Despacho 2h)</option>
                    <option value="Medellín">Medellín (Despacho 24h)</option>
                    <option value="Cali">Cali (Despacho 24h)</option>
                    <option value="Barranquilla">Barranquilla (Despacho 24h)</option>
                    <option value="Bucaramanga">Bucaramanga (Despacho 24h)</option>
                  </select>
                </div>

                {/* Subtotals */}
                <div className="space-y-1 text-xs border-t border-slate-800/80 pt-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal pinturas:</span>
                    <span className="font-mono text-slate-200">${subtotal.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Transporte express a obra:</span>
                    <span className="font-mono text-slate-200">
                      {shippingCost === 0 ? <strong className="text-emerald-400 font-bold">GRATIS</strong> : `$${shippingCost.toLocaleString('es-CO')}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-slate-800">
                    <span>Total a Pagar:</span>
                    <span className="text-amber-400 font-mono text-base font-black">
                      ${total.toLocaleString('es-CO')} COP
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Confirmar Pedido Express</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pago 100% seguro contra entrega o PSE · Garantía de fábrica</span>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};
