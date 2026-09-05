import os
import sys
import webbrowser
import uvicorn

# Ensure current directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.main import app

def start_server():
    print("=" * 70)
    print("  SIH26155: AI-Driven Multi-Vendor Network Security Compliance Auditor")
    print("  Sponsored by: National Technical Research Organisation (NTRO)")
    print("=" * 70)
    print("  [+] Starting Web Server on http://localhost:8000")
    print("  [+] Multi-Vendor Parser: Cisco IOS, Juniper Junos, FortiOS, PAN-OS")
    print("  [+] Compliance Frameworks: CIS, NIST SP 800-53, DISA STIG, CERT-In")
    print("  [+] Opening dashboard in browser...")
    print("=" * 70)
    
    # Try opening browser after start
    try:
        webbrowser.open("http://localhost:8000")
    except Exception:
        pass

    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=False)

if __name__ == "__main__":
    start_server()
