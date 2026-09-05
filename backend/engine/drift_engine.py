import difflib
import datetime
from typing import List
from ..models import DriftAnalysisResult, DriftDiffItem

class DriftDetectionEngine:
    """
    Analyzes configuration changes between an approved security baseline
    and current device running configuration to detect policy drift and shadow modifications.
    """

    @classmethod
    def analyze_drift(cls, baseline_config: str, current_config: str, device_name: str = "Core-Router-01", vendor: str = "cisco_ios") -> DriftAnalysisResult:
        base_lines = [l.strip() for l in baseline_config.splitlines() if l.strip() and not l.strip().startswith('!')]
        curr_lines = [l.strip() for l in current_config.splitlines() if l.strip() and not l.strip().startswith('!')]

        differ = difflib.ndiff(base_lines, curr_lines)
        diff_items: List[DriftDiffItem] = []
        critical_unauth_count = 0

        line_num = 1
        for d in differ:
            code = d[:2]
            text = d[2:].strip()
            if not text:
                continue

            if code == "- ":
                diff_items.append(DriftDiffItem(
                    line_number=line_num,
                    type="removed",
                    content=text,
                    security_impact=cls._evaluate_removal_impact(text),
                    is_violation=bool(cls._evaluate_removal_impact(text))
                ))
                line_num += 1
            elif code == "+ ":
                impact = cls._evaluate_addition_impact(text)
                if "CRITICAL" in (impact or "") or "HIGH" in (impact or ""):
                    critical_unauth_count += 1
                diff_items.append(DriftDiffItem(
                    line_number=line_num,
                    type="added",
                    content=text,
                    security_impact=impact,
                    is_violation=bool(impact)
                ))
                line_num += 1
            elif code == "  ":
                diff_items.append(DriftDiffItem(
                    line_number=line_num,
                    type="unchanged",
                    content=text,
                    security_impact=None,
                    is_violation=False
                ))
                line_num += 1

        total_diffs = sum(1 for item in diff_items if item.type in ["added", "removed"])
        drift_detected = total_diffs > 0
        drift_score = min(round((total_diffs / max(len(base_lines), 1)) * 100, 1), 100.0)

        summary_msg = f"Detected {total_diffs} configuration change(s). "
        if critical_unauth_count > 0:
            summary_msg += f"ALERT: {critical_unauth_count} critical/high security drift event(s) detected (unauthorized ports/shadow accounts)."
        elif drift_detected:
            summary_msg += "Minor drift detected without high-severity security breaches."
        else:
            summary_msg += "Configuration matches approved baseline 100%. No unauthorized drift detected."

        return DriftAnalysisResult(
            device_id="DEV-CORE-01",
            device_name=device_name,
            vendor=vendor,
            baseline_timestamp="2026-08-15 00:00:00 UTC (Approved Golden Image)",
            current_timestamp=datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC (Live Poll)"),
            drift_detected=drift_detected,
            drift_score=drift_score,
            critical_unauthorized_changes=critical_unauth_count,
            diff_items=diff_items,
            security_summary=summary_msg
        )

    @staticmethod
    def _evaluate_addition_impact(line: str) -> str:
        line_l = line.lower()
        if "telnet" in line_l:
            return "CRITICAL: Plaintext Telnet management protocol enabled."
        if "username" in line_l and ("admin" in line_l or "privilege 15" in line_l or "root" in line_l):
            return "HIGH: New privileged administrator account added out-of-band."
        if "permit any any" in line_l or "permit ip any any" in line_l:
            return "CRITICAL: Permissive wildcard ACL rule injected."
        if "snmp-server community" in line_l:
            return "MEDIUM: Insecure SNMP community string added."
        if "no logging" in line_l or "no ntp" in line_l:
            return "HIGH: Security auditing/logging service disabled."
        return None

    @staticmethod
    def _evaluate_removal_impact(line: str) -> str:
        line_l = line.lower()
        if "service password-encryption" in line_l:
            return "HIGH: Password encryption was removed."
        if "logging host" in line_l or "syslog" in line_l:
            return "CRITICAL: Centralized syslog forwarding was disabled."
        if "ntp server" in line_l:
            return "MEDIUM: NTP time synchronization server removed."
        return None
