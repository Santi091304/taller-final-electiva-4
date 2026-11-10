import React, { useState } from 'react';
import { 
  Paintbrush, 
  Search, 
  ShoppingCart, 
  Heart, 
  Clock, 
  Menu, 
  X, 
  ChevronRight, 
  Sparkles,
  Calculator,
  User,
  LogOut
} from 'lucide-react';
import { AuthUser } from './AuthModal';

interface NavbarProps {
  cartCount: number;
  favoritesCount: number;
  onOpenCart: () => void;
  onOpenFavorites: () => void;
  onOpenQuote: () => void;
  onOpenOrders: () => void;
  onOpenCalculator: () => void;
  onOpenAiModal: () => void;
  onOpenAuth: () => void;
  currentUser: AuthUser | null;
  onLogout: () => void;
  onSearch: (query: string) => void;
  searchQuery: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  favoritesCount,
  onOpenCart,
  onOpenFavorites,
  onOpenQuote,
  onOpenOrders,
  onOpenCalculator,
  onOpenAiModal,
  onOpenAuth,
  currentUser,
  onLogout,
  onSearch,
  searchQuery,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);

  const handleNavClick = (anchor: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(anchor);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#080d1a]/95 border-b border-slate-800/80 transition-all">
      {/* Top Notice Banner */}
      {bannerVisible && (
        <div className="bg-gradient-to-r from-blue-900/90 via-[#0e1b36] to-slate-900 text-xs text-slate-200 py-1.5 px-4 border-b border-blue-500/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-center">
            <div className="flex-1 flex items-center justify-center gap-2 text-center">
              <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
              <span className="font-semibold text-amber-300">Envíos Express Inmediatos:</span>
              <span className="text-slate-300 hidden md:inline">Despachos en Bogotá, Medellín, Cali, Barranquilla, Bucaramanga y todo el país.</span>
              <span className="text-slate-300 md:hidden">Despacho express a toda Colombia.</span>
              <span className="hidden lg:inline text-slate-400">· Línea Pro: (601) 745-9000</span>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-slate-300 text-xs">
              <button 
                onClick={onOpenOrders}
                className="hover:text-amber-400 transition-colors flex items-center gap-1 font-medium cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Rastrear Envío
              </button>
              <button 
                onClick={() => setBannerVisible(false)}
                className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                title="Cerrar aviso"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar: Search in top-left corner, centered navigation & logo, actions on right */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Desktop Layout (lg+) */}
        <div className="hidden lg:flex items-center justify-between gap-4 xl:gap-6">
          
          {/* 1. Buscador en toda la esquina superior izquierda */}
          <div className="w-48 lg:w-56 xl:w-64 shrink-0">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Buscar pinturas, colores..."
                className="w-full pl-9 pr-7 py-2 bg-slate-900/90 hover:bg-slate-900 focus:bg-slate-900 border border-slate-700/80 focus:border-blue-500 rounded-xl text-xs text-slate-100 placeholder-slate-400 outline-none transition-all focus:ring-1 focus:ring-blue-500/30 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearch('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  title="Limpiar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 2. Componentes de la parte de arriba centrados (Logo oficial + Enlaces de navegación) */}
          <div className="flex-1 flex items-center justify-center gap-4 xl:gap-6">
            {/* Logo oficial de la marca */}
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex items-center gap-2.5 shrink-0 group"
            >
              <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-amber-400 flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
                <Paintbrush className="w-4.5 h-4.5 xl:w-5 xl:h-5 text-slate-950 -rotate-12" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-lg xl:text-xl tracking-tight text-white">
                    PINTUKO
                  </span>
                  <span className="font-display font-extrabold text-[10px] xl:text-xs px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 uppercase tracking-wider">
                    PRO
                  </span>
                </div>
                <span className="text-[8px] xl:text-[9px] tracking-widest uppercase text-slate-400 font-medium hidden 2xl:inline">
                  Pinturas & Servicios Certificados
                </span>
              </div>
            </a>

            {/* Separador vertical sutil */}
            <div className="h-6 w-px bg-slate-800 hidden xl:block" />

            {/* Enlaces de navegación principales centrados */}
            <nav className="flex items-center gap-3.5 xl:gap-5 text-xs xl:text-sm font-medium text-slate-300">
              <a 
                href="#inicio" 
                onClick={() => handleNavClick('#inicio')}
                className="hover:text-amber-400 transition-colors whitespace-nowrap"
              >
                Inicio
              </a>
              <a 
                href="#galeria" 
                onClick={() => handleNavClick('#galeria')}
                className="hover:text-amber-400 transition-colors whitespace-nowrap"
              >
                <span className="hidden xl:inline">Galería de Trabajos</span>
                <span className="xl:hidden">Galería</span>
              </a>
              <a 
                href="#catalogo" 
                onClick={() => handleNavClick('#catalogo')}
                className="hover:text-amber-400 transition-colors whitespace-nowrap"
              >
                <span className="hidden xl:inline">Catálogo de Pinturas</span>
                <span className="xl:hidden">Catálogo</span>
              </a>
              <button 
                onClick={onOpenCalculator}
                className="hover:text-amber-400 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5 text-blue-400" />
                <span>Calculadora m²</span>
              </button>
              <button 
                onClick={onOpenOrders}
                className="hover:text-amber-400 transition-colors whitespace-nowrap cursor-pointer"
              >
                <span className="hidden xl:inline">Últimos pedidos</span>
                <span className="xl:hidden">Pedidos</span>
              </button>
              <a 
                href="#sedes" 
                onClick={() => handleNavClick('#sedes')}
                className="hover:text-amber-400 transition-colors whitespace-nowrap"
              >
                <span className="hidden xl:inline">Contacto & Sedes</span>
                <span className="xl:hidden">Sedes</span>
              </a>
            </nav>
          </div>

          {/* 3. Acciones a la derecha: Favoritos, Carrito, Iniciar Sesión, Cotizar */}
          <div className="flex items-center gap-2 sm:gap-2.5 xl:gap-3 shrink-0">
            
            {/* Favoritos Button */}
            <button
              onClick={onOpenFavorites}
              className="relative p-2 text-slate-300 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl border border-slate-700/50 transition-colors cursor-pointer"
              title="Lista de Favoritos"
              aria-label="Lista de Favoritos"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-800/80 rounded-xl border border-slate-700/50 transition-colors cursor-pointer"
              title="Carrito de Compras"
              aria-label="Carrito de Compras"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-amber-400 text-[10px] font-extrabold text-slate-950 shadow-sm animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Authentication Button: Iniciar Sesión / Perfil */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 font-black flex items-center justify-center text-[11px] shadow-sm">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-bold text-slate-200 hidden md:inline max-w-[90px] truncate">
                  {currentUser.name}
                </span>
                <button 
                  onClick={onLogout} 
                  className="text-slate-400 hover:text-rose-400 ml-0.5 p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer" 
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-sm"
              >
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Iniciar sesión</span>
              </button>
            )}

            {/* Featured CTA Cotizar Button (Azul brillante con esquinas redondeadas) */}
            <button
              onClick={onOpenQuote}
              className="px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all rounded-xl shadow-lg shadow-blue-600/30 border border-blue-400/40 whitespace-nowrap flex items-center gap-1.5 group cursor-pointer"
            >
              <span>Cotizar</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Header (< lg) */}
        <div className="flex lg:hidden items-center justify-between gap-2.5">
          {/* 1. Buscador en la esquina superior izquierda */}
          <div className="flex-1 max-w-[170px] sm:max-w-xs">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-8 pr-2 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-400 outline-none"
              />
            </div>
          </div>

          {/* 2. Logo corporativo centrado */}
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-1.5 shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-blue-500 to-amber-400 flex items-center justify-center shadow-md shadow-blue-600/30">
              <Paintbrush className="w-4 h-4 text-slate-950 -rotate-12" />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-display font-black text-base text-white">
                PINTUKO
              </span>
              <span className="font-display font-extrabold text-[9px] px-1 py-0.2 rounded bg-amber-400 text-slate-950 uppercase tracking-wider">
                PRO
              </span>
            </div>
          </a>

          {/* 3. Acciones rápidas a la derecha */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onOpenFavorites}
              className="relative p-1.5 text-slate-300 hover:text-rose-400 rounded-lg border border-slate-700/50"
              title="Favoritos"
            >
              <Heart className="w-4 h-4" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 px-0.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenCart}
              className="relative p-1.5 text-slate-300 hover:text-amber-400 rounded-lg border border-slate-700/50"
              title="Carrito"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 px-0.5 items-center justify-center rounded-full bg-amber-400 text-[9px] font-bold text-slate-950">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg border border-slate-700/50 cursor-pointer"
              aria-label="Menú principal"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#080d1a] px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            <button
              onClick={() => handleNavClick('#inicio')}
              className="text-left px-3 py-2.5 text-base font-medium text-slate-200 hover:bg-slate-800/80 rounded-lg cursor-pointer"
            >
              Inicio
            </button>
            <button
              onClick={() => handleNavClick('#galeria')}
              className="text-left px-3 py-2.5 text-base font-medium text-slate-200 hover:bg-slate-800/80 rounded-lg cursor-pointer"
            >
              Galería de Trabajos
            </button>
            <button
              onClick={() => handleNavClick('#catalogo')}
              className="text-left px-3 py-2.5 text-base font-medium text-slate-200 hover:bg-slate-800/80 rounded-lg cursor-pointer"
            >
              Catálogo de Pinturas
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenCalculator(); }}
              className="text-left px-3 py-2.5 text-base font-medium text-blue-400 hover:bg-slate-800/80 rounded-lg flex items-center gap-2 cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              Calculadora m²
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenAiModal(); }}
              className="text-left px-3 py-2.5 text-base font-medium text-amber-400 hover:bg-slate-800/80 rounded-lg flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Pintuko IA Diagnóstico
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenOrders(); }}
              className="text-left px-3 py-2.5 text-base font-medium text-slate-200 hover:bg-slate-800/80 rounded-lg flex items-center gap-2 cursor-pointer"
            >
              <Clock className="w-4 h-4 text-slate-400" />
              Últimos pedidos
            </button>
            <button
              onClick={() => handleNavClick('#sedes')}
              className="text-left px-3 py-2.5 text-base font-medium text-slate-200 hover:bg-slate-800/80 rounded-lg cursor-pointer"
            >
              Contacto & Sedes
            </button>
            
            <div className="pt-2 border-t border-slate-800/80">
              {currentUser ? (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-xs">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-white">{currentUser.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="text-xs text-rose-400 hover:underline cursor-pointer"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <User className="w-4 h-4 text-amber-400" />
                  <span>Iniciar sesión / Registrarse</span>
                </button>
              )}
            </div>
          </nav>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Atención Pro Colombia: (601) 745-9000</span>
            <span className="text-amber-400 font-medium">Lunes a Sábado 7am - 6pm</span>
          </div>
        </div>
      )}
    </header>
  );
};
