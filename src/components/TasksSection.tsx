import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DailyTask, PriorityLevel } from '../types';
import {
  Check,
  Clock,
  Phone,
  MessageCircle,
  Building,
  Mail,
  Trash2,
  Calendar,
  Filter,
  Plus,
  Bell,
  Search,
  CheckCircle2,
} from 'lucide-react';

export const TasksSection: React.FC = () => {
  const {
    tasks,
    toggleTaskComplete,
    deleteTask,
    activePriorityFilter,
    setActivePriorityFilter,
    setIsNewTaskModalOpen,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    // Priority filter
    if (activePriorityFilter !== 'all' && task.priority !== activePriorityFilter) {
      return false;
    }
    // Category filter
    if (selectedCategory !== 'all' && task.category !== selectedCategory) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description.toLowerCase().includes(q);
      const matchClient = task.clientName?.toLowerCase().includes(q) || false;
      const matchCompany = task.clientCompany?.toLowerCase().includes(q) || false;
      return matchTitle || matchDesc || matchClient || matchCompany;
    }
    return true;
  });

  const getPriorityBadge = (p: PriorityLevel) => {
    switch (p) {
      case 'inmediata':
        return {
          label: '🔥 ATENCIÓN INMEDIATA',
          bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          dot: 'bg-rose-500',
        };
      case 'hoy':
        return {
          label: '🟡 CONTACTAR HOY',
          bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-400',
        };
      case 'gestionado':
        return {
          label: '🟢 BIEN GESTIONADO',
          bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-400',
        };
      case 'seguimiento':
        return {
          label: '⚠️ SEGUIMIENTO',
          bg: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
          dot: 'bg-yellow-400',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Priority Section Header matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 font-display">
            <span>🔥 Prioridad comercial & Tareas diarias</span>
          </h3>
          <p className="text-xs text-slate-400">
            Recordatorios diarios programados con pipeline de contacto, cobro y stock.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-[#09151e] border border-[#172b3a] rounded-lg p-1 text-xs">
            <button
              onClick={() => setActivePriorityFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                activePriorityFilter === 'all'
                  ? 'bg-[#152a3b] text-[#2ee59d] font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas ({tasks.length})
            </button>
            <button
              onClick={() => setActivePriorityFilter('inmediata')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                activePriorityFilter === 'inmediata'
                  ? 'bg-rose-950/60 text-rose-300 font-semibold border border-rose-800/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🔥 Inmediata
            </button>
            <button
              onClick={() => setActivePriorityFilter('hoy')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                activePriorityFilter === 'hoy'
                  ? 'bg-amber-950/60 text-amber-300 font-semibold border border-amber-800/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🟡 Hoy
            </button>
            <button
              onClick={() => setActivePriorityFilter('seguimiento')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                activePriorityFilter === 'seguimiento'
                  ? 'bg-yellow-950/60 text-yellow-300 font-semibold border border-yellow-800/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚠️ Seguimiento
            </button>
          </div>

          <button
            onClick={() => setIsNewTaskModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2ee59d] hover:bg-[#28d390] text-[#061017] text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nueva Tarea</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, empresa, tarea o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#0d1822] border border-[#172b3a] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2ee59d] transition-colors"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 bg-[#0d1822] border border-[#172b3a] rounded-xl text-xs text-slate-300 focus:outline-none focus:border-[#2ee59d]"
        >
          <option value="all">Todas las categorías</option>
          <option value="contacto">Contacto con Cliente</option>
          <option value="stock">Gestión de Stock</option>
          <option value="cobro">Cobranzas & Facturación</option>
          <option value="envio">Envíos & Logística</option>
          <option value="general">General / Operativo</option>
        </select>
      </div>

      {/* Task List styled like the screenshot card */}
      {filteredTasks.length === 0 ? (
        <div className="bg-[#0d1822] border border-[#172b3a] rounded-xl p-8 text-center">
          <CheckCircle2 className="w-10 h-10 text-[#2ee59d]/50 mx-auto mb-2" />
          <p className="text-sm text-slate-300 font-medium">No hay tareas pendientes en este filtro</p>
          <p className="text-xs text-slate-500 mt-1">¡Excelente trabajo manteniendo el pipeline al día!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const badge = getPriorityBadge(task.priority);
            const isDone = task.completed;

            return (
              <div
                key={task.id}
                className={`rounded-xl border transition-all duration-200 p-5 ${
                  isDone
                    ? 'bg-[#0a141d]/70 border-[#142634] opacity-60'
                    : 'bg-[#0d1822] border-[#172b3a] hover:border-[#223f54] shadow-sm'
                }`}
              >
                {/* Top Row: Priority Badge + Score/Priority number + Actions */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-md border tracking-wider font-mono flex items-center gap-1.5 ${badge.bg}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
                      {badge.label}
                    </span>

                    {task.reminderEnabled && (
                      <span className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                        <Bell className="w-3 h-3" />
                        <span>{task.dueTime || 'Hoy'}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-mono text-sm font-bold">
                      {task.priority === 'inmediata' ? '98' : task.priority === 'hoy' ? '45' : '15'}
                    </span>

                    {/* Checkbox / Done toggle */}
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                        isDone
                          ? 'bg-[#2ee59d] border-[#2ee59d] text-black'
                          : 'bg-[#09151f] border-[#1e394f] text-transparent hover:text-slate-400 hover:border-[#2ee59d]'
                      }`}
                      title={isDone ? 'Marcar como pendiente' : 'Marcar como completada'}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-slate-600 hover:text-rose-400 p-1 transition-colors"
                      title="Eliminar tarea"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Main Content: Title & Lead/Client details */}
                <div className="mb-3">
                  <h4
                    className={`text-base font-bold ${
                      isDone ? 'line-through text-slate-400' : 'text-white'
                    }`}
                  >
                    {task.title}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {task.description}
                  </p>
                </div>

                {/* Inner lead details box matching the screenshot! */}
                {task.clientName && (
                  <div className="bg-[#081219] border border-[#142533] rounded-lg p-3.5 my-3 space-y-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-semibold block">
                      CONTACTAR A
                    </span>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-white">{task.clientName}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-0.5">
                          {task.clientCompany && (
                            <span className="flex items-center gap-1">
                              <Building className="w-3.5 h-3.5 text-slate-500" />
                              <span>{task.clientCompany}</span>
                            </span>
                          )}
                          {task.clientPhone && (
                            <span className="flex items-center gap-1 font-mono text-slate-300">
                              <Phone className="w-3.5 h-3.5 text-slate-500" />
                              <span>{task.clientPhone}</span>
                            </span>
                          )}
                          {task.clientEmail && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <Mail className="w-3.5 h-3.5 text-slate-500" />
                              <span>{task.clientEmail}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Communication Actions */}
                      <div className="flex items-center gap-2">
                        {task.clientPhone && (
                          <a
                            href={`https://wa.me/${task.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Hola ${task.clientName}, te escribo desde BB Import respecto a tu consulta: ${task.title}`,
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                        {task.clientPhone && (
                          <a
                            href={`tel:${task.clientPhone}`}
                            className="p-1.5 rounded-lg bg-[#0e1f2b] hover:bg-[#163044] border border-[#1b3a50] text-slate-300 hover:text-white transition-colors"
                            title="Llamar"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom metadata tags: [Estado: new] [Fuente: excel/bbimport] [Fecha] */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#13222e] text-[11px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-[#0b1722] border border-[#172d3e] text-slate-400">
                    Estado: {isDone ? 'completado' : task.priority === 'inmediata' ? 'urgente' : 'activo'}
                  </span>

                  <span className="px-2 py-0.5 rounded bg-[#0b1722] border border-[#172d3e] text-slate-400">
                    Fuente: {task.source}
                  </span>

                  <span className="px-2 py-0.5 rounded bg-[#0b1722] border border-[#172d3e] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{task.dueDate} {task.dueTime ? `(${task.dueTime} hs)` : ''}</span>
                  </span>

                  {task.category && (
                    <span className="px-2 py-0.5 rounded bg-[#0b1722] border border-[#172d3e] text-[#2ee59d]/80 uppercase">
                      {task.category}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
