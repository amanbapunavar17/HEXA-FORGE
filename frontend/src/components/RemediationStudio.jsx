import React, { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  Layers, 
  Play, 
  FileCode,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function RemediationStudio({ auditResult, selectedFinding, setSelectedFinding }) {
  const [viewMode, setViewMode] = useState('cli'); // 'cli' or 'ansible'
  const [copied, setCopied] = useState(false);

  const findings = auditResult?.findings || [];
  const failedFindings = findings.filter(f => f.status === 'FAIL');

  const currentFinding = selectedFinding || failedFindings[0] || findings[0];

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!currentFinding) return;
    const content = viewMode === 'cli' ? currentFinding.remediation_cli : currentFinding.remediation_ansible;
    const extension = viewMode === 'cli' ? 'txt' : 'yml';
    const filename = `remediation_${currentFinding.rule_id}_${viewMode}.${extension}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!currentFinding) {
    return (
      <div className="glass-card rounded-xl p-12 text-center border border-cyber-border space-y-3">
        <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
        <h3 className="text-base font-bold text-white">All Evaluated Rules Compliant!</h3>
        <p className="text-xs text-slate-400">
          No violations detected in the active configuration that require remediation.
        </p>
      </div>
    );
  }

  const activeContent = viewMode === 'cli' ? currentFinding.remediation_cli : currentFinding.remediation_ansible;

  return (
    <div className="space-y-6">
      
      {/* Studio Header */}
      <div className="glass-card rounded-xl p-6 border border-cyber-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase text-cyan-400">Automated Fix Generation</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Vendor-Tailored Hardening</span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">
            Zero-Touch Remediation Studio
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Generates vendor-specific CLI configuration commands and production-grade Ansible Playbooks.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setViewMode('cli')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'cli'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Vendor CLI Snippet</span>
          </button>

          <button
            onClick={() => setViewMode('ansible')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'ansible'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="h-3.5 w-3.5" />
            <span>Ansible Playbook (.yml)</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Finding Selector */}
        <div className="lg:col-span-1 glass-card rounded-xl p-5 border border-cyber-border space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Select Finding to Patch</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold">
              {failedFindings.length} Violations
            </span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {failedFindings.map((f) => {
              const isSelected = f.rule_id === currentFinding.rule_id;
              return (
                <div
                  key={f.rule_id}
                  onClick={() => setSelectedFinding(f)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-950/30 shadow-md'
                      : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono font-bold text-cyan-400">{f.rule_id}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300">
                      {f.severity}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{f.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 font-mono">{f.benchmark_ref}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Code Preview & Execution Terminal */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="rounded-xl border border-cyber-border bg-slate-950 overflow-hidden shadow-2xl">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/80"></div>
                <div className="h-3 w-3 rounded-full bg-amber-500/80"></div>
                <div className="h-3 w-3 rounded-full bg-emerald-500/80"></div>
                <span className="ml-2 text-xs font-mono text-slate-400">
                  {viewMode === 'cli' ? 'vendor_remediation_commands.cli' : 'playbook_remediation.yml'}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopy(activeContent)}
                  className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-all"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-1.5 px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded text-xs font-semibold transition-all"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="p-5 font-mono text-xs text-cyan-300 bg-slate-950 overflow-x-auto leading-relaxed min-h-[220px]">
              <pre>{activeContent}</pre>
            </div>
          </div>

          {/* AI Hardening Rationale Card */}
          <div className="glass-card rounded-xl p-5 border border-cyan-500/30 bg-cyan-950/10 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">AI Remediation Impact Analysis</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Applying this patch satisfies requirement <span className="font-semibold text-white">{currentFinding.benchmark_ref}</span>. 
              It enforces least privilege and strong cryptographic protections on the device plane without causing service interruption to existing established TCP data plane sessions.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
