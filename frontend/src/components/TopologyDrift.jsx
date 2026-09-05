import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Server, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  Activity, 
  RefreshCw,
  Clock,
  Layers
} from 'lucide-react';

export default function TopologyDrift({ onSelectDevice }) {
  const [devices, setDevices] = useState([]);
  const [driftResult, setDriftResult] = useState(null);
  const [loadingDrift, setLoadingDrift] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('topology'); // 'topology' or 'drift'

  useEffect(() => {
    fetchDevices();
    fetchDriftAnalysis();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/devices');
      if (res.ok) {
        const data = await res.json();
        setDevices(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDriftAnalysis = async () => {
    setLoadingDrift(true);
    try {
      const res = await fetch('/api/drift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_name: "Core-Router-HQ-01", vendor: "cisco_ios" })
      });
      if (res.ok) {
        const data = await res.json();
        setDriftResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDrift(false);
    }
  };

  const getNodeBadgeColor = (status) => {
    if (status === 'COMPLIANT') return 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400';
    if (status === 'WARNING') return 'border-amber-500/40 bg-amber-950/20 text-amber-400';
    return 'border-rose-500/40 bg-rose-950/20 text-rose-400';
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Sub-Navigation */}
      <div className="glass-card rounded-xl p-6 border border-cyber-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase text-cyan-400">Enterprise Fleet Architecture</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Continuous Monitoring</span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">
            Network Topology & Configuration Drift Visualizer
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-vendor infrastructure graph and cryptographic baseline integrity tracking.
          </p>
        </div>

        {/* Sub-tab switcher */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveSubTab('topology')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'topology'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Topology Map
          </button>
          <button
            onClick={() => setActiveSubTab('drift')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'drift'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Baseline Drift Tracker
          </button>
        </div>
      </div>

      {activeSubTab === 'topology' ? (
        /* Visual Topology Map */
        <div className="space-y-4">
          <div className="glass-card rounded-xl p-6 border border-cyber-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Server className="h-4 w-4 text-cyan-400" />
                <span>Heterogeneous Infrastructure Graph (Multi-Vendor)</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">5 Monitored Appliances</span>
            </div>

            {/* Visual Node Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
              {devices.map((device, idx) => (
                <div
                  key={device.id}
                  className={`p-5 rounded-xl border transition-all ${getNodeBadgeColor(device.status)} space-y-3 relative group hover:scale-[1.02] cursor-pointer`}
                  onClick={() => onSelectDevice && onSelectDevice(device)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800 text-slate-300 font-semibold">
                      {device.vendor}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {device.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {device.name}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">IP: {device.ip}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Compliance:</span>
                    <span className="font-bold font-mono text-white">{device.compliance_score}%</span>
                  </div>

                  {device.critical_issues > 0 && (
                    <div className="text-[11px] font-semibold text-rose-400 flex items-center space-x-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{device.critical_issues} Critical Finding(s)</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Configuration Drift Detection View */
        <div className="space-y-4">
          <div className="glass-card rounded-xl p-6 border border-cyber-border space-y-4">
            
            {/* Drift Summary Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white uppercase">Device Target:</span>
                  <span className="text-xs font-mono text-cyan-400">{driftResult?.device_name} ({driftResult?.vendor})</span>
                </div>
                <p className="text-xs text-rose-300 font-medium">
                  {driftResult?.security_summary}
                </p>
              </div>

              <button
                onClick={fetchDriftAnalysis}
                disabled={loadingDrift}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold self-start sm:self-auto"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingDrift ? 'animate-spin' : ''}`} />
                <span>Re-poll Live Config</span>
              </button>
            </div>

            {/* Diff View Box */}
            <div className="rounded-xl border border-cyber-border bg-slate-950 overflow-hidden font-mono text-xs shadow-2xl">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-slate-400">
                <span>CONFIG DRIFT DIFF (GOLDEN BASELINE vs LIVE RUNNING)</span>
                <span className="text-[11px] text-cyan-400 font-sans">
                  Red: Removed Baseline Protection | Green: Live Added Command
                </span>
              </div>

              <div className="p-4 space-y-1 max-h-[450px] overflow-y-auto">
                {driftResult?.diff_items.map((item, idx) => {
                  let bgClass = 'text-slate-400';
                  let symbol = '  ';
                  
                  if (item.type === 'added') {
                    bgClass = item.is_violation ? 'bg-rose-950/40 text-rose-300 border-l-2 border-rose-500' : 'bg-emerald-950/30 text-emerald-300 border-l-2 border-emerald-500';
                    symbol = '+ ';
                  } else if (item.type === 'removed') {
                    bgClass = 'bg-rose-950/20 text-rose-400/80 border-l-2 border-rose-400';
                    symbol = '- ';
                  }

                  return (
                    <div key={idx} className={`p-1.5 rounded flex items-start justify-between gap-4 ${bgClass}`}>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-600 select-none w-8 text-right">{item.line_number}</span>
                        <span className="font-bold select-none">{symbol}</span>
                        <span>{item.content}</span>
                      </div>

                      {item.security_impact && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0 font-sans font-bold">
                          {item.security_impact}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
