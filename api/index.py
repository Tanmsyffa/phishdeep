from flask import Flask, request, jsonify
import urllib.request
import urllib.error
import re
import socket
import ssl
import json
import os
import tempfile
import datetime
from urllib.parse import urlparse, quote
import ipaddress
from concurrent.futures import ThreadPoolExecutor, as_completed

try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None  # type: ignore

app = Flask(__name__)

# ---------------------------------------------------------------------------
# Manual root domain extractor — no network download, no external deps.
# Handles common 2-part TLDs used in Indonesia + globally.
# ---------------------------------------------------------------------------
_MULTI_TLDS = {
    'co.id', 'or.id', 'net.id', 'ac.id', 'sch.id', 'web.id', 'biz.id',
    'co.uk', 'org.uk', 'me.uk', 'net.uk', 'ltd.uk',
    'com.au', 'net.au', 'org.au', 'id.au',
    'co.in', 'net.in', 'org.in', 'ac.in',
    'com.br', 'net.br', 'org.br', 'gov.br',
    'co.nz', 'net.nz', 'org.nz',
    'co.za', 'org.za', 'net.za',
    'co.jp', 'ne.jp', 'or.jp',
    'com.sg', 'net.sg', 'org.sg',
    'com.my', 'net.my', 'org.my',
    'com.ph', 'net.ph', 'org.ph',
}

def _get_root_domain(hostname: str) -> tuple[str, str]:
    """Return (root_domain, tld_suffix) without any network I/O."""
    hostname = hostname.lower().lstrip('www.')
    # Strip leading www.
    if hostname.startswith('www.'):
        hostname = hostname[4:]
    parts = hostname.split('.')
    if len(parts) >= 3:
        two_part = f"{parts[-2]}.{parts[-1]}"
        if two_part in _MULTI_TLDS:
            return f"{parts[-3]}.{two_part}", two_part
    if len(parts) >= 2:
        return f"{parts[-2]}.{parts[-1]}", parts[-1]
    return hostname, ''

def _domain_only(hostname: str) -> str:
    """Extract just the second-level name (e.g. 'google' from 'google.com')."""
    root, tld = _get_root_domain(hostname)
    return root.replace(f'.{tld}', '') if tld else root

def is_safe_url(url):
    """Check if the URL points to a safe (public) IP to prevent SSRF."""
    try:
        parsed = urlparse(url)
        hostname = parsed.hostname
        if not hostname:
            return False
            
        # Get IP address of the hostname
        ip = socket.gethostbyname(hostname)
        ip_obj = ipaddress.ip_address(ip)
        
        # Block private, loopback, link-local, multicast, etc.
        if ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local or ip_obj.is_multicast:
            return False
        return True
    except Exception:
        # If hostname resolution fails or it's invalid, block it
        return False

def get_rdap_info(domain):
    """Lookup domain info via RDAP (modern WHOIS replacement using HTTPS)."""
    domain_info = {
        'domain': domain,
        'registrar': 'Unknown',
        'creation_date': 'Unknown',
        'expiry_date': 'Unknown',
        'age_days': None,
        'nameservers': [],
        'ip_address': 'Unknown',
        'ssl_issuer': 'Unknown',
        'ssl_expiry_date': 'Unknown'
    }
    try:
        bootstrap_url = f"https://rdap.org/domain/{domain}"
        req = urllib.request.Request(
            bootstrap_url,
            headers={'Accept': 'application/rdap+json', 'User-Agent': 'PhishDeep-Analyzer/1.0'}
        )
        response = urllib.request.urlopen(req, timeout=10)
        rdap_data = json.loads(response.read().decode())
        
        # -- Domain name (canonical) --
        ldhName = rdap_data.get('ldhName', '')
        if ldhName:
            domain_info['domain'] = ldhName.lower()

        # -- Nameservers --
        ns_list = []
        for ns in rdap_data.get('nameservers', []):
            ns_name = ns.get('ldhName', '')
            if ns_name:
                ns_list.append(ns_name.lower())
        domain_info['nameservers'] = ns_list

        # -- Registrar: walk entities recursively --
        def find_registrar(entities):
            for entity in entities:
                if 'registrar' in entity.get('roles', []):
                    vcard = entity.get('vcardArray', [])
                    if len(vcard) > 1:
                        for field in vcard[1]:
                            # field[0] = property name, field[3] = value
                            if field[0] == 'fn' and field[3] and field[3].strip():
                                return field[3].strip()
                    # Also check nested entities
                    nested = find_registrar(entity.get('entities', []))
                    if nested:
                        return nested
            return None

        registrar = find_registrar(rdap_data.get('entities', []))
        if registrar:
            domain_info['registrar'] = registrar

        # -- Parse events: registration, expiration --
        for event in rdap_data.get('events', []):
            action = event.get('eventAction', '')
            raw_date = event.get('eventDate', '')
            if not raw_date:
                continue
            try:
                dt = datetime.datetime.fromisoformat(raw_date.replace('Z', '+00:00')).replace(tzinfo=None)
                if action == 'registration':
                    domain_info['creation_date'] = dt.strftime("%d %B %Y")
                    domain_info['age_days'] = (datetime.datetime.now() - dt).days
                elif action == 'expiration':
                    domain_info['expiry_date'] = dt.strftime("%d %B %Y")
            except Exception:
                continue
                
    except Exception:
        pass
    return domain_info


