import React from 'react';
import { useApp } from '../context/AppContext';
import { PriorityLevel } from '../types';

export const IntelligenceBar: React.FC = () => {
  const { metrics, activePriorityFilter, setActivePriorityFilter, setActiveTab } = useApp();

  const categories: {
    id: PriorityLevel;
    label: string;
    emoji: string;
    dotColor: string;
    count: number;
    description: string;
  }[] = [
    {
      id: 'inmediata',
      label: 'Atención inmediata',
      emoji: '🔥',
      dotColor: 'bg-rose-500',
      count: metrics.priorityCounts.inmediata,
      description: 'Stock crítico o cobros urgentes',
    },
    {
      id: 'hoy',
      label: 'Contactar hoy',
      emoji: '🟡',
      dotColor: 'bg-amber-400',
      count: metrics.priorityCounts.hoy,
      description: 'Consultas web y pedidos pendientes',
    },
    {
      id: 'gestionado',
      label: 'Bien gestionados',
      emoji: '🟢',
      dotColor: 'bg-emerald-400',
      count: metrics.priorityCounts.gestionado,
      description: 'Ventas cerradas y entregadas',
    },
    {
      id: 'seguimiento',
      label: 'Seguimiento',
      emoji: '⚠️',
      dotColor: 'bg-yellow-500',
      count: metrics.priorityCounts.seguimiento,
      description: 'Cotizaciones y envíos en tránsito',
    },
  ];

  const handleCategoryClick = (p: PriorityLevel) => {
    if (activePriorityFilter === p) {
      setActivePriorityFilter('all');
    } else {
      setActivePriorityFilter(p);
    }
    setActiveTab('tasks');
  };

  return (
    <div className="space-y-3.5">
      {/* Header section matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2ee59d] font-mono">
            GROWTH INTELLIGENCE
          </span>
          <h2 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2 font-display mt-0.5">
            <span>🎯 Acciones recomendadas</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            ISAMER OS analiza el pipeline comercial y prioriza automáticamente las tareas de inventario, clientes y ventas.
          </p>
        </div>

        {/* Status indicator: • Motor activo */}
        <div className="flex items-center gap-2 self-start sm:self-center px-3 py-1.5 rounded-full bg-[#0a1520] border border-[#172c3d] text-xs font-medium text-slate-300 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#2ee59d] animate-pulse"></span>
          <span className="font-mono text-[#2ee59d]">Motor activo</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">IA de Flujo Comercial</span>
        </div>
      </div>

      {/* 4 Category Cards matching the screenshot */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {categories.map((cat) => {
          const isSelected = activePriorityFilter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`rounded-xl p-4 text-left transition-all duration-200 border cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'bg-[#112332] border-[#2ee59d] shadow-[0_0_20px_rgba(46,229,157,0.15)]'
                  : 'bg-[#0d1822] border-[#172b3a] hover:border-[#223f54] hover:bg-[#0f1d2a]'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <span className="text-sm">{cat.emoji}</span>
                <span className="truncate">{cat.label}</span>
              </div>

              <div className="mt-2.5 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-white font-display">
                  {cat.count}
                </span>
                {isSelected && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#2ee59d]/20 text-[#2ee59d] border border-[#2ee59d]/30 font-medium">
                    Filtrando
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-500 mt-1 truncate">
                {cat.description}
              </p>

              {/* Bottom accent indicator */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all ${
                  isSelected ? 'bg-[#2ee59d]' : 'bg-transparent group-hover:bg-[#1a384d]'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
