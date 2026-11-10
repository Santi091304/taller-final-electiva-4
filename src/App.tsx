import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CatalogSection } from './components/CatalogSection';
import { GallerySection } from './components/GallerySection';
import { ContactLocationsSection } from './components/ContactLocationsSection';
import { Footer } from './components/Footer';

import { AiDiagnosticModal } from './components/AiDiagnosticModal';
import { CalculatorModal } from './components/CalculatorModal';
import { QuoteModal } from './components/QuoteModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { CartDrawer } from './components/CartDrawer';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { PintukoAiChat } from './components/PintukoAiChat';
import { AuthModal, AuthUser } from './components/AuthModal';

import { PRODUCTS, POPULAR_SEARCHES } from './data/mockData';
import { PaintProduct, CartItem } from './types';
import { Check, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Application State (Inicialmente vacíos según elección del usuario)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('todos');

  // Modals & Drawers visibility
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<PaintProduct | null>(null);

  // Quote Prefill
  const [quotePrefill, setQuotePrefill] = useState<{
    areaM2: number;
    product: PaintProduct;
    coats: number;
  } | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Cart operations
  const handleAddToCart = (
    product: PaintProduct, 
    sizeLabel: string, 
    color: { name: string; hex: string },
    quantity: number = 1
  ) => {
    const sizeObj = product.availableSizes.find(s => s.label === sizeLabel) || product.availableSizes[0];
    const sizePrice = Math.round(product.price * sizeObj.multiplier);
    const existingIndex = cartItems.findIndex(
      item => item.product.id === product.id && 
              item.selectedSize === sizeLabel && 
              item.selectedColor.name === color.name
    );

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += quantity;
      setCartItems(updated);
    } else {
      const newItem: CartItem = {
        id: `${product.id}-${sizeLabel}-${color.name}-${Date.now()}`,
        product,
        selectedSize: sizeLabel,
        sizePrice,
        selectedColor: color,
        quantity,
      };
      setCartItems(prev => [newItem, ...prev]);
    }

    showToast(`✓ "${product.name}" agregado al carrito (${quantity}x)`);
  };

  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(itemId);
      return;
    }
    setCartItems(items => items.map(it => it.id === itemId ? { ...it, quantity: newQty } : it));
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCartItems(items => items.filter(it => it.id !== itemId));
    showToast('Producto eliminado del carrito');
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Favorites operations
  const handleToggleFavorite = (product: PaintProduct) => {
    if (favoriteIds.includes(product.id)) {
      setFavoriteIds(prev => prev.filter(id => id !== product.id));
      showToast(`"${product.name}" eliminado de favoritos`);
    } else {
      setFavoriteIds(prev => [...prev, product.id]);
      showToast(`"${product.name}" guardado en favoritos`);
    }
  };

  const handleRemoveFavorite = (product: PaintProduct) => {
    setFavoriteIds(prev => prev.filter(id => id !== product.id));
  };

  // Quote with details from calculator
  const handleOpenQuoteWithDetails = (areaM2: number, product: PaintProduct, coats: number) => {
    setQuotePrefill({ areaM2, product, coats });
    setIsQuoteModalOpen(true);
  };

  const favoriteProducts = PRODUCTS.filter(p => favoriteIds.includes(p.id));
  const cartCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 border border-amber-400/60 text-slate-100 text-xs font-bold shadow-2xl shadow-black/80 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        cartCount={cartCount}
        favoritesCount={favoriteIds.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenQuote={() => setIsQuoteModalOpen(true)}
        onOpenOrders={() => setIsOrdersModalOpen(true)}
        onOpenCalculator={() => setIsCalculatorModalOpen(true)}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        currentUser={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          showToast('Has cerrado sesión correctamente');
        }}
        onSearch={(term) => setSearchQuery(term)}
        searchQuery={searchQuery}
      />

      {/* Hero Section */}
      <main className="flex-1">
        <HeroSection
          onSearchSubmit={(term) => setSearchQuery(term)}
          onOpenAiModal={() => setIsAiModalOpen(true)}
          onSelectCategoryFilter={(categoryTag) => {
            setActiveCategory(categoryTag);
            setSearchQuery(categoryTag);
          }}
          popularSearches={POPULAR_SEARCHES}
        />

        {/* Gallery Section with Before & After Slider */}
        <GallerySection
          onOpenQuote={() => setIsQuoteModalOpen(true)}
        />

        {/* Catalog Section */}
        <CatalogSection
          products={PRODUCTS}
          activeCategory={activeCategory}
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            setSearchQuery('');
          }}
          searchQuery={searchQuery}
          onAddToCart={(prod, size, col) => handleAddToCart(prod, size, col)}
          onToggleFavorite={handleToggleFavorite}
          favoriteIds={favoriteIds}
          onOpenProductDetail={(prod) => setSelectedProductDetail(prod)}
        />

        {/* Contact and Sede Distribution Centers */}
        <ContactLocationsSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenCalculator={() => setIsCalculatorModalOpen(true)}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenQuote={() => setIsQuoteModalOpen(true)}
        onOpenOrders={() => setIsOrdersModalOpen(true)}
      />

      {/* Modals & Drawers */}
      <AiDiagnosticModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onAddToCart={(prod, size, col) => handleAddToCart(prod, size, col)}
        onOpenQuote={() => setIsQuoteModalOpen(true)}
      />

      <CalculatorModal
        isOpen={isCalculatorModalOpen}
        onClose={() => setIsCalculatorModalOpen(false)}
        onAddToCart={(prod, size, col, qty) => handleAddToCart(prod, size, col, qty)}
        onOpenQuoteWithDetails={handleOpenQuoteWithDetails}
      />

      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => {
          setIsQuoteModalOpen(false);
          setQuotePrefill(null);
        }}
        initialArea={quotePrefill?.areaM2 || 80}
        initialProduct={quotePrefill?.product?.name || 'Pintuko Vinilo Max Tipo 1'}
        initialCoats={quotePrefill?.coats || 2}
      />

      <OrderTrackerModal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favoriteProducts}
        onRemoveFavorite={handleRemoveFavorite}
        onAddToCart={(prod, size, col) => handleAddToCart(prod, size, col)}
      />

      <ProductDetailModal
        product={selectedProductDetail}
        onClose={() => setSelectedProductDetail(null)}
        onAddToCart={(prod, size, col) => handleAddToCart(prod, size, col)}
      />

      {/* Authentication Modal (Login, Register & 6-Digit Verification Code) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`¡Bienvenido a PINTUKO PRO, ${user.name}!`);
        }}
      />

      {/* Floating Virtual Assistant Pintuko IA (Speech Synthesis & Photo Diagnosis) */}
      <PintukoAiChat
        onOpenCalculator={() => setIsCalculatorModalOpen(true)}
        onOpenQuote={() => setIsQuoteModalOpen(true)}
        onSelectProductCategory={(cat) => {
          setActiveCategory(cat);
          const el = document.getElementById('catalogo');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

    </div>
  );
}
