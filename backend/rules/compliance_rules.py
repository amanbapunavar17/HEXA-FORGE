from typing import List, Dict, Any
from ..models import SeverityLevel, RuleStatus, VendorType

RULES_DATABASE = [
    {
        "id": "SEC-AAA-001",
        "title": "Enable Password Encryption & Master Secret (No Plaintext Passwords)",
        "category": "Authentication & Access Control",
        "frameworks": ["cis", "nist_800_53", "disa_stig", "cert_in"],
        "benchmark_refs": {
            "cis": "CIS Benchmark v2.0 - Section 1.1.1 (Level 1)",
            "nist_800_53": "NIST SP 800-53 Rev 5: IA-5(1) Password Protection",
            "disa_stig": "DISA STIG: NET-V-001235 (CAT I)",
            "cert_in": "CERT-In Baseline Hardening Section 4.2"
        },
        "severity": SeverityLevel.CRITICAL,
        "description": "Ensure passwords stored in the configuration file are encrypted using strong hashing (SHA-512 / Type 8/9 / Argon2) and global password encryption is enabled.",
        "rationale": "Cleartext passwords or weak reversible reversible hashes (Type 7 / MD5) allow unauthorized users with view access to decrypt administrative passwords.",
        "check": lambda meta: meta["crypto"]["password_encryption"] and meta["users_and_auth"]["secret_configured"] and not meta["users_and_auth"]["default_credentials"],
        "remediation_cli": {
            VendorType.CISCO_IOS: "conf t\nservice password-encryption\nenable algorithm-type sha256 secret <STRONG_PASSWORD>\nend\nwrite memory",
            VendorType.JUNIPER_JUNOS: "set system login password format sha-512\nset system root-authentication plain-text-password\ncommit",
            VendorType.FORTINET_FORTIOS: "config system global\n  set password-policy-enable enable\n  set strong-crypto enable\nend",
            VendorType.PALO_ALTO: "set mgt-config users admin password\ncommit",
            VendorType.LINUX_IPTABLES: "# Ensure /etc/shadow uses SHA-512 ($6$) or yescrypt hashing\nauthconfig --passalgo=sha512 --update"
        },
        "remediation_ansible": """- name: Enforce Strong Password Encryption
  cisco.ios.ios_config:
    lines:
      - service password-encryption
      - enable algorithm-type sha256 secret {{ vaulted_enable_secret }}"""
    },
    {
        "id": "SEC-SVC-002",
        "title": "Disable Insecure Management Protocols (Telnet and Plain HTTP)",
        "category": "Insecure Management Protocols",
        "frameworks": ["cis", "nist_800_53", "disa_stig", "cert_in"],
        "benchmark_refs": {
            "cis": "CIS Benchmark v2.0 - Section 1.2.2 (Level 1)",
            "nist_800_53": "NIST SP 800-53: SC-8 Transmission Confidentiality & AC-17 Remote Access",
            "disa_stig": "DISA STIG: NET-V-000450 (CAT I)",
            "cert_in": "CERT-In Directive: Prohibition of Unencrypted Management Channels"
        },
        "severity": SeverityLevel.CRITICAL,
        "description": "Telnet and HTTP transmit credentials and session data in cleartext across the network. All administrative access must be restricted to SSHv2 and HTTPS.",
        "rationale": "Adversaries performing Man-in-the-Middle (MitM) or network packet sniffing can capture plaintext administrator credentials and hijack router sessions.",
        "check": lambda meta: not meta["services"]["telnet_enabled"] and not meta["services"]["http_server_enabled"] and meta["services"]["ssh_enabled"],
        "remediation_cli": {
            VendorType.CISCO_IOS: "conf t\nno ip http server\nip http secure-server\nline vty 0 15\n transport input ssh\n transport output ssh\nend\nwrite memory",
            VendorType.JUNIPER_JUNOS: "delete system services telnet\ndelete system services web-management http\nset system services ssh protocol-version v2\nset system services web-management https\ncommit",
            VendorType.FORTINET_FORTIOS: "config system global\n  set admin-sport 8443\n  set admin-ssh-port 22\nend\nconfig system interface\n  edit port1\n    unset allowaccess http telnet\n  end",
            VendorType.PALO_ALTO: "set deviceconfig system service disable-telnet yes\nset deviceconfig system service disable-http yes\ncommit",
            VendorType.LINUX_IPTABLES: "iptables -A INPUT -p tcp --dport 23 -j DROP\niptables -A INPUT -p tcp --dport 80 -j DROP"
        },
        "remediation_ansible": """- name: Disable Telnet and Force SSHv2 on VTY Lines
  cisco.ios.ios_config:
    lines:
      - no ip http server
      - ip http secure-server
    parents: line vty 0 15
    lines:
      - transport input ssh"""
    },
    {
        "id": "SEC-CRY-003",
        "title": "Enforce SSH Version 2 with Modern Cryptographic Ciphers",
        "category": "Cryptography & Ciphers",
        "frameworks": ["cis", "nist_800_53", "disa_stig", "cert_in"],
        "benchmark_refs": {
            "cis": "CIS Benchmark - Section 1.2.3 (Level 1)",
            "nist_800_53": "NIST SP 800-53: SC-13 Cryptographic Protection",
            "disa_stig": "DISA STIG: NET-V-000890 (CAT II)",
            "cert_in": "CERT-In Cyber Security Guidelines Cl. 7"
        },
        "severity": SeverityLevel.HIGH,
        "description": "Ensure SSHv1 is completely disabled and only SSHv2 is enabled with strong key generation (minimum RSA 2048-bit or Ed25519) and no legacy 3DES/RC4/MD5 ciphers.",
        "rationale": "SSHv1 and weak encryption ciphers (such as 3DES, CBC mode ciphers) are vulnerable to side-channel attacks, key recovery, and traffic decryption.",
        "check": lambda meta: meta["crypto"]["ssh_version_2"] and not meta["crypto"]["weak_ciphers_detected"],
        "remediation_cli": {
            VendorType.CISCO_IOS: "conf t\nip ssh version 2\nip ssh time-out 60\nip ssh authentication-retries 3\ncrypto key generate rsa modulus 2048\nend\nwrite memory",
            VendorType.JUNIPER_JUNOS: "set system services ssh protocol-version v2\nset system services ssh ciphers [ aes256-gcm@openssh.com chacha20-poly1305@openssh.com aes256-ctr ]\ncommit",
            VendorType.FORTINET_FORTIOS: "config system global\n  set ssh-enc-algo high\n  set ssh-kex-algo high\n  set ssh-mac-algo high\nend",
            VendorType.PALO_ALTO: "set deviceconfig system ssh ciphers [ aes256-gcm aes256-ctr ]\ncommit",
            VendorType.LINUX_IPTABLES: "# Update /etc/ssh/sshd_config with:\n# Protocol 2\n# Ciphers aes256-gcm@openssh.com,chacha20-poly1305@openssh.com\nsystemctl restart sshd"
        },
        "remediation_ansible": """- name: Enforce SSHv2 and Key Exchange Policies
  cisco.ios.ios_config:
    lines:
      - ip ssh version 2
      - ip ssh time-out 60
      - ip ssh authentication-retries 3"""
    },
    {
        "id": "SEC-LOG-004",
        "title": "Configure Centralized Remote Syslog & Timestamp Auditing",
        "category": "Logging & Audit Trails",
        "frameworks": ["cis", "nist_800_53", "disa_stig", "cert_in", "iso_27001"],
        "benchmark_refs": {
            "cis": "CIS Benchmark - Section 2.1 (Level 1)",
            "nist_800_53": "NIST SP 800-53: AU-2 Audit Events & AU-6 Audit Review",
            "disa_stig": "DISA STIG: NET-V-002100 (CAT II)",
            "cert_in": "CERT-In Mandatory Directions: Retention & Forwarding of Logs to Central SIEM"
        },
        "severity": SeverityLevel.HIGH,
        "description": "Network devices must send all security, access, and configuration change logs to a secure central SIEM/syslog repository with microsecond/millisecond timestamps.",
        "rationale": "Local memory buffers can be easily overwritten or cleared by attackers to erase forensic evidence of unauthorized access.",
        "check": lambda meta: meta["logging_ntp"]["logging_enabled"] and meta["logging_ntp"]["timestamps_configured"],
        "remediation_cli": {
            VendorType.CISCO_IOS: "conf t\nservice timestamps log datetime msec show-timezone\nservice timestamps debug datetime msec show-timezone\nlogging buffered 64000 informational\nlogging host 10.10.100.50 transport udp port 514\nend\nwrite memory",
            VendorType.JUNIPER_JUNOS: "set system syslog host 10.10.100.50 any notice\nset system syslog time-format millisecond\ncommit",
            VendorType.FORTINET_FORTIOS: "config log syslogd setting\n  set status enable\n  set server \"10.10.100.50\"\n  set mode reliable\nend",
            VendorType.PALO_ALTO: "set shared log-settings syslog Central-SIEM server 10.10.100.50 port 514\ncommit",
            VendorType.LINUX_IPTABLES: "# Configure /etc/rsyslog.conf with *.* @10.10.100.50:514\nsystemctl restart rsyslog"
        },
        "remediation_ansible": """- name: Configure Centralized SIEM Syslog Server
  cisco.ios.ios_logging_global:
    config:
      hosts:
        - hostname: 10.10.100.50
      buffered:
        size: 64000
        severity: informational"""
    },
    {
        "id": "SEC-NTP-005",
        "title": "Enforce Synchronized Network Time Protocol (NTP) with Authentication",
        "category": "System Hardening",
        "frameworks": ["cis", "nist_800_53", "disa_stig", "cert_in"],
        "benchmark_refs": {
            "cis": "CIS Benchmark - Section 2.2 (Level 1)",
            "nist_800_53": "NIST SP 800-53: AU-8 Time Stamps",
            "disa_stig": "DISA STIG: NET-V-002150 (CAT II)",
            "cert_in": "CERT-In Directive Section 2.1 (NTP Time Synchronization with NIC/NPL)"
        },
        "severity": SeverityLevel.MEDIUM,
        "description": "Network devices must synchronize system clocks with authoritative NTP time servers (e.g. National Physical Laboratory / NIC Stratum-1/2 servers) to ensure forensic timestamp integrity.",
        "rationale": "Discrepancies in clock timing prevent cross-device log correlation and correlation during incident response investigations.",
        "check": lambda meta: meta["logging_ntp"]["ntp_configured"],
        "remediation_cli": {
            VendorType.CISCO_IOS: "conf t\nntp server 10.10.1.1 prefer\nntp server 10.10.1.2\nntp authenticate\nend\nwrite memory",
            VendorType.JUNIPER_JUNOS: "set system ntp server 10.10.1.1 prefer\nset system ntp server 10.10.1.2\ncommit",
            VendorType.FORTINET_FORTIOS: "config system ntp\n  set ntpsync enable\n  set type custom\n  config ntpserver\n    edit 1\n      set server \"10.10.1.1\"\n    next\n  end\nend",
            VendorType.PALO_ALTO: "set deviceconfig system ntp-servers primary-ntp-server ntp-server-address 10.10.1.1\ncommit",
            VendorType.LINUX_IPTABLES: "chronyc add server 10.10.1.1 iburst\nsystemctl restart chronyd"
        },
        "remediation_ansible": """- name: Configure Authoritative NTP Servers
  cisco.ios.ios_ntp_global:
    config:
      servers:
        - server: 10.10.1.1
          prefer: true
        - server: 10.10.1.2"""
    },
    {
        "id": "SEC-ACL-006",
        "title": "Eliminate Overly Permissive Access Control Lists (No 'permit any any')",
        "category": "Access Control & Perimeter Defense",
        "frameworks": ["cis", "nist_800_53", "disa_stig", "cert_in", "iso_27001"],
        "benchmark_refs": {
            "cis": "CIS Benchmark - Section 3.1 (Level 1)",
            "nist_800_53": "NIST SP 800-53: AC-3 Access Enforcement & AC-4 Information Flow Enforcement",
            "disa_stig": "DISA STIG: NET-V-003020 (CAT I)",
            "cert_in": "CERT-In Network Perimeter Defense Guideline"
        },
        "severity": SeverityLevel.CRITICAL,
        "description": "Rules containing unconditional wildcard allowances (such as 'permit ip any any' or 'permit any any') bypass Zero-Trust principles and expose internal network segments.",
        "rationale": "Overly broad ACLs grant attackers unrestricted lateral movement and allow unfiltered inbound exploitation of internal hosts.",
        "check": lambda meta: len(meta["acls_or_policies"]) == 0,
        "remediation_cli": {
            VendorType.CISCO_IOS: "conf t\nip access-list extended RESTRICTED_INBOUND\n permit tcp any host 192.168.1.100 eq 443\n deny ip any any log\ninterface GigabitEthernet0/0\n ip access-group RESTRICTED_INBOUND in\nend\nwrite memory",
            VendorType.JUNIPER_JUNOS: "set firewall filter PERIMETER_FILTER term DEFAULT_DENY then log\nset firewall filter PERIMETER_FILTER term DEFAULT_DENY then discard\ncommit",
            VendorType.FORTINET_FORTIOS: "config firewall policy\n  edit 1\n    set action accept\n    set srcintf \"wan\"\n    set dstintf \"dmz\"\n    set service \"HTTPS\"\n  next\n  edit 999\n    set action deny\n    set srcintf \"all\"\n    set dstintf \"all\"\n  next\nend",
            VendorType.PALO_ALTO: "set rulebase security rules DEFAULT_DENY action deny log-end yes\ncommit",
            VendorType.LINUX_IPTABLES: "iptables -P INPUT DROP\niptables -P FORWARD DROP"
        },
        "remediation_ansible": """- name: Replace Permissive ACL with Strict Zero Trust Ruleset
  cisco.ios.ios_acls:
    config:
      - afi: ipv4
        acls:
          - name: RESTRICTED_INBOUND
            acl_type: extended
            aces:
              - sequence: 10
                grant: permit
                protocol: tcp
                source: { any: true }
                destination: { host: 192.168.1.100, port_protocol: { eq: https } }
              - sequence: 20
                grant: deny
                protocol: ip
                source: { any: true }
                destination: { any: true }
                log: true"""
    },
    {
        "id": "SEC-SNMP-007",
        "title": "Deprecate Insecure SNMPv1/v2c & Default Community Strings",
        "category": "Management Protocols",
        "frameworks": ["cis", "nist_800_53", "disa_stig", "cert_in"],
        "benchmark_refs": {
            "cis": "CIS Benchmark - Section 1.3.1 (Level 1)",
            "nist_800_53": "NIST SP 800-53: IA-2 Identification & Authentication",
            "disa_stig": "DISA STIG: NET-V-001050 (CAT I)",
            "cert_in": "CERT-In SNMP Security Hardening Standard"
        },
        "severity": SeverityLevel.HIGH,
        "description": "SNMPv1 and SNMPv2c use cleartext community strings (e.g. 'public', 'private') that lack authentication and cryptographic integrity. Must migrate to SNMPv3 with authPriv (AES + SHA).",
        "rationale": "Attackers sniffing standard SNMP community strings can enumerate full routing tables, ARP caches, interface counters, or alter device settings if RW strings are present.",
        "check": lambda meta: not meta["services"]["snmp_v1_v2_active"],
        "remediation_cli": {
            VendorType.CISCO_IOS: "conf t\nno snmp-server community public\nno snmp-server community private\nsnmp-server group SECURE_NMS v3 priv\nsnmp-server user nms_admin SECURE_NMS v3 auth sha StrongAuthPass priv aes 128 StrongPrivPass\nend\nwrite memory",
            VendorType.JUNIPER_JUNOS: "delete snmp community public\ndelete snmp community private\nset snmp v3 usm local-user nms_admin authentication-sha authentication-password StrongAuthPass\nset snmp v3 usm local-user nms_admin privacy-aes128 privacy-password StrongPrivPass\ncommit",
            VendorType.FORTINET_FORTIOS: "config system snmp community\n  delete 1\nend\nconfig system snmp user\n  edit \"nms_admin\"\n    set security-level auth-priv\n    set auth-proto sha\n    set auth-pwd StrongAuthPass\n    set priv-proto aes\n    set priv-pwd StrongPrivPass\n  next\nend",
            VendorType.PALO_ALTO: "set deviceconfig system snmp-setting v3-users nms_admin auth-password StrongAuthPass priv-password StrongPrivPass\ncommit",
            VendorType.LINUX_IPTABLES: "# In /etc/snmp/snmpd.conf replace rocommunity with createUser nms_admin SHA StrongAuthPass AES StrongPrivPass"
        },
        "remediation_ansible": """- name: Remove Legacy SNMPv1/v2c and Deploy SNMPv3
  cisco.ios.ios_config:
    lines:
      - no snmp-server community public
      - no snmp-server community private
      - snmp-server group SECURE_NMS v3 priv
      - snmp-server user nms_admin SECURE_NMS v3 auth sha StrongAuthPass priv aes 128 StrongPrivPass"""
    },
    {
        "id": "SEC-BAN-008",
        "title": "Configure Legal Warning & Authorized Access Login Banners",
        "category": "Administrative & Legal Compliance",
        "frameworks": ["cis", "nist_800_53", "disa_stig", "cert_in", "iso_27001"],
        "benchmark_refs": {
            "cis": "CIS Benchmark - Section 1.4.1 (Level 1)",
            "nist_800_53": "NIST SP 800-53: AC-8 System Use Notification",
            "disa_stig": "DISA STIG: NET-V-000100 (CAT III)",
            "cert_in": "CERT-In Mandatory Banner Policy for Critical Infrastructure"
        },
        "severity": SeverityLevel.LOW,
        "description": "Network devices must present a clear advisory warning banner stating that the system is restricted to authorized personnel only and activity is monitored and logged.",
        "rationale": "Without a legally enforceable login disclaimer banner, prosecution of unauthorized intruders can be legally contested.",
        "check": lambda meta: meta["banners"] is True,
        "remediation_cli": {
            VendorType.CISCO_IOS: "conf t\nbanner login ^C\n======================================================\n* WARNING: RESTRICTED GOVERNMENT / ENTERPRISE SYSTEM *\n* UNAUTHORIZED ACCESS IS PROHIBITED AND MONITORED    *\n======================================================\n^C\nend\nwrite memory",
            VendorType.JUNIPER_JUNOS: "set system login message \"\\n======================================================\\n* WARNING: RESTRICTED GOVERNMENT / ENTERPRISE SYSTEM *\\n* UNAUTHORIZED ACCESS IS PROHIBITED AND MONITORED    *\\n======================================================\\n\"\ncommit",
            VendorType.FORTINET_FORTIOS: "config system global\n  set pre-login-banner enable\nend",
            VendorType.PALO_ALTO: "set deviceconfig system login-banner \"WARNING: RESTRICTED GOVERNMENT / ENTERPRISE SYSTEM\"\ncommit",
            VendorType.LINUX_IPTABLES: "echo 'WARNING: RESTRICTED SYSTEM. ALL ACTIVITY LOGGED.' > /etc/issue.net"
        },
        "remediation_ansible": """- name: Enforce Standardized Legal Login Banner
  cisco.ios.ios_banner:
    banner: login
    text: |
      ======================================================
      * WARNING: RESTRICTED GOVERNMENT / ENTERPRISE SYSTEM *
      * UNAUTHORIZED ACCESS IS PROHIBITED AND MONITORED    *
      ======================================================
    state: present"""
    }
]
