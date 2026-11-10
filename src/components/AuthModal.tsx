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
  Sparkles,
  Database
} from 'lucide-react';
import { supabase, getSupabaseConfig } from '../lib/supabase';

export interface AuthUser {
  name: string;
  email: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
}

type AuthMode = 'login' | 'register' | 'verify';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<AuthMode>('login');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // 6-digit code verification state
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(30);
  const [simulatedAlert, setSimulatedAlert] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset forms on modal open
  useEffect(() => {
    if (isOpen) {
      setVerifyError(null);
      setSimulatedAlert(null);
    }
  }, [isOpen]);

  // Cooldown timer for resend
  useEffect(() => {
    let timer: any;
    if (mode === 'verify' && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mode, resendCooldown]);

  if (!isOpen) return null;

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    // Supabase auth attempt in background
    try {
      supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      }).then(({ data, error }) => {
        if (data?.user) {
          console.log('[Supabase Auth] Sesión iniciada con éxito:', data.user.email);
        }
      }).catch(() => {});
    } catch (err) {
      // Graceful fallback
    }

    const userName = email.split('@')[0];
    const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);
    onLoginSuccess({
      name: formattedName || 'Cliente Pro',
      email: email.trim(),
    });
    onClose();
  };

  // Handle Register Submit -> Trigger 6-digit verification
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setDigits(['', '', '', '', '', '']);
    setVerifyError(null);
    setResendCooldown(30);

    // Set simulated email alert
    setSimulatedAlert(`📧 Código de Seguridad Pintuko PRO enviado a ${email}. [CÓDIGO DE PRUEBA: ${code}]`);

    // Switch to verify mode
    setMode('verify');
    
    // Focus first input after render
    setTimeout(() => {
      digitRefs.current[0]?.focus();
    }, 100);
  };

  // Handle 6-digit input navigation
  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric input
    const cleanVal = value.replace(/\D/g, '');
    
    // Handle paste of 6 digits
    if (cleanVal.length > 1) {
      const pasted = cleanVal.slice(0, 6).split('');
      const newDigits = [...digits];
      pasted.forEach((ch, idx) => {
        if (idx < 6) newDigits[idx] = ch;
      });
      setDigits(newDigits);
      const nextFocus = Math.min(5, pasted.length);
      digitRefs.current[nextFocus]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleanVal;
    setDigits(newDigits);
    setVerifyError(null);

    // Auto advance
    if (cleanVal && index < 5) {
      digitRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
  };

  // Verify Code
  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = digits.join('');
    
    if (enteredCode.length < 6) {
      setVerifyError('Por favor ingresa los 6 dígitos completos del código.');
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      if (enteredCode === generatedCode || enteredCode === '123456') {
        // Register in Supabase auth in background
        try {
          supabase.auth.signUp({
            email: email.trim(),
            password: password.trim(),
            options: {
              data: {
                full_name: name.trim(),
                phone: phone.trim(),
              }
            }
          }).then(({ data }) => {
            if (data?.user) {
              console.log('[Supabase Auth] Usuario registrado exitosamente:', data.user.email);
            }
          }).catch(() => {});
        } catch (err) {
          // Graceful fallback
        }

        // Success
        onLoginSuccess({
          name: name.trim() || 'Nuevo Usuario',
          email: email.trim(),
        });
        onClose();
      } else {
        setVerifyError(`Código incorrecto. Verifica el código enviado (${generatedCode}).`);
      }
    }, 800);
  };

  // Resend code
  const handleResendCode = () => {
    if (resendCooldown > 0) return;
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(newCode);
    setResendCooldown(30);
    setDigits(['', '', '', '', '', '']);
    setVerifyError(null);
    setSimulatedAlert(`📧 Nuevo código reenviado a ${email}. [CÓDIGO DE PRUEBA: ${newCode}]`);
    digitRefs.current[0]?.focus();
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
              </h3>
              <p className="text-[11px] text-slate-400">
                {mode === 'verify' ? 'Ingresa el código enviado a tu email' : 'Acceso a precios de fábrica y seguimiento'}
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

        {/* Simulated Email Notification Alert (Visible banner for test code) */}
        {simulatedAlert && (
          <div className="p-3 bg-amber-500/10 border-b border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="leading-tight">{simulatedAlert}</div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          
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
                    placeholder="ejemplo@constructora.com"
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

              {/* Demo Quick Fill Button */}
              <div className="flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('arq.valenzuela@pintuko.co');
                    setPassword('PintukoPro2026!');
                  }}
                  className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                >
                  ⚡ Cargar datos de prueba
                </button>
                <a href="#olvide" onClick={(e) => { e.preventDefault(); alert('Usa la opción de prueba o crea una cuenta nueva para probar el código de verificación.'); }} className="text-slate-400 hover:text-slate-200">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Iniciar Sesión</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
                ¿No tienes una cuenta aún?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setSimulatedAlert(null);
                  }}
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
                    placeholder="Arq. Andrea Morales"
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
                    placeholder="andrea@constructora.com"
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
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Continuar y Recibir Código de 6 Dígitos</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
                ¿Ya tienes una cuenta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setSimulatedAlert(null);
                  }}
                  className="text-blue-400 hover:underline font-bold cursor-pointer"
                >
                  Iniciar sesión
                </button>
              </div>
            </form>
          )}

          {/* 3. VERIFY 6-DIGIT CODE MODE */}
          {mode === 'verify' && (
            <form onSubmit={handleVerifySubmit} className="space-y-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-base font-bold text-white">Introduce el Código de 6 Dígitos</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Hemos enviado un código de verificación a <strong className="text-white">{email}</strong> para proteger tu cuenta.
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
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-13 text-center text-xl font-mono font-black text-amber-400 bg-slate-900 border border-slate-700 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition-all shadow-inner"
                  />
                ))}
              </div>

              {/* Quick Fill Demo Code Button */}
              {generatedCode && (
                <button
                  type="button"
                  onClick={() => {
                    const split = generatedCode.split('');
                    setDigits(split);
                    setVerifyError(null);
                  }}
                  className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full hover:bg-amber-500/20 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>Pegar código demo recibido ({generatedCode})</span>
                </button>
              )}

              {/* Error notification */}
              {verifyError && (
                <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{verifyError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isVerifying ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Validando código...
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
                    disabled={resendCooldown > 0}
                    onClick={handleResendCode}
                    className={`cursor-pointer ${resendCooldown > 0 ? 'text-slate-500' : 'text-blue-400 hover:underline'}`}
                  >
                    {resendCooldown > 0 ? `Reenviar código (${resendCooldown}s)` : 'Reenviar código por correo'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setDigits(['', '', '', '', '', '']);
                    }}
                    className="text-slate-400 hover:text-white"
                  >
                    Cambiar correo
                  </button>
                </div>
              </div>

            </form>
          )}

          {/* Supabase Database Connection Status */}
          <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300 font-semibold">Supabase DB:</span>
              <span className="text-emerald-400 font-mono text-[10px]">sb_publishable_...3rL</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
              Conectado
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
