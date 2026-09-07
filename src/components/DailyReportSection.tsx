import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  Copy,
  Check,
  Printer,
  Calendar,
  CreditCard,
  Globe,
  ShoppingBag,
} from 'lucide-react';

export const DailyReportSection: React.FC = () => {
  const { sales, businessConfig, selectedBusiness, setSelectedBusiness } = useApp();
  const [copied, setCopied] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2026-09-07');

  const isSaleMatching = (s: any) => {
    if (selectedBusiness === 'all') return true;
    return (s.businessId || 'bbimport') === selectedBusiness;
  };

  // Filter sales for the selected date and business
  const daySales = sales.filter((s) => s.dayDate === selectedDate && isSaleMatching(s));

  // Computed for this day
  const totalRevenue = daySales.reduce((sum, s) => sum + s.total, 0);
  const totalCost = daySales.reduce((sum, s) => sum + s.totalCost, 0);
  const netProfit = daySales.reduce((sum, s) => sum + s.netProfit, 0);
  const marginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const avgTicket = daySales.length > 0 ? totalRevenue / daySales.length : 0;

  // Count products vs combos sold today
  let individualProductsSold = 0;
  let combosSold = 0;

  daySales.forEach((s) => {
    s.items.forEach((item) => {
      if (item.type === 'product') {
        individualProductsSold += item.quantity;
      } else {
        combosSold += item.quantity;
      }
    });
  });

  // Breakdown by Payment Method
  const paymentBreakdown: Record<string, { total: number; count: number }> = {};
  daySales.forEach((s) => {
    const pm = s.paymentMethod;
    if (!paymentBreakdown[pm]) {
      paymentBreakdown[pm] = { total: 0, count: 0 };
    }
    paymentBreakdown[pm].total += s.total;
    paymentBreakdown[pm].count += 1;
  });

  // Breakdown by E-commerce Store for this day
  const storeBreakdown: Record<string, { name: string; short: string; color: string; total: number; profit: number; count: number; url: string }> = {
    bbimport: {
      name: 'BB IMPORT',
      short: 'BB IMPORT',
      color: '#00c8ff',
      total: 0,
      profit: 0,
      count: 0,
      url: 'https://bbimport.onrender.com/',
    },
    lumbarfix: {
      name: 'LUMBAR FIX®',
      short: 'LUMBAR FIX',
      color: '#3b82f6',
      total: 0,
      profit: 0,
      count: 0,
      url: 'https://lumbar-fix.vercel.app/',
    },
  };

  sales.filter((s) => s.dayDate === selectedDate).forEach((s) => {
    const bId = (s.businessId || 'bbimport') as 'bbimport' | 'lumbarfix';
    if (storeBreakdown[bId]) {
      storeBreakdown[bId].total += s.total;
      storeBreakdown[bId].profit += s.netProfit;
      storeBreakdown[bId].count += 1;
    }
  });

  // Copy Summary to Clipboard formatted for WhatsApp
  const handleCopySummary = () => {
    const title =
      selectedBusiness === 'all'
        ? 'CONSOLIDADO DUAL E-COMMERCE (BB IMPORT + LUMBAR FIX)'
        : selectedBusiness === 'lumbarfix'
        ? 'LUMBAR FIX® (lumbar-fix.vercel.app)'
        : 'BB IMPORT (bbimport.onrender.com)';

    const text = `📊 *REPORTE DIARIO DE GANANCIAS - ${title}*
📅 Fecha: ${selectedDate}
🌐 Plataformas: bbimport.onrender.com | lumbar-fix.vercel.app

💵 *Facturación Total:* ${businessConfig.currencySymbol}${totalRevenue.toLocaleString('es-AR')}
📦 *Costo de Mercadería:* ${businessConfig.currencySymbol}${totalCost.toLocaleString('es-AR')}
🚀 *GANANCIA NETA LIMPIA:* ${businessConfig.currencySymbol}${netProfit.toLocaleString('es-AR')}
📈 *Margen Neto:* ${marginPercent.toFixed(1)}%
🧾 *Ventas E-commerce:* ${daySales.length}
🎯 *Ticket Promedio:* ${businessConfig.currencySymbol}${Math.round(avgTicket).toLocaleString('es-AR')}

📦 *Volumen Vendido:*
• Productos individuales: ${individualProductsSold} unidades
• Combos promocionales: ${combosSold} combos

🏪 *Desglose por Tienda Online (Hoy):*
• BB IMPORT: $${storeBreakdown.bbimport.total.toLocaleString('es-AR')} (Ganancia: +$${storeBreakdown.bbimport.profit.toLocaleString('es-AR')})
• LUMBAR FIX®: $${storeBreakdown.lumbarfix.total.toLocaleString('es-AR')} (Ganancia: +$${storeBreakdown.lumbarfix.profit.toLocaleString('es-AR')})

💳 *Por Medio de Pago:*
${Object.entries(paymentBreakdown)
  .map(
    ([method, data]) =>
      `• ${method.toUpperCase()}: ${businessConfig.currencySymbol}${data.total.toLocaleString(
        'es-AR',
      )} (${data.count} pedidos)`,
  )
  .join('\n')}

_Generado automáticamente por ISAMER OS - Dual E-commerce_`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2ee59d] font-mono">
            AUTOMATIZACIÓN FINANCIERA & BALANCE DIARIO
          </span>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-display">
            <span>Reporte Automático de Ganancias Diarias</span>
          </h2>
          <p className="text-xs text-slate-400">
            Cálculo en tiempo real de ingresos brutos, costo de mercadería vendida y ganancia neta.
          </p>
        </div>

        {/* Action buttons: Copy & Print */}
        <div className="flex items-center gap-2">
          {/* Date Selector */}
          <div className="flex items-center gap-1.5 bg-[#09151e] border border-[#172b3a] rounded-lg px-2.5 py-1.5 text-xs text-white">
            <Calendar className="w-3.5 h-3.5 text-[#2ee59d]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs text-white font-mono focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e1f2d] hover:bg-[#152e42] border border-[#1b3a50] text-slate-200 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#2ee59d]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '¡Copiado para WhatsApp!' : 'Copiar Resumen'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-1.5 rounded-lg bg-[#0e1f2d] hover:bg-[#152e42] border border-[#1b3a50] text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Imprimir reporte"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Store Filter Tabs for Daily Report */}
      <div className="flex items-center flex-wrap gap-2 border-b border-[#142634] pb-2.5">
        <span className="text-xs text-slate-400 font-medium mr-1">Filtrar Balance por:</span>
        <button
          onClick={() => setSelectedBusiness('all')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            selectedBusiness === 'all'
              ? 'bg-[#152e42] text-white border border-[#234d6e]'
              : 'bg-[#091520] text-slate-400 hover:text-white border border-[#132736]'
          }`}
        >
          Ambas Tiendas (Consolidado)
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
          <span>BB IMPORT</span>
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
          <span>LUMBAR FIX®</span>
        </button>
      </div>

      {/* Main KPI Flashcards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Facturación */}
        <div className="bg-[#0d1822] border border-[#172b3a] rounded-xl p-4">
          <span className="text-xs font-medium text-slate-400">Facturación Total del Día</span>
          <div className="text-2xl font-extrabold text-white font-display mt-1">
            {businessConfig.currencySymbol}{totalRevenue.toLocaleString('es-AR')}
          </div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-400">
            <span>{daySales.length} transacciones registradas</span>
          </div>
        </div>

        {/* Costo de Mercadería */}
        <div className="bg-[#0d1822] border border-[#172b3a] rounded-xl p-4">
          <span className="text-xs font-medium text-slate-400">Costo Total Mercadería (COGS)</span>
          <div className="text-2xl font-extrabold text-slate-300 font-display mt-1">
            {businessConfig.currencySymbol}{totalCost.toLocaleString('es-AR')}
          </div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-500 font-mono">
            <span>Inversión en stock repuesto</span>
          </div>
        </div>

        {/* Ganancia Neta Real (Highlight) */}
        <div className="bg-[#0c1c28] border border-[#20455d] rounded-xl p-4 shadow-[0_0_20px_rgba(46,229,157,0.1)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#2ee59d]">GANANCIA NETA LIMPIA</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#2ee59d]/20 text-[#2ee59d] font-mono">
              {marginPercent.toFixed(1)}% MARGEN
            </span>
          </div>
          <div className="text-2xl font-black text-[#2ee59d] font-display mt-1">
            +{businessConfig.currencySymbol}{netProfit.toLocaleString('es-AR')}
          </div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-emerald-400 font-medium">
            <TrendingUp className="w-3 h-3 inline" />
            <span>Ganancia líquida directa al negocio</span>
          </div>
        </div>

        {/* Productos vs Combos */}
        <div className="bg-[#0d1822] border border-[#172b3a] rounded-xl p-4">
          <span className="text-xs font-medium text-slate-400">Unidades Vendidas</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-white font-display">
              {individualProductsSold + combosSold}
            </span>
            <span className="text-xs text-slate-500">artículos</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>• Separados: {individualProductsSold} u.</span>
            <span>• Combos: {combosSold} u.</span>
          </div>
        </div>
      </div>

      {/* Breakdowns: Payments & Locales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Payment Methods Breakdown */}
        <div className="bg-[#0d1822] border border-[#172b3a] rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#2ee59d]" />
            <span>Ingresos por Método de Pago</span>
          </h3>

          <div className="space-y-2.5">
            {Object.entries(paymentBreakdown).length === 0 ? (
              <p className="text-xs text-slate-500">No hay ventas registradas en esta fecha.</p>
            ) : (
              Object.entries(paymentBreakdown).map(([method, data]) => {
                const pct = totalRevenue > 0 ? (data.total / totalRevenue) * 100 : 0;
                return (
                  <div key={method} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 capitalize font-medium">
                        {method.replace('_', ' ')}
                      </span>
                      <span className="font-mono font-bold text-white">
                        {businessConfig.currencySymbol}{data.total.toLocaleString('es-AR')}{' '}
                        <span className="text-slate-500 text-[10px]">({pct.toFixed(0)}%)</span>
                      </span>
                    </div>
                    {/* Bar */}
                    <div className="w-full bg-[#081219] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#2ee59d] h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* E-commerce Store Performance Breakdown */}
        <div className="bg-[#0d1822] border border-[#172b3a] rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#2ee59d]" />
              <span>Rendimiento por Tienda Online</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">100% E-COMMERCE</span>
          </h3>

          <div className="space-y-3.5">
            {/* BB IMPORT STORE */}
            <div className="p-3 rounded-lg bg-[#08131c] border border-[#143044]">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00c8ff]"></span>
                  <span className="text-xs font-bold text-white">BB IMPORT</span>
                  <a
                    href="https://bbimport.onrender.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-[#00c8ff] hover:underline"
                  >
                    bbimport.onrender.com ↗
                  </a>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-white text-xs">
                    ${storeBreakdown.bbimport.total.toLocaleString('es-AR')}
                  </span>
                  <span className="text-[#2ee59d] font-mono text-[11px] block font-semibold">
                    +${storeBreakdown.bbimport.profit.toLocaleString('es-AR')} neta ({storeBreakdown.bbimport.count} pedidos)
                  </span>
                </div>
              </div>
              <div className="w-full bg-[#050b10] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#00c8ff] h-full rounded-full transition-all"
                  style={{
                    width: `${
                      totalRevenue > 0 ? (storeBreakdown.bbimport.total / totalRevenue) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* LUMBAR FIX STORE */}
            <div className="p-3 rounded-lg bg-[#08131c] border border-[#1a2f48]">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></span>
                  <span className="text-xs font-bold text-white">LUMBAR FIX®</span>
                  <a
                    href="https://lumbar-fix.vercel.app/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-[#60a5fa] hover:underline"
                  >
                    lumbar-fix.vercel.app ↗
                  </a>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-white text-xs">
                    ${storeBreakdown.lumbarfix.total.toLocaleString('es-AR')}
                  </span>
                  <span className="text-[#2ee59d] font-mono text-[11px] block font-semibold">
                    +${storeBreakdown.lumbarfix.profit.toLocaleString('es-AR')} neta ({storeBreakdown.lumbarfix.count} pedidos)
                  </span>
                </div>
              </div>
              <div className="w-full bg-[#050b10] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#3b82f6] h-full rounded-full transition-all"
                  style={{
                    width: `${
                      totalRevenue > 0 ? (storeBreakdown.lumbarfix.total / totalRevenue) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed List of Today's Transactions */}
      <div className="bg-[#0d1822] border border-[#172b3a] rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
          <span>Tickets y Ventas del Día ({daySales.length})</span>
          <span className="text-xs text-slate-400 font-mono">Ticket Promedio: ${Math.round(avgTicket).toLocaleString('es-AR')}</span>
        </h3>

        {daySales.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">
            No se han registrado ventas en la fecha seleccionada. Puedes pulsar "+ Registrar Venta" para cargar una nueva.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 font-mono text-[11px] uppercase border-b border-[#152533]">
                <tr>
                  <th className="py-2.5 px-3">Hora & Ticket</th>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Tienda E-commerce</th>
                  <th className="py-2.5 px-3">Detalle Ítems</th>
                  <th className="py-2.5 px-3">Pago</th>
                  <th className="py-2.5 px-3 text-right">Total Venta</th>
                  <th className="py-2.5 px-3 text-right">Ganancia Neta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#13222e]">
                {daySales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-[#101f2d] transition-colors">
                    <td className="py-2.5 px-3 font-mono">
                      <span className="font-bold text-white">{sale.code}</span>
                      <span className="text-slate-500 block text-[10px]">
                        {sale.date.includes('T') ? sale.date.split('T')[1].substring(0, 5) : ''} hs
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-slate-300 font-medium">{sale.clientName}</td>

                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          sale.businessId === 'lumbarfix'
                            ? 'bg-[#3b82f6]/15 text-[#60a5fa] border-[#3b82f6]/30'
                            : 'bg-[#00c8ff]/15 text-[#00c8ff] border-[#00c8ff]/30'
                        }`}
                      >
                        {sale.businessId === 'lumbarfix' ? 'LUMBAR FIX®' : 'BB IMPORT'}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Venta Online / Web</span>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="text-[11px] text-slate-300 space-y-0.5">
                        {sale.items.map((item, idx) => (
                          <div key={idx} className="truncate max-w-[220px]">
                            <span className="text-slate-400 font-mono">{item.quantity}x</span>{' '}
                            <span>{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#09151f] border border-[#162938] text-slate-300 text-[11px] capitalize">
                        {sale.paymentMethod.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                      {businessConfig.currencySymbol}{sale.total.toLocaleString('es-AR')}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#2ee59d]">
                      +{businessConfig.currencySymbol}{sale.netProfit.toLocaleString('es-AR')}
                      <span className="text-slate-500 text-[10px] block font-normal">
                        ({sale.marginPercent.toFixed(1)}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
