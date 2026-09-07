import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sliders,
  Store,
  Globe,
  DollarSign,
  Key,
  Download,
  Upload,
  RotateCcw,
  Check,
  AlertTriangle,
  Layers,
} from 'lucide-react';

export const BusinessSettingsModal: React.FC = () => {
  const {
    businessConfig,
    updateBusinessConfig,
    resetToDefaults,
    exportDatabaseJSON,
    importDatabaseJSON,
    setActiveTab,
  } = useApp();

  const [name, setName] = useState(businessConfig.businessName);
  const [tagline, setTagline] = useState(businessConfig.tagline);
  const [currencySymbol, setCurrencySymbol] = useState(businessConfig.currencySymbol);
  const [currencyCode, setCurrencyCode] = useState(businessConfig.currencyCode);
  const [websiteUrl, setWebsiteUrl] = useState(businessConfig.websiteUrl);
  const [lowStockDefault, setLowStockDefault] = useState(businessConfig.lowStockThresholdDefault);
  const [licenseKey, setLicenseKey] = useState(businessConfig.whiteLabelLicense);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessConfig({
      businessName: name.trim() || 'BB Import',
      tagline: tagline.trim(),
      currencySymbol: currencySymbol.trim() || '$',
      currencyCode: currencyCode.trim() || 'ARS',
      websiteUrl: websiteUrl.trim() || 'https://bbimport.onrender.com/',
      lowStockThresholdDefault: Number(lowStockDefault) || 5,
      whiteLabelLicense: licenseKey.trim(),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `isamer_os_backup_${name.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExecuteImport = () => {
    if (!importJsonText.trim()) return;
    const ok = importDatabaseJSON(importJsonText.trim());
    if (ok) {
      setImportStatus('success');
      setImportJsonText('');
      setTimeout(() => setImportStatus(null), 3000);
    } else {
      setImportStatus('error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2ee59d] font-mono">
            SISTEMA SAAS MULTI-NEGOCIO & WHITE-LABEL
          </span>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-display">
            <span>Configuración de Negocio & Licencia Vendible</span>
          </h2>
          <p className="text-xs text-slate-400">
            Personaliza para BB Import o adapta la plataforma para venderla como software independiente a otros negocios.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-[#2ee59d] text-xs font-bold">
            <Check className="w-4 h-4" />
            <span>¡Configuración guardada!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: General Business Form */}
        <div className="lg:col-span-2 bg-[#0d1822] border border-[#172b3a] rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Store className="w-4 h-4 text-[#2ee59d]" />
            <span>Datos de la Empresa / Marca Comercial</span>
          </h3>

          <form onSubmit={handleSaveConfig} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Nombre del Negocio *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="BB Import"
                  className="w-full px-3 py-2 bg-[#060e15] border border-[#182e3f] rounded-lg text-white font-bold focus:border-[#2ee59d] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Eslogan o Subtítulo</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Importaciones directas & Tecnología"
                  className="w-full px-3 py-2 bg-[#060e15] border border-[#182e3f] rounded-lg text-white focus:border-[#2ee59d] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-300 block mb-1">Símbolo Moneda</label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  placeholder="$"
                  className="w-full px-3 py-2 bg-[#060e15] border border-[#182e3f] rounded-lg text-white font-mono text-center font-bold focus:border-[#2ee59d] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Código Moneda</label>
                <input
                  type="text"
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value)}
                  placeholder="ARS / USD"
                  className="w-full px-3 py-2 bg-[#060e15] border border-[#182e3f] rounded-lg text-white font-mono text-center focus:border-[#2ee59d] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Umbral Stock Bajo</label>
                <input
                  type="number"
                  min="1"
                  value={lowStockDefault}
                  onChange={(e) => setLowStockDefault(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#060e15] border border-[#182e3f] rounded-lg text-white font-mono text-center focus:border-[#2ee59d] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#2ee59d]" />
                <span>Página Web Conectada (E-Commerce)</span>
              </label>
              <input
                type="url"
                required
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://bbimport.onrender.com/"
                className="w-full px-3 py-2 bg-[#060e15] border border-[#182e3f] rounded-lg text-[#2ee59d] font-mono focus:border-[#2ee59d] focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Utilizada para rastreo de tráfico, links de campañas y sincronización digital.
              </p>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Licencia White-Label para Terceros</span>
              </label>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="LIC-ENTERPRISE-PRO-2026"
                className="w-full px-3 py-2 bg-[#060e15] border border-[#182e3f] rounded-lg text-amber-300 font-mono focus:border-[#2ee59d] focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Permite comercializar esta solución como software llave en mano a otros comerciantes.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-[#2ee59d] hover:bg-[#28d390] text-black font-bold transition-all shadow-[0_0_12px_rgba(46,229,157,0.2)] cursor-pointer"
              >
                Guardar Cambios del Negocio
              </button>
            </div>
          </form>
        </div>

        {/* Right: Data Export / Import (Portability for selling to others) */}
        <div className="bg-[#0d1822] border border-[#172b3a] rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Download className="w-4 h-4 text-[#2ee59d]" />
              <span>Copia de Seguridad & Portabilidad</span>
            </h3>
            <p className="text-xs text-slate-400">
              Descarga o restaura toda la base de datos (productos, combos, ventas, clientes y tareas) en formato JSON.
            </p>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0e2230] hover:bg-[#15344a] border border-[#1e4460] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#2ee59d]" />
            <span>Descargar Base de Datos JSON</span>
          </button>

          {/* Import JSON Box */}
          <div className="pt-3 border-t border-[#142634] space-y-2 text-xs">
            <label className="text-slate-300 font-semibold block flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Restaurar / Importar Base de Datos</span>
            </label>

            <textarea
              rows={3}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Pega el contenido JSON de una copia de seguridad..."
              className="w-full px-2.5 py-1.5 bg-[#060e15] border border-[#182e3f] rounded-lg text-white font-mono text-[11px] focus:border-[#2ee59d] focus:outline-none"
            />

            {importStatus === 'success' && (
              <p className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                ¡Base de datos importada correctamente!
              </p>
            )}

            {importStatus === 'error' && (
              <p className="text-rose-400 text-xs font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Error: El archivo JSON no es válido.
              </p>
            )}

            <button
              onClick={handleExecuteImport}
              disabled={!importJsonText.trim()}
              className="w-full py-2 rounded-lg bg-[#142838] hover:bg-[#1c384e] disabled:opacity-40 text-slate-200 text-xs font-semibold cursor-pointer"
            >
              Cargar y Reemplazar Datos
            </button>
          </div>

          {/* Reset button */}
          <div className="pt-3 border-t border-[#142634]">
            <button
              onClick={() => {
                if (confirm('¿Deseas reiniciar los datos a la configuración inicial de BB Import?')) {
                  resetToDefaults();
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/40 text-rose-300 text-xs font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer Datos Iniciales BB Import</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