def analyze_link(target_url):
    details = []
    risk_score = 0
    extracted_code = ""
    domain_info = {}
    frameworks = []
    redirect_chain = []
    
    parsed_url = urlparse(target_url)
    domain = parsed_url.netloc.replace('www.', '').split(':')[0]  # strip port

    # Extract root domain using no-download manual function
    root_domain, _tld_suffix = _get_root_domain(domain)
    extracted_domain_only = _domain_only(domain)

    # ================================================================
    # ALL OSINT LOOKUPS — run in parallel (ThreadPoolExecutor)
    # Max wall-clock time = slowest individual call (~5s) not sum of all.
    # ================================================================
    def _task_rdap():
        return ('rdap', get_rdap_info(root_domain))

    def _task_ip():
        if parsed_url.hostname:
            return ('ip', socket.gethostbyname(parsed_url.hostname))
        return ('ip', None)

    def _task_ssl():
        if parsed_url.scheme != 'https' or not parsed_url.hostname:
            return ('ssl', None)
        try:
            ctx_ssl = ssl.create_default_context()
            with socket.create_connection((parsed_url.hostname, 443), timeout=5) as sock:
                with ctx_ssl.wrap_socket(sock, server_hostname=parsed_url.hostname) as ssock:
                    return ('ssl', ssock.getpeercert())
        except ssl.SSLCertVerificationError as e:
            return ('ssl_invalid', str(getattr(e, 'verify_message', str(e))))
        except Exception:
            return ('ssl', None)

    def _task_mx():
        r = urllib.request.Request(
            f'https://dns.google/resolve?name={root_domain}&type=MX',
            headers={'Accept': 'application/json', 'User-Agent': 'PhishDeep-Analyzer/1.0'})
        resp = urllib.request.urlopen(r, timeout=5)
        data = json.loads(resp.read().decode())
        return ('mx', [a.get('data', '') for a in data.get('Answer', [])])

    def _task_urlscan():
        r = urllib.request.Request(
            f'https://urlscan.io/api/v1/search/?q=domain:{root_domain}&size=3',
            headers={'Accept': 'application/json', 'User-Agent': 'PhishDeep-Analyzer/1.0'})
        resp = urllib.request.urlopen(r, timeout=5)
        return ('urlscan', json.loads(resp.read().decode()))

    def _task_spf():
        r = urllib.request.Request(
            f'https://dns.google/resolve?name={root_domain}&type=TXT',
            headers={'Accept': 'application/json', 'User-Agent': 'PhishDeep-Analyzer/1.0'})
        resp = urllib.request.urlopen(r, timeout=5)
        data = json.loads(resp.read().decode())
        return ('spf', [a.get('data', '') for a in data.get('Answer', [])])

    def _task_dmarc():
        r = urllib.request.Request(
            f'https://dns.google/resolve?name=_dmarc.{root_domain}&type=TXT',
            headers={'Accept': 'application/json', 'User-Agent': 'PhishDeep-Analyzer/1.0'})
        resp = urllib.request.urlopen(r, timeout=5)
        data = json.loads(resp.read().decode())
        return ('dmarc', [a.get('data', '') for a in data.get('Answer', [])])

    def _task_ttl():
        r = urllib.request.Request(
            f'https://dns.google/resolve?name={root_domain}&type=A',
            headers={'Accept': 'application/json', 'User-Agent': 'PhishDeep-Analyzer/1.0'})
        resp = urllib.request.urlopen(r, timeout=5)
        data = json.loads(resp.read().decode())
        answers = data.get('Answer', [])
        return ('ttl', answers[0].get('TTL', 0) if answers else None)

    def _task_crt():
        r = urllib.request.Request(
            f'https://crt.sh/?q=%.{root_domain}&output=json',
            headers={'Accept': 'application/json', 'User-Agent': 'PhishDeep-Analyzer/1.0'})
        resp = urllib.request.urlopen(r, timeout=5)
        raw = resp.read().decode()
        if raw.strip().startswith('['):
            return ('crt', json.loads(raw))
        return ('crt', [])

    def _task_wayback():
        r = urllib.request.Request(
            f'https://web.archive.org/cdx/search/cdx?url={root_domain}&output=json&limit=1&fl=timestamp&filter=statuscode:200&from=19960101',
            headers={'User-Agent': 'PhishDeep-Analyzer/1.0'})
        resp = urllib.request.urlopen(r, timeout=5)
        return ('wayback', json.loads(resp.read().decode()))

    osint_tasks = [
        _task_rdap, _task_ip, _task_ssl,
        _task_mx, _task_urlscan,
        _task_spf, _task_dmarc, _task_ttl,
        _task_crt, _task_wayback,
    ]
    osint_results = {}
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(fn): fn.__name__ for fn in osint_tasks}
        for future in as_completed(futures, timeout=10):
            try:
                key, val = future.result(timeout=1)
                osint_results[key] = val
            except Exception:
                pass

    # --- Process RDAP ---
    rdap_data = osint_results.get('rdap', {})
    if rdap_data:
        domain_info.update(rdap_data)
        if domain_info.get('age_days') is not None:
            if domain_info['age_days'] < 30:
                risk_score += 35
                details.append({"step": "RDAP Analisis Domain", "finding": f"PERINGATAN: Domain sangat baru ({domain_info['age_days']} hari). Domain berumur sangat pendek adalah ciri khas situs phishing sekali pakai."})
            elif domain_info['age_days'] < 180:
                risk_score += 10
                details.append({"step": "RDAP Analisis Domain", "finding": f"Domain berumur {domain_info['age_days']} hari (< 6 bulan). Relatif baru, perlu perhatian lebih."})
            else:
                details.append({"step": "RDAP Analisis Domain", "finding": f"Domain telah aktif selama {domain_info['age_days']} hari ({round(domain_info['age_days']/365, 1)} tahun). Relatif terpercaya dari sisi usia."})
        else:
            details.append({"step": "RDAP Analisis Domain", "finding": "Data RDAP tidak tersedia untuk domain ini. Mungkin menggunakan ccTLD privat."})
        bad_registrars = ['namecheap', 'freenom', 'hostinger', 'namesilo', 'godaddy', 'domain.com']
        if any(br in domain_info.get('registrar', '').lower() for br in bad_registrars):
            risk_score += 10
            details.append({"step": "Reputasi Registrar", "finding": f"Domain didaftarkan melalui {domain_info['registrar']}, layanan yang sering disalahgunakan untuk hosting situs phishing secara murah/gratis."})
    else:
        details.append({"step": "RDAP Analisis Domain", "finding": "Tidak dapat mengambil data registrasi domain."})

    # --- Process IP ---
    ip_result = osint_results.get('ip')
    if ip_result:
        domain_info['ip_address'] = ip_result
        # IP Geolocation (needs IP, run inline after IP is known)
        try:
            geo_req = urllib.request.Request(
                f"http://ip-api.com/json/{ip_result}?fields=status,country,regionName,city,isp,org,as,hosting",
                headers={'User-Agent': 'PhishDeep-Analyzer/1.0'})
            geo_resp = urllib.request.urlopen(geo_req, timeout=5)
            geo_data = json.loads(geo_resp.read().decode())
            if geo_data.get('status') == 'success':
                domain_info['geo_country'] = geo_data.get('country', 'Unknown')
                domain_info['geo_city']    = f"{geo_data.get('city', '')}, {geo_data.get('regionName', '')}".strip(', ')
                domain_info['geo_isp']     = geo_data.get('isp', 'Unknown')
                domain_info['geo_as']      = geo_data.get('as', '')
                domain_info['geo_hosting'] = geo_data.get('hosting', False)
                hosting_flag = " (Hosting/Datacenter)" if domain_info['geo_hosting'] else ""
                details.append({"step": "IP Geolocation", "finding": f"Server berlokasi di {domain_info['geo_city']}, {domain_info['geo_country']}{hosting_flag}. ISP: {domain_info['geo_isp']}. ASN: {domain_info['geo_as']}."})
        except Exception:
            pass

    # --- Process SSL ---
    if 'ssl_invalid' in osint_results:
        risk_score += 50
        details.append({"step": "Analisis Sertifikat SSL", "finding": f"BAHAYA KRITIS: Sertifikat SSL tidak valid ({osint_results['ssl_invalid']}). Browser biasanya memblokir situs ini."})
        domain_info['ssl_issuer'] = 'Invalid / Untrusted'
    elif osint_results.get('ssl'):
        cert = osint_results['ssl']
        issuer = dict(x[0] for x in cert.get('issuer', []))
        domain_info['ssl_issuer']      = issuer.get('organizationName', issuer.get('commonName', 'Unknown'))
        domain_info['ssl_expiry_date'] = cert.get('notAfter', 'Unknown')
        if cert.get('notAfter'):
            expiry_dt = datetime.datetime.strptime(cert['notAfter'], "%b %d %H:%M:%S %Y %Z")
            days_to_expiry = (expiry_dt - datetime.datetime.utcnow()).days
            if days_to_expiry < 30:
                risk_score += 15
                details.append({"step": "Analisis Sertifikat SSL", "finding": f"PERINGATAN: Sertifikat SSL kedaluwarsa dalam {days_to_expiry} hari."})
            else:
                details.append({"step": "Analisis Sertifikat SSL", "finding": f"Sertifikat valid diterbitkan oleh {domain_info['ssl_issuer']} (Sisa {days_to_expiry} hari)."})

    # --- Process MX ---
    mx_records = osint_results.get('mx', [])
    domain_info['mx_records'] = mx_records
    if mx_records:
        details.append({"step": "DNS MX Record", "finding": f"Domain memiliki {len(mx_records)} MX record: {', '.join(mx_records[:3])}. Domain ini memiliki infrastruktur email aktif."})
    else:
        details.append({"step": "DNS MX Record", "finding": "Tidak ada MX record ditemukan. Domain tidak menggunakan email server (atau disembunyikan)."})

    # --- Process URLScan ---
    urlscan_data = osint_results.get('urlscan', {})
    if urlscan_data:
        total_hits = urlscan_data.get('total', 0)
        results_list = urlscan_data.get('results', [])
        domain_info['urlscan_total'] = total_hits
        if total_hits > 0:
            last_scan = results_list[0].get('task', {}).get('time', 'Unknown') if results_list else 'Unknown'
            malicious_count = sum(1 for r in results_list if r.get('verdicts', {}).get('overall', {}).get('malicious'))
            domain_info['urlscan_last_scan'] = last_scan
            domain_info['urlscan_malicious'] = malicious_count
            if malicious_count > 0:
                risk_score += 30
                details.append({"step": "URLScan.io Threat Intel", "finding": f"PERINGATAN: {malicious_count} dari {len(results_list)} scan terakhir terindikasi BERBAHAYA. Total {total_hits} riwayat scan ditemukan."})
            else:
                details.append({"step": "URLScan.io Threat Intel", "finding": f"Domain telah dipindai {total_hits} kali di URLScan.io. Scan terakhir: {last_scan[:10]}. Tidak ada hasil malicious."})
        else:
            details.append({"step": "URLScan.io Threat Intel", "finding": "Domain belum pernah dipindai oleh komunitas URLScan.io. Domain baru atau sangat jarang diakses."})

    # --- Process SPF ---
    txt_records = osint_results.get('spf', [])
    spf_record = next((r for r in txt_records if 'v=spf1' in r.lower()), None)
    domain_info['spf_record'] = spf_record or 'Tidak Ada'
    if spf_record:
        details.append({"step": "SPF Record (Email Auth)", "finding": f"SPF record ditemukan: {spf_record[:120]}. Email authentication terkonfigurasi."})
    else:
        risk_score += 5
        details.append({"step": "SPF Record (Email Auth)", "finding": "Tidak ada SPF record. Domain rentan digunakan untuk mengirim email phishing atas nama domain ini."})

    # --- Process DMARC ---
    dmarc_records = osint_results.get('dmarc', [])
    dmarc_record = next((r for r in dmarc_records if 'v=DMARC1' in r), None)
    domain_info['dmarc_record'] = dmarc_record or 'Tidak Ada'
    if dmarc_record:
        details.append({"step": "DMARC Record (Email Auth)", "finding": f"DMARC record ditemukan: {dmarc_record[:120]}. Domain terlindungi dari email spoofing."})
    else:
        risk_score += 5
        details.append({"step": "DMARC Record (Email Auth)", "finding": "Tidak ada DMARC record. Siapapun dapat memalsukan email seolah berasal dari domain ini."})

    # --- Process TTL ---
    ttl_value = osint_results.get('ttl')
    if ttl_value is not None:
        domain_info['dns_ttl'] = ttl_value
        if ttl_value < 300:
            risk_score += 20
            details.append({"step": "DNS TTL (Fast-Flux)", "finding": f"PERINGATAN: TTL DNS sangat rendah ({ttl_value} detik). Indikator kuat Fast-Flux."})
        else:
            details.append({"step": "DNS TTL (Fast-Flux)", "finding": f"TTL DNS normal: {ttl_value} detik. Tidak ada indikasi Fast-Flux."})

    # --- Process TLD Risk (no network, instant) ---
    high_risk_tlds = {
        'tk': 'Freenom (gratis)', 'ml': 'Freenom (gratis)', 'ga': 'Freenom (gratis)',
        'cf': 'Freenom (gratis)', 'gq': 'Freenom (gratis)',
        'xyz': 'TLD sangat murah, populer spam', 'top': 'TLD murah, sering disalahgunakan',
        'icu': 'TLD murah, penyalahgunaan tinggi', 'club': 'TLD murah',
        'work': 'TLD murah', 'online': 'TLD murah', 'site': 'TLD murah', 'buzz': 'TLD murah, sering spam',
    }
    final_tld = _tld_suffix.split('.')[-1] if '.' in _tld_suffix else _tld_suffix
    if final_tld in high_risk_tlds:
        risk_score += 20
        domain_info['tld_risk'] = f"Berisiko Tinggi — {high_risk_tlds[final_tld]}"
        details.append({"step": "Analisis TLD", "finding": f"PERINGATAN: TLD '.{final_tld}' tergolong berisiko tinggi ({high_risk_tlds[final_tld]})."})
    else:
        domain_info['tld_risk'] = 'Normal'
        details.append({"step": "Analisis TLD", "finding": f"TLD '.{final_tld}' tergolong normal dan tidak termasuk dalam daftar TLD berisiko tinggi."})

    # --- Process crt.sh ---
    crt_data = osint_results.get('crt', [])
    if crt_data:
        cert_count = len(crt_data)
        domain_info['cert_count'] = cert_count
        unique_names = list({c.get('name_value', '') for c in crt_data[:10]})
        if cert_count > 50:
            risk_score += 10
            details.append({"step": "Certificate Transparency (crt.sh)", "finding": f"PERHATIAN: {cert_count} sertifikat SSL tercatat di log transparansi. Volume tinggi dapat menandakan infrastruktur phishing aktif."})
        else:
            details.append({"step": "Certificate Transparency (crt.sh)", "finding": f"{cert_count} sertifikat SSL tercatat di crt.sh. Subdomains: {', '.join(unique_names[:5])}"})

    # --- Process Wayback ---
    wb_data = osint_results.get('wayback', [])
    if wb_data and len(wb_data) > 1:
        first_ts = wb_data[1][0]
        first_seen = f"{first_ts[0:4]}-{first_ts[4:6]}-{first_ts[6:8]}"
        domain_info['wayback_first_seen'] = first_seen
        details.append({"step": "Wayback Machine (Archive.org)", "finding": f"Domain pertama kali terarsip pada: {first_seen}. Situs ini memiliki rekam jejak online."})
    else:
        domain_info['wayback_first_seen'] = 'Tidak ditemukan'
        details.append({"step": "Wayback Machine (Archive.org)", "finding": "Domain belum pernah terarsip oleh Wayback Machine. Domain sangat baru atau tidak pernah diindeks."})


    # Domain Patterns
    domain_lower = domain.lower()
    
    # 1. Check if URL is an IP address
    is_ip = re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', domain_lower)
    if is_ip:
        risk_score += 40
        details.append({"step": "Analisis Pola Domain", "finding": "PERINGATAN: Menggunakan alamat IP langsung (bukan nama domain). Taktik ini sangat sering digunakan scammer untuk menyembunyikan identitas."})
    else:
        # 2. Suspicious keywords (General Phishing terms)
        suspicious_keywords = [
            'login', 'secure', 'bank', 'account', 'update', 'verify', 'free', 'bonus', 'admin',
            'support', 'recover', 'billing', 'invoice', 'wallet', 'helpdesk', 'service', 'auth',
            'validation', 'customer', 'confirm', 'security', 'setting', 'refund', 'prize', 'gift', 'promosi'
        ]
        
        # High-risk target brands (Indonesian context + Global)
        target_brands = [
            'bca', 'bri', 'mandiri', 'bni', 'dana', 'ovo', 'gopay', 'shopeepay', 
            'tokopedia', 'shopee', 'telkomsel', 'pajak', 'pln', 'netflix', 'paypal', 'apple', 'google'
        ]
        
        found_keywords = [kw for kw in suspicious_keywords if kw in domain_lower]
        found_brands = [brand for brand in target_brands if brand in domain_lower]
        
        if found_brands and found_keywords:
            risk_score += 45
            details.append({"step": "Analisis Pola Domain", "finding": f"SANGAT MENCURIGAKAN: Kombinasi pencatutan brand ('{', '.join(found_brands)}') dengan kata manipulatif ('{', '.join(found_keywords)}'). Indikator kuat situs Phishing/Spoofing."})
        elif found_keywords:
            risk_score += 15
            details.append({"step": "Analisis Pola Domain", "finding": f"Terdeteksi kata kunci yang sering digunakan untuk memanipulasi korban: {', '.join(found_keywords)}"})
        elif found_brands:
            risk_score += 15
            details.append({"step": "Analisis Pola Domain", "finding": f"Mengandung nama institusi/brand populer: {', '.join(found_brands)}. Pastikan ini adalah domain resmi mereka."})
        
        # 3. Subdomain depth check (e.g. secure.login.bank.com.scammer.net)
        subdomain_parts = domain_lower.split('.')
        if len(subdomain_parts) > 4:
            risk_score += 20
            details.append({"step": "Analisis Struktur Domain", "finding": f"Subdomain terlalu dalam ({len(subdomain_parts)} level). Taktik ini sering digunakan untuk mendorong nama domain asli ke luar layar HP (URL padding)."})
            
        # 4. Excessive hyphens check
        hyphen_count = domain_lower.count('-')
        if hyphen_count >= 3:
            risk_score += 15
            details.append({"step": "Analisis Tanda Hubung", "finding": f"Menggunakan terlalu banyak tanda hubung ({hyphen_count} buah) pada domain. Taktik umum untuk mengelabui mata (typosquatting)."})
            
        # 5. Homograph attacks (Punycode IDN)
        if 'xn--' in domain_lower:
            risk_score += 50
            details.append({"step": "Analisis Karakter Visual (Homograph)", "finding": "SANGAT MENCURIGAKAN: Domain menggunakan Punycode (Karakter Internasional). Taktik 'Links That Lie' yang sangat berbahaya untuk meniru huruf asli (misal huruf cyrillic 'a' menyerupai latin 'a')."})
            
        # 6. Credential / @ Obfuscation trick
        if '@' in parsed_url.netloc:
            risk_score += 55
            details.append({"step": "Analisis Obfuscation", "finding": "BAHAYA KRITIS: Ditemukan karakter '@' pada URL. Browser akan mengabaikan teks sebelum '@' (seringkali URL asli) dan mengarahkan Anda ke alamat scammer setelahnya."})
            
        # 7. Typosquatting Detection (Levenshtein-like 1-char distance check)
        major_brands = ['google', 'facebook', 'instagram', 'twitter', 'youtube', 'apple', 'microsoft',
                        'amazon', 'netflix', 'paypal', 'whatsapp', 'linkedin', 'tiktok', 'spotify',
                        'tokopedia', 'shopee', 'bukalapak', 'gojek', 'grab', 'bca', 'mandiri', 'bni', 'bri']
        extracted_domain_only = _domain_only(domain)
        for brand in major_brands:
            if extracted_domain_only != brand and len(extracted_domain_only) == len(brand):
                # Check char-by-char: if only 1 char differs
                diffs = sum(1 for a, b in zip(extracted_domain_only, brand) if a != b)
                if diffs == 1:
                    risk_score += 40
                    details.append({"step": "Deteksi Typosquatting", "finding": f"PERINGATAN KRITIS: Domain '{extracted_domain_only}' terdeteksi sebagai kemungkinan typosquatting dari '{brand}' (beda hanya 1 karakter). Taktik klasik penipuan identitas brand."})
                    break

        if not found_keywords and not found_brands and len(subdomain_parts) <= 4 and hyphen_count < 3 and 'xn--' not in domain_lower and '@' not in parsed_url.netloc:
            details.append({"step": "Analisis Pola Domain", "finding": "Tidak ada anomali atau pola penipuan mencolok pada susunan teks domain."})

    # HTTP Request & Redirect Tracer
    try:
        if not is_safe_url(target_url):
            raise ValueError("Target URL dilarang karena merujuk pada jaringan internal/lokal (Potensi SSRF diblokir).")

        req = urllib.request.Request(
            target_url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/114.0.0.0 Safari/537.36'}
        )
        # Create unverified SSL context to analyze sites with broken/phishing certs
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        # Redirect Tracer: capture every hop manually
        redirect_chain.append(target_url)
        visited = set()
        check_url = target_url
        for _ in range(10):  # Max 10 hops
            if check_url in visited:
                break
            visited.add(check_url)
            try:
                hop_req = urllib.request.Request(
                    check_url,
                    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/114.0.0.0 Safari/537.36'}
                )
                opener = urllib.request.build_opener(
                    urllib.request.HTTPRedirectHandler(),
                    urllib.request.HTTPSHandler(context=ctx)
                )
                hop_response = opener.open(hop_req, timeout=5)
                final_url = hop_response.url if hasattr(hop_response, 'url') else check_url
                if final_url and final_url != check_url and final_url not in redirect_chain:
                    redirect_chain.append(final_url)
                    check_url = final_url
                else:
                    break
            except Exception:
                break
        
        if len(redirect_chain) > 1:
            risk_score += 15
            details.append({"step": "Redirect Tracer", "finding": f"Mendeteksi {len(redirect_chain)-1} pengalihan rute (redirect chain). Situs melakukan penyamaran melalui beberapa URL."})
        else:
            details.append({"step": "Redirect Tracer", "finding": "Tidak ada pengalihan rute. Koneksi langsung ke target."})
        
        try:
            response = urllib.request.urlopen(req, timeout=10, context=ctx)
            html_content = response.read().decode('utf-8', errors='ignore')
            resp_headers = response.headers
        except urllib.error.HTTPError as e:
            if e.code in [401, 403]:
                details.append({"step": "Koneksi Jaringan", "finding": f"Situs membatasi akses (HTTP {e.code}). Memindai halaman login/proteksi yang diberikan..."})
                risk_score += 15
            else:
                details.append({"step": "Koneksi Jaringan", "finding": f"Situs mengembalikan HTTP {e.code}. Menganalisis halaman error..."})
            html_content = e.read().decode('utf-8', errors='ignore')
            resp_headers = e.headers
            
        # ======================================================
        # ANALISIS MENDALAM: HEADERS + HTML FINGERPRINTING
        # ======================================================
        
        # --- Layer 1: HTTP Response Headers ---
        server = resp_headers.get('Server', '')
        powered_by = resp_headers.get('X-Powered-By', '')
        via = resp_headers.get('Via', '')
        cf_ray = resp_headers.get('CF-Ray', '')
        content_type = resp_headers.get('Content-Type', '')
        
        if cf_ray or 'cloudflare' in server.lower():
            frameworks.append('CDN: Cloudflare')
        if server:
            server_clean = server.strip()
            if 'Apache' in server_clean: frameworks.append(f'Web Server: Apache ({server_clean})')
            elif 'nginx' in server_clean.lower(): frameworks.append(f'Web Server: Nginx ({server_clean})')
            elif 'IIS' in server_clean: frameworks.append(f'Web Server: Microsoft IIS ({server_clean})')
            elif 'LiteSpeed' in server_clean: frameworks.append(f'Web Server: LiteSpeed')
            elif not any(x in server_clean.lower() for x in ['cloudflare']): 
                frameworks.append(f'Web Server: {server_clean}')
        if powered_by:
            frameworks.append(f'Backend: {powered_by}')
        if via:
            frameworks.append(f'Via Proxy: {via}')
        
        # Check security headers
        missing_security = []
        if not resp_headers.get('Strict-Transport-Security'): missing_security.append('HSTS')
        if not resp_headers.get('X-Frame-Options'): missing_security.append('X-Frame-Options')
        if not resp_headers.get('Content-Security-Policy'): missing_security.append('CSP')
        if not resp_headers.get('X-XSS-Protection'): missing_security.append('X-XSS-Protection')
        if missing_security:
            frameworks.append(f'PERINGATAN - Header Tidak Ada: {", ".join(missing_security)}')
        
        # --- Layer 2: HTML Source Fingerprinting ---
        try:
            if BeautifulSoup:
                soup = BeautifulSoup(html_content, 'html.parser')
                
                # Check meta generator
                generator = soup.find('meta', attrs={'name': 'generator'})
                if generator and generator.get('content'):
                    gen_content = generator.get('content')
                    frameworks.append(f'Generator: {gen_content}')
                    if 'WordPress' in gen_content:
                        frameworks.append('CMS: WordPress')
                    elif 'Joomla' in gen_content:
                        frameworks.append('CMS: Joomla')
                    elif 'Drupal' in gen_content:
                        frameworks.append('CMS: Drupal')

                # Exact script and link paths (more accurate than loose string matching)
                script_srcs = [script.get('src', '') for script in soup.find_all('script') if script.get('src')]
                link_hrefs = [link.get('href', '') for link in soup.find_all('link') if link.get('href')]
                all_urls = ' '.join(script_srcs + link_hrefs).lower()

                # JS Frameworks (Deterministic)
                if soup.find(id='__next') or '/_next/static/' in all_urls:
                    frameworks.append('JS Framework: Next.js')
                if soup.find(id='__nuxt') or '/_nuxt/' in all_urls:
                    frameworks.append('JS Framework: Nuxt.js')
                if 'data-reactroot' in html_content or any('react' in src for src in script_srcs):
                    frameworks.append('JS Framework: React')
                if 'v-app' in html_content or 'data-v-' in html_content or any('vue' in src for src in script_srcs):
                    frameworks.append('JS Framework: Vue.js')
                if 'ng-version' in html_content or any('angular' in src for src in script_srcs):
                    frameworks.append('JS Framework: Angular')
                if any('svelte' in src for src in script_srcs):
                    frameworks.append('JS Framework: Svelte')

                # CMS and Platforms (Deterministic)
                if '/wp-content/' in all_urls or '/wp-includes/' in all_urls:
                    frameworks.append('CMS: WordPress')
                if '/media/jui/' in all_urls or '/components/com_' in all_urls:
                    frameworks.append('CMS: Joomla')
                if '/sites/default/files/' in all_urls:
                    frameworks.append('CMS: Drupal')
                if 'cdn.shopify.com' in all_urls:
                    frameworks.append('Platform: Shopify')

                # Libraries & CSS
                if any('bootstrap' in src for src in all_urls.split()):
                    frameworks.append('CSS Framework: Bootstrap')
                if any('tailwind' in src for src in all_urls.split()):
                    frameworks.append('CSS Framework: Tailwind CSS')
                if any('jquery' in src for src in script_srcs):
                    frameworks.append('Library: jQuery')

                # ============================================
                # Form Action Analysis — Where does it submit?
                # ============================================
                forms = soup.find_all('form')
                external_form_actions = []
                for form in forms:
                    action = form.get('action', '')
                    if action and action.startswith('http') and parsed_url.hostname and parsed_url.hostname not in action:
                        external_form_actions.append(action)
                    elif action and ('http' not in action) and '.php' not in action and action.strip() not in ['', '#', '/']:
                        external_form_actions.append(action)
                domain_info['form_actions'] = external_form_actions
                if external_form_actions:
                    risk_score += 25
                    details.append({"step": "Analisis Form Action", "finding": f"PERINGATAN: Form pada halaman ini mengirim data ke {len(external_form_actions)} alamat eksternal/mencurigakan: {', '.join(external_form_actions[:3])}. Kemungkinan kuat phishing harvester."})

                # ============================================
                # External Link + Hidden Element Analysis
                # ============================================
                all_links = [a.get('href', '') for a in soup.find_all('a', href=True)]
                external_links = [l for l in all_links if l.startswith('http') and parsed_url.hostname and parsed_url.hostname not in l]
                iframes = soup.find_all('iframe')
                hidden_iframes = [f for f in iframes if 'display:none' in (f.get('style','').replace(' ','').lower()) or f.get('width') == '0' or f.get('height') == '0']
                domain_info['external_links_count'] = len(external_links)
                domain_info['iframe_count'] = len(iframes)
                domain_info['hidden_iframe_count'] = len(hidden_iframes)

                if hidden_iframes:
                    risk_score += 30
                    details.append({"step": "Deteksi iFrame Tersembunyi", "finding": f"BAHAYA: Ditemukan {len(hidden_iframes)} iFrame tersembunyi (width/height=0 atau display:none). Taktik klasik untuk memuat konten jahat di balik layar."})
                elif iframes:
                    details.append({"step": "Deteksi iFrame", "finding": f"Ditemukan {len(iframes)} iFrame pada halaman. Periksa sumbernya untuk memastikan keamanan."})

                if len(external_links) > 20:
                    details.append({"step": "Analisis Link Eksternal", "finding": f"Halaman memiliki {len(external_links)} link ke domain eksternal. Volume tinggi bisa mengindikasikan situs spam/link farm."})
                    

            # Check Set-Cookie headers for backend frameworks
            set_cookie = resp_headers.get('Set-Cookie', '')
            if set_cookie:
                if 'laravel_session' in set_cookie or 'XSRF-TOKEN' in set_cookie:
                    frameworks.append('Backend: Laravel (PHP)')
                if 'csrftoken' in set_cookie and 'django' in set_cookie.lower():
                    frameworks.append('Backend: Django (Python)')
                if 'ci_session' in set_cookie:
                    frameworks.append('Backend: CodeIgniter (PHP)')
                if 'PHPSESSID' in set_cookie:
                    frameworks.append('Backend: PHP')

            # Ensure uniqueness
            frameworks = list(dict.fromkeys(frameworks))

        except Exception:
            pass

        if not frameworks:
            frameworks.append('Web Stack: Custom / Static HTML / Unknown')

        if "<input type=\"password\"" in html_content.lower() or "type='password'" in html_content.lower():
            risk_score += 30
            details.append({"step": "Analisis Konten Halaman", "finding": "TERDETEKSI: Adanya Form Input Password pada situs yang berisiko."})
            match = re.search(r'(?i)<form.*?>.*?</form>', html_content, re.DOTALL)
            if match:
                extracted_code = match.group(0)[:400] + "\n...[truncated]"

        # ====================================================
        # Page Content Intelligence: Title + Meta Analysis
        # ====================================================
        if BeautifulSoup and html_content:
            try:
                content_soup = BeautifulSoup(html_content, 'html.parser')
                page_title = content_soup.title.string.strip() if content_soup.title and content_soup.title.string else ''
                meta_desc_tag = content_soup.find('meta', attrs={'name': 'description'})
                meta_desc = meta_desc_tag.get('content', '').strip() if meta_desc_tag else ''
                domain_info['page_title'] = page_title
                domain_info['meta_description'] = meta_desc

                # Check if page title spoofs a known brand
                brand_spoof_list = ['google', 'facebook', 'bca', 'mandiri', 'bni', 'bri', 'dana', 'ovo',
                                    'shopee', 'tokopedia', 'netflix', 'paypal', 'apple', 'microsoft']
                title_lower = page_title.lower()
                for brand in brand_spoof_list:
                    if brand in title_lower and brand not in root_domain.lower():
                        risk_score += 25
                        details.append({"step": "Analisis Konten Halaman", "finding": f"PERINGATAN: Judul halaman menyebut brand '{brand.upper()}' namun domain bukan milik brand tersebut. Kemungkinan kuat spoofing."})
                        break

                if page_title:
                    details.append({"step": "Page Intelligence", "finding": f"Judul halaman: '{page_title}'" + (f" | Deskripsi: '{meta_desc[:120]}...'" if len(meta_desc) > 120 else (f" | Deskripsi: '{meta_desc}'" if meta_desc else ""))})
            except Exception:
                pass

    except urllib.error.URLError as e:
        risk_score += 40
        details.append({"step": "Koneksi Jaringan", "finding": f"Target tidak dapat dijangkau ({str(e.reason)}). Kemungkinan telah di-take down."})
    except Exception as e:
        details.append({"step": "Koneksi Jaringan", "finding": f"Gagal menganalisis situs: {str(e)}"})
    encoded = quote(target_url, safe='')
    screenshot_url = f"https://api.microlink.io/?url={encoded}&screenshot=true&meta=false&embed=screenshot.url"
    return min(risk_score, 100), details, extracted_code, domain_info, frameworks, redirect_chain, screenshot_url

