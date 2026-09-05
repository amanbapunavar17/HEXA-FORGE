# 🛡️ SIH26155: AI-Driven Multi-Vendor Network Security Compliance Auditor

> **Smart India Hackathon (SIH 2026)**  
> **Problem Statement ID:** `SIH26155`  
> **Organization:** National Technical Research Organisation (NTRO)  
> **Theme:** Blockchain & Cybersecurity  
> **Category:** Software  

---

## 📌 Executive Summary

Enterprise and strategic government networks are composed of multi-vendor appliances (Cisco, Juniper, Fortinet, Palo Alto, Linux/Arista). Auditing these devices against strict defense & national benchmarks (**CIS Benchmarks**, **NIST SP 800-53**, **DISA STIG**, **CERT-In Directions**, and **ISO 27001**) is traditionally slow, manual, and error-prone.

This platform provides an **AI-driven, vendor-agnostic compliance auditor** that ingests heterogeneous network configurations, maps security violations to authoritative benchmarks, calculates weighted risk scores, generates automated remediation playbooks (Ansible & CLI), and tracks real-time configuration drift.

---

## 🚀 Key Features & Capabilities

1. **Vendor-Agnostic Abstract Syntax Tree (AST) Ingestion:**
   - Universal parsing for **Cisco IOS/IOS-XE**, **Juniper Junos**, **Fortinet FortiOS**, **Palo Alto PAN-OS**, **Arista EOS**, and **Linux iptables/nftables**.
   - Automatic vendor detection from raw text or uploaded configuration files (`.cfg`, `.conf`, `.txt`, `.json`).

2. **Multi-Standard Security Compliance Engine:**
   - Evaluates configurations against:
     - **CIS Benchmarks** (Level 1 & Level 2 hardening)
     - **NIST SP 800-53 (Rev 5)** (AC-3, AC-17, AU-2, AU-8, IA-5, SC-8, SC-13)
     - **DISA STIG** (DoD CAT I / CAT II / CAT III findings)
     - **CERT-In Directives** (Centralized logging & NTP time synchronization)
     - **ISO/IEC 27001** Annex A network controls

3. **Zero-Touch Automated Remediation Studio:**
   - Instant generation of vendor-specific CLI command scripts.
   - Production-ready **Ansible Playbooks (`.yml`)** for automated mass fleet patching.
   - Context-aware AI explanations of *why* the vulnerability exists and *how* the patch remediates it.

4. **Network Topology & Baseline Drift Detection:**
   - Multi-vendor infrastructure topology map with live compliance health status indicators.
   - Side-by-side configuration diff comparing approved Golden Images against live running configs to flag shadow administrator injection, disabled logging, and unauthorized port openings.

5. **Official Executive Audit Report Generator:**
   - Print/Save as PDF with official NTRO and SIH headers, executive risk summaries, findings matrix, and auditor cryptographic sign-off.
   - Raw JSON / CSV export for SIEM integration.

6. **Interactive AI Security Copilot:**
   - Live AI analyst ready to answer technical compliance questions, explain security frameworks, and assist during hackathon presentations.

---

## 🛠️ Quick Start & Running the Prototype

### Option 1: Single-Command Launch (Recommended)
Open a terminal in this directory and run:
```bash
python main.py
```
*The prototype will start on `http://localhost:8000` and automatically open in your browser.*

### Option 2: Windows Batch / PowerShell Launcher
- Double-click `run_demo.bat` or execute `./run_demo.ps1`.

### Option 3: Full Development Mode (FastAPI + Vite Hot Reload)
If you wish to edit frontend code with instant hot-reloading:
1. Start backend:
   ```bash
   python -m uvicorn backend.main:app --port 8000 --reload
   ```
2. Start frontend dev server:
   ```bash
   cd frontend
   npm run dev
   ```
   Open `http://localhost:5173`.

---

## 🎯 Internal Hackathon Presentation Guide (For Judges)

1. **Step 1: Executive Dashboard (Tab 1)**
   - Show the overall compliance score (42.8%), risk index (7.8/10.0), and the multi-framework radar chart comparing CIS, NIST, DISA STIG, and CERT-In.
2. **Step 2: Multi-Vendor Ingestion (Tab 2)**
   - Load `cisco_vulnerable_core.cfg` from the preset dropdown to show automatic syntax parsing and detection of insecure Telnet, weak cleartext password, default SNMP strings, and wildcard `permit any any` ACLs.
   - Switch to `juniper_edge_router.conf` or `fortinet_firewall.conf` to demonstrate vendor-agnostic handling.
3. **Step 3: Audit Findings Breakdown (Tab 3)**
   - Filter by `CRITICAL` findings. Expand a finding to show the exact extracted lines from the config file and the specific regulatory citations.
4. **Step 4: Zero-Touch Remediation Studio (Tab 4)**
   - Show the generated Cisco CLI commands and toggle to the **Ansible Playbook (.yml)** tab. Click **Download** or **Copy** to demonstrate automated patching readiness.
5. **Step 5: Topology & Drift Detection (Tab 5)**
   - Switch to the **Baseline Drift Tracker** to show real-time detection of unauthorized changes between the approved golden image and live running state.
6. **Step 6: Official Audit Report (Tab 6)**
   - Click **Print / Save as PDF** to show the professional NTRO-formatted audit report ready for executive delivery.
7. **Step 7: Ask the AI Copilot (Top Right Button)**
   - Open the Copilot and click the quick prompt: *"Why does 'permit any any' violate Zero Trust?"* to show real-time interactive AI assistance.

---

## 📁 Repository Structure

```
sih26155-network-auditor/
├── backend/
│   ├── main.py                  # FastAPI server & static file host
│   ├── models.py                # Data schemas (AuditResult, Finding, Drift)
│   ├── parsers/
│   │   └── universal_parser.py  # Multi-vendor AST extractor & detector
│   ├── rules/
│   │   └── compliance_rules.py  # CIS, NIST, DISA STIG, CERT-In rule definitions
│   ├── engine/
│   │   ├── compliance_engine.py # Core compliance auditor & risk calculator
│   │   ├── drift_engine.py      # Baseline vs live config drift analyzer
│   │   └── ai_copilot.py        # Intelligent cybersecurity assistant
│   └── data/
│       └── sample_configs/      # Cisco, Juniper, Fortinet, Palo Alto configs
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── DashboardOverview.jsx
│   │   │   ├── ConfigScanner.jsx
│   │   │   ├── AuditResults.jsx
│   │   │   ├── RemediationStudio.jsx
│   │   │   ├── TopologyDrift.jsx
│   │   │   ├── AuditReport.jsx
│   │   │   └── AICopilotModal.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── dist/                    # Pre-bundled production assets
├── main.py                      # 1-Click root application launcher
├── run_demo.bat                 # Windows Batch Launcher
├── run_demo.ps1                 # PowerShell Launcher
└── README.md                    # Project documentation & pitch guide
```
