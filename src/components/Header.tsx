import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Plus,
  ExternalLink,
  Store,
  Clock,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    businessConfig,
    selectedBusiness,
    setSelectedBusiness,
    metrics,
    setIsNewSaleModalOpen,
    setIsNewTaskModalOpen,
    setActiveTab,
  } = useApp();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
      setCurrentDate(
        now.toLocaleDateString('es-AR', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-[#142330] bg-[#071017]/95 backdrop-blur sticky top-0 z-40 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left: Brand Identity matching user screenshot */}
        <div>
          <div className="flex items-center flex-wrap gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white flex items-center gap-1.5 font-display">
              ISAMER <span className="text-[#2ee59d] drop-shadow-[0_0_12px_rgba(46,229,157,0.4)]">OS</span>
            </h1>

            {/* Business Quick Switcher */}
            <div className="flex items-center p-0.5 rounded-lg bg-[#0b1723] border border-[#1a3449]">
              <button
                onClick={() => setSelectedBusiness('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  selectedBusiness === 'all'
                    ? 'bg-[#2ee59d] text-[#061017] shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-[#122536]'
                }`}
              >
                Ambos E-commerce
              </button>
              <button
                onClick={() => setSelectedBusiness('bbimport')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  selectedBusiness === 'bbimport'
                    ? 'bg-[#00c8ff] text-[#061017] shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-[#122536]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#00c8ff]"></span>
                BB IMPORT
              </button>
              <button
                onClick={() => setSelectedBusiness('lumbarfix')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  selectedBusiness === 'lumbarfix'
                    ? 'bg-[#3b82f6] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-[#122536]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>
                LUMBAR FIX®
              </button>
            </div>

            {/* Live Web Status Button */}
            <button
              onClick={() => setActiveTab('sync')}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#091824] hover:bg-[#11273a] border border-[#1b3b52] text-xs font-medium text-[#2ee59d] transition-colors cursor-pointer group"
              title="Ver estado de enlace y webhooks de bbimport.onrender.com y lumbar-fix.vercel.app"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#2ee59d] animate-pulse"></span>
              <span className="font-mono text-[11px]">2 Tiendas Web Conectadas</span>
              <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Subtitle from exact screenshot */}
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-mono mt-0.5 font-medium">
            DATA <span className="text-slate-600">→</span> INTELLIGENCE{' '}
            <span className="text-slate-600">→</span> SOFTWARE{' '}
            <span className="text-slate-600">→</span> DUAL E-COMMERCE ENGINE
          </p>
        </div>

        {/* Right: Status indicators & Fast Actions */}
        <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto justify-between md:justify-end">
          {/* Real-time Clock */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a1520] border border-[#162938] text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-[#2ee59d]" />
            <span className="font-mono text-slate-200 font-semibold">{currentTime}</span>
            <span className="text-slate-500 capitalize">{currentDate}</span>
          </div>

          {/* Stock Alert Badge if any */}
          {metrics.criticalStockCount > 0 && (
            <button
              onClick={() => setActiveTab('inventory')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{metrics.criticalStockCount} bajo stock</span>
            </button>
          )}

          {/* Button: + Nueva Tarea */}
          <button
            onClick={() => setIsNewTaskModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e1f2d] hover:bg-[#142c40] border border-[#1b3a50] text-slate-200 hover:text-white text-xs font-semibold transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-[#2ee59d]" />
            <span>+ Tarea / Recordatorio</span>
          </button>

          {/* Main Action Button: + Nueva Venta (Matching green mint button in screenshot) */}
          <button
            onClick={() => setIsNewSaleModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#2ee59d] hover:bg-[#28d390] text-[#061017] text-xs lg:text-sm font-bold transition-all shadow-[0_0_16px_rgba(46,229,157,0.35)] active:scale-95 cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            <span>+ Registrar Venta</span>
          </button>

          {/* Settings / White-label */}
          <button
            onClick={() => setActiveTab('settings')}
            className="p-1.5 rounded-lg bg-[#0a1520] hover:bg-[#142838] border border-[#162938] text-slate-400 hover:text-white transition-colors"
            title="Configuración de negocio y venta a terceros"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
