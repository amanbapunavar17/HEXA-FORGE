import os
import glob
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from .models import (
    ScanRequest, AuditResult, DriftAnalysisResult,
    ChatMessage, VendorType, ComplianceFramework
)
from .engine.compliance_engine import ComplianceEngine
from .engine.drift_engine import DriftDetectionEngine
from .engine.ai_copilot import AICopilotEngine
from .parsers.universal_parser import UniversalConfigParser

app = FastAPI(
    title="SIH26155: AI-Driven Multi-Vendor Network Security Compliance Auditor",
    description="Automated multi-vendor network compliance auditing, drift detection, and remediation platform.",
    version="1.0.0"
)

# Enable CORS for frontend Vite dev server (e.g. localhost:5173, localhost:3000, localhost:8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SAMPLE_CONFIGS_DIR = os.path.join(os.path.dirname(__file__), "data", "sample_configs")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SIH26155-Compliance-Auditor-Engine",
        "version": "1.0.0",
        "standards_supported": ["CIS Benchmarks", "NIST SP 800-53 Rev 5", "DISA STIG", "CERT-In", "ISO 27001"]
    }

@app.get("/api/sample-configs")
def get_sample_configs():
    samples = []
    if os.path.exists(SAMPLE_CONFIGS_DIR):
        for fpath in glob.glob(os.path.join(SAMPLE_CONFIGS_DIR, "*.*")):
            fname = os.path.basename(fpath)
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                
                vendor = UniversalConfigParser.detect_vendor(content)
                samples.append({
                    "id": fname,
                    "filename": fname,
                    "vendor": vendor.value,
                    "title": fname.replace("_", " ").replace(".cfg", "").replace(".conf", "").title(),
                    "content": content
                })
            except Exception as e:
                pass
    return samples

@app.post("/api/scan", response_model=AuditResult)
def scan_configuration(request: ScanRequest):
    if not request.raw_config.strip():
        raise HTTPException(status_code=400, detail="Configuration content cannot be empty.")
    
    result = ComplianceEngine.audit_configuration(request)
    return result

@app.post("/api/drift", response_model=DriftAnalysisResult)
def analyze_drift(payload: dict):
    baseline = payload.get("baseline_config", "")
    current = payload.get("current_config", "")
    device_name = payload.get("device_name", "Core-Router-HQ-01")
    vendor = payload.get("vendor", "cisco_ios")

    if not baseline or not current:
        # Fallback to sample baseline and vulnerable config if not supplied
        vulnerable_path = os.path.join(SAMPLE_CONFIGS_DIR, "cisco_vulnerable_core.cfg")
        hardened_path = os.path.join(SAMPLE_CONFIGS_DIR, "cisco_hardened_core.cfg")
        if os.path.exists(hardened_path) and os.path.exists(vulnerable_path):
            with open(hardened_path, "r") as f: baseline = f.read()
            with open(vulnerable_path, "r") as f: current = f.read()

    return DriftDetectionEngine.analyze_drift(baseline, current, device_name, vendor)

@app.post("/api/chat")
def chat_copilot(msg: ChatMessage):
    response_text = AICopilotEngine.generate_response(msg.content)
    return {
        "role": "assistant",
        "content": response_text
    }

@app.get("/api/devices")
def get_enterprise_fleet():
    """
    Returns mock multi-vendor network topology nodes with live posture indicators.
    """
    return [
        {
            "id": "node-1",
            "name": "Core-Router-HQ-01",
            "type": "Router",
            "vendor": "Cisco IOS-XE",
            "ip": "203.0.113.1",
            "status": "NON_COMPLIANT",
            "compliance_score": 37.5,
            "critical_issues": 3,
            "connected_to": ["node-2", "node-3"]
        },
        {
            "id": "node-2",
            "name": "Juniper-Edge-MX204",
            "type": "Edge Gateway",
            "vendor": "Juniper Junos",
            "ip": "198.51.100.2",
            "status": "WARNING",
            "compliance_score": 62.5,
            "critical_issues": 1,
            "connected_to": ["node-1", "node-4"]
        },
        {
            "id": "node-3",
            "name": "FortiGate-Perimeter-FW",
            "type": "Firewall",
            "vendor": "Fortinet FortiOS",
            "ip": "192.0.2.1",
            "status": "NON_COMPLIANT",
            "compliance_score": 25.0,
            "critical_issues": 4,
            "connected_to": ["node-1", "node-5"]
        },
        {
            "id": "node-4",
            "name": "Distribution-Switch-Dist01",
            "type": "L3 Switch",
            "vendor": "Arista EOS",
            "ip": "10.10.20.1",
            "status": "COMPLIANT",
            "compliance_score": 91.0,
            "critical_issues": 0,
            "connected_to": ["node-2"]
        },
        {
            "id": "node-5",
            "name": "DMZ-Linux-SecGateway",
            "type": "Security Gateway",
            "vendor": "Linux iptables",
            "ip": "10.10.50.1",
            "status": "COMPLIANT",
            "compliance_score": 87.5,
            "critical_issues": 0,
            "connected_to": ["node-3"]
        }
    ]

# Mount frontend build if dist directory exists
FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
