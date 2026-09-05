import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from backend.main import app

def run_tests():
    client = TestClient(app)

    # 1. Health check
    r = client.get('/api/health')
    assert r.status_code == 200, f"Health failed: {r.text}"
    print("[+] Health check OK:", r.json()["service"])

    # 2. Sample configs
    r = client.get('/api/sample-configs')
    assert r.status_code == 200, f"Samples failed: {r.text}"
    samples = r.json()
    print(f"[+] Sample configs loaded: {len(samples)} files")

    # 3. Scan test
    scan_payload = {
        "raw_config": samples[0]["content"],
        "device_name": "Test-Router",
        "vendor": "cisco_ios",
        "framework": "all"
    }
    r = client.post('/api/scan', json=scan_payload)
    assert r.status_code == 200, f"Scan failed: {r.text}"
    audit_res = r.json()
    score = audit_res["summary"]["compliance_score"]
    fails = audit_res["summary"]["failed_rules"]
    print(f"[+] Scan OK! Score: {score}%, Violations: {fails}")

    # 4. Drift test
    r = client.post('/api/drift', json={})
    assert r.status_code == 200, f"Drift failed: {r.text}"
    drift_res = r.json()
    print(f"[+] Drift Analysis OK! Score: {drift_res['drift_score']}%, Critical Changes: {drift_res['critical_unauthorized_changes']}")

    # 5. Chat copilot test
    r = client.post('/api/chat', json={"role": "user", "content": "Why is permit any any a security risk?"})
    assert r.status_code == 200, f"Chat failed: {r.text}"
    print("[+] AI Copilot OK! Response length:", len(r.json()["content"]))

    # 6. Static SPA index.html verification
    r = client.get('/')
    assert r.status_code == 200, f"Root SPA failed: {r.text}"
    print("[+] Root SPA UI endpoint OK! Content-Type:", r.headers.get("content-type"))
    print("=== ALL SYSTEM VALIDATION TESTS PASSED 100% ===")

if __name__ == "__main__":
    run_tests()
