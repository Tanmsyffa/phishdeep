'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react';

export default function ExportButtons({ data }: { data: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExportCSV = () => {
    setIsOpen(false);

    const results = data.results_json || {};
    const details: any[] = results.details || [];
    const domainInfo: any = results.domain_info || {};
    const frameworks: string[] = results.frameworks || [];
    const redirectChain: string[] = results.redirect_chain || [];

    const isDanger = data.risk_score > 70;
    const isSuspicious = data.risk_score > 30 && data.risk_score <= 70;
    const verdict = isDanger
      ? 'MALICIOUS / HIGH RISK'
      : isSuspicious
      ? 'SUSPICIOUS — REVIEW REQUIRED'
      : 'CLEAN — NO SIGNIFICANT THREAT';

    const generatedAt = new Date().toLocaleString('en-GB', {
      dateStyle: 'long',
      timeStyle: 'long',
    });

    const esc = (s: string | number | undefined | null) => {
      const str = String(s ?? '');
      return `"${str.replace(/"/g, '""')}"`;
    };

    const row = (...cols: (string | number | undefined | null)[]) =>
      cols.map(esc).join(',') + '\r\n';

    const divider = (title: string) =>
      `\r\n${esc('=== ' + title + ' ===')},,\r\n`;

    let csv = '';

    // ─── SECTION 1: Report Cover ─────────────────────────────────────────────
    csv += row('PHISHDEEP CYBERSECURITY INTELLIGENCE PLATFORM');
    csv += row('Cybersecurity Threat Analysis Report — Enterprise Edition');
    csv += row('CONFIDENTIAL — FOR AUTHORIZED USE ONLY');
    csv += row('');
    csv += row('Report ID', data.id);
    csv += row('Generated', generatedAt);
    csv += row('Platform', 'PhishDeep v1.0 | phishdeep.my.id');
    csv += row('Methodology', 'Automated Forensic Analysis + OSINT Enrichment');
    csv += row('');

    // ─── SECTION 2: Executive Summary ────────────────────────────────────────
    csv += divider('EXECUTIVE SUMMARY');
    csv += row('Field', 'Value');
    csv += row('Target URL', data.target_url);
    csv += row('Scan Type', data.target_type);
    csv += row('Risk Score', `${data.risk_score} / 100`);
    csv += row('Confidence Level', domainInfo.confidence_level || 'N/A');
    csv += row('Verdict', verdict);
    csv += row('Threat Summary', domainInfo.threat_summary || 'N/A');
    csv += row('Scan Date', new Date(data.created_at).toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' }));
    csv += row('');

    // ─── SECTION 3: Domain Intelligence ─────────────────────────────────────
    if (Object.keys(domainInfo).length > 0) {
      csv += divider('DOMAIN & OSINT INTELLIGENCE');
      csv += row('Attribute', 'Value');
      const di = domainInfo;
      csv += row('Domain', di.domain || 'N/A');
      csv += row('Registrar', di.registrar || 'Unknown');
      csv += row('Registration Date', di.creation_date || 'Unknown');
      csv += row('Expiry Date', di.expiry_date || 'Unknown');
      csv += row('Last Updated', di.last_updated || 'Unknown');
      csv += row('Domain Age (days)', di.age_days != null ? String(di.age_days) : 'Unknown');
      csv += row('IP Address', di.ip_address || 'Unknown');
      csv += row('Geolocation (Country)', di.geo_country || 'Unknown');
      csv += row('Geolocation (City)', di.geo_city || 'Unknown');
      csv += row('ISP / Hosting', di.geo_isp || 'Unknown');
      csv += row('ASN', di.geo_as || 'Unknown');
      csv += row('SSL Issuer', di.ssl_issuer || 'Unknown');
      csv += row('SSL Expiry', di.ssl_expiry_date || 'Unknown');
      csv += row('TLD Risk', di.tld_risk || 'Unknown');
      csv += row('Safe Browsing Status', di.safe_browsing || 'Unchecked');
      if (di.virustotal_malicious !== undefined) {
        csv += row('VirusTotal Detections', `${di.virustotal_malicious} Malicious | ${di.virustotal_suspicious} Suspicious`);
      }
      if (di.abuseipdb_score !== undefined) {
        csv += row('AbuseIPDB Confidence', `${di.abuseipdb_score}% (${di.abuseipdb_reports} reports)`);
      }
      csv += row('Wayback First Seen', di.wayback_first_seen || 'N/A');
      csv += row('Wayback Last Seen', di.wayback_last_seen || 'N/A');
      csv += row('SPF Record', di.spf_record || 'Not Found');
      csv += row('DMARC Record', di.dmarc_record || 'Not Found');
      csv += row('DNS TTL (sec)', di.dns_ttl != null ? String(di.dns_ttl) : 'N/A');
      if (di.nameservers?.length) csv += row('Nameservers', di.nameservers.join(' | '));
      if (di.mx_records?.length) csv += row('MX Records', di.mx_records.slice(0,5).join(' | '));
      csv += row('');
    }

    // ─── SECTION 4: Detected Technologies ────────────────────────────────────
    if (frameworks.length > 0) {
      csv += divider('DETECTED TECHNOLOGIES & STACK');
      csv += row('Category', 'Detected Value');
      frameworks.forEach((fw: string) => {
        const idx = fw.indexOf(':');
        const label = idx > -1 ? fw.substring(0, idx).trim() : fw;
        const value = idx > -1 ? fw.substring(idx + 1).trim() : 'Detected';
        csv += row(label, value);
      });
      csv += row('');
    }

    // ─── SECTION 5: Redirect Chain ────────────────────────────────────────────
    if (redirectChain.length > 1) {
      csv += divider('REDIRECT CHAIN ANALYSIS');
      csv += row('Hop', 'URL');
      redirectChain.forEach((url, i) => {
        csv += row(`Hop ${i + 1}`, url);
      });
      csv += row('');
    }

    // ─── SECTION 6: Forensic Findings ────────────────────────────────────────
    csv += divider('FORENSIC INVESTIGATION FINDINGS');
    csv += row('No.', 'Analysis Module', 'Finding');
    details.forEach((d: any, idx: number) => {
      csv += row(String(idx + 1), d.step, d.finding);
    });
    csv += row('');

    // ─── SECTION 7: Legal Disclaimer ─────────────────────────────────────────
    csv += divider('LEGAL DISCLAIMER & CLASSIFICATION');
    csv += row('This report was automatically generated by the PhishDeep Cybersecurity Intelligence Platform.');
    csv += row('Classification', 'CONFIDENTIAL');
    csv += row('Distribution', 'Authorized Personnel Only');
    csv += row('Disclaimer', 'This report is provided AS-IS for informational and investigative purposes only. PhishDeep shall not be liable for any decisions made based on this report.');
    csv += row('Standard Reference', 'NIST SP 800-115 | MITRE ATT&CK Framework | ISO/IEC 27001');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PhishDeep_Report_${data.id.split('-')[0]}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    setIsOpen(false);
    window.print();
  };

  return (
    <div className="relative inline-block text-left w-full sm:w-auto mt-2 sm:mt-0" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-full transition-all flex items-center justify-center gap-2 shadow-sm text-sm active:scale-95"
      >
        <Download className="w-4 h-4" /> Download Laporan <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:right-0 left-0 sm:left-auto mt-2 w-full sm:w-52 bg-white dark:bg-[#1c1c1e] backdrop-blur-xl rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.15)] border border-gray-100/80 dark:border-white/10 z-50 overflow-hidden origin-top animate-in fade-in zoom-in-95">
          <button
            onClick={handleExportPDF}
            className="w-full text-left px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-3 font-medium"
          >
            <FileText className="w-4 h-4 text-red-500 shrink-0" />
            <div>
              <div className="font-semibold">Format PDF</div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500">Laporan forensik visual</div>
            </div>
          </button>
          <div className="border-t border-gray-100 dark:border-white\/10"></div>
          <button
            onClick={handleExportCSV}
            className="w-full text-left px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-3 font-medium"
          >
            <FileSpreadsheet className="w-4 h-4 text-green-500 shrink-0" />
            <div>
              <div className="font-semibold">Format CSV</div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500">Data lengkap untuk spreadsheet</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
