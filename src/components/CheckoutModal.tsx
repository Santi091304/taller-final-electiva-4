import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Lock,
  MapPin,
  ShieldCheck,
  Tag,
  Truck,
  User,
  Building2,
  Smartphone,
  Banknote,
  Edit3,
  ShoppingBag,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { CartItem } from '../types';
import { AuthUser } from './AuthModal';
import {
  saveCheckoutOrderToSupabase,
  validateCouponInSupabase,
} from '../lib/supabase';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToCart: () => void;
  items: CartItem[];
  currentUser: AuthUser | null;
  onOrderComplete: (orderNumber: string) => void;
}

type CheckoutStep = 1 | 2 | 3;

const formatCOP = (amount: number): string => {
  return (
    '$ ' +
    amount.toLocaleString('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) +
    ' COP'
  );
};

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onBackToCart,
  items,
  currentUser,
  onOrderComplete,
}) => {
  // Active step & completion tracking
  const [activeStep, setActiveStep] = useState<CheckoutStep>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Paso 1: Identificación
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [documentType, setDocumentType] = useState('CC');
  const [documentNumber, setDocumentNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptNewsletter, setAcceptNewsletter] = useState(true);
  const [step1Error, setStep1Error] = useState<string | null>(null);

  // Paso 2: Envío
  const [city, setCity] = useState('Bogotá D.C.');
  const [address, setAddress] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'express' | 'programado' | 'sede'>('express');
  const [step2Error, setStep2Error] = useState<string | null>(null);

  // Paso 3: Pago
  const [paymentMethod, setPaymentMethod] = useState<'pse' | 'card' | 'nequi' | 'cod'>('pse');
  const [pseBank, setPseBank] = useState('Bancolombia');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [nequiPhone, setNequiPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step3Error, setStep3Error] = useState<string | null>(null);

  // Cupón de descuento (Columna derecha)
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: 'percentage' | 'fixed' | 'free_shipping';
    value: number;
    label: string;
  } | null>(null);
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Orden completada
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderNumber: string;
    total: number;
    city: string;
    synced: boolean;
  } | null>(null);

  // Prefill from authenticated user when opened
  useEffect(() => {
    if (isOpen && currentUser) {
      if (!email) setEmail(currentUser.email);
      if (!firstName && currentUser.name) {
        const parts = currentUser.name.split(' ');
        setFirstName(parts[0] || '');
        if (!lastName && parts.length > 1) {
          setLastName(parts.slice(1).join(' '));
        }
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Financial calculations
  const subtotal = items.reduce((acc, item) => acc + item.sizePrice * item.quantity, 0);
  const freeShippingThreshold = 180000;

  let baseShipping = 0;
  if (items.length > 0 && deliveryMethod !== 'sede') {
    if (deliveryMethod === 'express') {
      baseShipping = subtotal >= freeShippingThreshold ? 0 : 18000;
    } else {
      baseShipping = subtotal >= freeShippingThreshold ? 0 : 12000;
    }
  }

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * appliedCoupon.value) / 100);
    } else if (appliedCoupon.discountType === 'fixed') {
      discountAmount = Math.min(subtotal, appliedCoupon.value);
    } else if (appliedCoupon.discountType === 'free_shipping') {
      discountAmount = baseShipping;
      baseShipping = 0;
    }
  }

  const shippingCost = appliedCoupon?.discountType === 'free_shipping' ? 0 : baseShipping;
  const displayedDiscount =
    appliedCoupon?.discountType === 'free_shipping' ? discountAmount : discountAmount;
  const total = Math.max(
    0,
    subtotal + shippingCost - (appliedCoupon?.discountType === 'free_shipping' ? 0 : discountAmount)
  );

  // Handlers
  const handleStep1Continue = (e: React.FormEvent) => {
    e.preventDefault();
    setStep1Error(null);

    if (!email.trim() || !email.includes('@')) {
      setStep1Error('Por favor ingresa un correo electrónico válido.');
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setStep1Error('Por favor ingresa tu nombre y apellidos completos.');
      return;
    }
    if (!documentNumber.trim() || documentNumber.trim().length < 5) {
      setStep1Error('Por favor ingresa un número de documento válido.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 7) {
      setStep1Error('Por favor ingresa un número de teléfono / móvil de contacto.');
      return;
    }
    if (!acceptTerms) {
      setStep1Error('Debes aceptar los términos, condiciones y política de privacidad para continuar.');
      return;
    }

    setCompletedSteps((prev) => Array.from(new Set([...prev, 1])));
    setActiveStep(2);
  };

  const handleStep2Continue = (e: React.FormEvent) => {
    e.preventDefault();
    setStep2Error(null);

    if (deliveryMethod !== 'sede' && (!address.trim() || address.trim().length < 5)) {
      setStep2Error('Por favor ingresa la dirección completa de entrega o de la obra.');
      return;
    }

    setCompletedSteps((prev) => Array.from(new Set([...prev, 2])));
    setActiveStep(3);
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsValidatingCoupon(true);
    setCouponFeedback(null);

    const res = await validateCouponInSupabase(couponInput);
    setIsValidatingCoupon(false);

    if (res.valid) {
      setAppliedCoupon({
        code: res.code,
        discountType: res.discountType,
        value: res.value,
        label: res.label,
      });
      setCouponFeedback({ type: 'success', text: `Cupón ${res.code} aplicado: ${res.label}` });
      setCouponInput('');
    } else {
      setCouponFeedback({ type: 'error', text: res.label });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponFeedback(null);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep3Error(null);

    if (paymentMethod === 'card' && cardNumber.replace(/\s/g, '').length < 12) {
      setStep3Error('Ingresa un número de tarjeta válido para continuar.');
      return;
    }
    if (paymentMethod === 'nequi' && nequiPhone.trim().length < 10) {
      setStep3Error('Ingresa los 10 dígitos de tu número Nequi o Daviplata.');
      return;
    }

    setIsSubmitting(true);
    const orderNumber = `PK-${Math.floor(100000 + Math.random() * 900000)}`;

    const paymentLabelMap = {
      pse: `PSE (${pseBank})`,
      card: 'Tarjeta Crédito / Débito',
      nequi: `Billetera Digital (${nequiPhone})`,
      cod: 'Pago Contra Entrega',
    };

    const result = await saveCheckoutOrderToSupabase({
      order_number: orderNumber,
      client_email: email.trim(),
      client_first_name: firstName.trim(),
      client_last_name: lastName.trim(),
      document_type: documentType,
      document_number: documentNumber.trim(),
      client_phone: phone.trim(),
      accepted_terms: acceptTerms,
      subscribed_newsletter: acceptNewsletter,
      city,
      shipping_address:
        deliveryMethod === 'sede' ? `Recogida en Sede Principal (${city})` : address.trim(),
      address_details: addressDetails.trim(),
      delivery_method: deliveryMethod,
      payment_method: paymentLabelMap[paymentMethod],
      coupon_code: appliedCoupon?.code || null,
      subtotal_cop: subtotal,
      shipping_cop: shippingCost,
      discount_cop: displayedDiscount,
      total_amount_cop: total,
      items: items.map((item) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        selected_size: item.selectedSize,
        selected_color_name: item.selectedColor.name,
        selected_color_hex: item.selectedColor.hex,
        quantity: item.quantity,
        unit_price_cop: item.sizePrice,
      })),
    });

    setIsSubmitting(false);
    setCompletedSteps((prev) => Array.from(new Set([...prev, 3])));
    setConfirmedOrder({
      orderNumber,
      total,
      city,
      synced: Boolean(result.synced),
    });
    onOrderComplete(orderNumber);
  };

  const handleCloseSuccess = () => {
    setConfirmedOrder(null);
    setActiveStep(1);
    setCompletedSteps([]);
    onClose();
  };

  const totalItemsCount = items.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 bg-[#060a14]/95 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* Top Corporate Checkout Header */}
      <div className="sticky top-0 z-20 bg-[#080d1a]/95 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-amber-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-blue-600/20">
              P
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-lg tracking-tight text-white">
                PINTUKO <span className="text-amber-400">PRO</span>
              </span>
              <span className="hidden sm:inline text-slate-600">|</span>
              <span className="hidden sm:inline text-xs font-medium text-slate-400">
                Checkout Seguro Directo de Fábrica
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              <Lock className="w-3.5 h-3.5" />
              <span className="font-semibold">Compra Protegida SSL</span>
            </div>
            <button
              onClick={confirmedOrder ? handleCloseSuccess : onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Cerrar proceso de compra"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {confirmedOrder ? (
          /* Success Screen */
          <div className="max-w-xl mx-auto my-8 p-8 rounded-3xl bg-[#090f20] border border-emerald-500/40 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/30 text-[11px] font-bold uppercase tracking-wider">
                Pedido Confirmado
              </span>
              <h2 className="text-2xl font-display font-black text-white">
                ¡Gracias por tu compra, {firstName}!
              </h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                Tu orden de despacho para <strong className="text-white">{confirmedOrder.city}</strong> ha sido registrada exitosamente y enviada a nuestra planta de preparación.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Número de Orden:</span>
                <span className="font-mono font-black text-amber-400 text-base">
                  {confirmedOrder.orderNumber}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Correo de confirmación:</span>
                <span className="font-medium text-slate-200">{email}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Pagado / Acordado:</span>
                <span className="font-mono font-bold text-white">
                  {formatCOP(confirmedOrder.total)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Estado de registro:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  {confirmedOrder.synced ? 'Sincronizado con Supabase DB' : 'Registrado en sistema Pintuko PRO'}
                </span>
              </div>
            </div>

            <button
              onClick={handleCloseSuccess}
              className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              Volver a la tienda Pintuko PRO
            </button>
          </div>
        ) : (
          /* 2-Column Checkout Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ============================================================== */}
            {/* COLUMNA IZQUIERDA: Pasos del Checkout (7/12 columns on desktop) */}
            {/* ============================================================== */}
            <div className="lg:col-span-7 space-y-5">
              {/* Top Step Progress Header */}
              <div className="flex items-center justify-between px-1 mb-2">
                <h1 className="text-xl sm:text-2xl font-display font-black text-white">
                  Finalizar Compra
                </h1>
                <span className="text-xs text-slate-400 font-medium">
                  Paso <strong className="text-amber-400">{activeStep}</strong> de 3
                </span>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* PASO 1: IDENTIFICACIÓN                                       */}
              {/* ------------------------------------------------------------ */}
              <div
                className={`rounded-2xl border transition-all overflow-hidden ${
                  activeStep === 1
                    ? 'bg-[#090f20] border-blue-500/50 shadow-xl shadow-blue-950/40'
                    : 'bg-[#090f20]/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Step 1 Header */}
                <div
                  onClick={() => {
                    if (activeStep !== 1) setActiveStep(1);
                  }}
                  className={`flex items-center justify-between px-6 py-4 border-b border-slate-800/80 ${
                    activeStep !== 1 ? 'cursor-pointer' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-colors ${
                        completedSteps.includes(1) && activeStep !== 1
                          ? 'bg-emerald-500 text-slate-950'
                          : activeStep === 1
                          ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {completedSteps.includes(1) && activeStep !== 1 ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        '1'
                      )}
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        <span>Identificación</span>
                      </h2>
                      {completedSteps.includes(1) && activeStep !== 1 && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {firstName} {lastName} · {email} · {documentType} {documentNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  {activeStep !== 1 && completedSteps.includes(1) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveStep(1);
                      }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                  )}
                </div>

                {/* Step 1 Body (Expanded when activeStep === 1) */}
                {activeStep === 1 && (
                  <form onSubmit={handleStep1Continue} className="p-6 space-y-5">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Solicitamos únicamente la información esencial para emitir tu factura electrónica y garantizar la entrega de tu pedido Pintuko PRO.
                    </p>

                    {step1Error && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 font-medium">
                        {step1Error}
                      </div>
                    )}

                    {/* Correo electrónico */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Correo electrónico <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ejemplo@correo.com"
                        className="w-full px-4 py-2.5 bg-slate-950/90 border border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all"
                      />
                    </div>

                    {/* Nombre y Apellidos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300">
                          Nombre <span className="text-amber-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Tu nombre"
                          className="w-full px-4 py-2.5 bg-slate-950/90 border border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300">
                          Apellidos <span className="text-amber-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Tus apellidos"
                          className="w-full px-4 py-2.5 bg-slate-950/90 border border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Tipo de documento, Cédula y Teléfono */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      <div className="sm:col-span-3 space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300">
                          Tipo de doc. <span className="text-amber-400">*</span>
                        </label>
                        <select
                          value={documentType}
                          onChange={(e) => setDocumentType(e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-950/90 border border-slate-700/80 focus:border-blue-500 rounded-xl text-sm text-white outline-none transition-all"
                        >
                          <option value="CC">C.C.</option>
                          <option value="NIT">NIT</option>
                          <option value="CE">C.E.</option>
                          <option value="PP">Pasaporte</option>
                        </select>
                      </div>

                      <div className="sm:col-span-4 space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300">
                          Cédula / Número <span className="text-amber-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={documentNumber}
                          onChange={(e) => setDocumentNumber(e.target.value)}
                          placeholder="1020304050"
                          className="w-full px-4 py-2.5 bg-slate-950/90 border border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all font-mono"
                        />
                      </div>

                      <div className="sm:col-span-5 space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300">
                          Teléfono / Móvil <span className="text-amber-400">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="300 123 4567"
                          className="w-full px-4 py-2.5 bg-slate-950/90 border border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all font-mono"
                        />
                      </div>
                    </div>

                    {/* Checkboxes: Términos y condiciones / Newsletter */}
                    <div className="space-y-3 pt-2 border-t border-slate-800/80">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-950 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                        />
                        <span className="text-xs text-slate-300 leading-relaxed group-hover:text-white transition-colors">
                          Acepto los{' '}
                          <span className="text-blue-400 underline">términos y condiciones</span> y
                          autorizo el tratamiento de mis datos personales conforme a la política de
                          privacidad de PINTUKO PRO. <span className="text-amber-400">*</span>
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={acceptNewsletter}
                          onChange={(e) => setAcceptNewsletter(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-950 text-amber-400 focus:ring-amber-400 cursor-pointer accent-amber-400"
                        />
                        <span className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-200 transition-colors">
                          Quiero recibir el boletín de ofertas técnicas, lanzamientos y guías de colorimetría de Pintuko PRO.
                        </span>
                      </label>
                    </div>

                    {/* Primary CTA Button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 border border-blue-400/40 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                      >
                        <span>Ir para la Entrega</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* ------------------------------------------------------------ */}
              {/* PASO 2: ENVÍO                                                */}
              {/* ------------------------------------------------------------ */}
              <div
                className={`rounded-2xl border transition-all overflow-hidden ${
                  activeStep === 2
                    ? 'bg-[#090f20] border-blue-500/50 shadow-xl shadow-blue-950/40'
                    : 'bg-[#090f20]/60 border-slate-800/90'
                }`}
              >
                {/* Step 2 Header */}
                <div
                  onClick={() => {
                    if (completedSteps.includes(1) && activeStep !== 2) {
                      setActiveStep(2);
                    }
                  }}
                  className={`flex items-center justify-between px-6 py-4 ${
                    activeStep === 2 ? 'border-b border-slate-800/80' : ''
                  } ${completedSteps.includes(1) && activeStep !== 2 ? 'cursor-pointer hover:bg-slate-900/40' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-colors ${
                        completedSteps.includes(2) && activeStep !== 2
                          ? 'bg-emerald-500 text-slate-950'
                          : activeStep === 2
                          ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {completedSteps.includes(2) && activeStep !== 2 ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        '2'
                      )}
                    </div>
                    <div>
                      <h2
                        className={`text-sm sm:text-base font-bold ${
                          activeStep === 2 || completedSteps.includes(2)
                            ? 'text-white'
                            : 'text-slate-400'
                        }`}
                      >
                        Envío
                      </h2>
                      {completedSteps.includes(2) && activeStep !== 2 ? (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {city} · {deliveryMethod === 'sede' ? 'Recogida en Sede PRO' : address}
                        </p>
                      ) : activeStep < 2 ? (
                        <p className="text-[11px] text-slate-500">
                          Esperando completar identificación
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {activeStep !== 2 && completedSteps.includes(2) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveStep(2);
                      }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                  )}
                </div>

                {/* Step 2 Body */}
                {activeStep === 2 && (
                  <form onSubmit={handleStep2Continue} className="p-6 space-y-5">
                    {step2Error && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 font-medium">
                        {step2Error}
                      </div>
                    )}

                    {/* Delivery Method Cards */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-300">
                        Modalidad de despacho
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => setDeliveryMethod('express')}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                            deliveryMethod === 'express'
                              ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500/30'
                              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <Truck className="w-4 h-4 text-amber-400" />
                            <span className="text-[10px] font-bold text-emerald-400">
                              {subtotal >= freeShippingThreshold ? 'GRATIS' : '$ 18.000'}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-white">Envío Express</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Mismo día (2h - 4h)
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeliveryMethod('programado')}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                            deliveryMethod === 'programado'
                              ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500/30'
                              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            <span className="text-[10px] font-bold text-slate-300">
                              {subtotal >= freeShippingThreshold ? 'GRATIS' : '$ 12.000'}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-white">Programado 24h</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Siguiente día hábil
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeliveryMethod('sede')}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                            deliveryMethod === 'sede'
                              ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500/30'
                              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <Building2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-[10px] font-bold text-emerald-400">GRATIS</span>
                          </div>
                          <div className="text-xs font-bold text-white">Retiro en Sede</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Listo en 45 minutos
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* City & Address */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300">
                          Ciudad / Municipio <span className="text-amber-400">*</span>
                        </label>
                        <select
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-950/90 border border-slate-700/80 focus:border-blue-500 rounded-xl text-sm text-white outline-none"
                        >
                          <option value="Bogotá D.C.">Bogotá D.C.</option>
                          <option value="Medellín">Medellín</option>
                          <option value="Cali">Cali</option>
                          <option value="Barranquilla">Barranquilla</option>
                          <option value="Bucaramanga">Bucaramanga</option>
                          <option value="Cartagena">Cartagena</option>
                          <option value="Pereira">Pereira</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300">
                          {deliveryMethod === 'sede' ? 'Sede seleccionada' : 'Dirección de entrega / obra'}{' '}
                          {deliveryMethod !== 'sede' && <span className="text-amber-400">*</span>}
                        </label>
                        {deliveryMethod === 'sede' ? (
                          <div className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-emerald-400 font-medium">
                            Centro de Distribución Pintuko PRO - {city}
                          </div>
                        ) : (
                          <input
                            type="text"
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Ej. Calle 80 # 45 - 20"
                            className="w-full px-4 py-2.5 bg-slate-950/90 border border-slate-700/80 focus:border-blue-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none"
                          />
                        )}
                      </div>
                    </div>

                    {deliveryMethod !== 'sede' && (
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300">
                          Detalles adicionales (Barrio, Torre, Apto o Indicaciones)
                        </label>
                        <input
                          type="text"
                          value={addressDetails}
                          onChange={(e) => setAddressDetails(e.target.value)}
                          placeholder="Ej. Torre 3 Apto 502, Barrio Chapinero"
                          className="w-full px-4 py-2.5 bg-slate-950/90 border border-slate-700/80 focus:border-blue-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none"
                        />
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveStep(1)}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        ← Volver a Identificación
                      </button>

                      <button
                        type="submit"
                        className="px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 border border-blue-400/40 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                      >
                        <span>Ir para el Pago</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* ------------------------------------------------------------ */}
              {/* PASO 3: PAGO                                                 */}
              {/* ------------------------------------------------------------ */}
              <div
                className={`rounded-2xl border transition-all overflow-hidden ${
                  activeStep === 3
                    ? 'bg-[#090f20] border-blue-500/50 shadow-xl shadow-blue-950/40'
                    : 'bg-[#090f20]/60 border-slate-800/90'
                }`}
              >
                {/* Step 3 Header */}
                <div
                  onClick={() => {
                    if (completedSteps.includes(2) && activeStep !== 3) {
                      setActiveStep(3);
                    }
                  }}
                  className={`flex items-center justify-between px-6 py-4 ${
                    activeStep === 3 ? 'border-b border-slate-800/80' : ''
                  } ${completedSteps.includes(2) && activeStep !== 3 ? 'cursor-pointer hover:bg-slate-900/40' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-colors ${
                        activeStep === 3
                          ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      3
                    </div>
                    <div>
                      <h2
                        className={`text-sm sm:text-base font-bold ${
                          activeStep === 3 ? 'text-white' : 'text-slate-400'
                        }`}
                      >
                        Pago
                      </h2>
                      {activeStep < 3 && (
                        <p className="text-[11px] text-slate-500">
                          Esperando completar dirección de envío
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 3 Body */}
                {activeStep === 3 && (
                  <form onSubmit={handleFinalSubmit} className="p-6 space-y-5">
                    {step3Error && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 font-medium">
                        {step3Error}
                      </div>
                    )}

                    {/* Payment Method Selector */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: 'pse', label: 'PSE', icon: Building2, sub: 'Débito bancario' },
                        { id: 'card', label: 'Tarjeta', icon: CreditCard, sub: 'Crédito / Débito' },
                        { id: 'nequi', label: 'Nequi', icon: Smartphone, sub: 'o Daviplata' },
                        { id: 'cod', label: 'Contra Entrega', icon: Banknote, sub: 'Efectivo / Datáfono' },
                      ].map((pm) => {
                        const Icon = pm.icon;
                        const active = paymentMethod === pm.id;
                        return (
                          <button
                            key={pm.id}
                            type="button"
                            onClick={() => setPaymentMethod(pm.id as any)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              active
                                ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500/30'
                                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <Icon
                              className={`w-4 h-4 mb-1.5 ${
                                active ? 'text-amber-400' : 'text-slate-400'
                              }`}
                            />
                            <div className="text-xs font-bold text-white">{pm.label}</div>
                            <div className="text-[10px] text-slate-400">{pm.sub}</div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Dynamic Payment Details */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                      {paymentMethod === 'pse' && (
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-slate-300">
                            Selecciona tu entidad bancaria (PSE)
                          </label>
                          <select
                            value={pseBank}
                            onChange={(e) => setPseBank(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white outline-none"
                          >
                            <option value="Bancolombia">Bancolombia</option>
                            <option value="Banco de Bogotá">Banco de Bogotá</option>
                            <option value="Davivienda">Davivienda</option>
                            <option value="BBVA Colombia">BBVA Colombia</option>
                            <option value="Banco Caja Social">Banco Caja Social</option>
                            <option value="Nequi PSE">Nequi</option>
                          </select>
                          <p className="text-[11px] text-slate-400">
                            Aprobación inmediata sin costos adicionales de comisión.
                          </p>
                        </div>
                      )}

                      {paymentMethod === 'card' && (
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-300">
                              Número de Tarjeta
                            </label>
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              placeholder="4532 •••• •••• 8890"
                              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-mono outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="block text-xs font-semibold text-slate-300">
                                Vencimiento (MM/AA)
                              </label>
                              <input
                                type="text"
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                placeholder="08/28"
                                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-mono outline-none"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-xs font-semibold text-slate-300">
                                Código CVV
                              </label>
                              <input
                                type="password"
                                maxLength={4}
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value)}
                                placeholder="•••"
                                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-mono outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'nequi' && (
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-slate-300">
                            Número celular Nequi / Daviplata
                          </label>
                          <input
                            type="tel"
                            value={nequiPhone}
                            onChange={(e) => setNequiPhone(e.target.value)}
                            placeholder="300 123 4567"
                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-mono outline-none"
                          />
                          <p className="text-[11px] text-slate-400">
                            Recibirás una notificación push en tu celular para autorizar el pago.
                          </p>
                        </div>
                      )}

                      {paymentMethod === 'cod' && (
                        <div className="flex items-start gap-3 text-xs text-slate-300">
                          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-white">Pago al recibir en obra o domicilio</p>
                            <p className="text-slate-400 mt-0.5 leading-relaxed">
                              Nuestro conductor certificado llevará datáfono inalámbrico (Visa/Mastercard) o podrás cancelar en efectivo al verificar el sellado original de fábrica de tus pinturas.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveStep(2)}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        ← Volver a Envío
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-950 font-black text-sm shadow-xl shadow-amber-400/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Procesando Pedido...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            <span>Finalizar Compra · {formatCOP(total)}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* ============================================================== */}
            {/* COLUMNA DERECHA: Resumen de Compra (Fijo/Sticky - 5/12 cols)   */}
            {/* ============================================================== */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <div className="rounded-2xl bg-[#090f20] border border-slate-800 shadow-2xl overflow-hidden">
                {/* Summary Header */}
                <div className="px-6 py-4 bg-[#0d162e] border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <h2 className="text-base font-bold text-white">Resumen de compra</h2>
                    <span className="text-xs font-mono text-slate-400">
                      ({totalItemsCount} {totalItemsCount === 1 ? 'ítem' : 'ítems'})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={onBackToCart}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Volver al carrito</span>
                  </button>
                </div>

                {/* Product Thumbnails Preview */}
                <div className="p-6 max-h-[300px] overflow-y-auto divide-y divide-slate-800/70">
                  {items.map((item) => (
                    <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3.5">
                      <div className="relative w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                        <span
                          className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-950 shadow-sm"
                          style={{ backgroundColor: item.selectedColor.hex }}
                          title={item.selectedColor.name}
                        />
                        <span className="absolute top-1 left-1 min-w-5 h-5 px-1 rounded-md bg-slate-950/90 border border-slate-700 text-[10px] font-bold text-amber-400 flex items-center justify-center font-mono">
                          {item.quantity}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-bold text-white truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Presentación: <span className="text-slate-300 font-medium">{item.selectedSize}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>Color:</span>
                          <span className="text-slate-300 font-medium truncate">
                            {item.selectedColor.name}
                          </span>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-white font-mono tabular-nums">
                          $ {(item.sizePrice * item.quantity).toLocaleString('es-CO')}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Cant. {item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Collapsible Discount Coupon Section */}
                <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-950/40">
                  <button
                    type="button"
                    onClick={() => setCouponOpen(!couponOpen)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-slate-200 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-amber-400" />
                      <span>Agregar cupón de descuento</span>
                    </span>
                    {couponOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {couponOpen && (
                    <div className="mt-3 space-y-2.5 animate-in fade-in duration-150">
                      <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="Ej. PINTUKO10 o PRO15"
                          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl text-xs text-white placeholder-slate-500 uppercase font-mono outline-none"
                        />
                        <button
                          type="submit"
                          disabled={isValidatingCoupon || !couponInput.trim()}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                        >
                          {isValidatingCoupon ? 'Validando...' : 'Aplicar'}
                        </button>
                      </form>

                      {!appliedCoupon && (
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>Prueba:</span>
                          {['PINTUKO10', 'PRO15', 'ENVIOGRATIS'].map((code) => (
                            <button
                              key={code}
                              type="button"
                              onClick={() => setCouponInput(code)}
                              className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 hover:border-amber-400/50 text-amber-300 font-mono cursor-pointer transition-colors"
                            >
                              {code}
                            </button>
                          ))}
                        </div>
                      )}

                      {couponFeedback && (
                        <div
                          className={`text-[11px] font-medium px-2.5 py-1.5 rounded-lg border ${
                            couponFeedback.type === 'success'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          }`}
                        >
                          {couponFeedback.text}
                        </div>
                      )}

                      {appliedCoupon && (
                        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-400/10 border border-amber-400/30 text-xs">
                          <span className="font-mono font-bold text-amber-300">
                            {appliedCoupon.code} ({appliedCoupon.label})
                          </span>
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="text-[11px] text-rose-400 hover:underline font-semibold cursor-pointer"
                          >
                            Quitar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right-Aligned Financial Breakdown */}
                <div className="p-6 border-t border-slate-800 bg-[#0d162e]/80 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Subtotal</span>
                    <span className="text-right font-mono font-semibold text-slate-200 tabular-nums">
                      {formatCOP(subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Envío ({deliveryMethod === 'sede' ? 'Retiro en Sede' : city})</span>
                    <span className="text-right font-mono font-semibold tabular-nums">
                      {shippingCost === 0 ? (
                        <span className="text-emerald-400 font-bold">Gratis</span>
                      ) : (
                        <span className="text-slate-200">{formatCOP(shippingCost)}</span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Descuentos</span>
                    <span className="text-right font-mono font-semibold tabular-nums">
                      {displayedDiscount > 0 ? (
                        <span className="text-emerald-400">- {formatCOP(displayedDiscount)}</span>
                      ) : (
                        <span className="text-slate-400">$ 0,00 COP</span>
                      )}
                    </span>
                  </div>

                  {/* Highlighted Total */}
                  <div className="pt-3 border-t border-slate-700/80 flex items-baseline justify-between gap-4">
                    <span className="text-sm font-bold text-white uppercase tracking-wide">
                      Total
                    </span>
                    <span className="text-right text-xl sm:text-2xl font-black font-mono text-amber-400 tabular-nums">
                      {formatCOP(total)}
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Garantía directa de fábrica Pintuko PRO · Despacho certificado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
