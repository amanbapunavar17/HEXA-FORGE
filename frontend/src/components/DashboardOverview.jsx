import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Layers, 
  FileCheck, 
  ArrowRight,
  TrendingDown,
  Cpu,
  Lock
} from 'lucide-react';

export default function DashboardOverview({ auditResult, setActiveTab, onScanSample }) {
  const summary = auditResult?.summary || {
    device_name: "Core-Router-HQ-01",
    vendor: "cisco_ios",
    framework_selected: "ALL STANDARDS",
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

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
    if (score >= 50) return 'text-amber-400 border-amber-500/30 bg-amber-950/20';
    return 'text-rose-400 border-rose-500/30 bg-rose-950/20';
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: SIH Pitch Hook */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-cyan-950/80 border border-cyan-500/20 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
              <Zap className="h-3 w-3" />
              <span>National Technical Research Organisation (NTRO) Problem Statement</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI-Driven Multi-Vendor Network Compliance Auditor
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Automated multi-vendor AST parsing, real-time security benchmark evaluation (CIS, NIST, DISA STIG, CERT-In), zero-touch Ansible remediation, and configuration drift detection.
            </p>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setActiveTab('scanner')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <span>Scan New Configuration</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Overall Compliance Score */}
        <div className="glass-card rounded-xl p-5 border border-cyber-border relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Compliance Posture</span>
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{summary.compliance_score}%</span>
            <span className="text-xs text-slate-400">/ 100%</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                summary.compliance_score >= 80 ? 'bg-emerald-400' : summary.compliance_score >= 50 ? 'bg-amber-400' : 'bg-rose-500'
              }`}
              style={{ width: `${summary.compliance_score}%` }}
            ></div>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Target: ≥ 90% (Defense Standard)
          </p>
        </div>

        {/* Metric 2: Risk Threat Index */}
        <div className="glass-card rounded-xl p-5 border border-cyber-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Calculated Risk Index</span>
            <ShieldAlert className="h-5 w-5 text-rose-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-rose-400">{summary.risk_score}</span>
            <span className="text-xs text-slate-400">/ 10.0</span>
          </div>
          <p className="mt-3 text-xs text-rose-300/90 font-medium flex items-center space-x-1">
            <AlertTriangle className="h-3.5 w-3.5 inline mr-1" />
            <span>High Risk - Immediate Hardening Required</span>
          </p>
        </div>

        {/* Metric 3: Critical Violations */}
        <div className="glass-card rounded-xl p-5 border border-cyber-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Critical / High Violations</span>
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">
              {summary.critical_violations + summary.high_violations}
            </span>
            <span className="text-xs text-slate-400">issues</span>
          </div>
          <div className="mt-3 flex space-x-2 text-[11px]">
            <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded font-semibold border border-rose-500/30">
              {summary.critical_violations} Critical
            </span>
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded font-semibold border border-amber-500/30">
              {summary.high_violations} High
            </span>
          </div>
        </div>

        {/* Metric 4: Evaluated Device Target */}
        <div className="glass-card rounded-xl p-5 border border-cyber-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Audited Node</span>
            <Cpu className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="mt-3">
            <span className="text-lg font-bold text-white block truncate">{summary.device_name}</span>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">
              Vendor: {summary.vendor}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Rules Evaluated:</span>
            <span className="font-semibold text-slate-200">{summary.total_rules}</span>
          </div>
        </div>

      </div>

      {/* Middle Grid: Framework Compliance & Demo Scenarios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Framework Compliance Breakdown */}
        <div className="lg:col-span-2 glass-card rounded-xl p-6 border border-cyber-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Framework-Specific Compliance Breakdown</h2>
              <p className="text-xs text-slate-400">Current posture across benchmark authorities</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono">
              Live Audit Active
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { name: "CIS Benchmarks (Level 1 & 2)", score: 45, desc: "Password hashing, SSHv2, Banner, SNMP, ACLs", badge: "CIS Cisco / Junos" },
              { name: "NIST SP 800-53 (Rev 5)", score: 50, desc: "AC-3, AC-17, AU-2, AU-8, IA-5, SC-8, SC-13", badge: "Federal Security" },
              { name: "DISA STIG Network Baseline", score: 38, desc: "DoD CAT I & CAT II finding remediation", badge: "Defense Standard" },
              { name: "CERT-In Cyber Guidelines", score: 40, desc: "Mandatory NTP sync, centralized syslog logging", badge: "Indian Directive" },
            ].map((fw, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-white">{fw.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                      {fw.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{fw.desc}</p>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <div className="w-24 bg-slate-800 rounded-full h-2">
                    <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${fw.score}%` }}></div>
                  </div>
                  <span className="text-xs font-mono font-bold text-white w-10 text-right">{fw.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Demo Launchers for Judges */}
        <div className="glass-card rounded-xl p-6 border border-cyber-border space-y-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Live Demo Scenarios</h2>
          </div>
          <p className="text-xs text-slate-300">
            One-click preset audits demonstrating multi-vendor detection and rule evaluation for hackathon judges:
          </p>

          <div className="space-y-2.5">
            <button
              onClick={() => onScanSample('cisco_vulnerable_core.cfg')}
              className="w-full text-left p-3 rounded-lg bg-slate-900/80 hover:bg-slate-800/80 border border-rose-500/30 hover:border-rose-500/60 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-300">🔴 Cisco Core (Vulnerable)</span>
                <span className="text-[10px] text-slate-400 font-mono">IOS-XE 17.6</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Fails on Telnet, cleartext secret, SNMP public string, permit any any ACL.
              </p>
            </button>

            <button
              onClick={() => onScanSample('cisco_hardened_core.cfg')}
              className="w-full text-left p-3 rounded-lg bg-slate-900/80 hover:bg-slate-800/80 border border-emerald-500/30 hover:border-emerald-500/60 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-300">🟢 Cisco Core (Hardened)</span>
                <span className="text-[10px] text-slate-400 font-mono">100% Compliant</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Full CIS/NIST compliance with SHA-256 secret, SSHv2, NTP sync, central SIEM syslog.
              </p>
            </button>

            <button
              onClick={() => onScanSample('juniper_edge_router.conf')}
              className="w-full text-left p-3 rounded-lg bg-slate-900/80 hover:bg-slate-800/80 border border-cyan-500/30 hover:border-cyan-500/60 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cyan-300">🔵 Juniper Edge Router</span>
                <span className="text-[10px] text-slate-400 font-mono">Junos MX204</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Junos syntax AST parsing, SSHv1 warning, root plain-text password flag.
              </p>
            </button>

            <button
              onClick={() => onScanSample('fortinet_firewall.conf')}
              className="w-full text-left p-3 rounded-lg bg-slate-900/80 hover:bg-slate-800/80 border border-purple-500/30 hover:border-purple-500/60 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-300">🟣 Fortinet Perimeter FW</span>
                <span className="text-[10px] text-slate-400 font-mono">FortiOS 7.2</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Detects insecure admin ports, open management HTTP, and wildcard policy accept.
              </p>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
