import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PriorityLevel, TaskCategory } from '../types';
import { X, CheckSquare, Bell, Calendar, User, Phone, Building } from 'lucide-react';

export const NewTaskModal: React.FC = () => {
  const {
    isNewTaskModalOpen,
    setIsNewTaskModalOpen,
    addTask,
    clients,
    businessConfig,
  } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('hoy');
  const [category, setCategory] = useState<TaskCategory>('contacto');
  const [dueDate, setDueDate] = useState('2026-09-07');
  const [dueTime, setDueTime] = useState('16:00');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [source, setSource] = useState('bbimport.onrender.com');

  // Client info
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCompany, setClientCompany] = useState('');

  if (!isNewTaskModalOpen) return null;

  const handleClientSelect = (cId: string) => {
    setSelectedClientId(cId);
    if (cId) {
      const cli = clients.find((c) => c.id === cId);
      if (cli) {
        setClientName(cli.name);
        setClientPhone(cli.phone);
        setClientCompany(cli.company || '');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      dueDate,
      dueTime: reminderEnabled ? dueTime : undefined,
      reminderEnabled,
      source,
      clientName: clientName.trim() || undefined,
      clientPhone: clientPhone.trim() || undefined,
      clientCompany: clientCompany.trim() || undefined,
      completed: false,
    });

    setIsNewTaskModalOpen(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="bg-[#0b1722] border border-[#1d3b50] rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#162b3b] flex items-center justify-between bg-[#081219]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-300">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-display">
                Crear Tarea con Recordatorio Diario
              </h3>
              <p className="text-xs text-slate-400">
                Prioriza contactos comerciales, llamadas, reposición de stock y cobranzas.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNewTaskModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#132534] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Título de la Tarea *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Contactar a Juan Pérez - Confirmar pedido por mayor"
              className="w-full px-3 py-2 bg-[#060e15] border border-[#172c3d] rounded-lg text-white focus:border-[#2ee59d] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1">Descripción detallada</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles de la cotización, combos solicitados, notas..."
              className="w-full px-3 py-2 bg-[#060e15] border border-[#172c3d] rounded-lg text-white focus:border-[#2ee59d] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Nivel de Prioridad</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-2.5 py-2 bg-[#060e15] border border-[#172c3d] rounded-lg text-white focus:border-[#2ee59d] focus:outline-none"
              >
                <option value="inmediata">🔥 Atención Inmediata</option>
                <option value="hoy">🟡 Contactar Hoy</option>
                <option value="seguimiento">⚠️ Seguimiento</option>
                <option value="gestionado">🟢 Bien Gestionado</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-2.5 py-2 bg-[#060e15] border border-[#172c3d] rounded-lg text-white focus:border-[#2ee59d] focus:outline-none"
              >
                <option value="contacto">Contacto con Cliente</option>
                <option value="stock">Gestión de Stock</option>
                <option value="cobro">Cobranzas & Facturación</option>
                <option value="envio">Envíos & Logística</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          {/* Date & Time reminder */}
          <div className="bg-[#081219] border border-[#162a39] rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Recordatorio Diario Programado</span>
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="rounded text-[#2ee59d] focus:ring-0"
                />
                <span className="text-slate-400 text-xs">Activar Alerta</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">Fecha de vencimiento</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#060e15] border border-[#172c3d] rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">Hora de Recordatorio</label>
                <input
                  type="time"
                  disabled={!reminderEnabled}
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#060e15] border border-[#172c3d] rounded-lg text-white font-mono disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Linked Lead / Client */}
          <div className="bg-[#081219] border border-[#162a39] rounded-xl p-3.5 space-y-2.5">
            <span className="text-slate-300 font-bold block">Vincular a Cliente / Prospecto (Opcional)</span>

            <select
              value={selectedClientId}
              onChange={(e) => handleClientSelect(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#060e15] border border-[#172c3d] rounded-lg text-white"
            >
              <option value="">Seleccionar cliente existente...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company ? `(${c.company})` : ''} - Tel: {c.phone}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nombre"
                className="px-2.5 py-1.5 bg-[#060e15] border border-[#172c3d] rounded-lg text-white"
              />
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="Tel/WhatsApp"
                className="px-2.5 py-1.5 bg-[#060e15] border border-[#172c3d] rounded-lg text-white font-mono"
              />
              <input
                type="text"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                placeholder="Empresa"
                className="px-2.5 py-1.5 bg-[#060e15] border border-[#172c3d] rounded-lg text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsNewTaskModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-[#09151e] text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#2ee59d] hover:bg-[#28d390] text-black font-bold"
            >
              Guardar Recordatorio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
