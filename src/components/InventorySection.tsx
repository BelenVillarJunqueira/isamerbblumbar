import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductItem, ProductCombo } from '../types';
import {
  Package,
  Boxes,
  AlertTriangle,
  Plus,
  Minus,
  Search,
  CheckCircle2,
  Trash2,
  Edit2,
  TrendingUp,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const InventorySection: React.FC = () => {
  const {
    products,
    combos,
    adjustStock,
    deleteProduct,
    deleteCombo,
    getComboMaxStock,
    businessConfig,
    selectedBusiness,
    setSelectedBusiness,
    addProduct,
    addCombo,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'individual' | 'combos' | 'alerts'>('individual');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal states
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddComboOpen, setIsAddComboOpen] = useState(false);

  // New Product Form state
  const [newProdBusiness, setNewProdBusiness] = useState<'bbimport' | 'lumbarfix'>('bbimport');
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Máquinas Cortadoras');
  const [newProdCost, setNewProdCost] = useState<number>(10000);
  const [newProdPrice, setNewProdPrice] = useState<number>(19000);
  const [newProdStock, setNewProdStock] = useState<number>(10);
  const [newProdMinAlert, setNewProdMinAlert] = useState<number>(5);
  const [newProdSupplier, setNewProdSupplier] = useState('');

  // New Combo Form state
  const [newComboBusiness, setNewComboBusiness] = useState<'bbimport' | 'lumbarfix'>('bbimport');
  const [newComboName, setNewComboName] = useState('');
  const [newComboSku, setNewComboSku] = useState('');
  const [newComboDesc, setNewComboDesc] = useState('');
  const [newComboPrice, setNewComboPrice] = useState<number>(35000);
  const [newComboComponents, setNewComboComponents] = useState<{ productId: string; quantity: number }[]>([
    { productId: products[0]?.id || '', quantity: 1 },
  ]);

  const isProdMatching = (p: ProductItem) => {
    if (selectedBusiness === 'all') return true;
    return (p.businessId || 'bbimport') === selectedBusiness;
  };

  const isComboMatching = (c: ProductCombo) => {
    if (selectedBusiness === 'all') return true;
    return (c.businessId || 'bbimport') === selectedBusiness;
  };

  // Critical stock filter for active business
  const lowStockProducts = products.filter((p) => isProdMatching(p) && p.currentStock <= p.minStockAlert);

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (!isProdMatching(p)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedCategory !== 'all' && p.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const filteredCombos = combos.filter(isComboMatching);

  // Categories list
  const categories = Array.from(new Set(products.filter(isProdMatching).map((p) => p.category)));

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    addProduct({
      name: newProdName.trim(),
      sku: newProdSku.trim() || `${newProdBusiness === 'lumbarfix' ? 'LF' : 'BBI'}-${Date.now().toString().slice(-4)}`,
      category: newProdCategory,
      costPrice: Number(newProdCost) || 0,
      sellingPrice: Number(newProdPrice) || 0,
      currentStock: Number(newProdStock) || 0,
      minStockAlert: Number(newProdMinAlert) || 5,
      localId: newProdBusiness === 'lumbarfix' ? 'ecommerce-lumbarfix' : 'ecommerce-bbimport',
      businessId: newProdBusiness,
      supplier: newProdSupplier,
    });

    setIsAddProductOpen(false);
    setNewProdName('');
    setNewProdSku('');
  };

  const handleCreateCombo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComboName.trim()) return;

    const validComponents = newComboComponents.filter((c) => c.productId && c.quantity > 0);
    if (validComponents.length === 0) return;

    addCombo({
      name: newComboName.trim(),
      sku: newComboSku.trim() || `CMB-${Date.now().toString().slice(-4)}`,
      description: newComboDesc.trim(),
      components: validComponents,
      sellingPrice: Number(newComboPrice) || 0,
      localId: newComboBusiness === 'lumbarfix' ? 'ecommerce-lumbarfix' : 'ecommerce-bbimport',
      businessId: newComboBusiness,
      active: true,
    });

    setIsAddComboOpen(false);
    setNewComboName('');
    setNewComboSku('');
    setNewComboDesc('');
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2ee59d] font-mono">
            INVENTARIO INTELIGENTE EN TIEMPO REAL
          </span>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-display">
            <span>Gestión de Stock: Productos Separados y Combos</span>
          </h2>
          <p className="text-xs text-slate-400">
            Control de existencias unitarias y cálculo automático de combos armables según componentes.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddProductOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e1f2d] hover:bg-[#142c40] border border-[#1b3a50] text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#2ee59d]" />
            <span>+ Producto Individual</span>
          </button>

          <button
            onClick={() => setIsAddComboOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2ee59d] hover:bg-[#28d390] text-black text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Boxes className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ Crear Combo / Pack</span>
          </button>
        </div>
      </div>

      {/* Low Stock Alert Notification Bar */}
      {lowStockProducts.length > 0 && (
        <div className="bg-rose-950/30 border border-rose-800/40 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-900/40 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-300">
                ¡Alerta de Inventario! {lowStockProducts.length} producto(s) por debajo del stock mínimo
              </p>
              <p className="text-[11px] text-slate-400">
                {lowStockProducts.map((p) => `${p.name} (${p.currentStock} unid.)`).join(', ')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveSubTab('alerts')}
            className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-semibold cursor-pointer transition-colors"
          >
            Ver Alertas Urgentes
          </button>
        </div>
      )}

      {/* Business Filter Bar & Sub-Tabs */}
      <div className="space-y-2.5 border-b border-[#152736] pb-3">
        {/* Business Selector Pills */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1">Tienda E-commerce:</span>
          <button
            onClick={() => setSelectedBusiness('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedBusiness === 'all'
                ? 'bg-[#152e42] text-white border border-[#234d6e]'
                : 'bg-[#091520] text-slate-400 hover:text-white border border-[#132736]'
            }`}
          >
            Todas ({products.length} productos)
          </button>
          <button
            onClick={() => setSelectedBusiness('bbimport')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedBusiness === 'bbimport'
                ? 'bg-[#00c8ff]/20 text-white border border-[#00c8ff]/60'
                : 'bg-[#091520] text-slate-400 hover:text-white border border-[#132736]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#00c8ff]"></span>
            <span>BB IMPORT ({products.filter((p) => (p.businessId || 'bbimport') === 'bbimport').length})</span>
          </button>
          <button
            onClick={() => setSelectedBusiness('lumbarfix')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedBusiness === 'lumbarfix'
                ? 'bg-[#3b82f6]/20 text-white border border-[#3b82f6]/60'
                : 'bg-[#091520] text-slate-400 hover:text-white border border-[#132736]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>
            <span>LUMBAR FIX® ({products.filter((p) => p.businessId === 'lumbarfix').length})</span>
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('individual')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'individual'
                  ? 'bg-[#122432] text-[#2ee59d] border border-[#1e4259]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Productos Separados ({filteredProducts.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('combos')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'combos'
                  ? 'bg-[#122432] text-[#2ee59d] border border-[#1e4259]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Combos & Packs ({filteredCombos.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('alerts')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'alerts'
                  ? 'bg-rose-950/50 text-rose-300 border border-rose-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Alertas Bajo Stock ({lowStockProducts.length})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar producto o SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 bg-[#09151e] border border-[#172b3a] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2ee59d]"
            />
          </div>
        </div>
      </div>

      {/* VIEW 1: PRODUCTOS SEPARADOS */}
      {activeSubTab === 'individual' && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-xl border border-[#172b3a] bg-[#0d1822]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#09151f] text-slate-400 border-b border-[#172b3a] uppercase font-mono text-[11px]">
                <tr>
                  <th className="py-3 px-4">Producto & SKU</th>
                  <th className="py-3 px-3">Categoría</th>
                  <th className="py-3 px-3 text-right">Costo</th>
                  <th className="py-3 px-3 text-right">Precio Venta</th>
                  <th className="py-3 px-3 text-right">Ganancia Unitaria</th>
                  <th className="py-3 px-3 text-center">Stock Actual</th>
                  <th className="py-3 px-3 text-center">Ajuste Rápido</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#142634]">
                {filteredProducts.map((prod) => {
                  const unitProfit = prod.sellingPrice - prod.costPrice;
                  const margin = ((unitProfit / Math.max(1, prod.sellingPrice)) * 100).toFixed(1);
                  const isLow = prod.currentStock <= prod.minStockAlert;
                  const isZero = prod.currentStock === 0;

                  return (
                    <tr
                      key={prod.id}
                      className={`hover:bg-[#10202e] transition-colors ${
                        isLow ? 'bg-rose-950/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{prod.name}</span>
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                              prod.businessId === 'lumbarfix'
                                ? 'bg-[#3b82f6]/15 text-[#60a5fa] border-[#3b82f6]/30'
                                : 'bg-[#00c8ff]/15 text-[#00c8ff] border-[#00c8ff]/30'
                            }`}
                          >
                            {prod.businessId === 'lumbarfix' ? 'LUMBAR FIX' : 'BB IMPORT'}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          SKU: {prod.sku} {prod.supplier ? `• Prov: ${prod.supplier}` : ''}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-[#091621] border border-[#162f42] text-slate-300 text-[11px]">
                          {prod.category}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-400">
                        {businessConfig.currencySymbol}{prod.costPrice.toLocaleString('es-AR')}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-white">
                        {businessConfig.currencySymbol}{prod.sellingPrice.toLocaleString('es-AR')}
                      </td>

                      <td className="py-3 px-3 text-right font-mono">
                        <span className="text-[#2ee59d] font-semibold">
                          +{businessConfig.currencySymbol}{unitProfit.toLocaleString('es-AR')}
                        </span>
                        <span className="text-slate-500 text-[10px] block">({margin}%)</span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono font-bold text-xs ${
                            isZero
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : isLow
                                ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                                : 'bg-emerald-950/40 text-[#2ee59d] border border-emerald-800/40'
                          }`}
                        >
                          {isLow && <AlertTriangle className="w-3 h-3" />}
                          <span>{prod.currentStock} u.</span>
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                          Mín: {prod.minStockAlert}
                        </span>
                      </td>

                      {/* Quick Adjust buttons */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1 bg-[#081219] p-1 rounded-lg border border-[#162a39]">
                          <button
                            onClick={() => adjustStock(prod.id, -1)}
                            className="p-1 rounded bg-[#0c1822] hover:bg-[#132737] text-slate-300 hover:text-white cursor-pointer"
                            title="Restar 1"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => adjustStock(prod.id, 1)}
                            className="p-1 rounded bg-[#0c1822] hover:bg-[#132737] text-[#2ee59d] hover:text-white cursor-pointer"
                            title="Sumar 1"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => adjustStock(prod.id, 5)}
                            className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#0c1822] hover:bg-[#132737] text-cyan-400 cursor-pointer"
                            title="Sumar lote de 5"
                          >
                            +5
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteProduct(prod.id)}
                          className="p-1.5 text-slate-600 hover:text-rose-400 transition-colors"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: COMBOS Y PACKS */}
      {activeSubTab === 'combos' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {combos.map((combo) => {
              const maxStockAvailable = getComboMaxStock(combo);

              // Calculate component sum values
              let componentsTotalSellingPrice = 0;
              let componentsTotalCost = 0;

              const componentDetails = combo.components.map((comp) => {
                const prod = products.find((p) => p.id === comp.productId);
                if (prod) {
                  componentsTotalSellingPrice += prod.sellingPrice * comp.quantity;
                  componentsTotalCost += prod.costPrice * comp.quantity;
                }
                return {
                  name: prod?.name || 'Producto eliminado',
                  quantity: comp.quantity,
                  unitStock: prod?.currentStock || 0,
                };
              });

              const clientSavings = Math.max(0, componentsTotalSellingPrice - combo.sellingPrice);
              const comboProfit = combo.sellingPrice - componentsTotalCost;
              const comboMargin = ((comboProfit / Math.max(1, combo.sellingPrice)) * 100).toFixed(1);

              return (
                <div
                  key={combo.id}
                  className="bg-[#0d1822] border border-[#172b3a] hover:border-[#224056] rounded-xl p-5 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Combo Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#2ee59d] font-bold px-2 py-0.5 rounded bg-[#2ee59d]/10 border border-[#2ee59d]/20">
                            COMBO / PACK
                          </span>
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                              combo.businessId === 'lumbarfix'
                                ? 'bg-[#3b82f6]/15 text-[#60a5fa] border-[#3b82f6]/30'
                                : 'bg-[#00c8ff]/15 text-[#00c8ff] border-[#00c8ff]/30'
                            }`}
                          >
                            {combo.businessId === 'lumbarfix' ? 'LUMBAR FIX' : 'BB IMPORT'}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-1.5">{combo.name}</h4>
                        <p className="text-xs text-slate-400">{combo.description}</p>
                      </div>

                      <button
                        onClick={() => deleteCombo(combo.id)}
                        className="text-slate-600 hover:text-rose-400 p-1 transition-colors"
                        title="Eliminar combo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Stock available based on individual components */}
                    <div className="bg-[#081219] border border-[#142634] rounded-lg p-3 my-3">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-400 font-medium">Stock armable en tiempo real:</span>
                        <span
                          className={`font-mono font-extrabold text-sm px-2 py-0.5 rounded ${
                            maxStockAvailable === 0
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : maxStockAvailable <= 3
                                ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                                : 'bg-[#2ee59d]/15 text-[#2ee59d] border border-[#2ee59d]/30'
                          }`}
                        >
                          {maxStockAvailable} combos disponibles
                        </span>
                      </div>

                      {/* Component breakdown */}
                      <p className="text-[10px] uppercase font-mono text-slate-500 font-semibold mb-1">
                        Componentes vinculados:
                      </p>
                      <div className="space-y-1">
                        {componentDetails.map((c, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-[11px] text-slate-300 bg-[#0b1720] px-2 py-1 rounded"
                          >
                            <span className="truncate">
                              {c.quantity}x {c.name}
                            </span>
                            <span className="font-mono text-slate-400 text-[10px]">
                              (disp: {c.unitStock} u.)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Financial Metrics of Combo */}
                  <div className="pt-3 border-t border-[#132330] space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Precio de Venta Combo:</span>
                      <span className="text-white font-mono font-bold text-sm">
                        {businessConfig.currencySymbol}{combo.sellingPrice.toLocaleString('es-AR')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Por separado costaría:</span>
                      <span className="text-slate-400 font-mono line-through">
                        {businessConfig.currencySymbol}{componentsTotalSellingPrice.toLocaleString('es-AR')}
                      </span>
                    </div>

                    {clientSavings > 0 && (
                      <div className="flex items-center justify-between text-[11px] text-emerald-400">
                        <span>Ahorro al cliente:</span>
                        <span className="font-mono font-semibold">
                          -{businessConfig.currencySymbol}{clientSavings.toLocaleString('es-AR')}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-400">Ganancia neta negocio:</span>
                      <span className="text-[#2ee59d] font-mono font-bold">
                        +{businessConfig.currencySymbol}{comboProfit.toLocaleString('es-AR')} ({comboMargin}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: ALERTAS DE BAJO STOCK */}
      {activeSubTab === 'alerts' && (
        <div className="space-y-3">
          <div className="bg-[#0d1822] border border-[#172b3a] rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Productos en Umbral Crítico de Reposición</span>
            </h3>

            {lowStockProducts.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-[#2ee59d] mx-auto mb-2" />
                <p>Todos los productos tienen existencias por encima del mínimo de alerta.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {lowStockProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-[#081219] border border-rose-900/30"
                  >
                    <div>
                      <div className="font-bold text-white text-sm">{prod.name}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        SKU: {prod.sku} • Proveedor: {prod.supplier || 'No asignado'} • Categoría: {prod.category}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-rose-400 font-mono font-extrabold text-sm block">
                          Stock actual: {prod.currentStock} u.
                        </span>
                        <span className="text-slate-500 font-mono text-[10px]">
                          Alerta configurada en: {prod.minStockAlert} u.
                        </span>
                      </div>

                      <button
                        onClick={() => adjustStock(prod.id, 10)}
                        className="px-3 py-1.5 rounded-lg bg-[#2ee59d] hover:bg-[#28d390] text-black text-xs font-bold transition-all cursor-pointer"
                      >
                        + Reponer (+10)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: NUEVO PRODUCTO INDIVIDUAL */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b1722] border border-[#1d384c] rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1 font-display">Crear Nuevo Producto</h3>
            <p className="text-xs text-slate-400 mb-4">
              Agrega un producto individual al inventario de BB Import.
            </p>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Tienda E-commerce *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewProdBusiness('bbimport');
                      setNewProdCategory('Máquinas Cortadoras');
                    }}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                      newProdBusiness === 'bbimport'
                        ? 'bg-[#00c8ff]/20 border-[#00c8ff] text-white shadow-sm'
                        : 'bg-[#060f16] border-[#193245] text-slate-400'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#00c8ff]"></span>
                    <span>BB IMPORT</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewProdBusiness('lumbarfix');
                      setNewProdCategory('Salud & Ortopedia');
                    }}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                      newProdBusiness === 'lumbarfix'
                        ? 'bg-[#3b82f6]/20 border-[#3b82f6] text-white shadow-sm'
                        : 'bg-[#060f16] border-[#193245] text-slate-400'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>
                    <span>LUMBAR FIX®</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="Ej: Auriculares Pro Max Wireless"
                  className="w-full px-3 py-2 bg-[#060f16] border border-[#193245] rounded-lg text-white focus:border-[#2ee59d] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-300 block mb-1">SKU / Código</label>
                  <input
                    type="text"
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value)}
                    placeholder="BBI-XXX-01"
                    className="w-full px-3 py-2 bg-[#060f16] border border-[#193245] rounded-lg text-white font-mono focus:border-[#2ee59d] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Categoría</label>
                  <input
                    type="text"
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    placeholder="Audio, Accesorios..."
                    className="w-full px-3 py-2 bg-[#060f16] border border-[#193245] rounded-lg text-white focus:border-[#2ee59d] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-300 block mb-1">Costo de Compra ($)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newProdCost}
                    onChange={(e) => setNewProdCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#060f16] border border-[#193245] rounded-lg text-white font-mono focus:border-[#2ee59d] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Precio de Venta ($)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#060f16] border border-[#193245] rounded-lg text-white font-mono focus:border-[#2ee59d] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-300 block mb-1">Stock Inicial (unid.)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#060f16] border border-[#193245] rounded-lg text-white font-mono focus:border-[#2ee59d] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Alerta Stock Mínimo</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newProdMinAlert}
                    onChange={(e) => setNewProdMinAlert(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#060f16] border border-[#193245] rounded-lg text-white font-mono focus:border-[#2ee59d] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Proveedor / Origen</label>
                <input
                  type="text"
                  value={newProdSupplier}
                  onChange={(e) => setNewProdSupplier(e.target.value)}
                  placeholder="Ej: Shenzhen Tech Ltd / Directo Fábrica"
                  className="w-full px-3 py-2 bg-[#060f16] border border-[#193245] rounded-lg text-white focus:border-[#2ee59d] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#162b3b]">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#09151e] text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#2ee59d] hover:bg-[#28d390] text-black font-bold"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO COMBO / PACK */}
      {isAddComboOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b1722] border border-[#1d384c] rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1 font-display">Crear Combo / Pack Promocional</h3>
            <p className="text-xs text-slate-400 mb-4">
              Vincula varios productos individuales. Al venderse el combo, se descontará automáticamente el stock de cada componente.
            </p>

            <form onSubmit={handleCreateCombo} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Tienda E-commerce *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewComboBusiness('bbimport');
                      const firstBbProd = products.find((p) => (p.businessId || 'bbimport') === 'bbimport');
                      setNewComboComponents([{ productId: firstBbProd?.id || products[0]?.id || '', quantity: 1 }]);
                    }}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                      newComboBusiness === 'bbimport'
                        ? 'bg-[#00c8ff]/20 border-[#00c8ff] text-white shadow-sm'
                        : 'bg-[#060f16] border-[#193245] text-slate-400'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#00c8ff]"></span>
                    <span>BB IMPORT</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewComboBusiness('lumbarfix');
                      const firstLfProd = products.find((p) => p.businessId === 'lumbarfix');
                      setNewComboComponents([{ productId: firstLfProd?.id || products[0]?.id || '', quantity: 1 }]);
                    }}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                      newComboBusiness === 'lumbarfix'
                        ? 'bg-[#3b82f6]/20 border-[#3b82f6] text-white shadow-sm'
                        : 'bg-[#060f16] border-[#193245] text-slate-400'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>
                    <span>LUMBAR FIX®</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Nombre del Combo *</label>
                <input
                  type="text"
                  required
                  value={newComboName}
                  onChange={(e) => setNewComboName(e.target.value)}
                  placeholder={newComboBusiness === 'lumbarfix' ? 'Ej: Pack Corrector + Soporte Lumbar' : 'Ej: Kit Peluquería Pro + Trimmer'}
                  className="w-full px-3 py-2 bg-[#060f16] border border-[#193245] rounded-lg text-white focus:border-[#2ee59d] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Descripción / Qué incluye</label>
                <input
                  type="text"
                  value={newComboDesc}
                  onChange={(e) => setNewComboDesc(e.target.value)}
                  placeholder={newComboBusiness === 'lumbarfix' ? 'Ej: Corrector Postural Magnético + Cojín Memory Foam' : 'Ej: Incluye Máquina Clipper + Shaver Pro'}
                  className="w-full px-3 py-2 bg-[#060f16] border border-[#193245] rounded-lg text-white focus:border-[#2ee59d] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Precio Promocional del Combo ($) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newComboPrice}
                  onChange={(e) => setNewComboPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#060f16] border border-[#193245] rounded-lg text-white font-mono focus:border-[#2ee59d] focus:outline-none"
                />
              </div>

              {/* Components selector */}
              <div className="border border-[#182f42] rounded-xl p-3 bg-[#081219]">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-slate-300 font-semibold">
                    Componentes del Combo ({newComboBusiness === 'lumbarfix' ? 'LUMBAR FIX®' : 'BB IMPORT'})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const avail = products.filter((p) => (p.businessId || 'bbimport') === newComboBusiness);
                      setNewComboComponents([
                        ...newComboComponents,
                        { productId: avail[0]?.id || products[0]?.id || '', quantity: 1 },
                      ]);
                    }}
                    className="text-[#2ee59d] hover:underline text-[11px] font-medium cursor-pointer"
                  >
                    + Agregar Componente
                  </button>
                </div>

                <div className="space-y-2">
                  {newComboComponents.map((comp, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={comp.productId}
                        onChange={(e) => {
                          const updated = [...newComboComponents];
                          updated[idx].productId = e.target.value;
                          setNewComboComponents(updated);
                        }}
                        className="flex-1 px-2.5 py-1.5 bg-[#060f16] border border-[#193245] rounded-lg text-white text-xs"
                      >
                        {products
                          .filter((p) => (p.businessId || 'bbimport') === newComboBusiness)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Stock: {p.currentStock} | Costo: ${p.costPrice.toLocaleString('es-AR')})
                            </option>
                          ))}
                      </select>

                      <div className="flex items-center gap-1">
                        <span className="text-slate-500 text-xs">Cant:</span>
                        <input
                          type="number"
                          min="1"
                          value={comp.quantity}
                          onChange={(e) => {
                            const updated = [...newComboComponents];
                            updated[idx].quantity = Math.max(1, Number(e.target.value));
                            setNewComboComponents(updated);
                          }}
                          className="w-14 px-2 py-1 bg-[#060f16] border border-[#193245] rounded-lg text-white font-mono text-center text-xs"
                        />
                      </div>

                      {newComboComponents.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewComboComponents(newComboComponents.filter((_, i) => i !== idx));
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#162b3b]">
                <button
                  type="button"
                  onClick={() => setIsAddComboOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#09151e] text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#2ee59d] hover:bg-[#28d390] text-black font-bold"
                >
                  Guardar Combo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