def analyze_file(file_url, file_type):
    details = []
    risk_score = 0
    extracted_code = ""
    domain_info = {}
    frameworks = []
    redirect_chain = []
    
    try:
        if not is_safe_url(file_url):
            raise ValueError("Target URL dilarang karena merujuk pada jaringan internal/lokal (Potensi SSRF diblokir).")
            
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        
        details.append({"step": "Persiapan Engine", "finding": "Mengunduh file dari brankas terenkripsi untuk analisis..."})
        req = urllib.request.Request(file_url, headers={'User-Agent': 'PhishDeep-Analyzer'})
        response = urllib.request.urlopen(req, timeout=15, context=ctx)
        raw_content = response.read()
        details.append({"step": "Integrasi File", "finding": f"File berhasil diekstraksi ke dalam sistem analyzer ({len(raw_content)} bytes)."})
        
        if file_type.lower() == 'apk':
            frameworks.append("Android Package (APK)")
            permissions = re.findall(br'android\.permission\.[A-Z_]+', raw_content)
            unique_perms = list(set([p.decode('utf-8') for p in permissions]))
            dangerous_perms = ['READ_SMS', 'RECEIVE_SMS', 'SEND_SMS', 'SYSTEM_ALERT_WINDOW', 'READ_CONTACTS', 'CALL_PHONE']
            found_dangerous = [p for p in unique_perms if any(dp in p for dp in dangerous_perms)]
            
            if unique_perms:
                details.append({"step": "Manifest Extraction", "finding": f"Berhasil mengekstrak {len(unique_perms)} deklarasi permission."})
                if found_dangerous:
                    risk_score += 65
                    details.append({"step": "Security Audit", "finding": f"PERINGATAN KRITIS: Aplikasi meminta akses yang melanggar privasi pengguna secara invasif."})
                    extracted_code = "\n".join(found_dangerous)
                else:
                    risk_score += 10
                    details.append({"step": "Security Audit", "finding": "Aplikasi hanya meminta akses wajar. Tidak ada anomali privasi."})
            else:
                details.append({"step": "Manifest Extraction", "finding": "Manifest obfuscated atau tidak dapat diuraikan. Perlu kewaspadaan tinggi."})
                risk_score += 40
                
            if b'Landroid/telephony/SmsManager;' in raw_content:
                risk_score += 25
                details.append({"step": "Bytecode Scan", "finding": "Menemukan injeksi pemanggilan API SMS Manager di belakang layar (Potensi pencurian OTP)."})
                
        else:
            frameworks.append("Document/File Media")
            if b'JavaScript' in raw_content or b'/JS' in raw_content:
                risk_score += 75
                details.append({"step": "Macro & Script Scan", "finding": "ANCAMAN TERDETEKSI: Dokumen mengandung sisipan JavaScript eksekusi otomatis."})
            else:
                details.append({"step": "Macro & Script Scan", "finding": "Dokumen terlihat pasif dan bersih dari injeksi payload."})

    except Exception as e:
        details.append({"step": "Ekstraksi File", "finding": f"Kegagalan mesin forensik: {str(e)}"})
        
    return min(risk_score, 100), details, extracted_code, domain_info, frameworks, redirect_chain, ""

