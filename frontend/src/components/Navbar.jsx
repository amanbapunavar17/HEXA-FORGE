import React from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Terminal, 
  GitBranch, 
  FileText, 
  Bot, 
  Server,
  Zap
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenCopilot, stats }) {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: Activity },
    { id: 'scanner', label: 'Device Audit & Ingestion', icon: ShieldCheck },
    { id: 'results', label: 'Audit Findings', icon: Server, badge: stats?.failed_rules },
    { id: 'remediation', label: 'Remediation Studio', icon: Terminal },
    { id: 'topology', label: 'Topology & Drift', icon: GitBranch },
    { id: 'report', label: 'Official Audit Report', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyber-border bg-cyber-darker/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Hackathon Tag */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-500 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="h-full w-full bg-cyber-darker rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-wide">SIH26155</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  NTRO Spoc
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">AI Multi-Vendor Security Auditor</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-full text-[10px]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: AI Copilot & Status */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Parser Engine Active</span>
            </div>

            <button
              onClick={onOpenCopilot}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all active:scale-95"
            >
              <Bot className="h-4 w-4" />
              <span>Ask AI Copilot</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
