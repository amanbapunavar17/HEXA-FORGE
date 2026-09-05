import uuid
import datetime
from typing import List, Dict, Any, Optional
from ..models import (
    ScanRequest, AuditResult, AuditSummary, Finding,
    SeverityLevel, RuleStatus, ComplianceFramework, VendorType
)
from ..parsers.universal_parser import UniversalConfigParser
from ..rules.compliance_rules import RULES_DATABASE

class ComplianceEngine:
    """
    Core Compliance Auditing Engine that evaluates multi-vendor network device
    configurations against industry and defense standards.
    """

    @classmethod
    def audit_configuration(cls, request: ScanRequest) -> AuditResult:
        audit_id = f"AUDIT-{datetime.datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        detected_vendor, parsed_meta = UniversalConfigParser.parse(request.raw_config, request.vendor)
        
        selected_framework = request.framework.value
        filtered_rules = []

        for rule in RULES_DATABASE:
            if selected_framework == "all" or selected_framework in rule["frameworks"]:
                filtered_rules.append(rule)

        findings: List[Finding] = []
        passed_count = 0
        failed_count = 0
        warning_count = 0
        crit_count = 0
        high_count = 0
        med_count = 0
        low_count = 0

        for rule in filtered_rules:
            # Evaluate rule
            is_compliant = rule["check"](parsed_meta)
            status = RuleStatus.PASS if is_compliant else RuleStatus.FAIL

            # Extract affected lines context
            affected = cls._find_affected_lines(rule["id"], parsed_meta["raw_lines"])

            # Map benchmark reference according to framework
            ref = rule["benchmark_refs"].get(
                selected_framework, 
                rule["benchmark_refs"].get("cis", "CIS Benchmark Standard")
            )

            # Extract vendor CLI fix
            cli_fix = rule["remediation_cli"].get(
                detected_vendor, 
                rule["remediation_cli"].get(VendorType.CISCO_IOS, "Manual configuration remediation required.")
            )

            finding = Finding(
                rule_id=rule["id"],
                title=rule["title"],
                framework=selected_framework.upper(),
                benchmark_ref=ref,
                severity=rule["severity"],
                status=status,
                category=rule["category"],
                description=rule["description"],
                affected_lines=affected if status == RuleStatus.FAIL else [],
                rationale=rule["rationale"],
                remediation_cli=cli_fix,
                remediation_ansible=rule["remediation_ansible"]
            )
            findings.append(finding)

            if status == RuleStatus.PASS:
                passed_count += 1
            else:
                failed_count += 1
                if rule["severity"] == SeverityLevel.CRITICAL:
                    crit_count += 1
                elif rule["severity"] == SeverityLevel.HIGH:
                    high_count += 1
                elif rule["severity"] == SeverityLevel.MEDIUM:
                    med_count += 1
                elif rule["severity"] == SeverityLevel.LOW:
                    low_count += 1

        total_rules = len(filtered_rules)
        compliance_pct = round((passed_count / total_rules * 100), 1) if total_rules > 0 else 100.0

        # Risk Index calculation: weighted severity formula (0.0 to 10.0 scale)
        weighted_risk = (crit_count * 3.5 + high_count * 2.0 + med_count * 1.0 + low_count * 0.4)
        risk_score = min(round(weighted_risk, 1), 10.0)

        summary = AuditSummary(
            device_name=request.device_name or parsed_meta["hostname"],
            vendor=detected_vendor.value,
            framework_selected=request.framework.value.upper(),
            timestamp=datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            total_rules=total_rules,
            passed_rules=passed_count,
            failed_rules=failed_count,
            warning_rules=warning_count,
            compliance_score=compliance_pct,
            risk_score=risk_score,
            critical_violations=crit_count,
            high_violations=high_count,
            medium_violations=med_count,
            low_violations=low_count
        )

        return AuditResult(
            audit_id=audit_id,
            summary=summary,
            findings=findings,
            raw_config=request.raw_config,
            parsed_metadata=parsed_meta
        )

    @staticmethod
    def _find_affected_lines(rule_id: str, raw_lines: List[str]) -> List[str]:
        matched = []
        for line in raw_lines:
            line_str = line.strip()
            if not line_str or line_str.startswith('!') or line_str.startswith('#'):
                continue
            if rule_id == "SEC-AAA-001" and ("password " in line_str or "username " in line_str):
                matched.append(line_str)
            elif rule_id == "SEC-SVC-002" and ("telnet" in line_str.lower() or "ip http server" in line_str.lower()):
                matched.append(line_str)
            elif rule_id == "SEC-CRY-003" and ("3des" in line_str.lower() or "md5" in line_str.lower() or "ssh" in line_str.lower()):
                matched.append(line_str)
            elif rule_id == "SEC-ACL-006" and ("permit any any" in line_str.lower() or "permit ip any any" in line_str.lower()):
                matched.append(line_str)
            elif rule_id == "SEC-SNMP-007" and ("snmp-server community" in line_str.lower()):
                matched.append(line_str)
        return matched[:5]
