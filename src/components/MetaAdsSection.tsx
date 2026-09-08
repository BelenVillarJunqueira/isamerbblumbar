import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
    trackMetaEvent,
    metaPixelTracker,
    getStoredMetaEvents,
    clearStoredMetaEvents,
    getMetaPixelConfig,
    saveMetaPixelConfig,
    MetaEventRecord,
    MetaPixelConfig,
} from '../lib/metaPixel';
import {
    Radio,
    Target,
    Sparkles,
    Copy,
    Check,
    ExternalLink,
    ShieldCheck,
    Eye,
    ShoppingCart,
    CreditCard,
    ShoppingBag,
    UserCheck,
    Activity,
    Trash2,
    Code,
    Layers,
    ArrowRight,
    TrendingUp,
    DollarSign,
    Send,
    Zap,
    CheckCircle2,
    Info,
    Flame,
    Globe,
    RefreshCw,
} from 'lucide-react';

export const MetaAdsSection: React.FC = () => {
    const { businessConfig, selectedBusiness, setSelectedBusiness, products, combos, sales } = useApp();

    // Pixel Config state
    const [pixelConfig, setPixelConfig] = useState<MetaPixelConfig>(getMetaPixelConfig());
    const [configSaved, setConfigSaved] = useState(false);

    // Events Stream state
    const [events, setEvents] = useState<MetaEventRecord[]>([]);
    const [selectedEventForModal, setSelectedEventForModal] = useState<MetaEventRecord | null>(null);
    const [eventFilter, setEventFilter] = useState<string>('all');
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedCodeSnippet, setCopiedCodeSnippet] = useState<string | null>(null);

    // UTM Generator State for Meta Ads
    const [utmStore, setUtmStore] = useState<'bbimport' | 'lumbarfix'>(
        selectedBusiness === 'lumbarfix' ? 'lumbarfix' : 'bbimport'
    );
    const [utmObjective, setUtmObjective] = useState<'conversions' | 'traffic' | 'whatsapp'>('conversions');
    const [utmPlacement, setUtmPlacement] = useState<'ig_reels' | 'ig_stories' | 'fb_feed' | 'advantage_plus'>('ig_reels');
    const [utmCampaignName, setUtmCampaignName] = useState<string>('promo_hot_sale');
    const [utmAdsetName, setUtmAdsetName] = useState<string>('publico_hombres_20_45');
    const [utmAdName, setUtmAdName] = useState<string>('video_reels_unboxing_01');

    // Sub-tabs in Meta section
    const [activeMetaTab, setActiveMetaTab] = useState<'stream' | 'campaign_builder' | 'code_setup' | 'config'>('stream');

    // Load and listen to live Meta events
    useEffect(() => {
        setEvents(getStoredMetaEvents());

        const handleNewEvent = (e: any) => {
            if (e.detail) {
                setEvents((prev) => [e.detail, ...prev.filter((item) => item.id !== e.detail.id)].slice(0, 60));
            }
        };

        const handleClearedEvents = () => {
            setEvents([]);
        };

        window.addEventListener('isamer-meta-event', handleNewEvent);
        window.addEventListener('isamer-meta-event-cleared', handleClearedEvents);

        return () => {
            window.removeEventListener('isamer-meta-event', handleNewEvent);
            window.removeEventListener('isamer-meta-event-cleared', handleClearedEvents);
        };
    }, []);

    const handleSaveConfig = (e: React.FormEvent) => {
        e.preventDefault();
        saveMetaPixelConfig(pixelConfig);
        setConfigSaved(true);
        setTimeout(() => setConfigSaved(false), 2500);
    };

    const handleClearEvents = () => {
        clearStoredMetaEvents();
    };

    // Test Events Dispatchers
    const triggerTestEvent = (type: 'PageView' | 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase' | 'Lead') => {
        const targetBiz = selectedBusiness === 'lumbarfix' ? 'lumbarfix' : 'bbimport';

        if (type === 'PageView') {
            metaPixelTracker.pageView('Dashboard Principal ISAMER OS', targetBiz);
        } else if (type === 'ViewContent') {
            const sampleItem = targetBiz === 'lumbarfix'
                ? { id: 'prod-lf-belt', name: 'Faja Lumbar Fix® Descompresora', price: 20000, category: 'Ortopedia', businessId: 'lumbarfix' as const }
                : { id: 'prod-ex5-blk', name: 'Máquina Cortadora EXXTRA TECH™ EX5', price: 34999, category: 'Barbería', businessId: 'bbimport' as const };
            metaPixelTracker.viewContent(sampleItem);
        } else if (type === 'AddToCart') {
            const sampleItem = targetBiz === 'lumbarfix'
                ? { id: 'prod-lf-belt', name: 'Faja Lumbar Fix® Descompresora', price: 20000, quantity: 1, businessId: 'lumbarfix' as const }
                : { id: 'combo-pro-lotion', name: 'Combo EX5 + Loción Aftershave', price: 41999, quantity: 1, businessId: 'bbimport' as const };
            metaPixelTracker.addToCart(sampleItem);
        } else if (type === 'InitiateCheckout') {
            metaPixelTracker.initiateCheckout({
                total: targetBiz === 'lumbarfix' ? 36000 : 41999,
                numItems: 1,
                businessId: targetBiz,
            });
        } else if (type === 'Purchase') {
            const randomId = `#META-${Math.floor(1000 + Math.random() * 9000)}`;
            metaPixelTracker.purchase({
                orderId: randomId,
                total: targetBiz === 'lumbarfix' ? 36000 : 54999,
                contentIds: targetBiz === 'lumbarfix' ? ['prod-lf-belt', 'prod-lf-knee'] : ['combo-duo-ex5'],
                numItems: 2,
                businessId: targetBiz,
                customerName: 'Cliente Meta Ads (Test)',
                paymentMethod: 'mercadopago_qr',
            });
        } else if (type === 'Lead') {
            metaPixelTracker.lead({
                clientName: 'Contacto Instagram Ad',
                clientPhone: '+54 9 11 4455-8899',
                source: 'instagram_reels_direct',
                businessId: targetBiz,
            });
        }
    };

    // Build Generated Meta Ads URL
    const baseUrl = utmStore === 'bbimport' ? 'https://bbimport.onrender.com/' : 'https://lumbar-fix.vercel.app/';
    const mediumMap = {
        ig_reels: 'reels',
        ig_stories: 'stories',
        fb_feed: 'feed',
        advantage_plus: 'cpc',
    };
    const sourceMap = {
        ig_reels: 'instagram',
        ig_stories: 'instagram',
        fb_feed: 'facebook',
        advantage_plus: 'facebook',
    };
    const generatedMetaUrl = `${baseUrl}?utm_source=${sourceMap[utmPlacement]}&utm_medium=${mediumMap[utmPlacement]}&utm_campaign=${encodeURIComponent(
        utmCampaignName
    )}&utm_content=${encodeURIComponent(utmAdName)}&utm_term=${encodeURIComponent(utmAdsetName)}&fbclid={{fbclid}}`;

    // Filtered events
    const filteredEvents = events.filter((ev) => {
        if (eventFilter !== 'all' && ev.eventName !== eventFilter) return false;
        if (selectedBusiness !== 'all' && ev.businessId !== selectedBusiness && ev.businessId !== 'all') return false;
        return true;
    });

    // Funnel calculations
    const countPageView = events.filter((e) => e.eventName === 'PageView').length;
    const countViewContent = events.filter((e) => e.eventName === 'ViewContent').length;
    const countAddToCart = events.filter((e) => e.eventName === 'AddToCart').length;
    const countInitiateCheckout = events.filter((e) => e.eventName === 'InitiateCheckout').length;
    const countPurchase = events.filter((e) => e.eventName === 'Purchase').length;

    const totalEventCount = events.length;

    return (
        <div className="space-y-6">
            {/* Top Banner: Status & Overview */}
            <div className="p-6 rounded-2xl bg-[#091520] border border-[#1b3a52] relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#00c8ff]/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#2ee59d] animate-ping"></span>
                            <span className="text-[11px] font-mono uppercase tracking-wider font-extrabold text-[#2ee59d] bg-[#2ee59d]/10 px-2.5 py-0.5 rounded-full border border-[#2ee59d]/30">
                                META ADS & PIXEL EN VIVO (ACTIVO)
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                                Conectado con fbq() Standard & CAPI
                            </span>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-black text-white font-display flex items-center gap-2">
                            <Radio className="w-6 h-6 text-[#00c8ff]" />
                            <span>Centro de Control Meta Ads & Pautas Publicitarias</span>
                        </h2>

                        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                            Monitorea lo que hace la gente en tiempo real, rastrea compras atribuidas, genera enlaces UTM para tus anuncios de Instagram/Facebook y sincroniza tus catálogos de <strong>BB IMPORT</strong> y <strong>LUMBAR FIX®</strong>.
                        </p>
                    </div>

                    {/* Quick Active Pixel IDs Badges */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                        <div className="p-2.5 rounded-xl bg-[#060f16] border border-[#183144] flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#00c8ff]"></span>
                                <span className="font-bold text-white">Pixel BB IMPORT:</span>
                            </div>
                            <span className="font-mono text-[#00c8ff] font-bold text-[11px]">
                                {pixelConfig.bbImportPixelId || 'No configurado'}
                            </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#060f16] border border-[#183144] flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>
                                <span className="font-bold text-white">Pixel LUMBAR FIX:</span>
                            </div>
                            <span className="font-mono text-[#60a5fa] font-bold text-[11px]">
                                {pixelConfig.lumbarFixPixelId || 'No configurado'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick Test Event Trigger Bar */}
                <div className="mt-5 pt-4 border-t border-[#132839] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-semibold text-slate-300">Disparar Eventos de Prueba:</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                            onClick={() => triggerTestEvent('PageView')}
                            className="px-2.5 py-1 rounded-lg bg-[#0e2130] hover:bg-[#16354d] border border-[#1d4260] text-slate-200 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        >
                            <Eye className="w-3 h-3 text-slate-400" />
                            <span>PageView</span>
                        </button>

                        <button
                            onClick={() => triggerTestEvent('ViewContent')}
                            className="px-2.5 py-1 rounded-lg bg-[#0e2130] hover:bg-[#16354d] border border-[#1d4260] text-[#00c8ff] text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        >
                            <Eye className="w-3 h-3 text-[#00c8ff]" />
                            <span>ViewContent</span>
                        </button>

                        <button
                            onClick={() => triggerTestEvent('AddToCart')}
                            className="px-2.5 py-1 rounded-lg bg-[#0e2130] hover:bg-[#16354d] border border-[#1d4260] text-amber-300 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        >
                            <ShoppingCart className="w-3 h-3 text-amber-400" />
                            <span>AddToCart</span>
                        </button>

                        <button
                            onClick={() => triggerTestEvent('Purchase')}
                            className="px-2.5 py-1 rounded-lg bg-[#2ee59d]/15 hover:bg-[#2ee59d]/25 border border-[#2ee59d]/40 text-[#2ee59d] text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                        >
                            <ShoppingBag className="w-3 h-3 text-[#2ee59d]" />
                            <span>Purchase ($)</span>
                        </button>

                        <button
                            onClick={() => triggerTestEvent('Lead')}
                            className="px-2.5 py-1 rounded-lg bg-[#0e2130] hover:bg-[#16354d] border border-[#1d4260] text-purple-300 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        >
                            <UserCheck className="w-3 h-3 text-purple-400" />
                            <span>Lead (WhatsApp)</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-[#142636] pb-2 flex-wrap gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                    <button
                        onClick={() => setActiveMetaTab('stream')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${activeMetaTab === 'stream'
                                ? 'bg-[#00c8ff] text-black shadow-md'
                                : 'text-slate-400 hover:text-white bg-[#0a151f] border border-[#172e42]'
                            }`}
                    >
                        <Activity className="w-3.5 h-3.5" />
                        <span>1. Monitor en Vivo (Test Events)</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
                            {filteredEvents.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveMetaTab('campaign_builder')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${activeMetaTab === 'campaign_builder'
                                ? 'bg-[#00c8ff] text-black shadow-md'
                                : 'text-slate-400 hover:text-white bg-[#0a151f] border border-[#172e42]'
                            }`}
                    >
                        <Target className="w-3.5 h-3.5" />
                        <span>2. Creador de Enlaces para Anuncios (UTM)</span>
                    </button>

                    <button
                        onClick={() => setActiveMetaTab('code_setup')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${activeMetaTab === 'code_setup'
                                ? 'bg-[#00c8ff] text-black shadow-md'
                                : 'text-slate-400 hover:text-white bg-[#0a151f] border border-[#172e42]'
                            }`}
                    >
                        <Code className="w-3.5 h-3.5" />
                        <span>3. Código para tus Páginas Web</span>
                    </button>

                    <button
                        onClick={() => setActiveMetaTab('config')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${activeMetaTab === 'config'
                                ? 'bg-[#00c8ff] text-black shadow-md'
                                : 'text-slate-400 hover:text-white bg-[#0a151f] border border-[#172e42]'
                            }`}
                    >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>4. Configuración de Pixel IDs & Token</span>
                    </button>
                </div>

                {/* Global Business selector indicator */}
                <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-500">Filtrando por:</span>
                    <span className="font-bold text-slate-200 font-mono">
                        {selectedBusiness === 'all'
                            ? 'Consolidado (Ambas)'
                            : selectedBusiness === 'bbimport'
                                ? 'BB IMPORT'
                                : 'LUMBAR FIX®'}
                    </span>
                </div>
            </div>

            {/* TAB 1: LIVE EVENT STREAM (META EVENTS MANAGER MONITOR) */}
            {activeMetaTab === 'stream' && (
                <div className="space-y-6">
                    {/* Conversion Funnel Overview Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div className="p-3.5 rounded-xl bg-[#091520] border border-[#162b3d] text-center space-y-1">
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono block">1. PageView</span>
                            <span className="text-lg font-black text-white font-mono">{countPageView}</span>
                            <span className="text-[10px] text-slate-500 block">Visitas generales</span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#091520] border border-[#162b3d] text-center space-y-1">
                            <span className="text-[10px] uppercase tracking-wider text-[#00c8ff] font-mono block">2. ViewContent</span>
                            <span className="text-lg font-black text-[#00c8ff] font-mono">{countViewContent}</span>
                            <span className="text-[10px] text-slate-500 block">
                                {countPageView > 0 ? `${((countViewContent / countPageView) * 100).toFixed(0)}% del tráfico` : '0%'}
                            </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#091520] border border-[#162b3d] text-center space-y-1">
                            <span className="text-[10px] uppercase tracking-wider text-amber-400 font-mono block">3. AddToCart</span>
                            <span className="text-lg font-black text-amber-300 font-mono">{countAddToCart}</span>
                            <span className="text-[10px] text-slate-500 block">
                                {countViewContent > 0 ? `${((countAddToCart / countViewContent) * 100).toFixed(0)}% de interés` : '0%'}
                            </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#091520] border border-[#162b3d] text-center space-y-1">
                            <span className="text-[10px] uppercase tracking-wider text-purple-400 font-mono block">4. Checkout</span>
                            <span className="text-lg font-black text-purple-300 font-mono">{countInitiateCheckout}</span>
                            <span className="text-[10px] text-slate-500 block">
                                {countAddToCart > 0 ? `${((countInitiateCheckout / countAddToCart) * 100).toFixed(0)}% intención` : '0%'}
                            </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#091520] border border-[#2ee59d]/40 text-center space-y-1 bg-linear-to-b from-[#091e1d] to-[#08151b] col-span-2 sm:col-span-1">
                            <span className="text-[10px] uppercase tracking-wider text-[#2ee59d] font-mono block font-bold">5. Purchase</span>
                            <span className="text-lg font-black text-[#2ee59d] font-mono">{countPurchase}</span>
                            <span className="text-[10px] text-emerald-400 font-bold block">
                                {countPageView > 0 ? `${((countPurchase / countPageView) * 100).toFixed(1)}% conversión` : 'Ventas web'}
                            </span>
                        </div>
                    </div>

                    {/* Events Table / Stream */}
                    <div className="bg-[#0b1622] border border-[#172d3f] rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-[#142636] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#08121a]">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-white font-display">Eventos Emitidos en Tiempo Real</span>
                                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#00c8ff]/15 text-[#00c8ff] border border-[#00c8ff]/30">
                                    {filteredEvents.length} eventos capturados
                                </span>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                {/* Event Type Filter */}
                                <select
                                    value={eventFilter}
                                    onChange={(e) => setEventFilter(e.target.value)}
                                    className="px-2.5 py-1.5 bg-[#050c12] border border-[#162d3e] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-[#00c8ff]"
                                >
                                    <option value="all">Todos los Eventos</option>
                                    <option value="Purchase">Purchase (Compras)</option>
                                    <option value="AddToCart">AddToCart (Carrito)</option>
                                    <option value="ViewContent">ViewContent (Productos)</option>
                                    <option value="PageView">PageView (Visitas)</option>
                                    <option value="Lead">Lead (WhatsApp/Contactos)</option>
                                </select>

                                <button
                                    onClick={handleClearEvents}
                                    className="px-2.5 py-1.5 rounded-lg bg-[#0f1d28] hover:bg-[#182d3d] border border-[#193245] text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Limpiar</span>
                                </button>
                            </div>
                        </div>

                        {filteredEvents.length === 0 ? (
                            <div className="p-12 text-center space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-[#091724] border border-[#183146] text-slate-400 flex items-center justify-center mx-auto">
                                    <Activity className="w-6 h-6 text-[#00c8ff]" />
                                </div>
                                <h4 className="text-sm font-bold text-white">No hay eventos recientes con este filtro</h4>
                                <p className="text-xs text-slate-400 max-w-md mx-auto">
                                    Usa los botones superiores de prueba o simula una venta web para ver el evento reflejado al instante en la consola de Meta.
                                </p>
                                <button
                                    onClick={() => triggerTestEvent('Purchase')}
                                    className="px-3.5 py-2 rounded-xl bg-[#2ee59d] hover:bg-[#28d390] text-black text-xs font-bold transition-all shadow-md cursor-pointer"
                                >
                                    Simular Evento de Compra Ahora
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs text-slate-300">
                                    <thead className="bg-[#070e14] text-[11px] uppercase tracking-wider text-slate-400 font-mono border-b border-[#122433]">
                                        <tr>
                                            <th className="py-3 px-4">Hora</th>
                                            <th className="py-3 px-4">Evento Meta</th>
                                            <th className="py-3 px-4">Tienda / Negocio</th>
                                            <th className="py-3 px-4">Valor / Moneda</th>
                                            <th className="py-3 px-4">Detalles del Payload</th>
                                            <th className="py-3 px-4 text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#10202e]">
                                        {filteredEvents.map((evt) => {
                                            const isPurchase = evt.eventName === 'Purchase';
                                            const isAddToCart = evt.eventName === 'AddToCart';
                                            const isViewContent = evt.eventName === 'ViewContent';
                                            const isLead = evt.eventName === 'Lead';

                                            return (
                                                <tr key={evt.id} className="hover:bg-[#0e1d29] transition-colors">
                                                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                                                        {evt.timestamp}
                                                    </td>
                                                    <td className="py-3 px-4 whitespace-nowrap">
                                                        <span
                                                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold font-mono inline-flex items-center gap-1.5 ${isPurchase
                                                                    ? 'bg-[#2ee59d]/15 text-[#2ee59d] border border-[#2ee59d]/30'
                                                                    : isAddToCart
                                                                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                                                        : isViewContent
                                                                            ? 'bg-[#00c8ff]/15 text-[#00c8ff] border border-[#00c8ff]/30'
                                                                            : isLead
                                                                                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                                                                                : 'bg-slate-700/30 text-slate-300 border border-slate-600/40'
                                                                }`}
                                                        >
                                                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                            {evt.eventName}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 whitespace-nowrap">
                                                        {evt.businessId === 'lumbarfix' ? (
                                                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#3b82f6]/15 text-[#60a5fa] border border-[#3b82f6]/30 font-bold">
                                                                LUMBAR FIX®
                                                            </span>
                                                        ) : evt.businessId === 'bbimport' ? (
                                                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#00c8ff]/15 text-[#00c8ff] border border-[#00c8ff]/30 font-bold">
                                                                BB IMPORT
                                                            </span>
                                                        ) : (
                                                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                                                AMBAS TIENDAS
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 whitespace-nowrap font-mono font-bold">
                                                        {evt.parameters?.value !== undefined ? (
                                                            <span className="text-[#2ee59d]">
                                                                ${Number(evt.parameters.value).toLocaleString('es-AR')} {evt.parameters.currency || 'ARS'}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-500">-</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-xs font-mono text-slate-400 max-w-xs truncate">
                                                        {evt.parameters?.content_name ||
                                                            evt.parameters?.order_id ||
                                                            evt.parameters?.page_title ||
                                                            JSON.stringify(evt.parameters).substring(0, 50)}
                                                    </td>
                                                    <td className="py-3 px-4 text-right whitespace-nowrap">
                                                        <button
                                                            onClick={() => setSelectedEventForModal(evt)}
                                                            className="px-2.5 py-1 rounded bg-[#091520] hover:bg-[#132c40] border border-[#1b3d57] text-[#00c8ff] text-[11px] font-semibold cursor-pointer"
                                                        >
                                                            Ver JSON
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: META ADS CAMPAIGN & UTM URL BUILDER */}
            {activeMetaTab === 'campaign_builder' && (
                <div className="space-y-6">
                    <div className="bg-[#0b1622] border border-[#183146] rounded-2xl p-6 shadow-xl space-y-5">
                        <div>
                            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                                <Target className="w-5 h-5 text-[#00c8ff]" />
                                <span>Generador de Enlaces para Anuncios de Meta (Facebook & Instagram Ads)</span>
                            </h3>
                            <p className="text-xs text-slate-300 mt-1">
                                Genera URLs con los parámetros dinámicos oficiales de Meta. Al colocar este enlace en el campo <strong>"URL del sitio web"</strong> dentro del Administrador de Anuncios (Ads Manager), sabrás exactamente qué anuncio, qué video y qué historia generó cada venta.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                            <div>
                                <label className="text-slate-300 font-semibold block mb-1">1. Tienda de Destino</label>
                                <select
                                    value={utmStore}
                                    onChange={(e) => setUtmStore(e.target.value as any)}
                                    className="w-full px-3 py-2.5 bg-[#060e15] border border-[#172d3f] rounded-xl text-white font-bold focus:border-[#00c8ff] focus:outline-none"
                                >
                                    <option value="bbimport">BB IMPORT (https://bbimport.onrender.com/)</option>
                                    <option value="lumbarfix">LUMBAR FIX® (https://lumbar-fix.vercel.app/)</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-slate-300 font-semibold block mb-1">2. Ubicación del Anuncio (Placement)</label>
                                <select
                                    value={utmPlacement}
                                    onChange={(e) => setUtmPlacement(e.target.value as any)}
                                    className="w-full px-3 py-2.5 bg-[#060e15] border border-[#172d3f] rounded-xl text-white focus:border-[#00c8ff] focus:outline-none"
                                >
                                    <option value="ig_reels">Instagram Reels (Formato Vertical 9:16)</option>
                                    <option value="ig_stories">Instagram Stories (Historias con Link)</option>
                                    <option value="fb_feed">Facebook Feed / Muro de Noticias</option>
                                    <option value="advantage_plus">Campaña Advantage+ (Automática)</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-slate-300 font-semibold block mb-1">3. Nombre de la Campaña (utm_campaign)</label>
                                <input
                                    type="text"
                                    value={utmCampaignName}
                                    onChange={(e) => setUtmCampaignName(e.target.value)}
                                    placeholder="ej: promo_hot_sale_barberia"
                                    className="w-full px-3 py-2.5 bg-[#060e15] border border-[#172d3f] rounded-xl text-white font-mono focus:border-[#00c8ff] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-slate-300 font-semibold block mb-1">4. Conjunto de Anuncios / Público (utm_term)</label>
                                <input
                                    type="text"
                                    value={utmAdsetName}
                                    onChange={(e) => setUtmAdsetName(e.target.value)}
                                    placeholder="ej: hombres_25_45_barba"
                                    className="w-full px-3 py-2.5 bg-[#060e15] border border-[#172d3f] rounded-xl text-white font-mono focus:border-[#00c8ff] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-slate-300 font-semibold block mb-1">5. Nombre del Creativo / Anuncio (utm_content)</label>
                                <input
                                    type="text"
                                    value={utmAdName}
                                    onChange={(e) => setUtmAdName(e.target.value)}
                                    placeholder="ej: video_reels_demostracion_01"
                                    className="w-full px-3 py-2.5 bg-[#060e15] border border-[#172d3f] rounded-xl text-white font-mono focus:border-[#00c8ff] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-slate-300 font-semibold block mb-1">Parámetros Dinámicos Meta</label>
                                <div className="p-2.5 rounded-xl bg-[#060d13] border border-[#132331] text-[11px] text-slate-400">
                                    Incluye automáticamente <span className="text-[#2ee59d] font-mono font-bold">fbclid</span> para atribución y retargeting 100% exacto.
                                </div>
                            </div>
                        </div>

                        {/* Generated URL Box */}
                        <div className="p-4 rounded-xl bg-[#050b11] border border-[#1a384f] space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-200">URL Lista para Pegar en Meta Ads Manager:</span>
                                <span className="text-[#00c8ff] font-mono text-[11px]">Rastreo Oficial</span>
                            </div>

                            <div className="p-3 rounded-lg bg-[#020508] border border-[#122533] text-xs font-mono text-[#00c8ff] break-all select-all">
                                {generatedMetaUrl}
                            </div>

                            <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
                                <p className="text-[11px] text-slate-400">
                                    Copia este enlace y pégalo en la sección <strong>"Destino" $\rightarrow$ "URL del sitio web"</strong> al crear tu anuncio en Facebook o Instagram.
                                </p>

                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(generatedMetaUrl);
                                        setCopiedLink(true);
                                        setTimeout(() => setCopiedLink(false), 2000);
                                    }}
                                    className="px-4 py-2 rounded-xl bg-[#2ee59d] hover:bg-[#28d390] text-black text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-md"
                                >
                                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar URL para Anuncio'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: CODE SETUP FOR WEBSITES (RENDER & VERCEL) */}
            {activeMetaTab === 'code_setup' && (
                <div className="space-y-6">
                    <div className="bg-[#0b1622] border border-[#183146] rounded-2xl p-6 shadow-xl space-y-6">
                        <div>
                            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                                <Code className="w-5 h-5 text-[#00c8ff]" />
                                <span>Cómo Integrar el Pixel en tus Sitios Web (bbimport.onrender.com y lumbar-fix.vercel.app)</span>
                            </h3>
                            <p className="text-xs text-slate-300 mt-1">
                                Copia y pega estos fragmentos exactos en el código de tus páginas. De esta manera, cada vez que una persona visite tus productos o compre en tus tiendas, los eventos llegarán directamente a tu Administrador de Meta Ads.
                            </p>
                        </div>

                        {/* Snippet 1: Base Pixel in <head> */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-[#00c8ff]/20 text-[#00c8ff] flex items-center justify-center text-[11px] font-mono">
                                        1
                                    </span>
                                    <span>Código Base del Pixel (Pegar en el &lt;head&gt; de tus páginas)</span>
                                </h4>

                                <button
                                    onClick={() => {
                                        const code = `<!-- Meta Pixel Code -->\n<script>\n!function(f,b,e,v,n,t,s)\n{if(f.fbq)return;n=f.fbq=function(){n.callMethod?\nn.callMethod.apply(n,arguments):n.queue.push(arguments)};\nif(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';\nn.queue=[];t=b.createElement(e);t.async=!0;\nt.src=v;s=b.getElementsByTagName(e)[0];\ns.parentNode.insertBefore(t,s)}(window, document,'script',\n'https://connect.facebook.net/en_US/fbevents.js');\nfbq('init', '${pixelConfig.bbImportPixelId}'); // ID de BB Import\nfbq('init', '${pixelConfig.lumbarFixPixelId}'); // ID de Lumbar Fix\nfbq('track', 'PageView');\n</script>\n<noscript><img height="1" width="1" style="display:none"\nsrc="https://www.facebook.com/tr?id=${pixelConfig.bbImportPixelId}&ev=PageView&noscript=1"\n/></noscript>`;
                                        navigator.clipboard.writeText(code);
                                        setCopiedCodeSnippet('head');
                                        setTimeout(() => setCopiedCodeSnippet(null), 2000);
                                    }}
                                    className="px-3 py-1 rounded-lg bg-[#0e2130] hover:bg-[#17344c] border border-[#1b3d59] text-xs text-[#00c8ff] font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                    {copiedCodeSnippet === 'head' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{copiedCodeSnippet === 'head' ? '¡Copiado!' : 'Copiar Código'}</span>
                                </button>
                            </div>

                            <pre className="p-4 rounded-xl bg-[#050b11] border border-[#132839] text-xs text-slate-300 font-mono overflow-x-auto">
                                {`<!-- Meta Pixel Code Base -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');

fbq('init', '${pixelConfig.bbImportPixelId}'); // Pixel ID BB Import
fbq('init', '${pixelConfig.lumbarFixPixelId}'); // Pixel ID Lumbar Fix
fbq('track', 'PageView');
</script>`}
                            </pre>
                        </div>

                        {/* Snippet 2: ViewContent and AddToCart */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-[#00c8ff]/20 text-[#00c8ff] flex items-center justify-center text-[11px] font-mono">
                                            2
                                        </span>
                                        <span>Al Ver un Producto (ViewContent)</span>
                                    </h4>

                                    <button
                                        onClick={() => {
                                            const code = `// Ejecutar al abrir la ficha del producto:\nfbq('track', 'ViewContent', {\n  content_name: product.name,\n  content_ids: [product.id],\n  content_type: 'product',\n  value: product.price,\n  currency: 'ARS'\n});`;
                                            navigator.clipboard.writeText(code);
                                            setCopiedCodeSnippet('viewcontent');
                                            setTimeout(() => setCopiedCodeSnippet(null), 2000);
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-[#0e2130] text-xs text-[#00c8ff] font-semibold flex items-center gap-1 cursor-pointer"
                                    >
                                        {copiedCodeSnippet === 'viewcontent' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiedCodeSnippet === 'viewcontent' ? '¡Copiado!' : 'Copiar'}</span>
                                    </button>
                                </div>

                                <pre className="p-3.5 rounded-xl bg-[#050b11] border border-[#132839] text-[11px] text-slate-300 font-mono overflow-x-auto">
                                    {`fbq('track', 'ViewContent', {
  content_name: 'Máquina EX5 Barbería',
  content_ids: ['prod-ex5-blk'],
  content_type: 'product',
  value: 34999,
  currency: 'ARS'
});`}
                                </pre>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-[#2ee59d]/20 text-[#2ee59d] flex items-center justify-center text-[11px] font-mono">
                                            3
                                        </span>
                                        <span>Al Confirmar Pago (Purchase)</span>
                                    </h4>

                                    <button
                                        onClick={() => {
                                            const code = `// Ejecutar en la página de éxito / 'gracias por tu compra':\nfbq('track', 'Purchase', {\n  value: orderTotal,\n  currency: 'ARS',\n  content_ids: itemIds,\n  num_items: totalItems,\n  order_id: orderCode\n});`;
                                            navigator.clipboard.writeText(code);
                                            setCopiedCodeSnippet('purchase');
                                            setTimeout(() => setCopiedCodeSnippet(null), 2000);
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-[#0e2130] text-xs text-[#2ee59d] font-semibold flex items-center gap-1 cursor-pointer"
                                    >
                                        {copiedCodeSnippet === 'purchase' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiedCodeSnippet === 'purchase' ? '¡Copiado!' : 'Copiar'}</span>
                                    </button>
                                </div>

                                <pre className="p-3.5 rounded-xl bg-[#050b11] border border-[#132839] text-[11px] text-slate-300 font-mono overflow-x-auto">
                                    {`fbq('track', 'Purchase', {
  value: 36000,
  currency: 'ARS',
  content_ids: ['prod-lf-belt'],
  num_items: 1,
  order_id: '#ORD-8921'
});`}
                                </pre>
                            </div>
                        </div>

                        {/* Meta Pixel Helper Chrome Extension Notice */}
                        <div className="p-4 rounded-xl bg-[#081520] border border-[#173347] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-[#2ee59d]" />
                                    <h4 className="text-xs font-bold text-white">¿Cómo verificar que el Pixel funciona al 100%?</h4>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    Instala la extensión gratuita oficial <strong>"Meta Pixel Helper"</strong> en Google Chrome. Al entrar a <strong>bbimport.onrender.com</strong> o <strong>lumbar-fix.vercel.app</strong>, el icono se encenderá en verde mostrando los eventos capturados en vivo.
                                </p>
                            </div>

                            <a
                                href="https://chromewebstore.google.com/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3.5 py-2 rounded-xl bg-[#0e2333] hover:bg-[#16364f] border border-[#1d4666] text-xs text-[#00c8ff] font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap self-start sm:self-auto"
                            >
                                <span>Descargar Extensión</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: PIXEL IDS & CONVERSIONS API TOKEN CONFIG */}
            {activeMetaTab === 'config' && (
                <div className="bg-[#0b1622] border border-[#183146] rounded-2xl p-6 shadow-xl space-y-5 max-w-3xl">
                    <div>
                        <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-[#2ee59d]" />
                            <span>Configuración de Cuentas y Credenciales de Meta</span>
                        </h3>
                        <p className="text-xs text-slate-300 mt-1">
                            Ingresa los IDs de tus Píxeles de Facebook creados en tu Administrador de Negocios (Meta Business Suite).
                        </p>
                    </div>

                    <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-slate-300 font-semibold block mb-1">
                                    Meta Pixel ID - BB IMPORT
                                </label>
                                <input
                                    type="text"
                                    value={pixelConfig.bbImportPixelId}
                                    onChange={(e) => setPixelConfig({ ...pixelConfig, bbImportPixelId: e.target.value })}
                                    placeholder="ej: 108492049281048"
                                    className="w-full px-3.5 py-2.5 bg-[#060e15] border border-[#172d3f] rounded-xl text-white font-mono focus:border-[#00c8ff] focus:outline-none"
                                />
                                <span className="text-[10px] text-slate-500 mt-1 block">Para bbimport.onrender.com</span>
                            </div>

                            <div>
                                <label className="text-slate-300 font-semibold block mb-1">
                                    Meta Pixel ID - LUMBAR FIX®
                                </label>
                                <input
                                    type="text"
                                    value={pixelConfig.lumbarFixPixelId}
                                    onChange={(e) => setPixelConfig({ ...pixelConfig, lumbarFixPixelId: e.target.value })}
                                    placeholder="ej: 219385019384712"
                                    className="w-full px-3.5 py-2.5 bg-[#060e15] border border-[#172d3f] rounded-xl text-white font-mono focus:border-[#3b82f6] focus:outline-none"
                                />
                                <span className="text-[10px] text-slate-500 mt-1 block">Para lumbar-fix.vercel.app</span>
                            </div>
                        </div>

                        <div>
                            <label className="text-slate-300 font-semibold block mb-1">
                                Código de Prueba en Administrador de Eventos (Opcional)
                            </label>
                            <input
                                type="text"
                                value={pixelConfig.testEventCode || ''}
                                onChange={(e) => setPixelConfig({ ...pixelConfig, testEventCode: e.target.value })}
                                placeholder="ej: TEST12345 (desde la pestaña 'Probar Eventos' en Meta)"
                                className="w-full px-3.5 py-2.5 bg-[#060e15] border border-[#172d3f] rounded-xl text-white font-mono focus:border-[#2ee59d] focus:outline-none"
                            />
                            <span className="text-[10px] text-slate-500 mt-1 block">
                                Si colocas este código, tus pruebas aparecerán directamente en la pestaña "Probar eventos" de Facebook Business Manager.
                            </span>
                        </div>

                        <div className="pt-3 border-t border-[#142636] flex items-center justify-between">
                            <span className="text-xs text-slate-400">
                                {configSaved ? (
                                    <span className="text-[#2ee59d] font-bold flex items-center gap-1">
                                        <CheckCircle2 className="w-4 h-4" /> ¡Configuración guardada y píxeles activos!
                                    </span>
                                ) : (
                                    'Se guardan permanentemente en tu navegador.'
                                )}
                            </span>

                            <button
                                type="submit"
                                className="px-5 py-2.5 rounded-xl bg-[#2ee59d] hover:bg-[#28d390] text-black font-bold transition-all shadow-md cursor-pointer"
                            >
                                Guardar Configuración
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* MODAL: INSPECT EVENT JSON PAYLOAD */}
            {selectedEventForModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#0b1722] border border-[#1c384e] rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-[#142839] pb-3">
                            <div>
                                <h3 className="text-base font-bold text-white font-display">
                                    Detalles del Evento: {selectedEventForModal.eventName}
                                </h3>
                                <span className="text-[11px] text-slate-400 font-mono">ID: {selectedEventForModal.id}</span>
                            </div>

                            <button
                                onClick={() => setSelectedEventForModal(null)}
                                className="text-slate-400 hover:text-white p-1 rounded-md"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs text-slate-400">Payload enviado a Meta Pixel (fbq):</span>
                            <pre className="p-3.5 rounded-xl bg-[#04090e] border border-[#132534] text-xs font-mono text-[#00c8ff] overflow-y-auto max-h-64 select-all">
                                {JSON.stringify(selectedEventForModal, null, 2)}
                            </pre>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <span className="text-[11px] text-[#2ee59d] flex items-center gap-1 font-mono">
                                <span className="w-2 h-2 rounded-full bg-[#2ee59d]"></span> Estado: 200 OK
                            </span>

                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(JSON.stringify(selectedEventForModal, null, 2));
                                    alert('¡Payload JSON copiado al portapapeles!');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-[#0e2232] hover:bg-[#16364f] border border-[#1c4566] text-xs text-slate-200 font-semibold"
                            >
                                Copiar JSON
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
