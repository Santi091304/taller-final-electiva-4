import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  KeyRound,
  RefreshCw,
  AlertCircle,
  Database,
  Info,
} from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import {
  supabase,
  getSupabaseConfig,
  translateSupabaseAuthError,
} from '../lib/supabase';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser, session: Session) => void;
  noticeMessage?: string | null;
}

type AuthMode = 'login' | 'register' | 'verify' | 'forgot';

const RESEND_COOLDOWN_SECONDS = 60;

export const extractAuthUser = (session: Session): AuthUser => {
  const metaName =
    (session.user.user_metadata?.full_name as string | undefined) ||
    (session.user.user_metadata?.name as string | undefined);
  const email = session.user.email || '';
  const fallbackName = email ? email.split('@')[0] : 'Cliente Pro';
  const formattedFallback = fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1);

  return {
    id: session.user.id,
    name: (metaName && metaName.trim()) || formattedFallback,
    email,
  };
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  noticeMessage,
}) => {
  const [mode, setMode] = useState<AuthMode>('login');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // 6-digit OTP verification state
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // Loading & Feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [needsConfirmationAction, setNeedsConfirmationAction] = useState(false);

  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);
  const supabaseConfig = getSupabaseConfig();

  // Reset transient feedback when modal opens
  useEffect(() => {
    if (isOpen) {
      setAuthError(null);
      setInfoMessage(null);
      setNeedsConfirmationAction(false);
      setIsSubmitting(false);
      setIsResending(false);
    }
  }, [isOpen]);

  // Cooldown timer for OTP resend
  useEffect(() => {
    if (mode !== 'verify' || resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [mode, resendCooldown]);

  if (!isOpen) return null;

  const ensureConfigured = (): boolean => {
    if (!supabaseConfig.isConfigured) {
      setAuthError(
        'Configuración incompleta: falta definir la variable VITE_SUPABASE_URL con la URL real de tu proyecto Supabase para conectar con Supabase Auth.'
      );
      return false;
    }
    return true;
  };

  // 1. REAL LOGIN: supabase.auth.signInWithPassword()
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setInfoMessage(null);
    setNeedsConfirmationAction(false);

    if (!ensureConfigured()) return;

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setAuthError('Ingresa tu correo electrónico y contraseña.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        const msgLower = error.message.toLowerCase();
        if (msgLower.includes('email not confirmed')) {
          setNeedsConfirmationAction(true);
        }
        setAuthError(translateSupabaseAuthError(error));
        return;
      }

      if (!data.session || !data.user) {
        setAuthError('No se recibió una sesión válida desde Supabase. Intenta nuevamente.');
        return;
      }

      if (!data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        setNeedsConfirmationAction(true);
        setAuthError('Debes confirmar tu correo electrónico antes de iniciar sesión.');
        return;
      }

      onLoginSuccess(extractAuthUser(data.session), data.session);
      onClose();
    } catch (err) {
      setAuthError(translateSupabaseAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. REAL SIGN UP: supabase.auth.signUp()
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setInfoMessage(null);
    setNeedsConfirmationAction(false);

    if (!ensureConfigured()) return;

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (!cleanName || !cleanEmail || !password) {
      setAuthError('Completa todos los campos obligatorios para crear tu cuenta.');
      return;
    }

    if (password.length < 6) {
      setAuthError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            phone: cleanPhone,
          },
        },
      });

      if (error) {
        setAuthError(translateSupabaseAuthError(error));
        return;
      }

      // Supabase returns an empty identities array when the email is already registered and confirmed
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        setAuthError('Este correo electrónico ya se encuentra registrado. Por favor inicia sesión.');
        return;
      }

      // If Supabase returned an authenticated confirmed session directly (e.g. confirm email disabled in project)
      if (data.session && data.user && data.user.email_confirmed_at) {
        onLoginSuccess(extractAuthUser(data.session), data.session);
        onClose();
        return;
      }

      if (!data.user) {
        setAuthError('No fue posible crear la cuenta en Supabase. Intenta nuevamente.');
        return;
      }

      // Confirmation email dispatched by Supabase Auth -> move to 6-digit OTP verification step
      setDigits(['', '', '', '', '', '']);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setInfoMessage(
        `Supabase solicitó el envío del código de verificación de 6 dígitos a ${cleanEmail}. Revisa tu bandeja de entrada o carpeta de spam.`
      );
      setMode('verify');

      setTimeout(() => {
        digitRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      setAuthError(translateSupabaseAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle 6-digit OTP inputs
  const handleDigitChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, '');

    if (cleanVal.length > 1) {
      const pasted = cleanVal.slice(0, 6).split('');
      const newDigits = [...digits];
      pasted.forEach((ch, idx) => {
        if (idx < 6) newDigits[idx] = ch;
      });
      setDigits(newDigits);
      setAuthError(null);
      const nextFocus = Math.min(5, pasted.length);
      digitRefs.current[nextFocus]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleanVal;
    setDigits(newDigits);
    setAuthError(null);

    if (cleanVal && index < 5) {
      digitRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
  };

  // 3. REAL OTP VERIFICATION: supabase.auth.verifyOtp({ email, token, type: 'email' })
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setInfoMessage(null);

    if (!ensureConfigured()) return;

    const enteredCode = digits.join('');
    const cleanEmail = email.trim();

    if (enteredCode.length < 6) {
      setAuthError('Por favor ingresa los 6 dígitos completos del código recibido en tu correo.');
      return;
    }

    if (!cleanEmail) {
      setAuthError('Falta el correo electrónico para validar el código.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: enteredCode,
        type: 'email',
      });

      if (error) {
        setAuthError(translateSupabaseAuthError(error));
        return;
      }

      if (!data.session || !data.user) {
        setAuthError(
          'El código no generó una sesión válida. Verifica que el código sea el más reciente o solicita uno nuevo.'
        );
        return;
      }

      onLoginSuccess(extractAuthUser(data.session), data.session);
      onClose();
    } catch (err) {
      setAuthError(translateSupabaseAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. REAL RESEND: supabase.auth.resend({ type: 'signup', email })
  const handleResendCode = async () => {
    if (resendCooldown > 0 || isResending) return;
    setAuthError(null);
    setInfoMessage(null);

    if (!ensureConfigured()) return;

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setAuthError('Ingresa un correo válido para reenviar la confirmación.');
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
      });

      if (error) {
        setAuthError(translateSupabaseAuthError(error));
        return;
      }

      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setDigits(['', '', '', '', '', '']);
      setInfoMessage(`Se envió un nuevo correo de verificación a ${cleanEmail}.`);
      digitRefs.current[0]?.focus();
    } catch (err) {
      setAuthError(translateSupabaseAuthError(err));
    } finally {
      setIsResending(false);
    }
  };

  // 5. REAL PASSWORD RECOVERY: supabase.auth.resetPasswordForEmail()
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setInfoMessage(null);

    if (!ensureConfigured()) return;

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setAuthError('Ingresa tu correo electrónico registrado.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: window.location.origin,
      });

      if (error) {
        setAuthError(translateSupabaseAuthError(error));
        return;
      }

      setInfoMessage(
        `Si el correo ${cleanEmail} está registrado, recibirás un enlace para restablecer tu contraseña.`
      );
    } catch (err) {
      setAuthError(translateSupabaseAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setAuthError(null);
    setInfoMessage(null);
    setNeedsConfirmationAction(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#090f20] border border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#0d162e]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {mode === 'login' && 'Iniciar Sesión en Pintuko PRO'}
                {mode === 'register' && 'Crear Cuenta Profesional'}
                {mode === 'verify' && 'Verificación de Seguridad'}
                {mode === 'forgot' && 'Recuperar Contraseña'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {mode === 'verify'
                  ? 'Ingresa el código de 6 dígitos enviado a tu correo'
                  : 'Autenticación segura con Supabase Auth'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Protected screen redirect notice */}
        {noticeMessage && (
          <div className="px-4 py-3 bg-blue-500/10 border-b border-blue-500/30 text-blue-200 text-xs font-medium flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>{noticeMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Global Info / Error Banners */}
          {infoMessage && (
            <div className="p-3 rounded-xl bg-blue-950/70 border border-blue-500/40 text-blue-200 text-xs flex items-start gap-2 leading-relaxed">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          {authError && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs space-y-2 leading-relaxed">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
              {needsConfirmationAction && email.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    setDigits(['', '', '', '', '', '']);
                    switchMode('verify');
                  }}
                  className="ml-6 text-[11px] font-bold text-amber-300 hover:underline cursor-pointer"
                >
                  Ir a ingresar código de verificación o reenviar correo →
                </button>
              )}
            </div>
          )}

          {/* 1. LOGIN MODE */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu-correo@empresa.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end items-center text-xs">
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verificando credenciales...</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
                ¿No tienes una cuenta aún?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="text-amber-400 hover:underline font-bold cursor-pointer"
                >
                  Regístrate aquí gratis
                </button>
              </div>
            </form>
          )}

          {/* 2. REGISTER MODE */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nombre Completo o Empresa
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre o razón social"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Correo Electrónico (para recibir código)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@empresa.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Teléfono / WhatsApp
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="310 123 4567"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Crear Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-950 font-black text-xs shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Registrando y enviando código...</span>
                  </>
                ) : (
                  <>
                    <span>Continuar y Recibir Código de 6 Dígitos</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
                ¿Ya tienes una cuenta?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-blue-400 hover:underline font-bold cursor-pointer"
                >
                  Iniciar sesión
                </button>
              </div>
            </form>
          )}

          {/* 3. VERIFY 6-DIGIT OTP CODE MODE */}
          {mode === 'verify' && (
            <form onSubmit={handleVerifySubmit} className="space-y-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-base font-bold text-white">Introduce el Código de 6 Dígitos</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Ingresa el código OTP enviado por correo a <strong className="text-white">{email}</strong> para activar tu cuenta.
                </p>
              </div>

              {/* 6 Individual Digit Boxes */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5 my-4">
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      digitRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-13 text-center text-xl font-mono font-black text-amber-400 bg-slate-900 border border-slate-700 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition-all shadow-inner"
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verificando con Supabase...</span>
                    </span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verificar y Activar Cuenta</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isResending}
                    onClick={handleResendCode}
                    className={`cursor-pointer ${
                      resendCooldown > 0 || isResending
                        ? 'text-slate-500 cursor-not-allowed'
                        : 'text-blue-400 hover:underline'
                    }`}
                  >
                    {isResending
                      ? 'Reenviando...'
                      : resendCooldown > 0
                      ? `Reenviar código (${resendCooldown}s)`
                      : 'Reenviar código por correo'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDigits(['', '', '', '', '', '']);
                      switchMode('register');
                    }}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cambiar correo
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* 4. FORGOT PASSWORD MODE */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Ingresa tu correo electrónico registrado y te enviaremos instrucciones de recuperación a través de Supabase Auth.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@empresa.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Enviando solicitud...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar Enlace de Recuperación</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-slate-800 text-center text-xs">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  ← Volver a Iniciar Sesión
                </button>
              </div>
            </form>
          )}

          {/* Honest Supabase Configuration Status */}
          <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Database
                className={`w-3.5 h-3.5 ${
                  supabaseConfig.isConfigured ? 'text-emerald-400' : 'text-amber-400'
                }`}
              />
              <span className="text-slate-300 font-semibold">Supabase Auth</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                supabaseConfig.isConfigured
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}
            >
              {supabaseConfig.isConfigured ? 'Proyecto configurado' : 'Falta VITE_SUPABASE_URL'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
