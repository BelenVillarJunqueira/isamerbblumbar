import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Compass,
  CheckSquare,
  Package,
  FileSpreadsheet,
  BarChart3,
  Users,
  Settings,
  AlertCircle,
  Globe,
} from 'lucide-react';

export const NavigationTabs: React.FC = () => {
  const { activeTab, setActiveTab, metrics, tasks, webConnectionStatus } = useApp();

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  const tabs = [
    {
      id: 'intelligence' as const,
      label: 'Growth Intelligence',
      icon: Compass,
      badge: null,
    },
    {
      id: 'sync' as const,
      label: 'Enlace Web & Webhooks',
      icon: Globe,
      badge: '2 Tiendas',
      badgeColor: 'bg-emerald-500/20 text-[#2ee59d] border-emerald-500/40',
    },
    {
      id: 'tasks' as const,
      label: 'Tareas & Recordatorios',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      id: 'inventory' as const,
      label: 'Stock & Combos',
      icon: Package,
      badge: metrics.criticalStockCount > 0 ? `${metrics.criticalStockCount} alertas` : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    {
      id: 'daily_report' as const,
      label: 'Reporte Diario',
      icon: FileSpreadsheet,
      badge: `$${metrics.todayProfit.toLocaleString('es-AR')}`,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    {
      id: 'monthly_sales' as const,
      label: 'Ventas Mensuales',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'clicks_crm' as const,
      label: 'Clics, Clientes & E-commerce',
      icon: Users,
      badge: `${metrics.todayTotalClicks} clics`,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    },
    {
      id: 'settings' as const,
      label: 'Multi-Negocio (SaaS)',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <nav className="border-b border-[#142330] bg-[#09131a] px-4 lg:px-8 overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#102230] text-[#2ee59d] border border-[#20445d] shadow-[0_2px_10px_rgba(0,0,0,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c1822]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#2ee59d]' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full border font-mono font-medium ${tab.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'}`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
