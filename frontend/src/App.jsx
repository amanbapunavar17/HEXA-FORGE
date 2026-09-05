import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardOverview from './components/DashboardOverview';
import ConfigScanner from './components/ConfigScanner';
import AuditResults from './components/AuditResults';
import RemediationStudio from './components/RemediationStudio';
import TopologyDrift from './components/TopologyDrift';
import AuditReport from './components/AuditReport';
import AICopilotModal from './components/AICopilotModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sampleConfigs, setSampleConfigs] = useState([]);
  const [rawConfig, setRawConfig] = useState('');
  const [deviceName, setDeviceName] = useState('Core-Router-HQ-01');
  const [vendor, setVendor] = useState('auto_detect');
  const [framework, setFramework] = useState('all');
  const [auditResult, setAuditResult] = useState(null);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSampleConfigs();
  }, []);

  const fetchSampleConfigs = async () => {
    try {
      const res = await fetch('/api/sample-configs');
      if (res.ok) {
        const samples = await res.json();
        setSampleConfigs(samples);
        
        // Auto-load the vulnerable cisco config as the default view
        const defaultSample = samples.find(s => s.filename.includes('vulnerable')) || samples[0];
        if (defaultSample) {
          setRawConfig(defaultSample.content);
          setDeviceName('Core-Router-HQ-01');
          
          // Trigger initial automated audit
          executeScan(defaultSample.content, 'Core-Router-HQ-01', 'cisco_ios', 'all');
        }
      }
    } catch (e) {
      console.error("Error fetching sample configs:", e);
    }
  };

  const executeScan = async (configContent, devName, targetVendor, targetFw) => {
    setLoading(true);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_config: configContent || rawConfig,
          device_name: devName || deviceName,
          vendor: targetVendor || vendor,
          framework: targetFw || framework
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAuditResult(data);
        if (data.findings && data.findings.length > 0) {
          const firstFail = data.findings.find(f => f.status === 'FAIL') || data.findings[0];
          setSelectedFinding(firstFail);
        }
      }
    } catch (e) {
      console.error("Scan execution failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunScan = async () => {
    await executeScan(rawConfig, deviceName, vendor, framework);
    setActiveTab('results');
  };

  const handleSelectSample = (filename) => {
    const found = sampleConfigs.find(s => s.filename === filename);
    if (found) {
      setRawConfig(found.content);
      setDeviceName(found.title.replace(/\s+/g, '-'));
      setVendor(found.vendor);
      executeScan(found.content, found.title.replace(/\s+/g, '-'), found.vendor, framework);
    }
  };

  const handleScanSampleAndJump = (filename) => {
    handleSelectSample(filename);
    setActiveTab('results');
  };

  return (
    <div className="min-h-screen bg-cyber-darker text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        stats={auditResult?.summary}
      />

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            auditResult={auditResult}
            setActiveTab={setActiveTab}
            onScanSample={handleScanSampleAndJump}
          />
        )}

        {activeTab === 'scanner' && (
          <ConfigScanner
            rawConfig={rawConfig}
            setRawConfig={setRawConfig}
            deviceName={deviceName}
            setDeviceName={setDeviceName}
            vendor={vendor}
            setVendor={setVendor}
            framework={framework}
            setFramework={setFramework}
            onRunScan={handleRunScan}
            loading={loading}
            sampleConfigs={sampleConfigs}
            onSelectSample={handleSelectSample}
          />
        )}

        {activeTab === 'results' && (
          <AuditResults
            auditResult={auditResult}
            onSelectRemediation={(finding) => {
              setSelectedFinding(finding);
              setActiveTab('remediation');
            }}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'remediation' && (
          <RemediationStudio
            auditResult={auditResult}
            selectedFinding={selectedFinding}
            setSelectedFinding={setSelectedFinding}
          />
        )}

        {activeTab === 'topology' && (
          <TopologyDrift
            onSelectDevice={(device) => {
              setDeviceName(device.name);
              setActiveTab('scanner');
            }}
          />
        )}

        {activeTab === 'report' && (
          <AuditReport
            auditResult={auditResult}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-cyber-border py-4 bg-cyber-dark text-slate-500 text-xs text-center print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Smart India Hackathon (SIH 2026) Prototype — Problem Statement <strong>SIH26155</strong></span>
          <span className="font-mono text-[11px] text-cyan-400/80">NTRO Sponsor • AI-Driven Multi-Vendor Auditor</span>
        </div>
      </footer>

      {/* AI Copilot Chat Modal */}
      <AICopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        auditResult={auditResult}
      />

    </div>
  );
}
