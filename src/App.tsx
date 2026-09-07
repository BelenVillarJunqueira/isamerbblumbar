import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { NavigationTabs } from './components/NavigationTabs';
import { MetricCards } from './components/MetricCards';
import { IntelligenceBar } from './components/IntelligenceBar';
import { TasksSection } from './components/TasksSection';
import { InventorySection } from './components/InventorySection';
import { DailyReportSection } from './components/DailyReportSection';
import { MonthlySalesSection } from './components/MonthlySalesSection';
import { ClicksAndCRMSection } from './components/ClicksAndCRMSection';
import { WebSyncSection } from './components/WebSyncSection';
import { BusinessSettingsModal } from './components/BusinessSettingsModal';
import { NewSaleModal } from './components/NewSaleModal';
import { NewTaskModal } from './components/NewTaskModal';
import {
  Store,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Package,
  CheckSquare,
  Sparkles,
  Bell,
  X,
  ArrowRight,
} from 'lucide-react';

const DashboardContent: React.FC = () => {
  const {
    activeTab,
    businessConfig,
    setActiveTab,
    setIsNewSaleModalOpen,
    lastIncomingOrderAlert,
    dismissOrderAlert,
  } = useApp();

  return (
    <div className="min-h-screen bg-[#050b11] text-slate-100 flex flex-col font-sans selection:bg-[#2ee59d]/30 selection:text-white">
      {/* Top Navigation & Brand Header */}
      <Header />

      {/* Tabs Navigation */}
      <NavigationTabs />

      {/* Floating Incoming Web Order Alert (Toast) */}
      {lastIncomingOrderAlert && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full p-4 rounded-2xl bg-[#091824] border-2 border-[#2ee59d] shadow-[0_10px_35px_rgba(46,229,157,0.25)] animate-bounce-subtle">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2ee59d]/20 border border-[#2ee59d] flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-[#2ee59d] animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2ee59d] font-mono">
                    ¡NUEVA VENTA WEB EN VIVO!
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{lastIncomingOrderAlert.time}</span>
                </div>
                <h4 className="text-sm font-bold text-white leading-tight">
                  Orden #{lastIncomingOrderAlert.orderId} - {lastIncomingOrderAlert.customerName}
                </h4>
                <p className="text-xs text-slate-300">{lastIncomingOrderAlert.itemsSummary}</p>
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-sm font-bold font-mono text-[#2ee59d]">
                    +${lastIncomingOrderAlert.amount.toLocaleString('es-AR')}
                  </span>
                  <button
                    onClick={() => {
                      dismissOrderAlert();
                      setActiveTab('tasks');
                    }}
                    className="text-xs text-white hover:text-[#2ee59d] underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <span>Ver Tarea de Envío</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={dismissOrderAlert}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-[#12283a] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Summary Cards */}
        <MetricCards />

        {/* Tab Views */}
        {activeTab === 'intelligence' && (
          <div className="space-y-6">
            <IntelligenceBar />

            {/* Two-column overview on intelligence tab: Tasks & Stock Highlights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TasksSection />
              <InventorySection />
            </div>
          </div>
        )}

        {activeTab === 'sync' && <WebSyncSection />}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <IntelligenceBar />
            <TasksSection />
          </div>
        )}

        {activeTab === 'inventory' && <InventorySection />}

        {activeTab === 'daily_report' && <DailyReportSection />}

        {activeTab === 'monthly_sales' && <MonthlySalesSection />}

        {activeTab === 'clicks_crm' && <ClicksAndCRMSection />}

        {activeTab === 'settings' && <BusinessSettingsModal />}
      </main>

      {/* Modals */}
      <NewSaleModal />
      <NewTaskModal />

      {/* Global Footer */}
      <footer className="border-t border-[#101f2c] bg-[#04080d] py-5 px-4 sm:px-8 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300 font-display">ISAMER OS</span>
            <span>•</span>
            <span>Motor Comercial para {businessConfig.businessName}</span>
            <span>•</span>
            <a
              href={businessConfig.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2ee59d] hover:underline flex items-center gap-1 font-mono"
            >
              <span>{businessConfig.websiteUrl.replace('https://', '').replace('/', '')}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2ee59d]" />
              <span>Multi-Tenant & White-Label Ready</span>
            </span>
            <span className="font-mono text-slate-600">v2.4.0-prod</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
