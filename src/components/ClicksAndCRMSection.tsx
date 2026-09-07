import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Client, StoreLocal, ClickChannel } from '../types';
import {
  MousePointerClick,
  Users,
  Store,
  ExternalLink,
  Plus,
  MessageCircle,
  Phone,
  Mail,
  Building,
  TrendingUp,
  Link,
  Copy,
  Check,
  Zap,
  Globe,
  ShoppingBag,
} from 'lucide-react';

export const ClicksAndCRMSection: React.FC = () => {
  const {
    clickChannels,
    recordChannelClick,
    addClickChannel,
    clients,
    addClient,
    locales,
    businessConfig,
    sales,
    selectedBusiness,
    setSelectedBusiness,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'clicks' | 'crm' | 'stores'>('stores');

  // UTM Generator State
  const [utmTargetStore, setUtmTargetStore] = useState<'bbimport' | 'lumbarfix'>('bbimport');
  const [utmSource, setUtmSource] = useState('whatsapp');
  const [utmCampaign, setUtmCampaign] = useState('combos_primavera');
  const [copiedLink, setCopiedLink] = useState(false);

  // New Client Modal
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientNotes, setClientNotes] = useState('');

  const targetUrl = utmTargetStore === 'lumbarfix' ? 'https://lumbar-fix.vercel.app/' : 'https://bbimport.onrender.com/';
  const generatedUtmUrl = `${targetUrl}?utm_source=${utmSource}&utm_campaign=${utmCampaign}&ref=isamer_os`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedUtmUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    addClient({
      name: clientName.trim(),
      email: clientEmail.trim(),
      phone: clientPhone.trim(),
      company: clientCompany.trim(),
      tier: 'nuevo',
      notes: clientNotes.trim(),
    });

    setIsNewClientOpen(false);
    setClientName('');
    setClientEmail('');
    setClientPhone('');
    setClientCompany('');
    setClientNotes('');
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2ee59d] font-mono">
            GESTIÓN COMERCIAL & E-COMMERCE DUAL
          </span>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-display">
            <span>Control de Clics, Clientes y Tiendas E-commerce</span>
          </h2>
          <p className="text-xs text-slate-400">
            Monitorea el tráfico de tus 2 tiendas online (BB IMPORT y LUMBAR FIX®), tu cartera de clientes y conversiones en vivo.
          </p>
        </div>

        {/* External direct links to both stores */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="https://bbimport.onrender.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00c8ff]/10 hover:bg-[#00c8ff]/20 border border-[#00c8ff]/30 text-[#00c8ff] text-xs font-semibold transition-colors"
          >
            <span>BB IMPORT Web</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://lumbar-fix.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 border border-[#3b82f6]/30 text-[#60a5fa] text-xs font-semibold transition-colors"
          >
            <span>LUMBAR FIX® Web</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Tabs selector */}
      <div className="flex items-center gap-2 border-b border-[#152736] pb-2">
        <button
          onClick={() => setActiveTab('stores')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'stores'
              ? 'bg-[#122432] text-[#2ee59d] border border-[#1e4259]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Tiendas E-commerce (2)</span>
        </button>

        <button
          onClick={() => setActiveTab('clicks')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'clicks'
              ? 'bg-[#122432] text-[#2ee59d] border border-[#1e4259]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MousePointerClick className="w-3.5 h-3.5" />
          <span>Control de Clics & Enlaces</span>
        </button>

        <button
          onClick={() => setActiveTab('crm')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'crm'
              ? 'bg-[#122432] text-[#2ee59d] border border-[#1e4259]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Clientes & CRM ({clients.length})</span>
        </button>
      </div>

      {/* SUB-SECTION 1: CONTROL DE CLICS */}
      {activeTab === 'clicks' && (
        <div className="space-y-4">
          {/* Clicks Summary Table */}
          <div className="bg-[#0d1822] border border-[#172b3a] rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 text-[#2ee59d]" />
                  <span>Tráfico Entrante por Canal & Conversión a Venta</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Rastrea cuántas visitas provienen de cada fuente y cuántas se convierten en ventas concretadas.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#09151f] text-slate-400 font-mono text-[11px] uppercase border-b border-[#172b3a]">
                  <tr>
                    <th className="py-3 px-3">Canal / Fuente</th>
                    <th className="py-3 px-3">Destino / URL</th>
                    <th className="py-3 px-3 text-center">Clics Hoy</th>
                    <th className="py-3 px-3 text-center">Clics Totales</th>
                    <th className="py-3 px-3 text-center">Ventas / Conversión</th>
                    <th className="py-3 px-3 text-center">Tasa Conversión</th>
                    <th className="py-3 px-3 text-right">Simulador de Tráfico</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#13222e]">
                  {clickChannels.map((chn) => (
                    <tr key={chn.id} className="hover:bg-[#101f2d] transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{chn.name}</div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Último clic: {chn.lastClickAt}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-400 text-[11px] truncate max-w-[200px]">
                        <a
                          href={chn.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#2ee59d] hover:underline"
                        >
                          {chn.url}
                        </a>
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold text-[#2ee59d] text-sm">
                        +{chn.todayClicks}
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold text-white">
                        {chn.totalClicks.toLocaleString('es-AR')}
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-cyan-300 font-semibold">
                        {chn.conversions} pedidos
                      </td>

                      <td className="py-3 px-3 text-center font-mono">
                        <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-[#2ee59d] border border-emerald-800/40 font-bold">
                          {chn.conversionRate}%
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => recordChannelClick(chn.id)}
                          className="px-2.5 py-1 rounded bg-[#0e2230] hover:bg-[#16364d] border border-[#1e4460] text-slate-200 hover:text-white text-xs font-semibold transition-all cursor-pointer active:scale-95 inline-flex items-center gap-1"
                        >
                          <Zap className="w-3 h-3 text-[#2ee59d]" />
                          <span>Simular Clic (+1)</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Generator of UTM Campaign Tracking Links for both stores */}
          <div className="bg-[#0d1822] border border-[#172b3a] rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Link className="w-4 h-4 text-[#2ee59d]" />
              <span>Generador de Enlaces de Campaña con Seguimiento (UTM)</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Crea enlaces personalizados para tus publicaciones de WhatsApp, Instagram o pauta publicitaria en cualquiera de tus dos tiendas e-commerce.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="text-slate-300 text-xs block mb-1">Tienda E-commerce Destino</label>
                <select
                  value={utmTargetStore}
                  onChange={(e) => setUtmTargetStore(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#081219] border border-[#182e3f] rounded-lg text-xs text-white focus:border-[#2ee59d] focus:outline-none font-semibold"
                >
                  <option value="bbimport">BB IMPORT (bbimport.onrender.com)</option>
                  <option value="lumbarfix">LUMBAR FIX® (lumbar-fix.vercel.app)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 text-xs block mb-1">Fuente / Medio</label>
                <select
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  className="w-full px-3 py-2 bg-[#081219] border border-[#182e3f] rounded-lg text-xs text-white focus:border-[#2ee59d] focus:outline-none"
                >
                  <option value="whatsapp">WhatsApp Mensaje Directo</option>
                  <option value="instagram_bio">Instagram Bio / Historias</option>
                  <option value="facebook_ads">Anuncios en Facebook</option>
                  <option value="google_ads">Google Búsqueda</option>
                  <option value="tiktok">TikTok Perfil</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 text-xs block mb-1">Nombre de Campaña / Promoción</label>
                <input
                  type="text"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  placeholder="ej: promo_alivio_lumbares"
                  className="w-full px-3 py-2 bg-[#081219] border border-[#182e3f] rounded-lg text-xs text-white focus:border-[#2ee59d] focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Resulting URL box */}
            <div className="bg-[#060e15] border border-[#162a39] rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-mono text-xs text-[#2ee59d] truncate">
                {generatedUtmUrl}
              </span>

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2ee59d] hover:bg-[#28d390] text-black text-xs font-bold transition-all cursor-pointer whitespace-nowrap self-end sm:self-auto"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 2: CRM DE CLIENTES */}
      {activeTab === 'crm' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Cartera de clientes, historial de consumo acumulado (LTV) y acciones directas de WhatsApp.
            </p>

            <button
              onClick={() => setIsNewClientOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2ee59d] hover:bg-[#28d390] text-black text-xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nuevo Cliente</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {clients.map((cli) => {
              const tierBadge =
                cli.tier === 'vip'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : cli.tier === 'frecuente'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-700/40 text-slate-300 border-slate-600/40';

              return (
                <div
                  key={cli.id}
                  className="bg-[#0d1822] border border-[#172b3a] hover:border-[#223e52] rounded-xl p-5 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">{cli.name}</h4>
                          <span
                            className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${tierBadge}`}
                          >
                            {cli.tier}
                          </span>
                        </div>
                        {cli.company && (
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-slate-500" />
                            <span>{cli.company}</span>
                          </p>
                        )}
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-sm font-bold text-[#2ee59d] block">
                          {businessConfig.currencySymbol}{cli.totalSpent.toLocaleString('es-AR')}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {cli.totalOrders} compras (LTV)
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-slate-400 my-3">
                      {cli.phone && (
                        <p className="flex items-center gap-1.5 font-mono text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{cli.phone}</span>
                        </p>
                      )}
                      {cli.email && (
                        <p className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>{cli.email}</span>
                        </p>
                      )}
                      {cli.notes && (
                        <p className="text-[11px] text-slate-500 italic mt-1 bg-[#09151e] p-2 rounded border border-[#142634]">
                          "{cli.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-[#142533] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 font-mono">
                      Última compra: {cli.lastPurchaseDate || 'Sin registro'}
                    </span>

                    {cli.phone && (
                      <a
                        href={`https://wa.me/${cli.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Hola ${cli.name}, te escribimos desde ${businessConfig.businessName}. ¡Tenemos nuevas ofertas en combos y productos para vos!`,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-semibold transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Escribir por WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-SECTION 3: TIENDAS E-COMMERCE (100% ONLINE) */}
      {activeTab === 'stores' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#2ee59d]" />
                <span>Gestión de Tiendas E-commerce (100% Digital)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Operaciones directas sin locales a la calle. Ambas tiendas centralizadas en este panel de control.
              </p>
            </div>

            <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-[#2ee59d]/10 text-[#2ee59d] border border-[#2ee59d]/30 font-bold self-start sm:self-auto">
              2 Tiendas Activas Online
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* STORE 1: BB IMPORT */}
            {(() => {
              const bbSales = sales.filter((s) => (s.businessId || 'bbimport') === 'bbimport');
              const bbRevenue = bbSales.reduce((acc, s) => acc + s.total, 0);
              const bbProfit = bbSales.reduce((acc, s) => acc + s.netProfit, 0);
              const bbMargin = bbRevenue > 0 ? ((bbProfit / bbRevenue) * 100).toFixed(1) : '0';

              return (
                <div className="bg-[#0b1622] border border-[#00c8ff]/30 hover:border-[#00c8ff]/60 rounded-xl p-5 flex flex-col justify-between transition-all shadow-lg">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#00c8ff] animate-pulse"></span>
                          <h4 className="text-base font-bold text-white font-display">BB IMPORT</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00c8ff]/20 text-[#00c8ff] border border-[#00c8ff]/30 font-bold">
                            E-COMMERCE WEB
                          </span>
                        </div>
                        <a
                          href="https://bbimport.onrender.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#00c8ff] hover:underline flex items-center gap-1 mt-1 font-mono"
                        >
                          <span>https://bbimport.onrender.com/</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <div className="p-2 rounded-lg bg-[#00c8ff]/10 border border-[#00c8ff]/30 text-[#00c8ff]">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="bg-[#070f17] p-3 rounded-lg border border-[#142637] space-y-1.5 text-xs text-slate-300 mb-4">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Nicho / Catálogo:</span>
                        <span className="text-white font-medium">Gadgets, Barbería & Gamer</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Plataforma Hosting:</span>
                        <span className="text-slate-200 font-mono">Render (Node / React)</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Conexión Webhook:</span>
                        <span className="text-[#2ee59d] font-mono font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2ee59d]"></span> En Línea (200 OK)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Metrics */}
                  <div>
                    <div className="pt-3 border-t border-[#13222f] grid grid-cols-3 gap-2 text-xs mb-4">
                      <div>
                        <span className="text-slate-500 text-[10px] block uppercase font-mono">Facturado</span>
                        <span className="font-mono font-bold text-white text-sm">
                          ${bbRevenue.toLocaleString('es-AR')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block uppercase font-mono">Ganancia</span>
                        <span className="font-mono font-bold text-[#2ee59d] text-sm">
                          +${bbProfit.toLocaleString('es-AR')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 text-[10px] block uppercase font-mono">Margen</span>
                        <span className="font-mono font-bold text-[#00c8ff] text-sm">
                          {bbMargin}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedBusiness('bbimport')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          selectedBusiness === 'bbimport'
                            ? 'bg-[#00c8ff] text-black shadow-md'
                            : 'bg-[#0e2130] hover:bg-[#15344d] border border-[#1b3e5a] text-[#00c8ff]'
                        }`}
                      >
                        {selectedBusiness === 'bbimport' ? '✓ Tienda Seleccionada' : 'Filtrar Todo por BB Import'}
                      </button>

                      <a
                        href="https://bbimport.onrender.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-lg bg-[#070f17] hover:bg-[#112333] border border-[#172d3f] text-slate-300 text-xs flex items-center gap-1"
                      >
                        <span>Abrir</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* STORE 2: LUMBAR FIX® */}
            {(() => {
              const lfSales = sales.filter((s) => s.businessId === 'lumbarfix');
              const lfRevenue = lfSales.reduce((acc, s) => acc + s.total, 0);
              const lfProfit = lfSales.reduce((acc, s) => acc + s.netProfit, 0);
              const lfMargin = lfRevenue > 0 ? ((lfProfit / lfRevenue) * 100).toFixed(1) : '0';

              return (
                <div className="bg-[#0b1622] border border-[#3b82f6]/30 hover:border-[#3b82f6]/60 rounded-xl p-5 flex flex-col justify-between transition-all shadow-lg">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] animate-pulse"></span>
                          <h4 className="text-base font-bold text-white font-display">LUMBAR FIX®</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3b82f6]/20 text-[#60a5fa] border border-[#3b82f6]/30 font-bold">
                            E-COMMERCE WEB
                          </span>
                        </div>
                        <a
                          href="https://lumbar-fix.vercel.app/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#60a5fa] hover:underline flex items-center gap-1 mt-1 font-mono"
                        >
                          <span>https://lumbar-fix.vercel.app/</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <div className="p-2 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/30 text-[#60a5fa]">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="bg-[#070f17] p-3 rounded-lg border border-[#142637] space-y-1.5 text-xs text-slate-300 mb-4">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Nicho / Catálogo:</span>
                        <span className="text-white font-medium">Alivio Lumbar & Salud Ergonómica</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Plataforma Hosting:</span>
                        <span className="text-slate-200 font-mono">Vercel (Next.js / React)</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Conexión Webhook:</span>
                        <span className="text-[#2ee59d] font-mono font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2ee59d]"></span> En Línea (200 OK)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Metrics */}
                  <div>
                    <div className="pt-3 border-t border-[#13222f] grid grid-cols-3 gap-2 text-xs mb-4">
                      <div>
                        <span className="text-slate-500 text-[10px] block uppercase font-mono">Facturado</span>
                        <span className="font-mono font-bold text-white text-sm">
                          ${lfRevenue.toLocaleString('es-AR')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block uppercase font-mono">Ganancia</span>
                        <span className="font-mono font-bold text-[#2ee59d] text-sm">
                          +${lfProfit.toLocaleString('es-AR')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 text-[10px] block uppercase font-mono">Margen</span>
                        <span className="font-mono font-bold text-[#60a5fa] text-sm">
                          {lfMargin}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedBusiness('lumbarfix')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          selectedBusiness === 'lumbarfix'
                            ? 'bg-[#3b82f6] text-white shadow-md'
                            : 'bg-[#0e2130] hover:bg-[#15344d] border border-[#1b3e5a] text-[#60a5fa]'
                        }`}
                      >
                        {selectedBusiness === 'lumbarfix' ? '✓ Tienda Seleccionada' : 'Filtrar Todo por Lumbar Fix'}
                      </button>

                      <a
                        href="https://lumbar-fix.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-lg bg-[#070f17] hover:bg-[#112333] border border-[#172d3f] text-slate-300 text-xs flex items-center gap-1"
                      >
                        <span>Abrir</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL: NUEVO CLIENTE */}
      {isNewClientOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b1722] border border-[#1d384c] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1 font-display">Registrar Nuevo Cliente</h3>
            <p className="text-xs text-slate-400 mb-4">
              Agrega a un cliente individual o corporativo a tu CRM comercial.
            </p>

            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Nombre y Apellido *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ej: Marcelo Morales"
                  className="w-full px-3 py-2 bg-[#060f16] border border-[#193245] rounded-lg text-white focus:border-[#2ee59d] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-300 block mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="1144556677"
                    className="w-full px-3 py-2 bg-[#060f16] border border-[#193245] rounded-lg text-white font-mono focus:border-[#2ee59d] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Empresa</label>
                  <input
                    type="text"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    placeholder="Ej: Importadora Sol"
                    className="w-full px-3 py-2 bg-[#060f16] border border-[#193245] rounded-lg text-white focus:border-[#2ee59d] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full px-3 py-2 bg-[#060f16] border border-[#193245] rounded-lg text-white focus:border-[#2ee59d] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Notas / Preferencias</label>
                <textarea
                  rows={2}
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  placeholder="Interesado en compras mayoristas..."
                  className="w-full px-3 py-2 bg-[#060f16] border border-[#193245] rounded-lg text-white focus:border-[#2ee59d] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#162b3b]">
                <button
                  type="button"
                  onClick={() => setIsNewClientOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#09151e] text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#2ee59d] hover:bg-[#28d390] text-black font-bold"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
