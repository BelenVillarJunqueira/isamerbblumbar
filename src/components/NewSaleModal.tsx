import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';
import { metaPixelTracker } from '../lib/metaPixel';
import {
  X,
  TrendingUp,
  ShoppingBag,
  Package,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
} from 'lucide-react';

export const NewSaleModal: React.FC = () => {
  const {
    isNewSaleModalOpen,
    setIsNewSaleModalOpen,
    products,
    combos,
    clients,
    locales,
    registerSale,
    businessConfig,
    getComboMaxStock,
    selectedBusiness,
  } = useApp();

  const [saleBusiness, setSaleBusiness] = useState<'bbimport' | 'lumbarfix'>(
    selectedBusiness === 'lumbarfix' ? 'lumbarfix' : 'bbimport',
  );
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [customClientName, setCustomClientName] = useState<string>('Consumidor Final');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [discount, setDiscount] = useState<number>(0);
  const [saleNotes, setSaleNotes] = useState<string>('');

  // Available items for the selected store
  const availableProducts = products.filter(
    (p) => (p.businessId || 'bbimport') === saleBusiness,
  );
  const availableCombos = combos.filter(
    (c) => (c.businessId || 'bbimport') === saleBusiness,
  );

  // Cart items
  const [cartItems, setCartItems] = useState<{
    type: 'product' | 'combo';
    id: string;
    quantity: number;
  }[]>([
    {
      type: 'product',
      id: products.find((p) => (p.businessId || 'bbimport') === (selectedBusiness === 'lumbarfix' ? 'lumbarfix' : 'bbimport'))?.id || products[0]?.id || '',
      quantity: 1,
    },
  ]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  useEffect(() => {
    if (isNewSaleModalOpen) {
      try {
        metaPixelTracker.initiateCheckout({
          total: finalTotal || 30000,
          numItems: cartItems.length || 1,
          businessId: saleBusiness,
        });
      } catch {}
    }
  }, [isNewSaleModalOpen]);

  if (!isNewSaleModalOpen) return null;

  // Handle business store switch
  const handleBusinessChange = (newBiz: 'bbimport' | 'lumbarfix') => {
    setSaleBusiness(newBiz);
    const firstProd = products.find((p) => (p.businessId || 'bbimport') === newBiz);
    if (firstProd) {
      setCartItems([{ type: 'product', id: firstProd.id, quantity: 1 }]);
    }
  };

  // Calculate live totals
  let subtotal = 0;
  let totalCost = 0;

  cartItems.forEach((item) => {
    if (item.type === 'product') {
      const prod = products.find((p) => p.id === item.id);
      if (prod) {
        subtotal += prod.sellingPrice * item.quantity;
        totalCost += prod.costPrice * item.quantity;
      }
    } else {
      const combo = combos.find((c) => c.id === item.id);
      if (combo) {
        subtotal += combo.sellingPrice * item.quantity;
        let comboUnitCost = 0;
        combo.components.forEach((comp) => {
          const compProd = products.find((p) => p.id === comp.productId);
          if (compProd) comboUnitCost += compProd.costPrice * comp.quantity;
        });
        totalCost += comboUnitCost * item.quantity;
      }
    }
  });

  const finalTotal = Math.max(0, subtotal - discount);
  const expectedProfit = finalTotal - totalCost;
  const expectedMargin = finalTotal > 0 ? (expectedProfit / finalTotal) * 100 : 0;

  const handleAddItem = (type: 'product' | 'combo') => {
    if (type === 'product' && availableProducts.length > 0) {
      const prod = availableProducts[0];
      setCartItems([...cartItems, { type: 'product', id: prod.id, quantity: 1 }]);
      try {
        metaPixelTracker.addToCart({
          id: prod.id,
          name: prod.name,
          price: prod.sellingPrice,
          quantity: 1,
          businessId: saleBusiness,
        });
      } catch {}
    } else if (type === 'combo' && availableCombos.length > 0) {
      const combo = availableCombos[0];
      setCartItems([...cartItems, { type: 'combo', id: combo.id, quantity: 1 }]);
      try {
        metaPixelTracker.addToCart({
          id: combo.id,
          name: combo.name,
          price: combo.sellingPrice,
          quantity: 1,
          businessId: saleBusiness,
        });
      } catch {}
    }
  };

  const handleRemoveItem = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    if (clientId) {
      const cli = clients.find((c) => c.id === clientId);
      if (cli) setCustomClientName(cli.name);
    } else {
      setCustomClientName('Consumidor Final');
    }
  };

  const handleSubmitSale = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Map store to localId
    const localId =
      saleBusiness === 'lumbarfix'
        ? locales.find((l) => l.businessId === 'lumbarfix')?.id || 'loc-lumbarfix'
        : locales.find((l) => (l.businessId || 'bbimport') === 'bbimport')?.id || 'loc-central';

    const result = registerSale({
      clientId: selectedClientId || undefined,
      clientName: customClientName.trim() || 'Consumidor Final',
      localId,
      items: cartItems,
      discount,
      paymentMethod,
      notes: saleNotes,
    });

    if (result.success && result.sale) {
      setSuccessCode(result.sale.code);
      setTimeout(() => {
        setSuccessCode(null);
        setIsNewSaleModalOpen(false);
      }, 1500);
    } else {
      setErrorMessage(result.error || 'Error al procesar la venta');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="bg-[#0b1722] border border-[#1d3b50] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#162b3b] flex items-center justify-between bg-[#081219]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#2ee59d]/15 text-[#2ee59d]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-display">
                Punto de Venta (POS) - Registrar Nueva Venta
              </h3>
              <p className="text-xs text-slate-400">
                Descuento automático de stock en tiempo real y cálculo de ganancia neta.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNewSaleModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#132534] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmitSale} className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successCode && (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-[#2ee59d] text-center font-bold text-sm flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>¡Venta registrada con éxito! Ticket: {successCode}</span>
            </div>
          )}

          {/* Store Selection & Customer */}
          <div className="bg-[#081219] p-3.5 rounded-xl border border-[#142634] space-y-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">
                Tienda E-commerce de la Venta *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleBusinessChange('bbimport')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    saleBusiness === 'bbimport'
                      ? 'bg-[#00c8ff]/20 border-[#00c8ff] text-white shadow-sm'
                      : 'bg-[#060e15] border-[#172c3d] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00c8ff]"></span>
                  <div className="text-left">
                    <span className="block leading-tight font-bold">BB IMPORT</span>
                    <span className="text-[10px] text-slate-400">bbimport.onrender.com</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleBusinessChange('lumbarfix')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    saleBusiness === 'lumbarfix'
                      ? 'bg-[#3b82f6]/20 border-[#3b82f6] text-white shadow-sm'
                      : 'bg-[#060e15] border-[#172c3d] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></span>
                  <div className="text-left">
                    <span className="block leading-tight font-bold">LUMBAR FIX®</span>
                    <span className="text-[10px] text-slate-400">lumbar-fix.vercel.app</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#142634]">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Cliente</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#060e15] border border-[#172c3d] rounded-lg text-white focus:border-[#2ee59d] focus:outline-none"
                >
                  <option value="">Cliente Ocasional / Rápido</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ''} - {c.tier.toUpperCase()}
                    </option>
                  ))}
                </select>

                {!selectedClientId && (
                  <input
                    type="text"
                    value={customClientName}
                    onChange={(e) => setCustomClientName(e.target.value)}
                    placeholder="Nombre de cliente o Consumidor Final"
                    className="w-full mt-1.5 px-2.5 py-1.5 bg-[#060e15] border border-[#172c3d] rounded-lg text-white placeholder-slate-500 focus:border-[#2ee59d] focus:outline-none"
                  />
                )}
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Medio de Pago</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-2.5 py-1.5 bg-[#060e15] border border-[#172c3d] rounded-lg text-white focus:border-[#2ee59d] focus:outline-none capitalize"
                >
                  <option value="efectivo">Efectivo / Transferencia Directa</option>
                  <option value="transferencia">Transferencia Bancaria</option>
                  <option value="tarjeta">Tarjeta Débito / Crédito</option>
                  <option value="mercadopago_qr">MercadoPago / Pasarela Web</option>
                  <option value="otro">Otro</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Canal: Venta Web Online {saleBusiness === 'lumbarfix' ? 'Lumbar Fix' : 'BB Import'}
                </span>
              </div>
            </div>
          </div>

          {/* Cart items list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-200 font-bold uppercase tracking-wider text-[11px] font-mono">
                Artículos a Vender (Productos Individuales o Combos)
              </label>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddItem('product')}
                  className="px-2.5 py-1 rounded bg-[#0e2130] hover:bg-[#16354c] border border-[#1d405b] text-slate-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Package className="w-3 h-3 text-[#2ee59d]" />
                  <span>+ Producto</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddItem('combo')}
                  className="px-2.5 py-1 rounded bg-[#2ee59d]/15 hover:bg-[#2ee59d]/25 border border-[#2ee59d]/30 text-[#2ee59d] text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Boxes className="w-3 h-3" />
                  <span>+ Combo</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 border border-[#162c3d] rounded-xl p-3 bg-[#081219]">
              {cartItems.map((item, idx) => {
                let currentItemStock = 0;
                let unitPrice = 0;

                if (item.type === 'product') {
                  const prod = products.find((p) => p.id === item.id);
                  currentItemStock = prod?.currentStock || 0;
                  unitPrice = prod?.sellingPrice || 0;
                } else {
                  const combo = combos.find((c) => c.id === item.id);
                  currentItemStock = combo ? getComboMaxStock(combo) : 0;
                  unitPrice = combo?.sellingPrice || 0;
                }

                const itemSubtotal = unitPrice * item.quantity;
                const isInsufficient = item.quantity > currentItemStock;

                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      isInsufficient
                        ? 'bg-rose-950/30 border-rose-800/50'
                        : 'bg-[#060e15] border-[#142635]'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <span
                        className={`text-[10px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                          item.type === 'combo'
                            ? 'bg-[#2ee59d]/20 text-[#2ee59d]'
                            : 'bg-cyan-500/20 text-cyan-300'
                        }`}
                      >
                        {item.type === 'combo' ? 'Combo' : 'Item'}
                      </span>

                      {/* Select item */}
                      <select
                        value={item.id}
                        onChange={(e) => {
                          const updated = [...cartItems];
                          updated[idx].id = e.target.value;
                          setCartItems(updated);
                        }}
                        className="flex-1 px-2 py-1.5 bg-[#0b1722] border border-[#182f42] rounded-md text-white text-xs"
                      >
                        {item.type === 'product'
                          ? availableProducts.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} - ${p.sellingPrice.toLocaleString('es-AR')} (Disp: {p.currentStock})
                              </option>
                            ))
                          : availableCombos.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name} - ${c.sellingPrice.toLocaleString('es-AR')} (Disp: {getComboMaxStock(c)})
                              </option>
                            ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      {/* Quantity */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-xs">Cant:</span>
                        <input
                          type="number"
                          min="1"
                          max={currentItemStock}
                          value={item.quantity}
                          onChange={(e) => {
                            const updated = [...cartItems];
                            updated[idx].quantity = Math.max(1, Number(e.target.value));
                            setCartItems(updated);
                          }}
                          className={`w-14 px-2 py-1 rounded border text-center font-mono font-bold text-xs ${
                            isInsufficient
                              ? 'bg-rose-950 border-rose-700 text-rose-300'
                              : 'bg-[#0b1722] border-[#182f42] text-white'
                          }`}
                        />
                      </div>

                      {/* Price subtotal */}
                      <span className="font-mono font-bold text-white text-xs min-w-[70px] text-right">
                        ${itemSubtotal.toLocaleString('es-AR')}
                      </span>

                      {/* Remove button */}
                      {cartItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Discount and Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 block mb-1 font-medium">Descuento Promocional ($)</label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-1.5 bg-[#081219] border border-[#182e3f] rounded-lg text-white font-mono text-xs focus:border-[#2ee59d] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">Observaciones / Factura</label>
              <input
                type="text"
                value={saleNotes}
                onChange={(e) => setSaleNotes(e.target.value)}
                placeholder="Ej: Factura A, despacho por correo, etc."
                className="w-full px-3 py-1.5 bg-[#081219] border border-[#182e3f] rounded-lg text-white text-xs focus:border-[#2ee59d] focus:outline-none"
              />
            </div>
          </div>

          {/* Real-time Financial Breakdown */}
          <div className="bg-[#091a27] border border-[#193d56] rounded-xl p-4 text-xs space-y-2 shadow-inner">
            <div className="flex items-center justify-between text-slate-300">
              <span>Subtotal Artículos:</span>
              <span className="font-mono font-semibold text-white">
                {businessConfig.currencySymbol}{subtotal.toLocaleString('es-AR')}
              </span>
            </div>

            {discount > 0 && (
              <div className="flex items-center justify-between text-rose-300">
                <span>Descuento aplicado:</span>
                <span className="font-mono font-semibold">
                  -{businessConfig.currencySymbol}{discount.toLocaleString('es-AR')}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Costo Total de Mercadería (COGS):</span>
              <span className="font-mono">
                {businessConfig.currencySymbol}{totalCost.toLocaleString('es-AR')}
              </span>
            </div>

            <div className="pt-2 border-t border-[#1a384e] flex items-center justify-between">
              <div>
                <span className="text-white font-bold text-sm block">Total a Cobrar:</span>
                <span className="text-[#2ee59d] font-mono font-extrabold text-xs">
                  Ganancia Neta Real: +{businessConfig.currencySymbol}{expectedProfit.toLocaleString('es-AR')} ({expectedMargin.toFixed(1)}%)
                </span>
              </div>

              <span className="text-2xl font-black text-white font-display">
                {businessConfig.currencySymbol}{finalTotal.toLocaleString('es-AR')}
              </span>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsNewSaleModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-[#09151e] text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-[#2ee59d] hover:bg-[#28d390] text-black font-extrabold text-sm transition-all shadow-[0_0_15px_rgba(46,229,157,0.3)] cursor-pointer"
            >
              Confirmar y Cobrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
