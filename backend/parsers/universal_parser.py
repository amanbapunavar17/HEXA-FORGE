import re
from typing import Dict, Any, Tuple
from ..models import VendorType

class UniversalConfigParser:
    """
    Vendor-agnostic configuration parser that ingests multi-vendor syntax
    and extracts key security attributes into a normalized abstract model.
    """

    @staticmethod
    def detect_vendor(raw_text: str) -> VendorType:
        text_lower = raw_text.lower()

        # Cisco indicators
        if "cisco" in text_lower or "service password-encryption" in text_lower or "line vty 0 4" in text_lower or "version 15." in text_lower or "version 16." in text_lower or "version 17." in text_lower:
            return VendorType.CISCO_IOS

        # Juniper indicators
        if "juniper" in text_lower or "junos" in text_lower or "system {" in text_lower or "interfaces {" in text_lower or "set system host-name" in text_lower:
            return VendorType.JUNIPER_JUNOS

        # Fortinet FortiOS indicators
        if "config system global" in text_lower or "config router" in text_lower or "config firewall policy" in text_lower or "fortios" in text_lower or "#config-version=" in text_lower:
            return VendorType.FORTINET_FORTIOS

        # Palo Alto PAN-OS indicators
        if "<config version=" in text_lower or "set deviceconfig" in text_lower or "set rulebase security" in text_lower or "pan-os" in text_lower or "paloalto" in text_lower:
            return VendorType.PALO_ALTO

        # Arista indicators
        if "arista" in text_lower or "management api http-commands" in text_lower or "eos" in text_lower:
            return VendorType.ARISTA_EOS

        # Linux iptables/nftables indicators
        if "*filter" in text_lower or "iptables" in text_lower or "nftables" in text_lower or ":input drop" in text_lower:
            return VendorType.LINUX_IPTABLES

        # Default fallback to Cisco IOS if ambiguous
        return VendorType.CISCO_IOS

    @classmethod
    def parse(cls, raw_text: str, vendor_override: VendorType = VendorType.AUTO_DETECT) -> Tuple[VendorType, Dict[str, Any]]:
        vendor = vendor_override if vendor_override != VendorType.AUTO_DETECT else cls.detect_vendor(raw_text)

        lines = [line.strip() for line in raw_text.splitlines() if line.strip() and not line.strip().startswith('!') and not line.strip().startswith('#')]

        metadata: Dict[str, Any] = {
            "hostname": cls._extract_hostname(raw_text, vendor),
            "vendor": vendor.value,
            "line_count": len(raw_text.splitlines()),
            "interfaces": cls._extract_interfaces(raw_text, vendor),
            "services": cls._extract_services(raw_text, vendor),
            "crypto": cls._extract_crypto(raw_text, vendor),
            "acls_or_policies": cls._extract_acls(raw_text, vendor),
            "users_and_auth": cls._extract_auth(raw_text, vendor),
            "logging_ntp": cls._extract_logging_ntp(raw_text, vendor),
            "banners": cls._extract_banners(raw_text, vendor),
            "raw_lines": raw_text.splitlines()
        }
        return vendor, metadata

    @staticmethod
    def _extract_hostname(text: str, vendor: VendorType) -> str:
        if vendor == VendorType.CISCO_IOS or vendor == VendorType.ARISTA_EOS:
            m = re.search(r'^\s*hostname\s+([A-Za-z0-9_\-\.]+)', text, re.MULTILINE | re.IGNORECASE)
            if m: return m.group(1)
        elif vendor == VendorType.JUNIPER_JUNOS:
            m = re.search(r'host-name\s+([A-Za-z0-9_\-\.]+);', text, re.IGNORECASE) or re.search(r'set\s+system\s+host-name\s+([A-Za-z0-9_\-\.]+)', text, re.IGNORECASE)
            if m: return m.group(1)
        elif vendor == VendorType.FORTINET_FORTIOS:
            m = re.search(r'set\s+hostname\s+"?([A-Za-z0-9_\-\.]+)"?', text, re.IGNORECASE)
            if m: return m.group(1)
        elif vendor == VendorType.PALO_ALTO:
            m = re.search(r'set\s+deviceconfig\s+system\s+hostname\s+([A-Za-z0-9_\-\.]+)', text, re.IGNORECASE) or re.search(r'<hostname>([^<]+)</hostname>', text, re.IGNORECASE)
            if m: return m.group(1)
        return "Gateway-Device-01"

    @staticmethod
    def _extract_interfaces(text: str, vendor: VendorType) -> list:
        interfaces = []
        for line in text.splitlines():
            if re.match(r'^\s*interface\s+(\S+)', line, re.IGNORECASE):
                interfaces.append(line.strip())
        return interfaces

    @staticmethod
    def _extract_services(text: str, vendor: VendorType) -> dict:
        return {
            "telnet_enabled": bool(re.search(r'transport\s+input.*telnet|set\s+system\s+services\s+telnet|config\s+system\s+telnet|enable\s+telnet', text, re.IGNORECASE)),
            "http_server_enabled": bool(re.search(r'ip\s+http\s+server|set\s+system\s+services\s+web-management\s+http|set\s+admin-port\s+80', text, re.IGNORECASE) and not re.search(r'no\s+ip\s+http\s+server', text, re.IGNORECASE)),
            "https_enabled": bool(re.search(r'ip\s+http\s+secure-server|web-management\s+https|https-server|admin-https', text, re.IGNORECASE)),
            "ssh_enabled": bool(re.search(r'transport\s+input.*ssh|set\s+system\s+services\s+ssh|ip\s+ssh\s+version\s+2|set\s+ssh\s+enable', text, re.IGNORECASE)),
            "snmp_v1_v2_active": bool(re.search(r'snmp-server\s+community\s+(public|private|\S+)\s+(ro|rw)|set\s+snmp\s+community', text, re.IGNORECASE)),
            "cdp_enabled": bool(re.search(r'^\s*cdp\s+run', text, re.MULTILINE | re.IGNORECASE) and not re.search(r'no\s+cdp\s+run', text, re.IGNORECASE)),
        }

    @staticmethod
    def _extract_crypto(text: str, vendor: VendorType) -> dict:
        return {
            "password_encryption": bool(re.search(r'service\s+password-encryption|system\s+login\s+password\s+format\s+sha-512', text, re.IGNORECASE)),
            "weak_ciphers_detected": bool(re.search(r'3des|des-cbc|md5|rc4|diffie-hellman-group1-sha1', text, re.IGNORECASE)),
            "ssh_version_2": bool(re.search(r'ip\s+ssh\s+version\s+2|protocol-version\s+v2', text, re.IGNORECASE)),
        }

    @staticmethod
    def _extract_acls(text: str, vendor: VendorType) -> list:
        acls = []
        for line in text.splitlines():
            if re.search(r'permit\s+any\s+any|permit\s+ip\s+any\s+any|any4\s+any4\s+any|all\s+all\s+ACCEPT', line, re.IGNORECASE):
                acls.append(line.strip())
        return acls

    @staticmethod
    def _extract_auth(text: str, vendor: VendorType) -> dict:
        return {
            "aaa_enabled": bool(re.search(r'aaa\s+new-model|authentication-order|radius-server|tacacs-server', text, re.IGNORECASE)),
            "secret_configured": bool(re.search(r'enable\s+secret|root-authentication\s+encrypted-password|secret-sha512', text, re.IGNORECASE)),
            "default_credentials": bool(re.search(r'username\s+admin\s+password\s+(admin|cisco|123456|password|default)', text, re.IGNORECASE)),
        }

    @staticmethod
    def _extract_logging_ntp(text: str, vendor: VendorType) -> dict:
        return {
            "logging_enabled": bool(re.search(r'logging\s+host|logging\s+server|set\s+system\s+syslog|config\s+log\s+syslogd', text, re.IGNORECASE)),
            "timestamps_configured": bool(re.search(r'service\s+timestamps\s+log\s+datetime|time-format\s+millisecond', text, re.IGNORECASE)),
            "ntp_configured": bool(re.search(r'ntp\s+server|set\s+system\s+ntp\s+server|config\s+system\s+ntp', text, re.IGNORECASE)),
        }

    @staticmethod
    def _extract_banners(text: str, vendor: VendorType) -> bool:
        return bool(re.search(r'banner\s+(motd|login)|set\s+system\s+login\s+message|set\s+pre-login-banner', text, re.IGNORECASE))
