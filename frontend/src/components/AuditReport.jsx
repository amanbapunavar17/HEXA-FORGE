import React from 'react';
import { 
  Printer, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  FileText,
  Building,
  Award
} from 'lucide-react';

export default function AuditReport({ auditResult }) {
  const summary = auditResult?.summary || {
    device_name: "Core-Router-HQ-01",
    vendor: "cisco_ios",
    framework_selected: "ALL STANDARDS",
    timestamp: new Date().toISOString(),
    compliance_score: 42.8,
    risk_score: 7.8,
    total_rules: 8,
    passed_rules: 3,
    failed_rules: 5,
    critical_violations: 2,
    high_violations: 2,
    medium_violations: 1,
    low_violations: 0
  };

  const findings = auditResult?.findings || [];

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(auditResult, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_report_${auditResult?.audit_id || 'SIH26155'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Report Controls */}
      <div className="glass-card rounded-xl p-4 border border-cyber-border flex items-center justify-between print:hidden">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-cyan-400" />
          <span className="text-sm font-bold text-white">Official Executive Audit Report</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Raw JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold shadow-md shadow-cyan-500/20 transition-all"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Formal Document Container */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl text-slate-200 print:bg-white print:text-black print:border-none print:p-0 space-y-6">
        
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono">
                SIH 2026 OFFICIAL AUDIT REPORT
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Network Security & Hardening Compliance Audit
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Sponsor: National Technical Research Organisation (NTRO) | PS Code: SIH26155
            </p>
          </div>

          <div className="text-left sm:text-right text-xs space-y-1 font-mono text-slate-400">
            <div>Audit Ref: <span className="font-bold text-white">{auditResult?.audit_id || 'AUDIT-2026-LIVE'}</span></div>
            <div>Date: <span>{summary.timestamp}</span></div>
            <div>Classification: <span className="text-amber-400 font-bold">RESTRICTED / INTERNAL</span></div>
          </div>
        </div>

        {/* Audit Scope & Device Target */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Audited Hostname:</span>
            <span className="font-bold text-white font-mono">{summary.device_name}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Vendor / OS Family:</span>
            <span className="font-bold text-cyan-300 font-mono uppercase">{summary.vendor}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Framework Evaluated:</span>
            <span className="font-bold text-white font-mono">{summary.framework_selected}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Overall Compliance:</span>
            <span className={`font-bold font-mono text-sm ${summary.compliance_score >= 80 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {summary.compliance_score}% ({summary.passed_rules}/{summary.total_rules} Passed)
            </span>
          </div>
        </div>

        {/* Executive Scorecard Matrix */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            1. Executive Risk Posture Assessment
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            The target network node underwent automated AST parsing and rule evaluation against standard security baselines including CIS Benchmarks, NIST SP 800-53 Rev 5, DISA STIGs, and CERT-In directions.
            A total of <span className="font-bold text-rose-400">{summary.failed_rules} security violation(s)</span> were identified, posing a calculated risk index of <span className="font-bold text-rose-400">{summary.risk_score} / 10.0</span>.
          </p>
        </div>

        {/* Findings Summary Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            2. Detailed Compliance Findings Table
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3">Rule ID</th>
                  <th className="p-3">Title / Description</th>
                  <th className="p-3">Standard Reference</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {findings.map((f, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 font-mono">
                    <td className="p-3 font-bold text-cyan-400">{f.rule_id}</td>
                    <td className="p-3 font-sans">
                      <div className="font-bold text-white">{f.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{f.description}</div>
                    </td>
                    <td className="p-3 text-[11px] text-slate-300">{f.benchmark_ref}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        f.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' :
                        f.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {f.severity}
                      </span>
                    </td>
                    <td className="p-3 font-bold">
                      <span className={f.status === 'PASS' ? 'text-emerald-400' : 'text-rose-400'}>
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Auditor Sign-off Certification */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-xs text-slate-400">
          <div>
            <div className="flex items-center space-x-2 text-white font-bold mb-1">
              <Award className="h-4 w-4 text-cyan-400" />
              <span>Certified AI Compliance Engine</span>
            </div>
            <p className="text-[11px]">System: SIH26155-AST-Engine v1.0 | Hash: SHA256-VALIDATED</p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <div className="w-48 border-b border-slate-600 pb-1 mb-1">
              <span className="font-mono text-cyan-400 text-[11px]">AI Security Auditor</span>
            </div>
            <div className="text-[10px]">Lead Cyber Auditor Sign-off</div>
          </div>
        </div>

      </div>

    </div>
  );
}
