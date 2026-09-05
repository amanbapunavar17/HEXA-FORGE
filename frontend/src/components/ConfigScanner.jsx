import React, { useState } from 'react';
import { 
  UploadCloud, 
  Play, 
  FileCode, 
  CheckCircle, 
  RotateCcw, 
  HelpCircle,
  Cpu,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

export default function ConfigScanner({ 
  rawConfig, 
  setRawConfig, 
  deviceName, 
  setDeviceName, 
  vendor, 
  setVendor, 
  framework, 
  setFramework, 
  onRunScan, 
  loading,
  sampleConfigs,
  onSelectSample
}) {
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setRawConfig(event.target.result);
      setDeviceName(file.name.replace(/\.[^/.]+$/, ""));
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setRawConfig(event.target.result);
        setDeviceName(file.name.replace(/\.[^/.]+$/, ""));
      };
      reader.readAsText(file);
    }
  };

  const lineCount = rawConfig.split('\n').length;

  return (
    <div className="space-y-6">
      
      {/* Top Configuration Controls */}
      <div className="glass-card rounded-xl p-6 border border-cyber-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <FileCode className="h-5 w-5 text-cyan-400" />
              <span>Multi-Vendor Configuration Ingestion & Audit</span>
            </h2>
            <p className="text-xs text-slate-400">
              Upload, paste, or select vendor running-configs to run automated AST security audits.
            </p>
          </div>

          {/* Sample Selectors */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Load Sample:</span>
            <select
              onChange={(e) => onSelectSample(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-cyan-300 text-xs rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
              defaultValue=""
            >
              <option value="" disabled>-- Select Preset Config --</option>
              {sampleConfigs.map((s) => (
                <option key={s.filename} value={s.filename}>
                  {s.title} ({s.vendor})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Input Parameters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Field 1: Device Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Device Identifier / Hostname
            </label>
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="e.g. Core-Router-HQ-01"
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Field 2: Target Vendor */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Target Vendor Architecture
            </label>
            <select
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="auto_detect">⚡ Auto-Detect Vendor (AST Heuristic)</option>
              <option value="cisco_ios">Cisco IOS / IOS-XE</option>
              <option value="juniper_junos">Juniper Junos OS</option>
              <option value="fortinet_fortios">Fortinet FortiOS</option>
              <option value="palo_alto_panos">Palo Alto PAN-OS</option>
              <option value="arista_eos">Arista EOS</option>
              <option value="linux_iptables">Linux Routing (iptables/nftables)</option>
            </select>
          </div>

          {/* Field 3: Compliance Framework */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Compliance Standard Baseline
            </label>
            <select
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-cyan-400 font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="all">🌐 All Supported Standards (Comprehensive)</option>
              <option value="cis">🛡️ CIS Benchmarks (v2.0)</option>
              <option value="nist_800_53">🏛️ NIST SP 800-53 (Rev 5)</option>
              <option value="disa_stig">⚔️ DISA STIG (DoD CAT I/II/III)</option>
              <option value="cert_in">🇮🇳 CERT-In Mandatory Directions</option>
              <option value="iso_27001">🔒 ISO/IEC 27001 Annex A</option>
            </select>
          </div>

        </div>
      </div>

      {/* Editor & Upload Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left: Drag & Drop Zone */}
        <div className="lg:col-span-1 space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all flex flex-col items-center justify-center min-h-[220px] ${
              dragOver ? 'border-cyan-400 bg-cyan-950/20' : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
            }`}
          >
            <UploadCloud className="h-10 w-10 text-cyan-400 mb-3" />
            <p className="text-xs font-bold text-white">Drag & Drop Config File</p>
            <p className="text-[11px] text-slate-400 mt-1 mb-3">Supports .cfg, .conf, .txt, .json</p>
            
            <label className="cursor-pointer px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-lg border border-slate-700 transition-all">
              <span>Browse File</span>
              <input type="file" onChange={handleFileUpload} className="hidden" accept=".cfg,.conf,.txt,.json,.xml" />
            </label>
          </div>

          {/* Quick Stats Box */}
          <div className="glass-card rounded-xl p-4 border border-cyber-border space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Lines:</span>
              <span className="font-mono font-bold text-white">{lineCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Byte Size:</span>
              <span className="font-mono font-bold text-white">{(rawConfig.length / 1024).toFixed(2)} KB</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>AST Tokenizer:</span>
              <span className="text-emerald-400 font-semibold">Ready</span>
            </div>
          </div>
        </div>

        {/* Right: Code Text Area with Line Numbers */}
        <div className="lg:col-span-3 space-y-3">
          <div className="relative rounded-xl border border-cyber-border bg-slate-950 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 font-mono">
              <span>RAW RUNNING-CONFIG EDITOR</span>
              <button 
                onClick={() => setRawConfig('')}
                className="text-slate-400 hover:text-rose-400 text-[11px] flex items-center space-x-1"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Clear</span>
              </button>
            </div>
            
            <textarea
              value={rawConfig}
              onChange={(e) => setRawConfig(e.target.value)}
              placeholder="Paste raw configuration text here (e.g. Cisco 'show running-config', Juniper 'show configuration', Fortinet 'show full-configuration')..."
              rows={16}
              className="w-full bg-slate-950 text-slate-200 font-mono text-xs p-4 focus:outline-none resize-none selection:bg-cyan-500/30 leading-relaxed"
              spellCheck="false"
            />
          </div>

          {/* Action Button: Audit Trigger */}
          <div className="flex justify-end pt-1">
            <button
              onClick={onRunScan}
              disabled={loading || !rawConfig.trim()}
              className={`flex items-center space-x-2.5 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-xl transition-all ${
                loading || !rawConfig.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 cyber-glow active:scale-95'
              }`}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Running AI Security Audit...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-cyan-300" />
                  <span>Execute Compliance Audit</span>
                  <Play className="h-4 w-4 fill-current ml-1" />
                </>
              )}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
