import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '@/shared/api/axiosInstance';
import { toast } from 'react-hot-toast';
import { usePos } from './context/PosContext';
import { usePosCart } from './hooks/usePosCart';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import type { PosProduct } from './types/pos.types';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus,
  Minus, 
  Coins, 
  Sparkles, 
  PlusCircle, 
  Loader2, 
  Scan,
  CheckCircle2
} from 'lucide-react';

import { ClientSearchBar } from './components/ClientSearchBar';

export const PossScreen: React.FC = () => {
  useDocumentTitle('Punto de Venta (POS) - D\'Mendoza');
  
  const { activeRegister, branchId } = usePos();
  const { cartItems, addItem, updateQty, removeItem, clearCart, totals } = usePosCart();

  // Search and Product List States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PosProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Client Link State (HU-033)
  const [linkedClient, setLinkedClient] = useState<{ id: number; name: string; documentId: string } | null>(null);

  // References for barcode scanner (T-119)
  const searchInputRef = useRef<HTMLInputElement>(null);
  const keyTimesRef = useRef<number[]>([]);

  // Fetch some initial popular products in this branch when page loads
  useEffect(() => {
    const fetchInitialProducts = async () => {
      if (!branchId) return;
      setLoadingInitial(true);
      try {
        // Query empty or generic search to fetch top branch items
        const { data } = await axiosInstance.get(`/v1/pos/products?sku=`);
        if (data.success) {
          setSearchResults(data.data.slice(0, 8)); // Top 8 items
        }
      } catch {
        toast.error('Error al precargar catálogo de productos');
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchInitialProducts();
  }, [branchId]);

  // Main search function returning matching items
  const handleSearch = async (queryStr: string): Promise<PosProduct[]> => {
    if (!queryStr.trim()) {
      setSearchResults([]);
      return [];
    }
    setSearching(true);
    try {
      const { data } = await axiosInstance.get(`/v1/pos/products?sku=${encodeURIComponent(queryStr)}`);
      if (data.success) {
        setSearchResults(data.data);
        return data.data;
      }
      return [];
    } catch {
      toast.error('Error al buscar productos');
      return [];
    } finally {
      setSearching(false);
    }
  };

  // Debounced/Triggered search input handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    // Perform standard search after short delay
    const delayDebounce = setTimeout(() => {
      handleSearch(val);
    }, 300);

    return () => clearTimeout(delayDebounce);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error('El carrito de ventas está vacío');
      return;
    }

    const payValue = parseFloat(paymentAmount);
    if (isNaN(payValue) || payValue < totals.total) {
      toast.error(`Monto de pago inválido. Debe cubrir el total de S/. ${totals.total.toFixed(2)}`);
      return;
    }

    setCheckoutLoading(true);
    // Simulate payment transaction
    setTimeout(() => {
      const change = payValue - totals.total;
      toast.success(`¡Venta procesada con éxito! Vuelto: S/. ${change.toFixed(2)}`);
      clearCart();
      setPaymentAmount('');
      setCheckoutLoading(false);
    }, 1200);
  };

  // Keyboard shortcut & automatic fast barcode scanner listener (T-119)
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // F2 focuses the search box instantly
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
        toast.success('Buscador enfocado (Modo lector listo)', { duration: 1500 });
        return;
      }

      // Barcode Scanner detection logic:
      // Scanners input characters very rapidly and finish with "Enter"
      const now = performance.now();
      keyTimesRef.current.push(now);

      // Keep only the last 5 keypress times to calculate running average
      if (keyTimesRef.current.length > 5) {
        keyTimesRef.current.shift();
      }

      // If user presses Enter in search box, check if it was entered rapidly (automatic scanner)
      if (e.key === 'Enter' && document.activeElement === searchInputRef.current) {
        e.preventDefault();
        
        // Calculate average time between keypresses
        let isScanner = false;
        if (keyTimesRef.current.length >= 2) {
          const intervals = [];
          for (let i = 1; i < keyTimesRef.current.length; i++) {
            intervals.push(keyTimesRef.current[i] - keyTimesRef.current[i - 1]);
          }
          const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
          // Standard typing speed is > 150ms per key. Scanners are typically < 30ms.
          // Requirement: auto-submit on Enter after rapid read (< 200ms between characters).
          if (avgInterval < 200) {
            isScanner = true;
          }
        }

        const scanQuery = searchQuery.trim();
        if (scanQuery) {
          // Instantly query server for the exact SKU
          const results = await handleSearch(scanQuery);
          
          if (results.length > 0) {
            // Find an exact SKU match to prevent adding wrong products on generic text
            const exactMatch = results.find(
              (p) => p.sku.toLowerCase() === scanQuery.toLowerCase()
            );

            if (exactMatch) {
              addItem(exactMatch, 1);
              setSearchQuery(''); // Clean instantly for the next scan
              
              if (isScanner) {
                toast.success(`Código de barras leído: ${exactMatch.sku}`, { icon: '🏷️' });
              }
            } else if (results.length === 1) {
              // If only one product returned (even if not exact match) we can add it for fast flow
              addItem(results[0], 1);
              setSearchQuery('');
            } else {
              toast.error('Múltiples coincidencias. Selecciona manualmente.', { icon: '🔍' });
            }
          } else {
            toast.error(`No se encontró ningún producto con SKU: "${scanQuery}"`, { icon: '❌' });
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, addItem]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* POS Top Title / Meta Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#D9D9D2]/40 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#3F3F3F]/80 uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#3F3F3F]" />
            <span>Módulo de Facturación Frecuente</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#3F3F3F] tracking-tight flex items-center gap-2">
            Punto de Venta (POS)
          </h1>
        </div>

        {activeRegister && (
          <div className="flex items-center gap-2.5 px-4 py-2 bg-[#F7F7F5] border border-[#D9D9D2]/70 rounded-2xl shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-bold text-[#3F3F3F] uppercase tracking-wider">
              {activeRegister.name}
            </span>
          </div>
        )}
      </div>

      {/* Grid workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Catalog / Product Search (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Search Box */}
          <div className="bg-white p-4 rounded-2xl border border-[#D9D9D2]/60 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[#3F3F3F] uppercase tracking-wider flex items-center gap-1.5">
                <Scan className="w-3.5 h-3.5 text-[#6B6B6B]" />
                <span>Búsqueda de Prendas y Variantes</span>
              </label>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-semibold text-gray-500 bg-[#FAFAFA] border rounded shadow-sm">
                Presiona F2
              </kbd>
            </div>
            
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                placeholder="Escribe el nombre o escanea el código de barras (SKU)..."
                className="w-full pl-10 pr-4 py-3 bg-[#FAFAFA] border border-[#D9D9D2]/80 rounded-xl outline-none text-sm text-[#3F3F3F] placeholder-[#6B6B6B]/40 focus:ring-2 focus:ring-[#3F3F3F]/15 focus:border-[#3F3F3F] transition-all font-semibold"
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B6B6B]/60">
                {searching ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#3F3F3F]" />
                ) : (
                  <Search className="w-4.5 h-4.5" />
                )}
              </div>
            </div>

            {/* Client Search and Registration Area (HU-033 / T-123) */}
            <div className="pt-3 border-t border-[#D9D9D2]/30">
              <ClientSearchBar 
                linkedClient={linkedClient} 
                onSelectClient={setLinkedClient} 
              />
            </div>
          </div>

          {/* Results Area */}
          <div className="bg-white rounded-2xl border border-[#D9D9D2]/60 shadow-sm overflow-hidden flex flex-col max-h-[500px]">
            <div className="px-4 py-3 bg-[#F7F7F5] border-b border-[#D9D9D2]/40 flex justify-between items-center">
              <span className="text-xs font-bold text-[#3F3F3F] uppercase tracking-wider">Catálogo Disponible</span>
              <span className="text-[10px] bg-[#3F3F3F]/10 text-[#3F3F3F] font-bold px-2 py-0.5 rounded-full">
                {searchResults.length} variantes
              </span>
            </div>

            <div className="divide-y divide-[#D9D9D2]/30 overflow-y-auto flex-1">
              {loadingInitial ? (
                <div className="p-12 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-[#3F3F3F]" />
                  <span className="text-xs text-[#6B6B6B] font-semibold">Cargando variantes de tienda...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-12 text-center text-xs text-[#6B6B6B]/70 space-y-1">
                  <p className="font-bold text-[#3F3F3F]">Sin resultados en la búsqueda</p>
                  <p>Intenta tecleando palabras clave o usa el lector de código de barras físico.</p>
                </div>
              ) : (
                searchResults.map((prod) => {
                  const outOfStock = prod.stock <= 0;
                  return (
                    <div 
                      key={prod.variantId} 
                      className={`p-4 flex items-center justify-between gap-4 hover:bg-[#F7F7F5]/50 transition-colors ${
                        outOfStock ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-[#3F3F3F] truncate">{prod.name}</div>
                        <div className="text-[10px] text-[#6B6B6B] mt-0.5 font-mono">{prod.sku}</div>
                        <div className="flex gap-1.5 mt-1.5">
                          {Object.entries(prod.attributes).map(([key, val]) => (
                            <span key={key} className="text-[9px] bg-[#F7F7F5] border border-[#D9D9D2]/40 text-[#6B6B6B] px-1.5 py-0.5 rounded-md font-semibold">
                              {key}: {val}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 flex items-center gap-4">
                        <div>
                          <div className="font-extrabold text-sm text-[#3F3F3F]">S/. {prod.price.toFixed(2)}</div>
                          <div className={`text-[10px] font-bold mt-1 ${
                            prod.stock <= 5 ? 'text-rose-600' : 'text-emerald-700'
                          }`}>
                            {outOfStock ? 'Agotado' : `${prod.stock} disp.`}
                          </div>
                        </div>

                        <button
                          disabled={outOfStock}
                          onClick={() => addItem(prod)}
                          className="p-2 bg-[#3F3F3F] hover:bg-[#3F3F3F]/90 text-white rounded-xl transition-all shadow hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          title="Agregar prenda"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Sales Cart & Totals Panel (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Cart Table Container */}
          <div className="bg-white rounded-2xl border border-[#D9D9D2]/60 shadow-sm overflow-hidden flex flex-col min-h-[350px]">
            
            {/* Cart Header */}
            <div className="px-5 py-4 bg-[#F7F7F5] border-b border-[#D9D9D2]/40 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[#3F3F3F]" />
                <span className="text-xs font-bold text-[#3F3F3F] uppercase tracking-wider">Carrito de Facturación</span>
              </div>
              
              {cartItems.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Vaciar
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 divide-y divide-[#D9D9D2]/20 overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
                  <div className="p-4 bg-[#F7F7F5] text-gray-400 rounded-full border border-dashed border-[#D9D9D2]">
                    <ShoppingCart className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#3F3F3F]">Carrito vacío</h3>
                  <p className="text-xs text-[#6B6B6B] max-w-xs">
                    Busca productos en el buscador de la izquierda o escanea con el lector láser de código de barras para comenzar.
                  </p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.variantId} className="p-4 flex items-center justify-between gap-4 hover:bg-[#FAFAFA]/40 transition-colors">
                    
                    {/* Item Information */}
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm text-[#3F3F3F] truncate">{item.name}</div>
                      <div className="text-[10px] text-[#6B6B6B] font-mono mt-0.5">{item.sku}</div>
                      <div className="flex gap-1.5 mt-1.5">
                        {Object.entries(item.attributes).map(([k, v]) => (
                          <span key={k} className="text-[9px] bg-[#FAFAFA] border text-gray-500 px-1.5 py-0.5 rounded font-semibold">
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Inline edit of quantities (T-118 Requirement) */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      
                      {/* Price per Unit */}
                      <div className="text-right">
                        <div className="text-[10px] text-[#6B6B6B] font-semibold">Precio Unit.</div>
                        <div className="font-bold text-xs text-[#3F3F3F]">S/. {item.price.toFixed(2)}</div>
                      </div>

                      {/* Quantity Selectors */}
                      <div className="flex items-center bg-[#F7F7F5] border border-[#D9D9D2] rounded-xl px-1.5 py-1">
                        <button
                          onClick={() => updateQty(item.variantId, item.quantity - 1)}
                          className="p-1 hover:bg-[#D9D9D2] rounded-lg transition-colors text-[#3F3F3F]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 font-extrabold text-sm text-[#3F3F3F] min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.variantId, item.quantity + 1)}
                          className="p-1 hover:bg-[#D9D9D2] rounded-lg transition-colors text-[#3F3F3F]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Total accumulated line */}
                      <div className="text-right w-20">
                        <div className="text-[10px] text-[#6B6B6B] font-semibold">Subtotal</div>
                        <div className="font-extrabold text-sm text-[#3F3F3F]">
                          S/. {(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>

                      {/* Delete item button */}
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="p-2 text-[#6B6B6B] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Eliminar de carrito"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>

                  </div>
                ))
              )}
            </div>

            {/* Sub-panel totals (IGV / Tax desglosado - T-118 Requirement) */}
            <div className="bg-[#F7F7F5] p-5 border-t border-[#D9D9D2]/50 space-y-4">
              <div className="grid grid-cols-2 gap-y-2.5 text-sm">
                <span className="text-[#6B6B6B] font-semibold">Subtotal Neto (Afecto):</span>
                <span className="text-right text-[#3F3F3F] font-bold">S/. {totals.subtotal.toFixed(2)}</span>
                
                <span className="text-[#6B6B6B] font-semibold">IGV (18% Incluido):</span>
                <span className="text-right text-[#3F3F3F] font-bold">S/. {totals.tax.toFixed(2)}</span>
                
                <div className="col-span-2 border-t border-[#D9D9D2]/40 my-1"></div>
                
                <span className="text-base font-extrabold text-[#3F3F3F] uppercase tracking-wider">Total a Cobrar:</span>
                <span className="text-right text-xl font-extrabold text-[#3F3F3F]">S/. {totals.total.toFixed(2)}</span>
              </div>

              {/* Checkout fast module */}
              {cartItems.length > 0 && (
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      min="0"
                      step="0.10"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Monto entregado (Efectivo)..."
                      className="w-full pl-9 pr-3 py-3 rounded-xl border border-[#D9D9D2] bg-white text-sm text-[#3F3F3F] font-extrabold focus:outline-none focus:ring-1 focus:ring-[#3F3F3F] focus:border-[#3F3F3F]"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Coins className="w-4 h-4" />
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    className="w-full sm:w-auto px-6 py-3 bg-[#3F3F3F] hover:bg-[#3F3F3F]/90 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {checkoutLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Procesar Pago</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default PossScreen;
