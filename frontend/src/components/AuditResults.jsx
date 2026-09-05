import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Terminal, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Code2,
  FileCheck2,
  Filter
} from 'lucide-react';

export default function AuditResults({ auditResult, onSelectRemediation, setActiveTab }) {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);

  if (!auditResult || !auditResult.findings) {
    return (
      <div className="glass-card rounded-xl p-12 text-center border border-cyber-border space-y-4">
        <ShieldCheck className="h-12 w-12 text-slate-600 mx-auto" />
        <h3 className="text-base font-bold text-white">No Audit Executed Yet</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Please run a scan from the "Device Audit & Ingestion" tab or load one of the preset multi-vendor configurations.
        </p>
        <button
          onClick={() => setActiveTab('scanner')}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold"
        >
          Go to Scanner
        </button>
      </div>
    );
  }

  const { summary, findings } = auditResult;

  const filteredFindings = findings.filter(f => {
    if (filterSeverity !== 'ALL' && f.severity !== filterSeverity) return false;
    if (filterStatus !== 'ALL' && f.status !== filterStatus) return false;
    return true;
  });

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      case 'LOW':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Results Header */}
      <div className="glass-card rounded-xl p-6 border border-cyber-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase text-cyan-400">{summary.vendor}</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">{summary.device_name}</span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">
            Audit Findings & Compliance Scorecard ({findings.length} Rules)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit ID: <span className="font-mono text-slate-300">{auditResult.audit_id}</span> | Timestamp: {summary.timestamp}
          </p>
        </div>

        {/* Mini Posture Pill */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Score</span>
            <span className={`text-lg font-extrabold ${summary.compliance_score >= 80 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {summary.compliance_score}%
            </span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Violations</span>
            <span className="text-lg font-extrabold text-rose-400">{summary.failed_rules}</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300">Filters:</span>
          
          {/* Status Filter */}
          <div className="flex space-x-1">
            {['ALL', 'FAIL', 'PASS'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  filterStatus === status
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {status === 'ALL' ? 'All Rules' : status === 'FAIL' ? 'Violations' : 'Compliant'}
              </button>
            ))}
          </div>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center space-x-1 text-xs">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                filterSeverity === sev
                  ? 'bg-slate-700 text-white border border-slate-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-3">
        {filteredFindings.map((finding) => {
          const isExpanded = expandedId === finding.rule_id;
          const isPass = finding.status === 'PASS';

          return (
            <div
              key={finding.rule_id}
              className={`glass-card rounded-xl border transition-all ${
                isPass 
                  ? 'border-emerald-500/20 bg-emerald-950/5' 
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Summary Header */}
              <div 
                onClick={() => toggleExpand(finding.rule_id)}
                className="p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 shrink-0">
                    {isPass ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="h-5 w-5 text-rose-400" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-300">{finding.rule_id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getSeverityBadge(finding.severity)}`}>
                        {finding.severity}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">
                        {finding.category}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{finding.title}</h4>
                    <p className="text-xs text-slate-400 font-mono">{finding.benchmark_ref}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-center shrink-0">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    isPass ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {finding.status}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Card Expanded Details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-4 text-xs">
                  
                  {/* Description & Threat Rationale */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                      <span className="text-slate-400 font-semibold block">Compliance Requirement:</span>
                      <p className="text-slate-200 leading-relaxed">{finding.description}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20 space-y-1">
                      <span className="text-rose-400 font-semibold block">Security Threat & Impact Rationale:</span>
                      <p className="text-rose-200/90 leading-relaxed">{finding.rationale}</p>
                    </div>
                  </div>

                  {/* Affected Lines in Configuration */}
                  {finding.affected_lines && finding.affected_lines.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-slate-400 font-semibold flex items-center space-x-1.5">
                        <Code2 className="h-3.5 w-3.5 text-amber-400" />
                        <span>Detected Vulnerable Lines in Device Config:</span>
                      </span>
                      <div className="p-3 rounded-lg bg-slate-950 border border-amber-500/30 font-mono text-[11px] text-amber-300 space-y-1">
                        {finding.affected_lines.map((line, lidx) => (
                          <div key={lidx} className="flex items-center space-x-2">
                            <span className="text-slate-600 select-none">{lidx + 1} |</span>
                            <span>{line}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Remediation Action CTA */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-400">
                      Standard: <span className="font-semibold text-white">{finding.framework}</span>
                    </span>
                    <button
                      onClick={() => {
                        onSelectRemediation(finding);
                        setActiveTab('remediation');
                      }}
                      className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
                    >
                      <Terminal className="h-3.5 w-3.5" />
                      <span>Open Remediation Script in Studio</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
