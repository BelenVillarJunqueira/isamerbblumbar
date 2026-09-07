import React from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Percent,
  AlertTriangle,
  MousePointerClick,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export const MetricCards: React.FC = () => {
  const { metrics, businessConfig, selectedBusiness, setSelectedBusiness, setActiveTab } = useApp();

  const businessLabel =
    selectedBusiness === 'bbimport'
      ? 'BB IMPORT (bbimport.onrender.com)'
      : selectedBusiness === 'lumbarfix'
        ? 'LUMBAR FIX® (lumbar-fix.vercel.app)'
        : 'Dual E-commerce (BB IMPORT + LUMBAR FIX)';

  const cards = [
    {
      id: 'ventas_hoy',
      label: 'Ventas Hoy',
      value: `${businessConfig.currencySymbol}${metrics.todaySales.toLocaleString('es-AR')}`,
      sublabel: `${metrics.todayCount} operaciones online`,
      trend: metrics.salesGrowthPercent >= 0 ? `+${metrics.salesGrowthPercent.toFixed(1)}% vs ayer` : `${metrics.salesGrowthPercent.toFixed(1)}% vs ayer`,
      isPositive: metrics.salesGrowthPercent >= 0,
      icon: DollarSign,
      action: () => setActiveTab('daily_report'),
    },
    {
      id: 'ganancia_neta',
      label: 'Ganancia Neta Hoy',
      value: `${businessConfig.currencySymbol}${metrics.todayProfit.toLocaleString('es-AR')}`,
      sublabel: `Costo: ${businessConfig.currencySymbol}${metrics.todayCost.toLocaleString('es-AR')}`,
      trend: `${metrics.todayMargin.toFixed(1)}% margen neto`,
      isPositive: true,
      highlight: true,
      icon: TrendingUp,
      action: () => setActiveTab('daily_report'),
    },
    {
      id: 'transacciones',
      label: 'Pedidos Online Hoy',
      value: metrics.todayCount.toString(),
      sublabel: '100% E-commerce (Sin locales)',
      trend: `${metrics.todayCount} despachos`,
      isPositive: true,
      icon: ShoppingBag,
      action: () => setActiveTab('monthly_sales'),
    },
    {
      id: 'margen_promedio',
      label: 'Margen Rentabilidad',
      value: `${metrics.todayMargin.toFixed(1)}%`,
      sublabel: 'Rentabilidad neta global',
      trend: metrics.todayMargin >= 35 ? 'Margen excelente' : 'Revisar costos',
      isPositive: metrics.todayMargin >= 35,
      icon: Percent,
      action: () => setActiveTab('daily_report'),
    },
    {
      id: 'stock_critico',
      label: 'Alertas de Stock',
      value: metrics.criticalStockCount.toString(),
      sublabel: metrics.criticalStockCount === 0 ? 'Stock e-commerce al día' : 'Requieren reposición',
      trend: metrics.criticalStockCount > 0 ? 'Atención urgente' : 'Todo en regla',
      isPositive: metrics.criticalStockCount === 0,
      isAlert: metrics.criticalStockCount > 0,
      icon: AlertTriangle,
      action: () => setActiveTab('inventory'),
    },
    {
      id: 'clics_trafico',
      label: 'Clics & Tráfico Hoy',
      value: metrics.todayTotalClicks.toString(),
      sublabel: selectedBusiness === 'all' ? 'Ambas tiendas web' : selectedBusiness === 'lumbarfix' ? 'lumbar-fix.vercel.app' : 'bbimport.onrender.com',
      trend: `${metrics.totalConversions} conversiones`,
      isPositive: true,
      icon: MousePointerClick,
      action: () => setActiveTab('clicks_crm'),
    },
  ];

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.id}
              onClick={c.action}
              className={`group rounded-xl p-4 transition-all duration-200 cursor-pointer border ${
                c.isAlert
                  ? 'bg-[#151218] border-rose-900/50 hover:border-rose-500/60 shadow-[0_0_15px_rgba(225,29,72,0.1)]'
                  : c.highlight
                    ? 'bg-[#0d1c26] border-[#1f4258] hover:border-[#2ee59d]/60 shadow-[0_0_15px_rgba(46,229,157,0.08)]'
                    : 'bg-[#0d1822] border-[#172b3a] hover:border-[#234157]'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200 transition-colors truncate">
                  {c.label}
                </span>
                <Icon
                  className={`w-3.5 h-3.5 flex-shrink-0 ${
                    c.isAlert
                      ? 'text-rose-400'
                      : c.highlight
                        ? 'text-[#2ee59d]'
                        : 'text-slate-500 group-hover:text-slate-400'
                  }`}
                />
              </div>

              <div className="flex items-baseline gap-1">
                <span
                  className={`text-2xl lg:text-[26px] font-extrabold tracking-tight font-display ${
                    c.isAlert ? 'text-rose-300' : c.highlight ? 'text-[#2ee59d]' : 'text-white'
                  }`}
                >
                  {c.value}
                </span>
              </div>

              <div className="mt-1.5 flex flex-col text-[11px]">
                <span className="text-slate-500 truncate">{c.sublabel}</span>
                <span
                  className={`font-medium flex items-center gap-0.5 mt-0.5 ${
                    c.isAlert
                      ? 'text-rose-400'
                      : c.isPositive
                        ? 'text-[#2ee59d]'
                        : 'text-amber-400'
                  }`}
                >
                  {c.isPositive && !c.isAlert && <ArrowUpRight className="w-3 h-3 inline" />}
                  {!c.isPositive && !c.isAlert && <ArrowDownRight className="w-3 h-3 inline" />}
                  {c.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dual Business Quick Comparison Banner (when 'all' is selected or allows toggling) */}
      <div className="bg-[#0a1520] border border-[#162938] rounded-xl px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-[#2ee59d]"></span>
          <span>Desglose por Negocio E-commerce:</span>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* BB IMPORT Pill */}
          <button
            onClick={() => setSelectedBusiness(selectedBusiness === 'bbimport' ? 'all' : 'bbimport')}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 transition-all cursor-pointer ${
              selectedBusiness === 'bbimport'
                ? 'bg-[#00c8ff]/15 border-[#00c8ff]/50 text-white shadow-sm'
                : 'bg-[#0d1d29] border-[#18364d] text-slate-300 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#00c8ff]"></span>
            <span className="font-semibold text-[#00c8ff]">BB IMPORT:</span>
            <span>${metrics.bbImportMetrics.todaySales.toLocaleString('es-AR')}</span>
            <span className="text-[#2ee59d] font-semibold">
              (+${metrics.bbImportMetrics.todayProfit.toLocaleString('es-AR')} ganancia)
            </span>
            <span className="text-slate-400 text-[10px]">({metrics.bbImportMetrics.todayCount} ventas)</span>
          </button>

          {/* LUMBAR FIX Pill */}
          <button
            onClick={() => setSelectedBusiness(selectedBusiness === 'lumbarfix' ? 'all' : 'lumbarfix')}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 transition-all cursor-pointer ${
              selectedBusiness === 'lumbarfix'
                ? 'bg-[#3b82f6]/15 border-[#3b82f6]/50 text-white shadow-sm'
                : 'bg-[#0e1b2b] border-[#1c334d] text-slate-300 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>
            <span className="font-semibold text-[#60a5fa]">LUMBAR FIX®:</span>
            <span>${metrics.lumbarFixMetrics.todaySales.toLocaleString('es-AR')}</span>
            <span className="text-[#2ee59d] font-semibold">
              (+${metrics.lumbarFixMetrics.todayProfit.toLocaleString('es-AR')} ganancia)
            </span>
            <span className="text-slate-400 text-[10px]">({metrics.lumbarFixMetrics.todayCount} ventas)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