@app.route('/api/scan', methods=['POST'])
def scan():
    try:
        data = request.json
        if not data:
            return jsonify({"status": "error", "message": "Request body tidak valid."}), 400

        target = (data.get('target', '') or '').strip()
        scan_type = data.get('type', 'link')
        
        if not target:
            return jsonify({"status": "error", "message": "Target tidak boleh kosong."}), 400
            
        if scan_type.lower() == 'link':
            # Auto-prefix protocol if missing
            if not target.startswith('http://') and not target.startswith('https://'):
                target = 'http://' + target

            # Validate URL has a real domain/IP after protocol
            parsed = urlparse(target)
            if not parsed.netloc:
                return jsonify({"status": "error", "message": "URL tidak valid. Pastikan formatnya benar (contoh: nama-domain.com)."}), 400

            # Block javascript: and data: URIs
            if parsed.scheme in ('javascript', 'data', 'vbscript'):
                return jsonify({"status": "error", "message": "Protokol URL tidak diizinkan."}), 400

            risk_score, details, extracted_code, domain_info, frameworks, redirect_chain, screenshot_url = analyze_link(target)
        elif scan_type.lower() in ['apk', 'doc', 'dokumen']:
            risk_score, details, extracted_code, domain_info, frameworks, redirect_chain, screenshot_url = analyze_file(target, scan_type)
        else:
            return jsonify({"status": "error", "message": "Tipe scan tidak dikenali atau telah dinonaktifkan."}), 400
        
        results = {
            "status": "success",
            "risk_score": risk_score,
            "details": details,
            "domain_info": domain_info,
            "frameworks": frameworks,
            "redirect_chain": redirect_chain,
            "screenshot_url": screenshot_url
        }
        
        if extracted_code:
            results["extracted_code"] = extracted_code

        return jsonify(results), 200
        
    except Exception as e:
        return jsonify({"status": "error", "message": f"Server error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5328, debug=True)
