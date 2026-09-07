import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Search,
} from 'lucide-react';

export const MonthlySalesSection: React.FC = () => {
  const { sales, businessConfig, selectedBusiness, setSelectedBusiness } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [comparisonMonth, setComparisonMonth] = useState<string>('2026-08');
  const [searchFilter, setSearchFilter] = useState('');

  // Available months from sales data
  const availableMonths = useMemo(() => {
    const months = Array.from(new Set(sales.map((s) => s.monthDate))).sort().reverse();
    return months.length > 0 ? months : ['2026-09', '2026-08'];
  }, [sales]);

  // Current selected month sales
  const currentMonthSales = useMemo(() => {
    return sales.filter((s) => {
      if (s.monthDate !== selectedMonth) return false;
      if (selectedBusiness !== 'all' && (s.businessId || 'bbimport') !== selectedBusiness) return false;
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matchCode = s.code.toLowerCase().includes(q);
        const matchClient = s.clientName.toLowerCase().includes(q);
        const matchItem = s.items.some((it) => it.name.toLowerCase().includes(q));
        if (!matchCode && !matchClient && !matchItem) return false;
      }
      return true;
    });
  }, [sales, selectedMonth, selectedBusiness, searchFilter]);

  // Comparison month sales
  const comparisonMonthSales = useMemo(() => {
    return sales.filter((s) => {
      if (s.monthDate !== comparisonMonth) return false;
      if (selectedBusiness !== 'all' && (s.businessId || 'bbimport') !== selectedBusiness) return false;
      return true;
    });
  }, [sales, comparisonMonth, selectedBusiness]);

  // Aggregated figures
  const curRevenue = currentMonthSales.reduce((sum, s) => sum + s.total, 0);
  const curCost = currentMonthSales.reduce((sum, s) => sum + s.totalCost, 0);
  const curProfit = currentMonthSales.reduce((sum, s) => sum + s.netProfit, 0);
  const curCount = currentMonthSales.length;
  const curMargin = curRevenue > 0 ? (curProfit / curRevenue) * 100 : 0;

  const prevRevenue = comparisonMonthSales.reduce((sum, s) => sum + s.total, 0);
  const prevProfit = comparisonMonthSales.reduce((sum, s) => sum + s.netProfit, 0);
  const prevCount = comparisonMonthSales.length;

  const revenueGrowth = prevRevenue > 0 ? ((curRevenue - prevRevenue) / prevRevenue) * 100 : 0;
  const profitGrowth = prevProfit > 0 ? ((curProfit - prevProfit) / prevProfit) * 100 : 0;

  // Day by day breakdown for chart
  const daysInMonth = 30;
  const dailyData = useMemo(() => {
    const map: Record<number, { day: number; revenue: number; profit: number; count: number }> = {};
    for (let i = 1; i <= daysInMonth; i++) {
      map[i] = { day: i, revenue: 0, profit: 0, count: 0 };
    }

    currentMonthSales.forEach((s) => {
      const dayNum = parseInt(s.dayDate.split('-')[2], 10);
      if (map[dayNum]) {
        map[dayNum].revenue += s.total;
        map[dayNum].profit += s.netProfit;
        map[dayNum].count += 1;
      }
    });

    return Object.values(map);
  }, [currentMonthSales]);

  const maxRevenueDay = Math.max(...dailyData.map((d) => d.revenue), 10000);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Codigo', 'Fecha', 'Cliente', 'TiendaEcommerce', 'MetodoPago', 'TotalVenta', 'Costo', 'GananciaNeta', 'MargenPct'];
    const rows = currentMonthSales.map((s) => [
      s.code,
      s.date,
      `"${s.clientName.replace(/"/g, '""')}"`,
      `"${s.businessId === 'lumbarfix' ? 'LUMBAR FIX' : 'BB IMPORT'}"`,
      s.paymentMethod,
      s.total,
      s.totalCost,
      s.netProfit,
      s.marginPercent.toFixed(2),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ventas_${selectedBusiness}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getMonthName = (mStr: string) => {
    const [year, month] = mStr.split('-');
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${months[parseInt(month, 10) - 1]} ${year}`;
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2ee59d] font-mono">
            ANALYTICS & EVOLUCIÓN HISTÓRICA
          </span>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-display">
            <span>Historial Mensual & Gráficas Comparativas</span>
          </h2>
          <p className="text-xs text-slate-400">
            Comparativa mes a mes de facturación, costos y ganancias netas con curvas de rendimiento.
          </p>
        </div>

        {/* Controls: Month selector & CSV export */}
        <div className="flex items-center gap-2">
          {/* Main Month */}
          <div className="flex items-center gap-1.5 bg-[#09151e] border border-[#172b3a] rounded-lg px-2.5 py-1.5 text-xs text-white">
            <Calendar className="w-3.5 h-3.5 text-[#2ee59d]" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m} className="bg-[#0b1622] text-white">
                  {getMonthName(m)}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e1f2d] hover:bg-[#152e42] border border-[#1b3a50] text-slate-200 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#2ee59d]" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Store Filter Tabs */}
      <div className="flex items-center flex-wrap gap-2 border-b border-[#142634] pb-2.5">
        <span className="text-xs text-slate-400 font-medium mr-1">Filtrar Analítica por:</span>
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

      {/* Comparative Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Facturación Mes Actual */}
        <div className="bg-[#0d1822] border border-[#172b3a] rounded-xl p-4">
          <span className="text-xs font-medium text-slate-400">Facturación {getMonthName(selectedMonth)}</span>
          <div className="text-2xl font-extrabold text-white font-display mt-1">
            {businessConfig.currencySymbol}{curRevenue.toLocaleString('es-AR')}
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px]">
            <span
              className={`font-semibold flex items-center gap-0.5 ${
                revenueGrowth >= 0 ? 'text-[#2ee59d]' : 'text-rose-400'
              }`}
            >
              {revenueGrowth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {revenueGrowth >= 0 ? `+${revenueGrowth.toFixed(1)}%` : `${revenueGrowth.toFixed(1)}%`}
            </span>
            <span className="text-slate-500">vs {getMonthName(comparisonMonth)}</span>
          </div>
        </div>

        {/* Ganancia Neta Mes Actual */}
        <div className="bg-[#0c1c28] border border-[#1d3d52] rounded-xl p-4 shadow-[0_0_20px_rgba(46,229,157,0.08)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#2ee59d]">Ganancia Neta {getMonthName(selectedMonth)}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2ee59d]/20 text-[#2ee59d] font-bold">
              {curMargin.toFixed(1)}%
            </span>
          </div>
          <div className="text-2xl font-black text-[#2ee59d] font-display mt-1">
            +{businessConfig.currencySymbol}{curProfit.toLocaleString('es-AR')}
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px]">
            <span
              className={`font-semibold flex items-center gap-0.5 ${
                profitGrowth >= 0 ? 'text-[#2ee59d]' : 'text-rose-400'
              }`}
            >
              {profitGrowth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {profitGrowth >= 0 ? `+${profitGrowth.toFixed(1)}%` : `${profitGrowth.toFixed(1)}%`}
            </span>
            <span className="text-slate-400">crecimiento de utilidad</span>
          </div>
        </div>

        {/* Costo Mercadería */}
        <div className="bg-[#0d1822] border border-[#172b3a] rounded-xl p-4">
          <span className="text-xs font-medium text-slate-400">Costo Mercadería Vendida</span>
          <div className="text-2xl font-extrabold text-slate-300 font-display mt-1">
            {businessConfig.currencySymbol}{curCost.toLocaleString('es-AR')}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-mono">
            {((curCost / Math.max(1, curRevenue)) * 100).toFixed(1)}% de la facturación
          </p>
        </div>

        {/* Volumen de Operaciones */}
        <div className="bg-[#0d1822] border border-[#172b3a] rounded-xl p-4">
          <span className="text-xs font-medium text-slate-400">Operaciones Cerradas</span>
          <div className="text-2xl font-extrabold text-white font-display mt-1">
            {curCount} ventas
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-mono">
            Promedio: {businessConfig.currencySymbol}{Math.round(curRevenue / Math.max(1, curCount)).toLocaleString('es-AR')} / ticket
          </p>
        </div>
      </div>

      {/* COMPARATIVE GRAPHS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* GRAPH 1: Evolution throughout the month (Interactive SVG) */}
        <div className="lg:col-span-2 bg-[#0d1822] border border-[#172b3a] rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#2ee59d]" />
                <span>Evolución Diaria: Ventas vs Ganancia Neta</span>
              </h3>
              <p className="text-xs text-slate-400">
                Pasa el cursor sobre cada barra para ver los importes del día.
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500"></span>
                <span>Ventas Brutas</span>
              </span>
              <span className="flex items-center gap-1.5 text-[#2ee59d]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#2ee59d]"></span>
                <span>Ganancia Neta</span>
              </span>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-56 w-full flex items-end gap-1 pt-6 px-2 border-b border-l border-[#1b3142]">
            {dailyData.map((d) => {
              const revHeightPct = Math.min(100, Math.round((d.revenue / maxRevenueDay) * 100));
              const profHeightPct = Math.min(100, Math.round((d.profit / maxRevenueDay) * 100));
              const hasData = d.revenue > 0;

              return (
                <div
                  key={d.day}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col bg-[#081219] border border-[#1e394f] rounded-lg p-2 text-[10px] text-white whitespace-nowrap z-30 shadow-xl pointer-events-none">
                    <span className="font-bold text-[#2ee59d]">Día {d.day} de {getMonthName(selectedMonth).split(' ')[0]}</span>
                    <span>Ventas: ${d.revenue.toLocaleString('es-AR')}</span>
                    <span className="text-emerald-400">Ganancia: +${d.profit.toLocaleString('es-AR')}</span>
                    <span className="text-slate-400">Tickets: {d.count}</span>
                  </div>

                  {/* Bars */}
                  <div className="w-full flex items-end justify-center gap-0.5 h-full">
                    {/* Revenue bar */}
                    <div
                      style={{ height: `${Math.max(hasData ? 6 : 2, revHeightPct)}%` }}
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        hasData ? 'bg-cyan-500/80 group-hover:bg-cyan-400' : 'bg-[#122330]'
                      }`}
                    />
                    {/* Profit bar */}
                    <div
                      style={{ height: `${Math.max(hasData ? 4 : 2, profHeightPct)}%` }}
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        hasData ? 'bg-[#2ee59d] group-hover:bg-[#34f5aa]' : 'bg-[#10202c]'
                      }`}
                    />
                  </div>

                  {/* Day number under bar (show every 5 days or when has data) */}
                  {(d.day === 1 || d.day % 5 === 0 || d.day === 7) && (
                    <span className="text-[9px] font-mono text-slate-500 mt-1 absolute -bottom-5">
                      {d.day}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-6 px-2">
            <span>Día 1</span>
            <span>Día 15</span>
            <span>Día 30</span>
          </div>
        </div>

        {/* GRAPH 2: Mes Actual vs Mes Anterior (Side-by-side comparison) */}
        <div className="bg-[#0d1822] border border-[#172b3a] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Comparativa Mes a Mes</h3>
            <p className="text-xs text-slate-400 mb-4">
              {getMonthName(selectedMonth)} vs {getMonthName(comparisonMonth)}
            </p>

            {/* Comparison Metrics */}
            <div className="space-y-4">
              {/* Facturación comparison */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Facturación Total:</span>
                  <span className="font-mono text-white font-bold">
                    {businessConfig.currencySymbol}{curRevenue.toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Mes anterior:</span>
                  <span>{businessConfig.currencySymbol}{prevRevenue.toLocaleString('es-AR')}</span>
                </div>
                {/* Visual Comparative Bars */}
                <div className="space-y-1 pt-1">
                  <div className="w-full bg-[#081219] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full rounded-full"
                      style={{
                        width: `${Math.min(100, Math.round((curRevenue / Math.max(1, Math.max(curRevenue, prevRevenue))) * 100))}%`,
                      }}
                    />
                  </div>
                  <div className="w-full bg-[#081219] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-slate-600 h-full rounded-full"
                      style={{
                        width: `${Math.min(100, Math.round((prevRevenue / Math.max(1, Math.max(curRevenue, prevRevenue))) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Ganancia Neta comparison */}
              <div className="space-y-1.5 pt-2 border-t border-[#142634]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#2ee59d] font-semibold">Ganancia Neta:</span>
                  <span className="font-mono text-[#2ee59d] font-bold">
                    +{businessConfig.currencySymbol}{curProfit.toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Mes anterior:</span>
                  <span>+{businessConfig.currencySymbol}{prevProfit.toLocaleString('es-AR')}</span>
                </div>
                {/* Visual Comparative Bars */}
                <div className="space-y-1 pt-1">
                  <div className="w-full bg-[#081219] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#2ee59d] h-full rounded-full"
                      style={{
                        width: `${Math.min(100, Math.round((curProfit / Math.max(1, Math.max(curProfit, prevProfit))) * 100))}%`,
                      }}
                    />
                  </div>
                  <div className="w-full bg-[#081219] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-800 h-full rounded-full"
                      style={{
                        width: `${Math.min(100, Math.round((prevProfit / Math.max(1, Math.max(curProfit, prevProfit))) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#142634] text-xs text-slate-400">
            <span className="font-semibold text-slate-200">Balance del período: </span>
            {profitGrowth >= 0 ? (
              <span className="text-emerald-400">
                Incrementaste tu ganancia neta un +{profitGrowth.toFixed(1)}% gracias a mayor tracción en combos y canales online.
              </span>
            ) : (
              <span className="text-amber-400">
                La ganancia disminuyó un {profitGrowth.toFixed(1)}% comparado al pico del mes anterior.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* DETAILED MONTHLY SALES TABLE */}
      <div className="bg-[#0d1822] border border-[#172b3a] rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Listado de Todas las Ventas del Mes ({currentMonthSales.length})</span>
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative w-40 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar ticket, cliente..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 bg-[#09151e] border border-[#172b3a] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2ee59d]"
              />
            </div>

            {/* Filter by store */}
            <select
              value={selectedBusiness}
              onChange={(e) => setSelectedBusiness(e.target.value as any)}
              className="px-2.5 py-1.5 bg-[#09151e] border border-[#172b3a] rounded-lg text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">Todas las Tiendas (Consolidado)</option>
              <option value="bbimport">BB IMPORT (bbimport.onrender.com)</option>
              <option value="lumbarfix">LUMBAR FIX® (lumbar-fix.vercel.app)</option>
            </select>
          </div>
        </div>

        {currentMonthSales.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">
            No se encontraron transacciones para el mes seleccionado con los filtros aplicados.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#09151f] text-slate-400 font-mono text-[11px] uppercase border-b border-[#172b3a]">
                <tr>
                  <th className="py-2.5 px-3">Ticket ID</th>
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Tienda E-commerce</th>
                  <th className="py-2.5 px-3">Ítems Comprados</th>
                  <th className="py-2.5 px-3">Canal / Pago</th>
                  <th className="py-2.5 px-3 text-right">Facturado</th>
                  <th className="py-2.5 px-3 text-right">Ganancia Neta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#13222e]">
                {currentMonthSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-[#101f2d] transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-white">
                      {sale.code}
                    </td>

                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                      {sale.dayDate}
                    </td>

                    <td className="py-2.5 px-3 font-medium text-slate-200">
                      {sale.clientName}
                    </td>

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
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="text-[11px] text-slate-300">
                        {sale.items.map((item, idx) => (
                          <span key={idx} className="block truncate max-w-[200px]">
                            {item.quantity}x {item.name} ({item.type === 'combo' ? 'Combo' : 'Unid'})
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="text-[11px]">
                        <span className="text-slate-300 capitalize">{sale.paymentMethod.replace('_', ' ')}</span>
                        <span className="text-slate-500 block text-[10px] font-mono">
                          {sale.source}
                        </span>
                      </div>
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
