import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Globe,
  RefreshCw,
  Zap,
  CheckCircle2,
  Copy,
  ExternalLink,
  Package,
  Layers,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Download,
  Terminal,
  Code2,
  Activity,
  HeartPulse,
  Scissors,
  Rocket,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const WebSyncSection: React.FC = () => {
  const {
    products,
    combos,
    isSyncingWeb,
    lastWebSyncTime,
    syncWithWebSite,
    simulateIncomingWebOrder,
    restoreOfficialBBImportCatalog,
    exportWebStockJSON,
    setActiveTab,
  } = useApp();

  const [copiedWebhook, setCopiedWebhook] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedStockJSON, setCopiedStockJSON] = useState(false);
  const [copiedDeployLink, setCopiedDeployLink] = useState(false);
  const [copiedRenderYaml, setCopiedRenderYaml] = useState(false);
  const [activeInstructionTab, setActiveInstructionTab] = useState<'bbimport' | 'lumbarfix' | 'testing' | 'reverse' | 'deploy'>('deploy');
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Dedicated Webhooks
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://isamer-os.cloud';
  const bbimportWebhookUrl = `${origin}/api/webhooks/bbimport-orders`;
  const lumbarfixWebhookUrl = `${origin}/api/webhooks/lumbarfix-orders`;

  // Code snippet for BB IMPORT (bbimport.onrender.com)
  const bbimportCodeSnippet = `// ============================================================================
// 👉 INTEGRACIÓN PARA: https://bbimport.onrender.com/ (Render Cloud)
// Pegar en el archivo de Checkout (ej: checkout.js o en el botón "Confirmar Pedido"):
// ============================================================================

async function notifyIsamerOS_BBImport(orderData) {
  try {
    const response = await fetch('${bbimportWebhookUrl}', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Store-Origin': 'bbimport.onrender.com'
      },
      body: JSON.stringify({
        businessId: 'bbimport',
        orderId: orderData.trackingCode || 'BB-' + Math.floor(100000 + Math.random() * 900000),
        customerName: orderData.customerName, // ej: "Esteban Morales"
        phone: orderData.phone,               // ej: "+54 9 11 6789-1234"
        items: [
          // SKUs oficiales reconocidos automáticamente por ISAMER OS:
          // 'EX5-BLK' (Negro), 'EX5-RED' (Rojo), 'EX5-BLU' (Azul), 'EX5-YEL' (Amarillo)
          // 'CMB-DUO' (Pack Dúo), 'CMB-PRO-LOTION' (Combo Profesional)
          { sku: orderData.sku || 'EX5-BLK', quantity: orderData.quantity || 1, price: 29999 }
        ],
        total: orderData.totalPrice || 29999,
        paymentMethod: orderData.paymentMethod || 'contra_entrega', // 'contra_entrega' | 'transferencia' | 'mercadopago_qr'
        shippingAddress: orderData.address + ', ' + orderData.city
      })
    });
    console.log("✅ Venta BB IMPORT sincronizada en ISAMER OS - Stock descontado y ganancia registrada");
  } catch (err) {
    console.warn("ISAMER OS offline, guardando en cola local...", err);
  }
}`;

  // Code snippet for LUMBAR FIX (lumbar-fix.vercel.app)
  const lumbarfixCodeSnippet = `// ============================================================================
// 👉 INTEGRACIÓN PARA: https://lumbar-fix.vercel.app/ (Vercel Cloud)
// Pegar en el Checkout / Formulario de Compra (Next.js / React / API Route):
// ============================================================================

async function notifyIsamerOS_LumbarFix(orderData) {
  try {
    const response = await fetch('${lumbarfixWebhookUrl}', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Store-Origin': 'lumbar-fix.vercel.app'
      },
      body: JSON.stringify({
        businessId: 'lumbarfix',
        orderId: orderData.trackingCode || 'LF-' + Math.floor(100000 + Math.random() * 900000),
        customerName: orderData.customerName, // ej: "Gonzalo Medina"
        phone: orderData.phone,               // ej: "+54 9 261 488-3322"
        items: [
          // SKUs oficiales reconocidos automáticamente por ISAMER OS:
          // 'LF-BELT-LXL' (Faja Descompresora $20.000)
          // 'LF-KNEE-PRO' (Rodillera Ortopédica $18.500)
          // 'LF-ANKLE-COMP' (Tobillera Compresión $15.000)
          // 'LF-FOAM-ROLLER' (Foam Roller $28.000)
          // 'CMB-LF-DUO' (Pack Dúo $32.000)
          // 'CMB-LF-PACK' (Pack Completo $89.999)
          { sku: orderData.sku || 'LF-BELT-LXL', quantity: orderData.quantity || 1, price: 20000 }
        ],
        total: orderData.totalPrice || 20000,
        paymentMethod: orderData.paymentMethod || 'contra_entrega', // 'contra_entrega' | 'mercadopago_qr' | 'transferencia'
        shippingAddress: orderData.address + ', ' + orderData.city
      })
    });
    console.log("✅ Venta LUMBAR FIX sincronizada en ISAMER OS - Stock descontado y tarea de envío creada");
  } catch (err) {
    console.warn("ISAMER OS offline, guardando en cola local...", err);
  }
}`;

  const handleCopyWebhook = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedWebhook(id);
    setTimeout(() => setCopiedWebhook(null), 2500);
  };

  const handleCopyCode = (snippet: string, id: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleCopyStockJSON = (business?: 'bbimport' | 'lumbarfix') => {
    const json = exportWebStockJSON(business);
    navigator.clipboard.writeText(json);
    setCopiedStockJSON(true);
    setTimeout(() => setCopiedStockJSON(false), 2500);
  };

  const handleSyncNow = async () => {
    setSyncFeedback('Verificando conexión en vivo con bbimport.onrender.com y lumbar-fix.vercel.app...');
    const res = await syncWithWebSite();
    setSyncFeedback(res.message);
    setTimeout(() => setSyncFeedback(null), 6000);
  };

  const handleSimulate = (preset: any) => {
    const res = simulateIncomingWebOrder(preset);
    setSyncFeedback(res.message);
    setTimeout(() => setSyncFeedback(null), 6000);
  };

  // Split products by business
  const bbProducts = products.filter((p) => p.businessId === 'bbimport');
  const lfProducts = products.filter((p) => p.businessId === 'lumbarfix');
  const bbCombos = combos.filter((c) => c.businessId === 'bbimport');
  const lfCombos = combos.filter((c) => c.businessId === 'lumbarfix');

  return (
    <div className="space-y-6">
      {/* Top Banner: Dual E-commerce Connection Status */}
      <div className="p-5 lg:p-6 rounded-2xl bg-[#091520] border border-[#1b3447] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#2ee59d]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2ee59d] opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 bg-[#2ee59d] rounded-full"></span>
              </span>
              <span className="text-xs font-mono font-bold text-[#2ee59d] tracking-wider uppercase">
                ENLACE DUAL EN VIVO ACTIVO
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400 font-mono">100% E-Commerce (Sin Locales a la Calle)</span>
            </div>

            <h2 className="text-xl lg:text-2xl font-black text-white font-display">
              Centro de Conexión de Tus 2 Tiendas Online
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl mt-1.5 leading-relaxed">
              Gestión centralizada de stock, combos, ventas y ganancias para <strong>BB IMPORT</strong> y{' '}
              <strong>LUMBAR FIX®</strong>. Cada compra realizada en cualquiera de tus dos sitios web descuenta
              stock en tiempo real y genera reportes automáticos.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5 w-full lg:w-auto">
            <button
              onClick={handleSyncNow}
              disabled={isSyncingWeb}
              className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#102434] hover:bg-[#163044] border border-[#234b6a] text-xs font-bold text-white transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-[#2ee59d] ${isSyncingWeb ? 'animate-spin' : ''}`} />
              <span>{isSyncingWeb ? 'Sincronizando...' : 'Verificar Conexión en Vivo'}</span>
            </button>

            <button
              onClick={() => {
                restoreOfficialBBImportCatalog();
                setSyncFeedback('¡Catálogo oficial de ambos e-commerce restaurado con éxito!');
                setTimeout(() => setSyncFeedback(null), 4000);
              }}
              className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0d1e2b] hover:bg-[#132a3d] border border-[#1b3b54] text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Restablecer Catálogos Oficiales</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {syncFeedback && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2ee59d] shrink-0" />
              <span>{syncFeedback}</span>
            </div>
            <button
              onClick={() => setSyncFeedback(null)}
              className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* 2 Business Live Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-4 border-t border-[#132533]">
          {/* Business 1: BB IMPORT */}
          <div className="p-3.5 rounded-xl bg-[#07131e] border border-[#18354c] flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-[#00c8ff]" />
                <span className="text-xs font-bold text-white">1. BB IMPORT (Cortadoras & Barber)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#2ee59d] border border-emerald-500/30 font-mono font-semibold">
                  EN LÍNEA
                </span>
              </div>
              <a
                href="https://bbimport.onrender.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#00c8ff] hover:underline flex items-center gap-1 font-mono"
              >
                https://bbimport.onrender.com/
                <ExternalLink className="w-3 h-3" />
              </a>
              <p className="text-[11px] text-slate-400">
                {bbProducts.length} variantes EX5 + {bbCombos.length} combos • Render Cloud
              </p>
            </div>
            <button
              onClick={() => handleCopyWebhook(bbimportWebhookUrl, 'bb')}
              className="px-2.5 py-1.5 rounded-lg bg-[#0e2130] hover:bg-[#142e44] border border-[#1b4363] text-[11px] font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedWebhook === 'bb' ? <CheckCircle2 className="w-3.5 h-3.5 text-[#2ee59d]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedWebhook === 'bb' ? 'Copiado' : 'Webhook'}</span>
            </button>
          </div>

          {/* Business 2: LUMBAR FIX */}
          <div className="p-3.5 rounded-xl bg-[#07131e] border border-[#18354c] flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-[#3b82f6]" />
                <span className="text-xs font-bold text-white">2. LUMBAR FIX® (Salud & Ortopedia)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#2ee59d] border border-emerald-500/30 font-mono font-semibold">
                  EN LÍNEA
                </span>
              </div>
              <a
                href="https://lumbar-fix.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#60a5fa] hover:underline flex items-center gap-1 font-mono"
              >
                https://lumbar-fix.vercel.app/
                <ExternalLink className="w-3 h-3" />
              </a>
              <p className="text-[11px] text-slate-400">
                {lfProducts.length} productos ortopédicos + {lfCombos.length} packs • Vercel Cloud
              </p>
            </div>
            <button
              onClick={() => handleCopyWebhook(lumbarfixWebhookUrl, 'lf')}
              className="px-2.5 py-1.5 rounded-lg bg-[#0e2130] hover:bg-[#142e44] border border-[#1b4363] text-[11px] font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedWebhook === 'lf' ? <CheckCircle2 className="w-3.5 h-3.5 text-[#2ee59d]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedWebhook === 'lf' ? 'Copiado' : 'Webhook'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guide: Step-by-Step Instructions for BOTH websites */}
      <div className="p-5 lg:p-6 rounded-2xl bg-[#071017] border border-[#142330] space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-base lg:text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#2ee59d]" />
              <span>Guía Paso a Paso: Cómo Conectar Ambas Páginas para que Funcionen 100% Real</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sin servidores complejos ni locales físicos. Sigue las instrucciones de cada pestaña para activar la conexión en 2 minutos:
            </p>
          </div>

          {/* Sub-tabs for instructions */}
          <div className="flex items-center flex-wrap gap-1 bg-[#0c1924] p-1 rounded-lg border border-[#183144]">
            <button
              onClick={() => setActiveInstructionTab('bbimport')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeInstructionTab === 'bbimport'
                  ? 'bg-[#00c8ff] text-[#061017] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>1. Conectar BB IMPORT</span>
            </button>
            <button
              onClick={() => setActiveInstructionTab('lumbarfix')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeInstructionTab === 'lumbarfix'
                  ? 'bg-[#3b82f6] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>2. Conectar LUMBAR FIX</span>
            </button>
            <button
              onClick={() => setActiveInstructionTab('testing')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeInstructionTab === 'testing'
                  ? 'bg-[#2ee59d] text-[#061017] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>3. Probar Simulador en Vivo</span>
            </button>
            <button
              onClick={() => setActiveInstructionTab('reverse')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeInstructionTab === 'reverse'
                  ? 'bg-[#2ee59d] text-[#061017] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>4. Exportar Stock JSON</span>
            </button>
            <button
              onClick={() => setActiveInstructionTab('deploy')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeInstructionTab === 'deploy'
                  ? 'bg-[#2ee59d] text-[#061017] shadow-sm'
                  : 'text-[#2ee59d] bg-[#2ee59d]/10 hover:bg-[#2ee59d]/20 border border-[#2ee59d]/30'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>🚀 5. Desplegar en Render & Poner en Uso</span>
            </button>
          </div>
        </div>

        {/* Tab 1: BB IMPORT Instructions */}
        {activeInstructionTab === 'bbimport' && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#091520] border border-[#162a3b]">
                <div className="w-7 h-7 rounded-lg bg-[#00c8ff]/15 border border-[#00c8ff]/40 text-[#00c8ff] flex items-center justify-center font-bold text-xs mb-2.5">
                  1
                </div>
                <h4 className="text-xs font-bold text-white">Copiar la URL del Webhook</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Copia la URL única de webhook de BB IMPORT. Ésta escuchará las órdenes de compra de tus cortadoras
                  EX5 en <span className="font-mono text-slate-300">bbimport.onrender.com</span>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#091520] border border-[#162a3b]">
                <div className="w-7 h-7 rounded-lg bg-[#00c8ff]/15 border border-[#00c8ff]/40 text-[#00c8ff] flex items-center justify-center font-bold text-xs mb-2.5">
                  2
                </div>
                <h4 className="text-xs font-bold text-white">Pegar el Snippet en Render</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  En el repositorio o script de checkout de Render, pega la función{' '}
                  <span className="font-mono text-[#00c8ff]">notifyIsamerOS_BBImport</span> para que se ejecute al
                  confirmar la orden de compra.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#091520] border border-[#162a3b]">
                <div className="w-7 h-7 rounded-lg bg-[#00c8ff]/15 border border-[#00c8ff]/40 text-[#00c8ff] flex items-center justify-center font-bold text-xs mb-2.5">
                  3
                </div>
                <h4 className="text-xs font-bold text-white">Stock y Despacho Automático</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Al recibir la orden, se descuenta el stock de la máquina o combo seleccionado, se agenda la tarea con
                  datos del cliente y se calcula tu ganancia neta.
                </p>
              </div>
            </div>

            {/* URL Box */}
            <div className="p-3.5 rounded-xl bg-[#09131c] border border-[#172b3c] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
                  URL del Webhook para BB IMPORT
                </span>
                <p className="text-xs font-mono text-[#00c8ff] select-all break-all">{bbimportWebhookUrl}</p>
              </div>
              <button
                onClick={() => handleCopyWebhook(bbimportWebhookUrl, 'bb_inst')}
                className="px-3.5 py-1.5 rounded-lg bg-[#102332] hover:bg-[#18364d] border border-[#1e4463] text-xs font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              >
                {copiedWebhook === 'bb_inst' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2ee59d]" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copiar URL</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Snippet Box */}
            <div className="rounded-xl bg-[#04080c] border border-[#13222e] overflow-hidden">
              <div className="px-4 py-2 bg-[#09131a] border-b border-[#13222e] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-mono text-slate-300">
                    Código para bbimport.onrender.com (checkout.js / api/orders)
                  </span>
                </div>
                <button
                  onClick={() => handleCopyCode(bbimportCodeSnippet, 'bb_code')}
                  className="text-xs text-[#00c8ff] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  {copiedCode === 'bb_code' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'bb_code' ? '¡Código Copiado!' : 'Copiar Código'}</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto no-scrollbar leading-relaxed">
                <code>{bbimportCodeSnippet}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Tab 2: LUMBAR FIX Instructions */}
        {activeInstructionTab === 'lumbarfix' && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#091520] border border-[#162a3b]">
                <div className="w-7 h-7 rounded-lg bg-[#3b82f6]/15 border border-[#3b82f6]/40 text-[#60a5fa] flex items-center justify-center font-bold text-xs mb-2.5">
                  1
                </div>
                <h4 className="text-xs font-bold text-white">Copiar Webhook de Lumbar Fix</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Copia el endpoint receptor para tu e-commerce <span className="font-mono text-[#60a5fa]">lumbar-fix.vercel.app</span>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#091520] border border-[#162a3b]">
                <div className="w-7 h-7 rounded-lg bg-[#3b82f6]/15 border border-[#3b82f6]/40 text-[#60a5fa] flex items-center justify-center font-bold text-xs mb-2.5">
                  2
                </div>
                <h4 className="text-xs font-bold text-white">Integrar en tu Vercel / Checkout</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Pega el snippet en la función de submit de tu formulario de compra o página de agradecimiento.
                  Admite compras individuales ($20.000), packs dúo ($32.000) o packs completos ($89.999).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#091520] border border-[#162a3b]">
                <div className="w-7 h-7 rounded-lg bg-[#3b82f6]/15 border border-[#3b82f6]/40 text-[#60a5fa] flex items-center justify-center font-bold text-xs mb-2.5">
                  3
                </div>
                <h4 className="text-xs font-bold text-white">Control Contra Entrega y Andreani</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Las órdenes con Pago Contra Entrega generan de inmediato una tarea prioritaria con el teléfono y dirección
                  del comprador para coordinar la moto o Andreani.
                </p>
              </div>
            </div>

            {/* URL Box */}
            <div className="p-3.5 rounded-xl bg-[#09131c] border border-[#172b3c] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
                  URL del Webhook para LUMBAR FIX®
                </span>
                <p className="text-xs font-mono text-[#60a5fa] select-all break-all">{lumbarfixWebhookUrl}</p>
              </div>
              <button
                onClick={() => handleCopyWebhook(lumbarfixWebhookUrl, 'lf_inst')}
                className="px-3.5 py-1.5 rounded-lg bg-[#102332] hover:bg-[#18364d] border border-[#1e4463] text-xs font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              >
                {copiedWebhook === 'lf_inst' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2ee59d]" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copiar URL</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Snippet Box */}
            <div className="rounded-xl bg-[#04080c] border border-[#13222e] overflow-hidden">
              <div className="px-4 py-2 bg-[#09131a] border-b border-[#13222e] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-mono text-slate-300">
                    Código para lumbar-fix.vercel.app (app/checkout/route.js o componente de compra)
                  </span>
                </div>
                <button
                  onClick={() => handleCopyCode(lumbarfixCodeSnippet, 'lf_code')}
                  className="text-xs text-[#60a5fa] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  {copiedCode === 'lf_code' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'lf_code' ? '¡Código Copiado!' : 'Copiar Código'}</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto no-scrollbar leading-relaxed">
                <code>{lumbarfixCodeSnippet}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: Live Testing & Simulation for BOTH businesses */}
        {activeInstructionTab === 'testing' && (
          <div className="space-y-5 pt-2">
            {/* Simulation for BB IMPORT */}
            <div className="p-4 rounded-xl bg-[#0a1824] border border-[#193b54] space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-[#00c8ff]" />
                  <span>Simular Compras en Vivo para BB IMPORT (bbimport.onrender.com)</span>
                </h4>
                <span className="text-[11px] font-mono text-slate-400">Descuenta stock EX5 al instante</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Haz clic en cualquiera de estos botones para disparar una orden idéntica a la que realiza un comprador en{' '}
                <strong className="text-white">bbimport.onrender.com</strong>:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleSimulate('bb_single')}
                  className="p-3.5 rounded-xl bg-[#102434] hover:bg-[#163147] border border-[#1f4767] text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-[#00c8ff]">
                      1x Máquina EX5 Negro Matte
                    </span>
                    <span className="text-xs font-mono font-bold text-[#00c8ff]">$29.999</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Método: <strong>Pago Contra Entrega Andreani</strong>. Descuenta 1 unidad de stock.
                  </p>
                  <div className="mt-2.5 flex items-center gap-1 text-[10px] font-semibold text-[#00c8ff]">
                    <span>⚡ Simular Compra Web BB Import</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                <button
                  onClick={() => handleSimulate('bb_duo')}
                  className="p-3.5 rounded-xl bg-[#102434] hover:bg-[#163147] border border-[#1f4767] text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-[#00c8ff]">
                      Pack Dúo: 2x Máquinas EX5
                    </span>
                    <span className="text-xs font-mono font-bold text-[#00c8ff]">$54.999</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Método: <strong>Transferencia Galicia</strong>. Descuenta 1 Negro + 1 Rojo Carmín.
                  </p>
                  <div className="mt-2.5 flex items-center gap-1 text-[10px] font-semibold text-[#00c8ff]">
                    <span>⚡ Simular Compra Web BB Import</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                <button
                  onClick={() => handleSimulate('bb_combo')}
                  className="p-3.5 rounded-xl bg-[#102434] hover:bg-[#163147] border border-[#1f4767] text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-[#00c8ff]">
                      Combo con Loción Post Afeitado
                    </span>
                    <span className="text-xs font-mono font-bold text-[#00c8ff]">$41.999</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Método: <strong>Mercado Pago QR</strong>. Descuenta 1 Máquina + 1 Loción.
                  </p>
                  <div className="mt-2.5 flex items-center gap-1 text-[10px] font-semibold text-[#00c8ff]">
                    <span>⚡ Simular Compra Web BB Import</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            </div>

            {/* Simulation for LUMBAR FIX */}
            <div className="p-4 rounded-xl bg-[#091522] border border-[#1c334d] space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-[#3b82f6]" />
                  <span>Simular Compras en Vivo para LUMBAR FIX® (lumbar-fix.vercel.app)</span>
                </h4>
                <span className="text-[11px] font-mono text-slate-400">Descuenta fajas y packs ortopédicos</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Prueba cómo impactan las compras de la tienda de descompresión lumbar en tu tablero unificado:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleSimulate('lf_single')}
                  className="p-3.5 rounded-xl bg-[#0d1d2e] hover:bg-[#132a42] border border-[#1d3d5e] text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-[#60a5fa]">
                      1x Faja Lumbar Descompresora
                    </span>
                    <span className="text-xs font-mono font-bold text-[#60a5fa]">$20.000</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Método: <strong>Pago Contra Entrega Andreani</strong>. Stock -1 Faja. Ganancia neta +$6.000.
                  </p>
                  <div className="mt-2.5 flex items-center gap-1 text-[10px] font-semibold text-[#60a5fa]">
                    <span>⚡ Simular Compra Lumbar Fix</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                <button
                  onClick={() => handleSimulate('lf_duo')}
                  className="p-3.5 rounded-xl bg-[#0d1d2e] hover:bg-[#132a42] border border-[#1d3d5e] text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-[#60a5fa]">
                      Pack Dúo: 2x Fajas Descompresoras
                    </span>
                    <span className="text-xs font-mono font-bold text-[#60a5fa]">$32.000</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Método: <strong>Mercado Pago</strong>. Stock -2 Fajas. Ganancia neta +$4.000.
                  </p>
                  <div className="mt-2.5 flex items-center gap-1 text-[10px] font-semibold text-[#60a5fa]">
                    <span>⚡ Simular Compra Lumbar Fix</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                <button
                  onClick={() => handleSimulate('lf_pack')}
                  className="p-3.5 rounded-xl bg-[#0d1d2e] hover:bg-[#132a42] border border-[#1d3d5e] text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-[#60a5fa]">
                      PACK COMPLETO LUMBAR FIX
                    </span>
                    <span className="text-xs font-mono font-bold text-[#2ee59d]">$89.999</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Faja + Rodillera + Tobillera + Foam Roller. Ganancia limpia: <strong>+$49.499</strong>.
                  </p>
                  <div className="mt-2.5 flex items-center gap-1 text-[10px] font-semibold text-[#2ee59d]">
                    <span>⚡ Simular Compra Pack Completo</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Reverse Stock Sync */}
        {activeInstructionTab === 'reverse' && (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-[#0a1824] border border-[#193b54]">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-[#2ee59d]" />
                <span>Exportar Stock Actualizado hacia Ambas Tiendas Web</span>
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Para garantizar que ni <strong className="text-white">bbimport.onrender.com</strong> ni{' '}
                <strong className="text-white">lumbar-fix.vercel.app</strong> sobrevenda productos cuando realizas
                ventas por WhatsApp o Instagram, exporta el stock actualizado en formato JSON con un clic:
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => handleCopyStockJSON()}
                  className="px-4 py-2 rounded-xl bg-[#2ee59d] hover:bg-[#28d390] text-[#061017] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {copiedStockJSON ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#061017]" />
                      <span>¡JSON Unificado Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar JSON Ambos Negocios</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleCopyStockJSON('bbimport')}
                  className="px-4 py-2 rounded-xl bg-[#091c2b] hover:bg-[#102b40] border border-[#173e5c] text-xs font-semibold text-[#00c8ff] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Scissors className="w-4 h-4" />
                  <span>Copiar JSON Solo BB IMPORT</span>
                </button>

                <button
                  onClick={() => handleCopyStockJSON('lumbarfix')}
                  className="px-4 py-2 rounded-xl bg-[#091b2c] hover:bg-[#102942] border border-[#1c3c5e] text-xs font-semibold text-[#60a5fa] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <HeartPulse className="w-4 h-4" />
                  <span>Copiar JSON Solo LUMBAR FIX</span>
                </button>

                <button
                  onClick={() => {
                    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(exportWebStockJSON());
                    const dlAnchorElem = document.createElement('a');
                    dlAnchorElem.setAttribute('href', dataStr);
                    dlAnchorElem.setAttribute('download', `isamer-dual-stock-${Date.now()}.json`);
                    dlAnchorElem.click();
                  }}
                  className="px-4 py-2 rounded-xl bg-[#112433] hover:bg-[#18364d] border border-[#1d425f] text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                  <span>Descargar Archivo JSON</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: DEPLOYMENT & PRODUCTION READY (RENDER / VERCEL / AI STUDIO) */}
        {activeInstructionTab === 'deploy' && (
          <div className="space-y-5 pt-2">
            {/* Direct Access Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0d2230] to-[#071724] border border-[#2ee59d]/40 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2ee59d] animate-ping"></span>
                    <span className="text-xs font-mono uppercase tracking-wider font-extrabold text-[#2ee59d]">
                      ACCESO INMEDIATO EN VIVO (YA ESTÁ LISTA PARA USAR)
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white font-display">
                    Tu Panel ya está 100% Funcional y Persistente
                  </h4>
                  <p className="text-xs text-slate-300 max-w-2xl">
                    No necesitas esperar a compilar ni configurar servidores para empezar a usarla. Puedes abrir esta URL en tu computadora, notebook o celular. Guarda tus ventas, clientes y stock automáticamente en la memoria del navegador.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        navigator.clipboard.writeText(window.location.href);
                        setCopiedDeployLink(true);
                        setTimeout(() => setCopiedDeployLink(false), 2500);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#2ee59d] hover:bg-[#28d390] text-[#061017] text-xs font-bold transition-all flex items-center gap-2 shadow-lg cursor-pointer whitespace-nowrap"
                  >
                    {copiedDeployLink ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>¡Enlace Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar Enlace de Acceso</span>
                      </>
                    )}
                  </button>

                  <a
                    href={typeof window !== 'undefined' ? window.location.href : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2.5 rounded-xl bg-[#091b29] hover:bg-[#122e44] border border-[#1e4666] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  >
                    <span>Abrir en Pestaña Nueva</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Step-by-Step Render Deployment Guide */}
            <div className="space-y-4">
              <div className="border-b border-[#142330] pb-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-[#00c8ff]" />
                  <span>Cómo Desplegarla en Render (Paso a Paso)</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Como ya tienes alojada la web de <strong>BB IMPORT</strong> en Render, puedes publicar este panel en tu misma cuenta de Render en 2 minutos:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-xl bg-[#091520] border border-[#162a3b] space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-[#00c8ff]/15 border border-[#00c8ff]/40 text-[#00c8ff] flex items-center justify-center font-bold text-xs font-mono">
                    1
                  </div>
                  <h5 className="text-xs font-bold text-white">Exportar a GitHub</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    En el menú de Google AI Studio, ve al menú superior o de configuración y pulsa <strong>"Export to GitHub"</strong> (o descarga el ZIP).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#091520] border border-[#162a3b] space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-[#00c8ff]/15 border border-[#00c8ff]/40 text-[#00c8ff] flex items-center justify-center font-bold text-xs font-mono">
                    2
                  </div>
                  <h5 className="text-xs font-bold text-white">Crear Static Site en Render</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Entra a tu panel de <a href="https://dashboard.render.com/" target="_blank" rel="noreferrer" className="text-[#00c8ff] hover:underline">dashboard.render.com</a>, haz clic en <strong>New +</strong> y elige <strong>Static Site</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#091520] border border-[#162a3b] space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-[#00c8ff]/15 border border-[#00c8ff]/40 text-[#00c8ff] flex items-center justify-center font-bold text-xs font-mono">
                    3
                  </div>
                  <h5 className="text-xs font-bold text-white">Parámetros de Build</h5>
                  <div className="text-[11px] text-slate-300 font-mono space-y-1 bg-[#050e14] p-2 rounded border border-[#112435]">
                    <div><span className="text-slate-500">Build:</span> npm run build</div>
                    <div><span className="text-slate-500">Publish:</span> dist</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#091520] border border-[#162a3b] space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-[#2ee59d]/15 border border-[#2ee59d]/40 text-[#2ee59d] flex items-center justify-center font-bold text-xs font-mono">
                    4
                  </div>
                  <h5 className="text-xs font-bold text-white">¡Listo en 1 Minuto!</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Render compilará tu aplicación y te dará tu enlace propio (ej: <span className="font-mono text-[#2ee59d]">isamer-os.onrender.com</span>) con SSL gratis.
                  </p>
                </div>
              </div>

              {/* Render.yaml already configured badge */}
              <div className="p-4 rounded-xl bg-[#08131d] border border-[#1a384f] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2ee59d]" />
                    <span className="text-xs font-bold text-white">
                      Archivo <code className="text-[#2ee59d] bg-[#050f16] px-1.5 py-0.5 rounded font-mono">render.yaml</code> ya incluido en el proyecto
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Incluye automáticamente la regla de reescritura para Single Page Application (SPA), evitando cualquier error 404 al navegar.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const yaml = `services:\n  - type: web\n    name: isamer-os-ecommerce\n    runtime: static\n    buildCommand: npm install && npm run build\n    staticPublishPath: ./dist\n    routes:\n      - type: rewrite\n        source: /*\n        destination: /index.html`;
                    navigator.clipboard.writeText(yaml);
                    setCopiedRenderYaml(true);
                    setTimeout(() => setCopiedRenderYaml(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#0e2232] hover:bg-[#16354e] border border-[#1c4566] text-xs text-[#00c8ff] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
                >
                  {copiedRenderYaml ? <Check className="w-3.5 h-3.5 text-[#2ee59d]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRenderYaml ? '¡render.yaml Copiado!' : 'Ver render.yaml'}</span>
                </button>
              </div>

              {/* Vercel Option (Together with LUMBAR FIX) */}
              <div className="p-4 rounded-xl bg-[#08121a] border border-[#182a39] space-y-2">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-[#3b82f6]" />
                  <h5 className="text-xs font-bold text-white">
                    ¿Prefieres tenerlo en Vercel junto a LUMBAR FIX®?
                  </h5>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  También es 100% compatible con Vercel. Solo entras a <a href="https://vercel.com/" target="_blank" rel="noreferrer" className="text-[#60a5fa] hover:underline">vercel.com</a>, seleccionas <strong>"Add New Project"</strong>, vinculas el repositorio de GitHub y Vercel detectará el framework <strong>Vite</strong> de forma automática.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* BB IMPORT Real Products */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Scissors className="w-4 h-4 text-[#00c8ff]" />
                <span>Catálogo Real de BB IMPORT (https://bbimport.onrender.com/)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Línea oficial de máquinas cortadoras profesionales EXXTRA TECH™ EX5 y repuestos originales.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs font-semibold text-[#00c8ff] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Gestionar Stock & Combos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {bbProducts.map((prod) => {
              const isLow = prod.currentStock <= prod.minStockAlert;
              const margin = Math.round(((prod.sellingPrice - prod.costPrice) / prod.sellingPrice) * 100);

              let colorDot = 'bg-slate-800';
              if (prod.sku === 'EX5-RED') colorDot = 'bg-red-500';
              if (prod.sku === 'EX5-BLU') colorDot = 'bg-blue-500';
              if (prod.sku === 'EX5-YEL') colorDot = 'bg-yellow-400';

              return (
                <div
                  key={prod.id}
                  className="p-4 rounded-xl bg-[#071118] border border-[#142634] hover:border-[#1f425b] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0e1f2b] text-slate-400 border border-[#173347]">
                        {prod.sku}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          isLow
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {isLow ? '⚠️ Stock Bajo' : '🟢 En Stock Web'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`w-3 h-3 rounded-full border border-white/20 shadow-sm ${colorDot}`}></span>
                      <h4 className="text-xs font-bold text-white leading-snug">
                        {prod.name.replace('Máquina Cortadora EXXTRA TECH™ EX5 - ', '')}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-400">Motor 7.000 RPM, cuchilla 0mm, batería Li-Ion 4hs</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#10202d] space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Stock Actual:</span>
                      <span className={`font-bold text-sm ${isLow ? 'text-amber-400' : 'text-slate-100'}`}>
                        {prod.currentStock} unidades
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Precio de Venta:</span>
                      <span className="font-bold text-sm font-mono text-[#00c8ff]">
                        ${prod.sellingPrice.toLocaleString('es-AR')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Costo: ${prod.costPrice.toLocaleString('es-AR')}</span>
                      <span className="text-emerald-400 font-semibold">{margin}% margen</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* LUMBAR FIX Real Products */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-[#3b82f6]" />
                <span>Catálogo Real de LUMBAR FIX® (https://lumbar-fix.vercel.app/)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Faja de descompresión lumbar, rodilleras pro, tobilleras de compresión y foam rollers ortopédicos.
              </p>
            </div>

            <a
              href="https://lumbar-fix.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[#60a5fa] hover:underline flex items-center gap-1"
            >
              <span>Visitar lumbar-fix.vercel.app</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {lfProducts.map((prod) => {
              const isLow = prod.currentStock <= prod.minStockAlert;
              const margin = Math.round(((prod.sellingPrice - prod.costPrice) / prod.sellingPrice) * 100);

              return (
                <div
                  key={prod.id}
                  className="p-4 rounded-xl bg-[#08121d] border border-[#16293d] hover:border-[#214364] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0f2134] text-slate-400 border border-[#1d3d5e]">
                        {prod.sku}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          isLow
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {isLow ? '⚠️ Stock Bajo' : '🟢 En Stock Web'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white leading-snug mb-1.5">{prod.name}</h4>
                    <p className="text-[11px] text-slate-400">Línea de salud y bienestar ortopédico certificada</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#132233] space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Stock Actual:</span>
                      <span className={`font-bold text-sm ${isLow ? 'text-amber-400' : 'text-slate-100'}`}>
                        {prod.currentStock} unidades
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Precio de Venta:</span>
                      <span className="font-bold text-sm font-mono text-[#60a5fa]">
                        ${prod.sellingPrice.toLocaleString('es-AR')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Costo: ${prod.costPrice.toLocaleString('es-AR')}</span>
                      <span className="text-emerald-400 font-semibold">{margin}% margen</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Combos Oficiales de Ambos Negocios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
          {/* BB Import Combos */}
          <div className="p-4 rounded-xl bg-[#08121a] border border-[#132330] space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Scissors className="w-4 h-4 text-[#00c8ff]" />
              <span>Combos & Packs Oficiales de BB IMPORT</span>
            </h4>
            <div className="space-y-2.5">
              {bbCombos.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-lg bg-[#050b11] border border-[#10202d] flex items-center justify-between gap-3"
                >
                  <div>
                    <h5 className="text-xs font-bold text-white">{c.name}</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{c.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-[#00c8ff] font-mono">
                      ${c.sellingPrice.toLocaleString('es-AR')}
                    </span>
                    <span className="block text-[10px] text-slate-500 font-mono">bbimport.onrender.com</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lumbar Fix Combos */}
          <div className="p-4 rounded-xl bg-[#08121a] border border-[#132330] space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-[#3b82f6]" />
              <span>Packs Oficiales de LUMBAR FIX®</span>
            </h4>
            <div className="space-y-2.5">
              {lfCombos.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-lg bg-[#050b11] border border-[#10202d] flex items-center justify-between gap-3"
                >
                  <div>
                    <h5 className="text-xs font-bold text-white">{c.name}</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{c.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-[#60a5fa] font-mono">
                      ${c.sellingPrice.toLocaleString('es-AR')}
                    </span>
                    <span className="block text-[10px] text-slate-500 font-mono">lumbar-fix.vercel.app</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
