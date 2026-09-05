from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from enum import Enum

class SeverityLevel(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"

class RuleStatus(str, Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    WARNING = "WARNING"
    MANUAL_REVIEW = "MANUAL_REVIEW"

class VendorType(str, Enum):
    CISCO_IOS = "cisco_ios"
    JUNIPER_JUNOS = "juniper_junos"
    FORTINET_FORTIOS = "fortinet_fortios"
    PALO_ALTO = "palo_alto_panos"
    ARISTA_EOS = "arista_eos"
    LINUX_IPTABLES = "linux_iptables"
    AUTO_DETECT = "auto_detect"

class ComplianceFramework(str, Enum):
    ALL = "all"
    CIS = "cis"
    NIST = "nist_800_53"
    DISA_STIG = "disa_stig"
    CERT_IN = "cert_in"
    ISO27001 = "iso_27001"

class Finding(BaseModel):
    rule_id: str
    title: str
    framework: str
    benchmark_ref: str
    severity: SeverityLevel
    status: RuleStatus
    category: str
    description: str
    affected_lines: List[str] = []
    rationale: str
    remediation_cli: str
    remediation_ansible: str
    cve_or_cwe: Optional[str] = None

class AuditSummary(BaseModel):
    device_name: str
    vendor: str
    framework_selected: str
    timestamp: str
    total_rules: int
    passed_rules: int
    failed_rules: int
    warning_rules: int
    compliance_score: float # 0 to 100%
    risk_score: float # 0 to 10 (Criticality weighted)
    critical_violations: int
    high_violations: int
    medium_violations: int
    low_violations: int

class AuditResult(BaseModel):
    audit_id: str
    summary: AuditSummary
    findings: List[Finding]
    raw_config: str
    parsed_metadata: Dict[str, Any] = {}

class ScanRequest(BaseModel):
    raw_config: str
    device_name: Optional[str] = "Edge-Router-01"
    vendor: VendorType = VendorType.AUTO_DETECT
    framework: ComplianceFramework = ComplianceFramework.ALL

class DriftDiffItem(BaseModel):
    line_number: int
    type: str # added, removed, modified, unchanged
    content: str
    security_impact: Optional[str] = None
    is_violation: bool = False

class DriftAnalysisResult(BaseModel):
    device_id: str
    device_name: str
    vendor: str
    baseline_timestamp: str
    current_timestamp: str
    drift_detected: bool
    drift_score: float # 0 to 100%
    critical_unauthorized_changes: int
    diff_items: List[DriftDiffItem]
    security_summary: str

class ChatMessage(BaseModel):
    role: str # user, assistant, system
    content: str
    audit_context_id: Optional[str] = None
