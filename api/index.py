from flask import Flask, request, jsonify
import urllib.request
import urllib.error
import re
import socket
import ssl
import json
import os
import hashlib
import zlib
import struct
import tempfile
import datetime
from urllib.parse import urlparse, quote
import ipaddress
import math
from concurrent.futures import ThreadPoolExecutor, as_completed

try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None  # type: ignore

try:
    import pymupdf  # PyMuPDF - installed via requirements.txt on Vercel
    PYMUPDF_AVAILABLE = True
except ImportError:
    pymupdf = None  # type: ignore
    PYMUPDF_AVAILABLE = False


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

def calculate_entropy(text: str) -> float:
    if not text:
        return 0.0
    entropy = 0.0
    for x in set(text):
        p_x = float(text.count(x)) / len(text)
        entropy += - p_x * math.log(p_x, 2)
    return entropy

def detect_homograph(domain: str) -> tuple[bool, str]:
    try:
        if 'xn--' in domain.lower():
            decoded = domain.encode('ascii').decode('idna')
            return True, f"Terdeteksi Punycode (Homograph Attack). Nama tersembunyi: {decoded}"
        if not all(ord(c) < 128 for c in domain):
            return True, "Domain mengandung karakter non-standar (Unicode) yang berpotensi menipu mata."
        return False, ""
    except Exception:
        return False, ""

def check_safe_browsing(url: str):
    api_key = os.environ.get('GOOGLE_SAFE_BROWSING_API_KEY')
    if not api_key:
        return None
    endpoint = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={api_key}"
    payload = {
        "client": {"clientId": "phishdeep-analyzer", "clientVersion": "1.0"},
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}]
        }
    }
    try:
        req = urllib.request.Request(endpoint, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
        response = urllib.request.urlopen(req, timeout=5)
        result = json.loads(response.read().decode('utf-8'))
        if 'matches' in result and len(result['matches']) > 0:
            return True # Malicious
        return False # Clean
    except Exception:
        return None

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
        'last_updated': 'Unknown',
        'domain_status': [],
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

        # -- Domain Status (e.g. clientTransferProhibited) --
        statuses = rdap_data.get('status', [])
        domain_info['domain_status'] = statuses

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

        # -- Parse events: registration, expiration, last changed --
        for event in rdap_data.get('events', []):
            action = event.get('eventAction', '')
            raw_date = event.get('eventDate', '')
            if not raw_date:
                continue
            try:
                dt = datetime.datetime.fromisoformat(raw_date.replace('Z', '+00:00')).replace(tzinfo=None)
                if action == 'registration':
                    domain_info['creation_date'] = dt.strftime("%d %b %Y")
                    domain_info['age_days'] = (datetime.datetime.now() - dt).days
                elif action == 'expiration':
                    domain_info['expiry_date'] = dt.strftime("%d %b %Y")
                elif action in ('last changed', 'last update of RDAP database'):
                    domain_info['last_updated'] = dt.strftime("%d %b %Y")
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

    # Heuristics: Shannon Entropy & Punycode (MITRE T1566.002, T1190)
    entropy = calculate_entropy(extracted_domain_only)
    is_homograph, homograph_msg = detect_homograph(domain)
    
    if is_homograph:
        risk_score += 40
        details.append({"step": "Heuristik Domain [T1566.002]", "finding": f"BAHAYA: {homograph_msg}"})
    
    if entropy > 4.0:
        risk_score += 15
        details.append({"step": "Analisis Shannon Entropy [T1568]", "finding": f"PERINGATAN: Nama domain sangat acak (Entropy: {round(entropy, 2)}). Pola ini sering digunakan oleh DGA (Domain Generation Algorithms) untuk malware."})
    else:
        details.append({"step": "Analisis Shannon Entropy", "finding": f"Nama domain wajar (Entropy: {round(entropy, 2)}). Tidak terdeteksi algoritma pengacak (DGA)."})

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
        # Get earliest snapshot
        r1 = urllib.request.Request(
            f'https://web.archive.org/cdx/search/cdx?url={root_domain}&output=json&limit=1&fl=timestamp&filter=statuscode:200&from=19960101',
            headers={'User-Agent': 'PhishDeep-Analyzer/1.0'})
        earliest = []
        try:
            resp1 = urllib.request.urlopen(r1, timeout=6)
            earliest = json.loads(resp1.read().decode())
        except Exception:
            pass
        # Get latest snapshot count
        r2 = urllib.request.Request(
            f'https://web.archive.org/cdx/search/cdx?url={root_domain}&output=json&limit=1&fl=timestamp&filter=statuscode:200&fastLatest=true',
            headers={'User-Agent': 'PhishDeep-Analyzer/1.0'})
        latest = []
        try:
            resp2 = urllib.request.urlopen(r2, timeout=6)
            latest = json.loads(resp2.read().decode())
        except Exception:
            pass
        # Get total count via availability API
        r3 = urllib.request.Request(
            f'https://archive.org/wayback/available?url={root_domain}',
            headers={'User-Agent': 'PhishDeep-Analyzer/1.0'})
        total_data = {}
        try:
            resp3 = urllib.request.urlopen(r3, timeout=5)
            total_data = json.loads(resp3.read().decode())
        except Exception:
            pass
        return ('wayback', {'earliest': earliest, 'latest': latest, 'available': total_data})

    def _task_safebrowsing():
        return ('safebrowsing', check_safe_browsing(target_url))

    osint_tasks = [
        _task_rdap, _task_ip, _task_ssl,
        _task_mx, _task_urlscan,
        _task_spf, _task_dmarc, _task_ttl,
        _task_crt, _task_wayback, _task_safebrowsing,
    ]
    osint_results = {}
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(fn): fn.__name__ for fn in osint_tasks}
        try:
            for future in as_completed(futures, timeout=5):
                try:
                    key, val = future.result(timeout=1)
                    osint_results[key] = val
                except Exception:
                    pass
        except Exception:
            pass # Catch concurrent.futures.TimeoutError if tasks take too long

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
                # Mitigasi Skor: Domain berumur > 5 tahun mengurangi skor 20, > 10 tahun mengurangi 40.
                if domain_info['age_days'] >= 3650:
                    risk_score -= 40
                    details.append({"step": "RDAP Analisis Domain", "finding": f"SANGAT AMAN: Domain telah aktif selama > 10 tahun ({round(domain_info['age_days']/365, 1)} tahun). Skor risiko diturunkan drastis."})
                elif domain_info['age_days'] >= 1825:
                    risk_score -= 20
                    details.append({"step": "RDAP Analisis Domain", "finding": f"AMAN: Domain telah aktif selama > 5 tahun ({round(domain_info['age_days']/365, 1)} tahun). Skor risiko dikurangi."})
                else:
                    details.append({"step": "RDAP Analisis Domain", "finding": f"Domain telah aktif selama {domain_info['age_days']} hari ({round(domain_info['age_days']/365, 1)} tahun). Terdaftar sejak {domain_info.get('creation_date', 'Unknown')}."})
        else:
            details.append({"step": "RDAP Analisis Domain", "finding": "Data RDAP tidak tersedia untuk domain ini. Mungkin menggunakan ccTLD privat."})
        
        # Check registrar for risk
        bad_registrars = ['namecheap', 'freenom', 'hostinger', 'namesilo', 'godaddy', 'domain.com']
        privacy_registrars = ['domains by proxy', 'whoisguard', 'privacyprotect', 'perfect privacy', 'redacted for privacy']
        registrar_lower = domain_info.get('registrar', '').lower()
        if any(pr in registrar_lower for pr in privacy_registrars):
            risk_score += 10
            details.append({"step": "Reputasi Registrar", "finding": f"Registrar menggunakan WHOIS privacy proxy ({domain_info['registrar']}). Identitas pemilik domain disembunyikan — umum digunakan pelaku phishing."})
        elif any(br in registrar_lower for br in bad_registrars):
            risk_score += 10
            details.append({"step": "Reputasi Registrar", "finding": f"Domain didaftarkan melalui {domain_info['registrar']}, layanan yang sering disalahgunakan untuk hosting situs phishing secara murah/gratis."})
        else:
            details.append({"step": "Reputasi Registrar", "finding": f"Registrar: {domain_info.get('registrar', 'Unknown')}. Kadaluarsa: {domain_info.get('expiry_date', 'Unknown')}. Diperbarui: {domain_info.get('last_updated', 'Unknown')}."})
        
        # Nameserver analysis
        ns = domain_info.get('nameservers', [])
        if ns:
            ns_str = ', '.join(ns[:4])
            # Check for privacy/proxy NS
            privacy_ns = ['cloudflare', 'domaincontrol', 'ui-dns', 'privatedns']
            if any(p in ' '.join(ns).lower() for p in privacy_ns):
                details.append({"step": "Analisis Nameserver", "finding": f"Menggunakan nameserver pihak ketiga/CDN: {ns_str}. Pemilik domain bisa bersembunyi di balik layanan ini."})
            else:
                details.append({"step": "Analisis Nameserver", "finding": f"Nameserver: {ns_str}."})
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
    wb_data = osint_results.get('wayback', {})
    if isinstance(wb_data, dict):
        earliest_list = wb_data.get('earliest', [])
        latest_list = wb_data.get('latest', [])
        avail_data = wb_data.get('available', {})
        
        if earliest_list and len(earliest_list) > 1:
            first_ts = earliest_list[1][0]
            first_seen = f"{first_ts[6:8]}/{first_ts[4:6]}/{first_ts[0:4]}"
            domain_info['wayback_first_seen'] = first_seen

            # Check latest seen
            if latest_list and len(latest_list) > 1:
                last_ts = latest_list[1][0]
                last_seen = f"{last_ts[6:8]}/{last_ts[4:6]}/{last_ts[0:4]}"
                domain_info['wayback_last_seen'] = last_seen
            
            # Check if available (most recent snapshot URL)
            snapshot_url = avail_data.get('archived_snapshots', {}).get('closest', {}).get('url', '')
            if snapshot_url:
                domain_info['wayback_snapshot_url'] = snapshot_url

            details.append({"step": "Wayback Machine (Archive.org)", "finding": f"Domain pertama kali terarsip: {first_seen}. Terakhir terindeks: {domain_info.get('wayback_last_seen', 'N/A')}. Situs ini memiliki rekam jejak online yang dapat diverifikasi."})
        else:
            domain_info['wayback_first_seen'] = 'Tidak ditemukan'
            risk_score += 5
            details.append({"step": "Wayback Machine (Archive.org)", "finding": "Domain TIDAK ditemukan di Wayback Machine (Archive.org). Domain sangat baru, belum pernah diindeks, atau menggunakan robots.txt untuk memblokir crawler — perlu kewaspadaan lebih."})
    else:
        # Fallback for old list-format
        if wb_data and len(wb_data) > 1:
            first_ts = wb_data[1][0]
            first_seen = f"{first_ts[6:8]}/{first_ts[4:6]}/{first_ts[0:4]}"
            domain_info['wayback_first_seen'] = first_seen
            details.append({"step": "Wayback Machine (Archive.org)", "finding": f"Domain pertama kali terarsip: {first_seen}."})
        else:
            domain_info['wayback_first_seen'] = 'Tidak ditemukan'
            details.append({"step": "Wayback Machine (Archive.org)", "finding": "Domain belum pernah terarsip oleh Wayback Machine."})

    # --- Process Google Safe Browsing ---
    sb_result = osint_results.get('safebrowsing')
    if sb_result is True:
        risk_score += 100
        domain_info['safe_browsing'] = 'Malicious'
        details.append({"step": "Google Safe Browsing [T1566]", "finding": "BAHAYA KRITIS: Domain ini resmi terdaftar di database Google Safe Browsing sebagai ancaman siber (Phishing/Malware)."})
    elif sb_result is False:
        domain_info['safe_browsing'] = 'Clean'
        details.append({"step": "Google Safe Browsing", "finding": "Domain tidak ditemukan dalam database Google Safe Browsing (Status Bersih)."})
    else:
        domain_info['safe_browsing'] = 'Unchecked'
        # Silent fail if API key is not configured


    # Domain Patterns
    domain_lower = domain.lower()
    
    # 1. Check if URL is an IP address
    is_ip = re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', domain_lower)
    if is_ip:
        risk_score += 40
        details.append({"step": "Analisis Pola Domain [T1566]", "finding": "PERINGATAN: Menggunakan alamat IP langsung (bukan nama domain). Taktik ini sangat sering digunakan scammer untuk menyembunyikan identitas."})
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
            details.append({"step": "Analisis Keyword Domain [T1566.002]", "finding": f"SANGAT MENCURIGAKAN: Kombinasi pencatutan brand ('{', '.join(found_brands)}') dengan kata manipulatif ('{', '.join(found_keywords)}'). Indikator kuat situs Phishing/Spoofing."})
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

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none'
        }

        req = urllib.request.Request(target_url, headers=headers)
        
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
                hop_req = urllib.request.Request(check_url, headers=headers)
                # Gunakan redirect handler default untuk tracing cepat
                opener = urllib.request.build_opener(
                    urllib.request.HTTPRedirectHandler(),
                    urllib.request.HTTPSHandler(context=ctx)
                )
                hop_response = opener.open(hop_req, timeout=2)
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
        
        import time
        start_time = time.time()
        try:
            response = urllib.request.urlopen(req, timeout=4, context=ctx)
            html_content = response.read().decode('utf-8', errors='ignore')
            resp_headers = response.headers
            status_code = response.getcode()
            latency = int((time.time() - start_time) * 1000)
            details.append({"step": "Koneksi Jaringan", "finding": f"Koneksi berhasil (HTTP {status_code}). Waktu respons: {latency}ms."})
        except urllib.error.HTTPError as e:
            latency = int((time.time() - start_time) * 1000)
            status_code = e.code
            if status_code in [401, 403]:
                details.append({"step": "Koneksi Jaringan", "finding": f"Situs membatasi akses (HTTP {status_code} Forbidden/Unauthorized). Latensi: {latency}ms. Mengindikasikan WAF atau halaman login proteksi."})
                risk_score += 5  # Reduced risk for 403s
            elif status_code == 404:
                details.append({"step": "Koneksi Jaringan", "finding": f"Halaman tidak ditemukan (HTTP 404). Latensi: {latency}ms."})
            elif status_code >= 500:
                details.append({"step": "Koneksi Jaringan", "finding": f"Server Error (HTTP {status_code}). Latensi: {latency}ms."})
            else:
                details.append({"step": "Koneksi Jaringan", "finding": f"Situs mengembalikan HTTP {status_code}. Latensi: {latency}ms."})
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
                    if 'WordPress' in gen_content:
                        frameworks.append('CMS: WordPress')
                    elif 'Joomla' in gen_content:
                        frameworks.append('CMS: Joomla')
                    elif 'Drupal' in gen_content:
                        frameworks.append('CMS: Drupal')
                    elif 'Wix' in gen_content:
                        frameworks.append('Platform: Wix')
                    else:
                        frameworks.append(f'Generator: {gen_content}')

                # Exact script and link paths (more accurate than loose string matching)
                script_srcs = [script.get('src', '') for script in soup.find_all('script') if script.get('src')]
                link_hrefs = [link.get('href', '') for link in soup.find_all('link') if link.get('href')]
                all_urls = ' '.join(script_srcs + link_hrefs).lower()

                # JS Frameworks (Deterministic)
                if soup.find(id='__next') or '/_next/static/' in all_urls:
                    frameworks.append('JS Framework: Next.js')
                if soup.find(id='__nuxt') or '/_nuxt/' in all_urls:
                    frameworks.append('JS Framework: Nuxt.js')
                if 'data-reactroot' in html_content or any('react' in src for src in script_srcs) or 'react.production.min.js' in all_urls:
                    frameworks.append('JS Library: React')
                if 'v-app' in html_content or 'data-v-' in html_content or any('vue' in src for src in script_srcs):
                    frameworks.append('JS Library: Vue.js')
                if 'ng-version' in html_content or any('angular' in src for src in script_srcs):
                    frameworks.append('JS Framework: Angular')
                if any('svelte' in src for src in script_srcs):
                    frameworks.append('JS Framework: Svelte')
                if 'jquery' in all_urls:
                    frameworks.append('JS Library: jQuery')

                # CSS Frameworks
                if 'tailwindcss' in html_content or 'tailwind.min.css' in all_urls:
                    frameworks.append('CSS: Tailwind CSS')
                elif 'class="flex ' in html_content and 'justify-' in html_content:
                    frameworks.append('CSS: Tailwind CSS (Terindikasi)')
                if 'bootstrap' in all_urls or 'class="container-fluid"' in html_content:
                    frameworks.append('CSS: Bootstrap')
                
                # Analytics
                if 'googletagmanager.com/gtm.js' in html_content:
                    frameworks.append('Analytics: Google Tag Manager')
                if 'google-analytics.com/analytics.js' in html_content or 'gtag(' in html_content:
                    frameworks.append('Analytics: Google Analytics')
                if 'fbq(' in html_content or 'connect.facebook.net/en_us/fbevents.js' in html_content.lower():
                    frameworks.append('Analytics: Facebook Pixel')

                # CMS and Platforms (Deterministic)
                if '/wp-content/' in all_urls or '/wp-includes/' in all_urls:
                    frameworks.append('CMS: WordPress')
                if '/media/jui/' in all_urls or '/components/com_' in all_urls:
                    frameworks.append('CMS: Joomla')
                if '/sites/default/files/' in all_urls:
                    frameworks.append('CMS: Drupal')
                if 'cdn.shopify.com' in all_urls:
                    frameworks.append('Platform: Shopify')

                # Extract forms to check for external POST actions
                forms = soup.find_all('form')
                form_actions = []
                root_domain = parsed_url.hostname.split('.')[-2] + '.' + parsed_url.hostname.split('.')[-1]
                for form in forms:
                    action = form.get('action')
                    if action and action.startswith('http') and root_domain not in action.lower():
                        form_actions.append(action)
                if form_actions:
                    domain_info['form_actions'] = form_actions
                    risk_score += 40
                    details.append({"step": "Deteksi Form Eksternal", "finding": f"BAHAYA: Formulir di halaman ini mengirimkan data (seperti sandi) ke server luar yang tidak terkait: {form_actions[0]}"})

                # Extract iframes and links
                iframes = soup.find_all('iframe')
                external_links = [link.get('href') for link in soup.find_all('a') if link.get('href') and link.get('href').startswith('http') and root_domain not in link.get('href').lower()]
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
                    finding_str = f"Judul: '{page_title}'"
                    if status_code != 200:
                        finding_str = f"[HTTP {status_code}] " + finding_str
                    if meta_desc:
                        desc_text = f" | Deskripsi: '{meta_desc[:120]}...'" if len(meta_desc) > 120 else f" | Deskripsi: '{meta_desc}'"
                        finding_str += desc_text
                    details.append({"step": "Page Intelligence", "finding": finding_str})
            except Exception:
                pass

    except urllib.error.URLError as e:
        risk_score += 40
        reason_str = str(e.reason)
        # Enhanced network error classification
        if 'SSL' in reason_str or 'certificate' in reason_str.lower():
            error_type = "SSL/TLS Error"
            error_hint = "Sertifikat TLS bermasalah atau cipher tidak kompatibel."
        elif 'timed out' in reason_str.lower() or 'timeout' in reason_str.lower():
            error_type = "Timeout"
            error_hint = "Server tidak merespons dalam batas waktu — mungkin diblokir atau down."
        elif 'refused' in reason_str.lower():
            error_type = "Koneksi Ditolak"
            error_hint = "Port HTTP/HTTPS diblokir atau service tidak berjalan."
        elif 'not found' in reason_str.lower() or 'no address' in reason_str.lower():
            error_type = "DNS Tidak Ditemukan"
            error_hint = "Domain tidak dapat di-resolve — mungkin tidak aktif atau salah tulis."
        else:
            error_type = "Koneksi Gagal"
            error_hint = "Kemungkinan telah di-takedown, diblokir, atau tidak dapat dijangkau."
        details.append({"step": "Koneksi Jaringan", "finding": f"[{error_type}] {reason_str[:150]}. {error_hint}"})
        
        # Port check even on failure
        try:
            host = parsed_url.hostname or domain
            socket.setdefaulttimeout(1) # Set a 1-second timeout for socket operations
            port80 = socket.connect_ex((host, 80))
            port443 = socket.connect_ex((host, 443))
            port_status = f"Port 80 (HTTP): {'Terbuka' if port80 == 0 else 'Tertutup'} | Port 443 (HTTPS): {'Terbuka' if port443 == 0 else 'Tertutup'}"
            details.append({"step": "Port Reachability", "finding": port_status + ". Meski HTTPS gagal, port dasar tetap dicek untuk menilai apakah server masih aktif."})
        except Exception:
            pass
        finally:
            socket.setdefaulttimeout(None) # Reset back to default

    except Exception as e:
        details.append({"step": "Koneksi Jaringan", "finding": f"Gagal menganalisis situs: {str(e)[:200]}"})
    encoded = quote(target_url, safe='')
    screenshot_url = f"https://api.microlink.io/?url={encoded}&screenshot=true&meta=false&embed=screenshot.url"
    
    # Final max bounds for score
    final_score = max(0, min(100, risk_score))
    return final_score, details, extracted_code, domain_info, frameworks, redirect_chain, screenshot_url



# ── Helper: Deep PDF analysis via PyMuPDF ────────────────────────────────────
def _analyze_pdf_pymupdf(raw_content: bytes) -> dict:
    """
    Use PyMuPDF (fitz) to perform proper structural PDF forensics.
    Returns a dict with findings. Falls back gracefully if PyMuPDF unavailable.
    """
    if not PYMUPDF_AVAILABLE:
        return {"available": False}

    result = {
        "available": True,
        "page_count": 0,
        "obj_count": 0,
        "embfile_count": 0,
        "metadata": {},
        "has_javascript": False,
        "javascript_snippets": [],
        "launch_actions": [],
        "suspicious_links": [],
        "all_links": [],
        "open_action": False,
        "auto_action": False,
        "form_fields": 0,
        "annotations": 0,
        "encrypted": False,
        "dangerous_keys": [],
    }

    try:
        doc = pymupdf.open(stream=raw_content, filetype="pdf")

        result["page_count"] = len(doc)
        result["obj_count"] = doc.xref_length()
        result["embfile_count"] = doc.embfile_count()
        result["encrypted"] = doc.is_encrypted
        result["metadata"] = {k: v for k, v in doc.metadata.items() if v}

        PHISH_KEYWORDS = [
            'login', 'verify', 'secure', 'account', 'password', 'update',
            'confirm', 'suspend', 'banking', 'paypal', 'signin', 'credential',
            'bit.ly', 'tinyurl', 't.co', 'goo.gl', 'ow.ly', 'rb.gy', 'cutt.ly'
        ]

        # ── Scan all XRef objects for dangerous PDF keys ──────────────────
        DANGEROUS_PDF_KEYS = {
            'JS': "JavaScript action",
            'JavaScript': "Explicit JavaScript reference",
            'OpenAction': "Auto-execute on document open",
            'AA': "Additional auto-action trigger",
            'Launch': "Shell launch command",
            'EmbeddedFile': "Embedded file",
            'RichMedia': "RichMedia embed",
            'XFA': "XFA Form (XML-based exploit)",
            'URI': "External URI",
        }

        for xref in range(1, min(doc.xref_length(), 5000)):
            try:
                keys = doc.xref_get_keys(xref)
                for dk, desc in DANGEROUS_PDF_KEYS.items():
                    if dk in keys:
                        if dk not in result["dangerous_keys"]:
                            result["dangerous_keys"].append(dk)
                        if dk in ('JS', 'JavaScript'):
                            result["has_javascript"] = True
                            try:
                                js_val = doc.xref_get_key(xref, dk)
                                if js_val and len(js_val) > 5:
                                    snippet = js_val[:400] if isinstance(js_val, str) else str(js_val)[:400]
                                    if snippet not in result["javascript_snippets"]:
                                        result["javascript_snippets"].append(snippet)
                            except Exception:
                                pass
                        if dk == 'OpenAction':
                            result["open_action"] = True
                        if dk == 'AA':
                            result["auto_action"] = True
                        if dk == 'Launch':
                            try:
                                launch_val = doc.xref_get_key(xref, dk)
                                result["launch_actions"].append(str(launch_val)[:200])
                            except Exception:
                                pass
            except Exception:
                continue

        # ── Extract all links from pages ──────────────────────────────────
        for page in doc:
            for link in page.get_links():
                uri = link.get('uri', '')
                kind = link.get('kind', 0)
                if uri:
                    result["all_links"].append(uri)
                    if any(kw in uri.lower() for kw in PHISH_KEYWORDS):
                        result["suspicious_links"].append(uri)
                if kind == 3:  # LINK_LAUNCH
                    result["launch_actions"].append(f"Launch link: {link}")

            # Count annotations
            result["annotations"] += len(list(page.annots()))

        # ── Form fields (AcroForm) ─────────────────────────────────────────
        try:
            for page in doc:
                result["form_fields"] += len(page.widgets() or [])
        except Exception:
            pass

        doc.close()

    except Exception as e:
        result["error"] = str(e)

    return result


# ── Helper: DroidDetective-style APK permission scoring ───────────────────────
# Based on RandomForest feature importance weights from DroidDetective
# (github.com/user1342/DroidDetective) — accuracy 93.1%, recall 91.7%
# The ML model trained on ~14 malware families + ~100 Google Play apps
_DD_WEIGHTS = {
    # High importance (ML feature weight × 100 = max score contribution)
    'android.permission.WRITE_EXTERNAL_STORAGE':    (9.8,  "Tulis penyimpanan eksternal"),
    'android.permission.INTERNET':                  (8.8,  "Akses internet"),
    'android.permission.WRITE_SMS':                 (5.7,  "Tulis/kirim SMS"),
    'android.permission.WAKE_LOCK':                 (3.9,  "Jaga layar aktif"),
    'android.permission.GET_TASKS':                 (3.6,  "Pantau proses aktif"),
    'android.permission.RECEIVE_BOOT_COMPLETED':    (2.6,  "Auto-start saat boot"),
    'android.permission.ACCESS_WIFI_STATE':         (2.2,  "Baca status WiFi"),
    'android.permission.ACCESS_NETWORK_STATE':      (2.1,  "Baca status jaringan"),
    'android.permission.SYSTEM_ALERT_WINDOW':       (1.9,  "Overlay layar (phishing UI)"),
    # Medium importance
    'android.permission.READ_PHONE_STATE':          (1.5,  "Baca IMEI & info SIM"),
    'android.permission.VIBRATE':                   (1.2,  "Kontrol vibrator"),
    'android.permission.READ_CONTACTS':             (1.5,  "Akses kontak"),
    'android.permission.SEND_SMS':                  (3.0,  "Kirim SMS tersembunyi"),
    'android.permission.READ_SMS':                  (3.0,  "Baca SMS (pencurian OTP)"),
    'android.permission.RECEIVE_SMS':               (2.5,  "Intersepsi SMS masuk"),
    'android.permission.CALL_PHONE':                (2.0,  "Panggilan telepon otomatis"),
    'android.permission.RECORD_AUDIO':              (2.0,  "Rekam audio"),
    'android.permission.CAMERA':                    (1.5,  "Akses kamera"),
    'android.permission.ACCESS_FINE_LOCATION':      (1.5,  "Pelacak GPS presisi"),
    'android.permission.READ_CALL_LOG':             (1.5,  "Baca riwayat telepon"),
    'android.permission.PROCESS_OUTGOING_CALLS':    (2.0,  "Intersepsi panggilan keluar"),
    'android.permission.INSTALL_PACKAGES':          (3.5,  "Instalasi APK senyap (dropper)"),
    'android.permission.REQUEST_INSTALL_PACKAGES':  (3.0,  "Minta izin instalasi APK"),
    'android.permission.BIND_DEVICE_ADMIN':         (3.5,  "Kontrol admin perangkat penuh"),
    'android.permission.BIND_ACCESSIBILITY_SERVICE':(2.5,  "Baca layar & input pengguna"),
    'android.permission.CHANGE_NETWORK_STATE':      (1.0,  "Manipulasi jaringan"),
    'android.permission.ACCESS_SUPERUSER':          (5.0,  "Akses root (superuser)"),
    'android.permission.CHANGE_WIFI_STATE':         (1.0,  "Ubah koneksi WiFi"),
    'android.permission.BLUETOOTH':                 (0.8,  "Akses Bluetooth"),
    'android.permission.NFC':                       (1.0,  "Akses NFC (pembayaran)"),
    'android.permission.USE_BIOMETRIC':             (1.2,  "Bypass biometrik"),
    'android.permission.USE_FINGERPRINT':           (1.2,  "Akses sidik jari"),
}

# Standard Android permissions list (from DroidDetective / AOSP)
_STANDARD_ANDROID_PERMISSIONS = set([
    'android.permission.' + p for p in [
        'ACCEPT_HANDOVER', 'ACCESS_BACKGROUND_LOCATION', 'ACCESS_BLOBS_ACROSS_USERS',
        'ACCESS_CHECKIN_PROPERTIES', 'ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION',
        'ACCESS_LOCATION_EXTRA_COMMANDS', 'ACCESS_MEDIA_LOCATION', 'ACCESS_NETWORK_STATE',
        'ACCESS_NOTIFICATION_POLICY', 'ACCESS_WIFI_STATE', 'ACCOUNT_MANAGER',
        'ACTIVITY_RECOGNITION', 'ADD_VOICEMAIL', 'ANSWER_PHONE_CALLS',
        'BATTERY_STATS', 'BIND_ACCESSIBILITY_SERVICE', 'BIND_APPWIDGET',
        'BIND_AUTOFILL_SERVICE', 'BIND_CALL_REDIRECTION_SERVICE', 'BIND_CARRIER_MESSAGING_SERVICE',
        'BIND_CONDITION_PROVIDER_SERVICE', 'BIND_CONTROLS', 'BIND_DEVICE_ADMIN',
        'BIND_DREAM_SERVICE', 'BIND_INCALL_SERVICE', 'BIND_INPUT_METHOD',
        'BIND_MIDI_DEVICE_SERVICE', 'BIND_NFC_SERVICE', 'BIND_NOTIFICATION_LISTENER_SERVICE',
        'BIND_PRINT_SERVICE', 'BIND_QUICK_ACCESS_WALLET_SERVICE', 'BIND_QUICK_SETTINGS_TILE',
        'BIND_REMOTEVIEWS', 'BIND_SCREENING_SERVICE', 'BIND_TELECOM_CONNECTION_SERVICE',
        'BIND_TEXT_SERVICE', 'BIND_TV_INPUT', 'BIND_VISUAL_VOICEMAIL_SERVICE',
        'BIND_VOICE_INTERACTION', 'BIND_VPN_SERVICE', 'BIND_VR_LISTENER_SERVICE',
        'BIND_WALLPAPER', 'BLUETOOTH', 'BLUETOOTH_ADMIN', 'BLUETOOTH_ADVERTISE',
        'BLUETOOTH_CONNECT', 'BLUETOOTH_PRIVILEGED', 'BLUETOOTH_SCAN', 'BODY_SENSORS',
        'BODY_SENSORS_BACKGROUND', 'BROADCAST_PACKAGE_REMOVED', 'BROADCAST_SMS',
        'BROADCAST_STICKY', 'BROADCAST_WAP_PUSH', 'CALL_COMPANION_APP',
        'CALL_PHONE', 'CALL_PRIVILEGED', 'CAMERA', 'CAPTURE_AUDIO_OUTPUT',
        'CHANGE_COMPONENT_ENABLED_STATE', 'CHANGE_CONFIGURATION', 'CHANGE_NETWORK_STATE',
        'CHANGE_WIFI_MULTICAST_STATE', 'CHANGE_WIFI_STATE', 'CLEAR_APP_CACHE',
        'CONTROL_LOCATION_UPDATES', 'DELETE_CACHE_FILES', 'DELETE_PACKAGES',
        'DIAGNOSTIC', 'DISABLE_KEYGUARD', 'DUMP', 'EXPAND_STATUS_BAR',
        'FACTORY_TEST', 'FLASHLIGHT', 'FOREGROUND_SERVICE', 'GET_ACCOUNTS',
        'GET_ACCOUNTS_PRIVILEGED', 'GET_PACKAGE_SIZE', 'GET_TASKS',
        'GLOBAL_SEARCH', 'HIDE_OVERLAY_WINDOWS', 'HIGH_SAMPLING_RATE_SENSORS',
        'INSTALL_LOCATION_PROVIDER', 'INSTALL_PACKAGES', 'INSTALL_SHORTCUT',
        'INSTANT_APP_FOREGROUND_SERVICE', 'INTERACT_ACROSS_PROFILES', 'INTERNET',
        'KILL_BACKGROUND_PROCESSES', 'LAUNCH_MULTI_PANE_SETTINGS_DEEP_LINK',
        'LOADER_USAGE_STATS', 'LOCATION_HARDWARE', 'MANAGE_DOCUMENTS',
        'MANAGE_EXTERNAL_STORAGE', 'MANAGE_MEDIA', 'MANAGE_ONGOING_CALLS',
        'MANAGE_OWN_CALLS', 'MANAGE_WIFI_INTERFACES', 'MANAGE_WIFI_NETWORK_SELECTION',
        'MASTER_CLEAR', 'MEDIA_CONTENT_CONTROL', 'MODIFY_AUDIO_SETTINGS',
        'MODIFY_PHONE_STATE', 'MOUNT_FORMAT_FILESYSTEMS', 'MOUNT_UNMOUNT_FILESYSTEMS',
        'NEARBY_WIFI_DEVICES', 'NFC', 'NFC_PREFERRED_PAYMENT_INFO',
        'NFC_TRANSACTION_EVENT', 'OVERRIDE_WIFI_CONFIG', 'PACKAGE_USAGE_STATS',
        'PERSISTENT_ACTIVITY', 'POST_NOTIFICATIONS', 'PROCESS_OUTGOING_CALLS',
        'QUERY_ALL_PACKAGES', 'READ_ASSISTANT_APP_SEARCH_DATA', 'READ_BASIC_PHONE_STATE',
        'READ_CALENDAR', 'READ_CALL_LOG', 'READ_CONTACTS', 'READ_EXTERNAL_STORAGE',
        'READ_FRAME_BUFFER', 'READ_INPUT_STATE', 'READ_LOGS', 'READ_MEDIA_AUDIO',
        'READ_MEDIA_IMAGES', 'READ_MEDIA_VIDEO', 'READ_MEDIA_VISUAL_USER_SELECTED',
        'READ_NEARBY_WIFI_NETWORKS', 'READ_PHONE_NUMBERS', 'READ_PHONE_STATE',
        'READ_PRECISE_PHONE_STATE', 'READ_SMS', 'READ_SYNC_SETTINGS',
        'READ_SYNC_STATS', 'READ_VOICEMAIL', 'REBOOT', 'RECEIVE_BOOT_COMPLETED',
        'RECEIVE_MMS', 'RECEIVE_SMS', 'RECEIVE_WAP_PUSH', 'RECORD_AUDIO',
        'REORDER_TASKS', 'REQUEST_COMPANION_PROFILE_APP_STREAMING',
        'REQUEST_COMPANION_PROFILE_AUTOMOTIVE_PROJECTION', 'REQUEST_COMPANION_PROFILE_COMPUTER',
        'REQUEST_COMPANION_PROFILE_GLASSES', 'REQUEST_COMPANION_PROFILE_NEARBY_DEVICE_STREAMING',
        'REQUEST_COMPANION_PROFILE_WATCH', 'REQUEST_COMPANION_RUN_IN_BACKGROUND',
        'REQUEST_COMPANION_SELF_MANAGED', 'REQUEST_COMPANION_START_FOREGROUND_SERVICES_FROM_BACKGROUND',
        'REQUEST_COMPANION_USE_DATA_IN_BACKGROUND', 'REQUEST_DELETE_PACKAGES',
        'REQUEST_IGNORE_BATTERY_OPTIMIZATIONS', 'REQUEST_INSTALL_PACKAGES',
        'REQUEST_OBSERVE_COMPANION_DEVICE_PRESENCE', 'REQUEST_PASSWORD_COMPLEXITY',
        'RESTART_PACKAGES', 'SCHEDULE_EXACT_ALARM', 'SEND_RESPOND_VIA_MESSAGE',
        'SEND_SMS', 'SET_ALARM', 'SET_ALWAYS_FINISH', 'SET_ANIMATION_SCALE',
        'SET_DEBUG_APP', 'SET_PREFERRED_APPLICATIONS', 'SET_PROCESS_LIMIT',
        'SET_TIME', 'SET_TIME_ZONE', 'SET_WALLPAPER', 'SET_WALLPAPER_HINTS',
        'SIGNAL_PERSISTENT_PROCESSES', 'SMS_FINANCIAL_TRANSACTIONS',
        'START_FOREGROUND_SERVICES_FROM_BACKGROUND', 'START_VIEW_APP_FEATURES',
        'START_VIEW_PERMISSION_USAGE', 'STATUS_BAR', 'SUBSCRIBED_FEEDS_READ',
        'SUBSCRIBED_FEEDS_WRITE', 'SYSTEM_ALERT_WINDOW', 'TRANSMIT_IR',
        'UNINSTALL_SHORTCUT', 'UPDATE_DEVICE_STATS', 'UWB_RANGING',
        'USE_BIOMETRIC', 'USE_EXACT_ALARM', 'USE_FINGERPRINT', 'USE_FULL_SCREEN_INTENT',
        'USE_ICC_AUTH_WITH_DEVICE_IDENTIFIER', 'USE_SIP', 'USE_WIFI_SCREENSHARING_API',
        'VIBRATE', 'WAKE_LOCK', 'WRITE_APN_SETTINGS', 'WRITE_CALENDAR',
        'WRITE_CALL_LOG', 'WRITE_CONTACTS', 'WRITE_EXTERNAL_STORAGE',
        'WRITE_GSERVICES', 'WRITE_SECURE_SETTINGS', 'WRITE_SETTINGS',
        'WRITE_SMS', 'WRITE_SYNC_SETTINGS', 'WRITE_VOICEMAIL',
    ]
])

def _droiddetective_score(all_permissions: list[str]) -> tuple[int, list[str], list[str]]:
    """
    DroidDetective-inspired ML-weighted APK permission scoring.
    Uses feature importance weights derived from RandomForest model trained on
    ~14 malware families + ~100 Google Play apps. Accuracy: 93.1%

    Returns: (score, dangerous_perms_with_desc, warnings)
    """
    if not all_permissions:
        return 0, [], []

    total_perms = len(all_permissions)
    proprietary_perms = [p for p in all_permissions if p not in _STANDARD_ANDROID_PERMISSIONS]
    prop_count = len(proprietary_perms)

    # Feature 1: num_of_permissions (weight 0.124 → scale to max 20 points)
    # DroidDetective: this is the SINGLE most predictive feature
    perm_count_score = min(20, int(total_perms * 0.6))

    # Feature 2: other_permission count (weight 0.102 → max 15 points)
    # Non-standard / proprietary permissions are strong malware indicators
    prop_score = min(15, prop_count * 3)

    # Feature 3+: Individual permission weights (ML-derived, scaled to max 50)
    weighted_found = []
    perm_score_total = 0.0
    for perm in all_permissions:
        if perm in _DD_WEIGHTS:
            w, desc = _DD_WEIGHTS[perm]
            weighted_found.append((perm, w, desc))
            perm_score_total += w

    individual_score = min(50, int(perm_score_total))
    total_score = perm_count_score + prop_score + individual_score

    warnings = []
    if total_perms > 30:
        warnings.append(f"Jumlah total permission sangat tinggi: {total_perms} (median app normal ~8)")
    elif total_perms > 15:
        warnings.append(f"Jumlah permission di atas rata-rata: {total_perms}")

    if prop_count > 0:
        warnings.append(f"{prop_count} permission proprietary/non-standard ditemukan: {', '.join(proprietary_perms[:5])}")

    dangerous = [(p, d) for p, _, d in sorted(weighted_found, key=lambda x: -x[1])[:10]]
    return min(total_score, 75), dangerous, warnings


# ── Helper: MalwareBazaar hash lookup ────────────────────────────────────────

def _check_malwarebazaar(sha256_hash: str):
    """Check file hash against abuse.ch MalwareBazaar (free, no key needed)."""
    try:
        payload = f"query=get_info&hash={sha256_hash}".encode('utf-8')
        req = urllib.request.Request(
            "https://mb-api.abuse.ch/api/v1/",
            data=payload,
            headers={'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'PhishDeep/2.0'}
        )
        resp = urllib.request.urlopen(req, timeout=6)
        result = json.loads(resp.read().decode('utf-8'))
        if result.get('query_status') == 'ok':
            data = result.get('data', [{}])[0]
            return {
                'found': True,
                'malware_family': data.get('tags', ['Unknown'])[0] if data.get('tags') else 'Unknown',
                'signature': data.get('signature', 'Unknown'),
                'file_type': data.get('file_type', 'Unknown'),
                'reporter': data.get('reporter', 'Unknown'),
                'first_seen': data.get('first_seen', ''),
            }
        return {'found': False}
    except Exception:
        return None  # API unreachable

# ── Helper: Entropy of byte array ────────────────────────────────────────────
def _byte_entropy(data: bytes) -> float:
    if not data:
        return 0.0
    freq = [0] * 256
    for b in data:
        freq[b] += 1
    n = len(data)
    entropy = 0.0
    for f in freq:
        if f > 0:
            p = f / n
            entropy -= p * math.log2(p)
    return entropy

# ── Helper: Decode PDF FlateDecode streams ────────────────────────────────────
def _decode_pdf_streams(raw: bytes) -> list[str]:
    """Extract and decompress all FlateDecode streams from a PDF."""
    decoded = []
    pattern = re.compile(rb'stream\r?\n(.*?)\r?\nendstream', re.DOTALL)
    for m in pattern.finditer(raw):
        chunk = m.group(1)
        try:
            decoded.append(zlib.decompress(chunk).decode('utf-8', errors='ignore'))
        except Exception:
            try:
                decoded.append(zlib.decompress(chunk, -15).decode('utf-8', errors='ignore'))
            except Exception:
                pass
    return decoded

# ── Helper: Detect JS obfuscation in code ────────────────────────────────────
def _detect_js_obfuscation(js_code: str) -> list[str]:
    patterns = {
        r'\\u[0-9a-fA-F]{4}': "Unicode escape sequences (obfuscation)",
        r'String\.fromCharCode\s*\(': "String.fromCharCode (char-by-char assembly)",
        r'unescape\s*\(': "unescape() (encoded payload expansion)",
        r'eval\s*\(': "eval() (dynamic code execution)",
        r'decodeURIComponent\s*\(': "decodeURIComponent (URL-encoded payload)",
        r'charCodeAt\s*\(': "charCodeAt (reverse string extraction)",
        r'[A-Za-z0-9+/]{80,}={0,2}': "Long base64 string (encoded payload)",
        r'\\x[0-9a-fA-F]{2}': "Hex escape sequences",
        r'document\.write\s*\(': "document.write injection",
        r'location\s*=\s*[\'"]http': "Forced redirect via location",
        r'window\.open\s*\(': "window.open (popup/redirect)",
        r'XMLHttpRequest': "XMLHttpRequest (hidden network call)",
        r'fetch\s*\(': "fetch() API (hidden network call)",
    }
    found = []
    for pat, desc in patterns.items():
        if re.search(pat, js_code):
            found.append(desc)
    return found

# ── Helper: APK ZIP entry inspection ─────────────────────────────────────────
def _parse_apk_entries(raw: bytes) -> list[str]:
    """Extract file names from APK (ZIP) central directory."""
    entries = []
    pos = 0
    while pos < len(raw) - 4:
        if raw[pos:pos+4] == b'PK\x01\x02':
            try:
                fname_len = struct.unpack_from('<H', raw, pos + 28)[0]
                fname = raw[pos + 46: pos + 46 + fname_len].decode('utf-8', errors='ignore')
                entries.append(fname)
                pos += 46 + fname_len
            except Exception:
                pos += 1
        else:
            pos += 1
    return entries


def analyze_file(file_url, file_type):
    details = []
    risk_score = 0
    extracted_code = ""
    domain_info = {}
    frameworks = []
    redirect_chain = []
    threat_indicators = []

    try:
        if not is_safe_url(file_url):
            raise ValueError("Target URL dilarang karena merujuk pada jaringan internal/lokal (Potensi SSRF diblokir).")

        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        details.append({"step": "Persiapan Engine", "finding": "Mengunduh file dari brankas terenkripsi untuk analisis forensik mendalam..."})
        req = urllib.request.Request(file_url, headers={
            'User-Agent': 'PhishDeep-ForensicAnalyzer/3.0',
            'Accept': '*/*'
        })
        response = urllib.request.urlopen(req, timeout=15, context=ctx)
        raw_content = response.read()
        file_size = len(raw_content)
        content_type = response.headers.get('Content-Type', 'unknown')
        details.append({"step": "Integrasi File", "finding": f"File berhasil diekstraksi ({file_size:,} bytes). Content-Type: {content_type}."})

        # ── HASH COMPUTATION ─────────────────────────────────────────────────
        md5_hash    = hashlib.md5(raw_content).hexdigest()
        sha1_hash   = hashlib.sha1(raw_content).hexdigest()
        sha256_hash = hashlib.sha256(raw_content).hexdigest()
        details.append({"step": "Hash Fingerprinting", "finding": f"MD5: {md5_hash} | SHA1: {sha1_hash} | SHA256: {sha256_hash}"})

        # ── MALWAREBAZAAR HASH LOOKUP ─────────────────────────────────────────
        mb_result = _check_malwarebazaar(sha256_hash)
        if mb_result is None:
            details.append({"step": "Threat Intel (MalwareBazaar)", "finding": "API tidak dapat dijangkau. Melewati pemeriksaan basis data malware."})
        elif mb_result.get('found'):
            risk_score += 95
            fam = mb_result.get('malware_family', '?')
            sig = mb_result.get('signature', '?')
            first = mb_result.get('first_seen', '?')
            details.append({"step": "Threat Intel (MalwareBazaar)", "finding": f"MATCH TERDETEKSI: Hash SHA256 ditemukan di database abuse.ch MalwareBazaar! Keluarga: {fam}, Signature: {sig}, Pertama dilaporkan: {first}."})
            threat_indicators.append(f"Known malware: {fam} ({sig})")
        else:
            details.append({"step": "Threat Intel (MalwareBazaar)", "finding": f"Hash tidak ditemukan di MalwareBazaar. File tidak teridentifikasi sebagai sampel malware yang dikenal."})

        # ── MAGIC BYTE DETECTION ─────────────────────────────────────────────
        magic = raw_content[:8]
        is_pdf          = raw_content[:4] == b'%PDF'
        is_zip          = magic[:2] == b'PK'
        is_pe           = magic[:2] == b'MZ'
        is_elf          = magic[:4] == b'\x7fELF'
        is_office_legacy = magic[:8] == b'\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1'
        is_rtf          = raw_content[:5] == b'{\\rtf'

        format_str = "PDF" if is_pdf else ("ZIP/OOXML/APK" if is_zip else ("PE-EXE" if is_pe else ("ELF" if is_elf else ("OLE-Office" if is_office_legacy else ("RTF" if is_rtf else f"Unknown({magic.hex()[:12]})")))))
        details.append({"step": "Magic Byte Verification", "finding": f"Format terdeteksi: {format_str}. File size: {file_size:,} bytes."})

        # ── GLOBAL ENTROPY CHECK ──────────────────────────────────────────────
        global_entropy = _byte_entropy(raw_content)
        if global_entropy > 7.5:
            risk_score += 15
            details.append({"step": "Entropy Analysis", "finding": f"Entropi file sangat tinggi ({global_entropy:.3f}/8.0). Indikasi kuat enkripsi atau packing — teknik umum menyembunyikan payload berbahaya."})
        elif global_entropy > 6.8:
            risk_score += 5
            details.append({"step": "Entropy Analysis", "finding": f"Entropi file sedang-tinggi ({global_entropy:.3f}/8.0). Beberapa bagian mungkin dikompresi atau diobfuscate."})
        else:
            details.append({"step": "Entropy Analysis", "finding": f"Entropi file normal ({global_entropy:.3f}/8.0). Tidak ada indikasi packing atau enkripsi menyeluruh."})

        # ── EMBEDDED EXECUTABLE CHECK ─────────────────────────────────────────
        if is_pe or is_elf:
            risk_score += 90
            details.append({"step": "Executable Detection", "finding": f"KRITIS: File adalah executable ({format_str}) yang disamarkan sebagai dokumen. Ancaman sangat tinggi."})

        if not is_pe and not is_elf:
            # Search for embedded PE/ELF headers (polyglot/dropper)
            pe_sigs = [i for i in range(1, min(len(raw_content)-1, 200000)) if raw_content[i:i+2] == b'MZ']
            elf_sigs = [i for i in range(1, min(len(raw_content)-3, 200000)) if raw_content[i:i+4] == b'\x7fELF']
            if pe_sigs:
                risk_score += 60
                details.append({"step": "Polyglot/Dropper Detection", "finding": f"TINGGI: Ditemukan {len(pe_sigs)} embedded Windows executable (MZ) di dalam file pada offset {pe_sigs[:3]}."})
                extracted_code = f"Embedded PE at offsets: {pe_sigs[:5]}"
            elif elf_sigs:
                risk_score += 50
                details.append({"step": "Polyglot/Dropper Detection", "finding": f"TINGGI: Ditemukan embedded Linux/Android native binary (ELF) di dalam file."})
            else:
                details.append({"step": "Polyglot/Dropper Detection", "finding": "Tidak ada embedded executable tersembunyi di dalam file."})

        # ═════════════════════════════════════════════════════════════════════
        # APK ANALYSIS
        # ═════════════════════════════════════════════════════════════════════
        if file_type.lower() == 'apk':
            frameworks.append("Android Package (APK)")

            # --- ZIP Entry inspection ---
            apk_entries = _parse_apk_entries(raw_content)
            has_dex     = sum(1 for e in apk_entries if re.match(r'classes\d*\.dex', e))
            has_native  = [e for e in apk_entries if e.endswith('.so')]
            has_manifest = 'AndroidManifest.xml' in apk_entries

            details.append({"step": "APK Structure", "finding": f"Ditemukan {len(apk_entries)} entri file: {has_dex} DEX class(es), {len(has_native)} native library (.so), Manifest: {'Ada' if has_manifest else 'TIDAK ADA'}."})

            if has_dex > 2:
                risk_score += 20
                details.append({"step": "Multi-DEX Detection", "finding": f"PERINGATAN: {has_dex} file DEX terdeteksi — pola dropper malware yang memuat payload tambahan secara dinamis."})

            if not has_manifest:
                risk_score += 30
                details.append({"step": "Manifest Check", "finding": "KRITIS: AndroidManifest.xml tidak ditemukan. APK sangat mencurigakan — kemungkinan termodifikasi secara ilegal."})

            SUSPICIOUS_LIBS = {'.so': 0, 'libdvm': 10, 'libart': 5, 'libhook': 25, 'libroot': 20, 'libinject': 30, 'libpatch': 20, 'libbypass': 25}
            for lib in has_native:
                lib_lower = lib.lower()
                for kw, score in SUSPICIOUS_LIBS.items():
                    if kw in lib_lower and score > 0:
                        risk_score += score
                        details.append({"step": "Native Lib Analysis", "finding": f"MENCURIGAKAN: Library native '{lib}' mengandung pola berbahaya ('{kw}') — kemungkinan hooking/bypass tool."})
                        break
            if has_native and all(not any(kw in lib.lower() for kw in ['hook', 'root', 'inject', 'patch', 'bypass']) for lib in has_native):
                details.append({"step": "Native Lib Analysis", "finding": f"Library native ditemukan: {', '.join(has_native[:5])}. Tidak ada nama library berbahaya yang dikenal."})

            # --- Permission analysis (DroidDetective ML-weighted scoring) ---
            # Method: RandomForest feature importance weights from github.com/user1342/DroidDetective
            # Accuracy: 93.1% on 14 malware families vs 100 Google Play apps
            permissions = re.findall(rb'android\.permission\.[A-Z_]+', raw_content)
            unique_perms = list(set([p.decode('utf-8', errors='ignore') for p in permissions]))

            details.append({"step": "Manifest Extraction", "finding": f"Berhasil mengekstrak {len(unique_perms)} permission dari AndroidManifest."})

            dd_score, dd_dangerous, dd_warnings = _droiddetective_score(unique_perms)
            risk_score += dd_score

            if dd_warnings:
                for w in dd_warnings:
                    details.append({"step": "DroidDetective Analysis", "finding": f"PERINGATAN: {w}"})

            if dd_dangerous:
                desc = "; ".join([f"{p.split('.')[-1]} ({d})" for p, d in dd_dangerous[:6]])
                details.append({"step": "Permission Audit (ML-weighted)", "finding": f"KRITIS: {len(dd_dangerous)} permission tinggi-risiko (ML-scored): {desc}."})
                extracted_code = "\n".join([p for p, _ in dd_dangerous])
            else:
                details.append({"step": "Permission Audit (ML-weighted)", "finding": f"Score ML-weighted rendah. {len(unique_perms)} permission ditemukan, tidak ada yang memiliki bobot risiko tinggi."})

            # --- Dangerous API in bytecode ---
            DANGEROUS_APIS = {
                b'Landroid/telephony/SmsManager;': (25, "SmsManager API (pencurian OTP)"),
                b'Ljava/lang/Runtime;->exec': (30, "Runtime.exec (eksekusi shell command)"),
                b'Ljava/lang/reflect/Method;->invoke': (15, "Reflection API (evasion/obfuscation)"),
                b'Landroid/content/pm/PackageInstaller;': (25, "PackageInstaller (silent APK install)"),
                b'Ldalvik/system/DexClassLoader;': (30, "DexClassLoader (memuat kode luar secara dinamis)"),
                b'Landroid/app/admin/DevicePolicyManager;': (20, "DevicePolicyManager (kontrol perangkat penuh)"),
                b'Ljava/net/URL;->openConnection': (10, "URL.openConnection (komunikasi tersembunyi)"),
                b'Landroid/view/accessibility/AccessibilityEvent;': (20, "AccessibilityEvent (membaca input pengguna)"),
                b'Landroid/app/NotificationListenerService;': (15, "NotificationListener (membaca semua notifikasi)"),
                b'Ljava/lang/ProcessBuilder;': (25, "ProcessBuilder (eksekusi proses sistem)"),
                b'android/content/ClipboardManager': (15, "ClipboardManager (membaca clipboard)"),
                b'Lcom/android/internal/telephony': (20, "Internal telephony API (eksploitasi SIM)"),
            }
            found_apis = []
            for api_b, (score, desc) in DANGEROUS_APIS.items():
                if api_b in raw_content:
                    found_apis.append((api_b.decode('utf-8', errors='ignore'), score, desc))

            if found_apis:
                api_score = min(45, sum(s for _, s, _ in found_apis))
                risk_score += api_score
                api_desc = "; ".join([d for _, _, d in found_apis[:5]])
                details.append({"step": "Bytecode Analysis", "finding": f"TERDETEKSI: {len(found_apis)} API berbahaya di bytecode Dalvik: {api_desc}."})
            else:
                details.append({"step": "Bytecode Analysis", "finding": "Tidak ada pemanggilan API berbahaya pada bytecode Dalvik."})

            # --- Obfuscation: b64 density ---
            b64_chunks = re.findall(rb'[A-Za-z0-9+/]{60,}={0,2}', raw_content)
            if len(b64_chunks) > 30:
                risk_score += 15
                details.append({"step": "Obfuscation Detection", "finding": f"Terdeteksi {len(b64_chunks)} segmen data encoded/base64 dalam bytecode — indikasi payload tersembunyi."})
            else:
                details.append({"step": "Obfuscation Detection", "finding": f"Tingkat obfuscation rendah ({len(b64_chunks)} segmen encoded). Tidak ada anomali signifikan."})

            # --- Self-signed certificate check ---
            if b'X.509' in raw_content or b'META-INF/' in raw_content:
                if b'CERT.RSA' in raw_content or b'CERT.DSA' in raw_content:
                    # Check for debug certificate common names
                    debug_cert_indicators = [b'Android Debug', b'Unknown', b'test-key', b'androiddebugkey']
                    found_debug = [d.decode() for d in debug_cert_indicators if d in raw_content]
                    if found_debug:
                        risk_score += 20
                        details.append({"step": "Certificate Analysis", "finding": f"PERINGATAN: APK ditandatangani dengan debug/self-signed certificate ({', '.join(found_debug)}). APK resmi tidak menggunakan sertifikat ini."})
                    else:
                        details.append({"step": "Certificate Analysis", "finding": "Sertifikat digital ditemukan. Bukan sertifikat debug yang umum digunakan pada APK tidak resmi."})

        # ═════════════════════════════════════════════════════════════════════
        # PDF ANALYSIS
        # ═════════════════════════════════════════════════════════════════════
        elif is_pdf:
            frameworks.append("PDF Document")

            # ── PyMuPDF forensic analysis (accurate structural parsing) ───────
            if PYMUPDF_AVAILABLE:
                details.append({"step": "PDF Engine", "finding": "PyMuPDF engine aktif — melakukan analisis forensik struktural PDF secara mendalam."})
                mupdf = _analyze_pdf_pymupdf(raw_content)

                if "error" not in mupdf:
                    pg = mupdf['page_count']
                    obj = mupdf['obj_count']
                    emb = mupdf['embfile_count']
                    enc = mupdf['encrypted']
                    details.append({"step": "PDF Structure (PyMuPDF)", "finding": f"Halaman: {pg}, Total objek: {obj}, Embedded files: {emb}, Terenkripsi: {enc}."})

                    # Metadata
                    meta = mupdf.get('metadata', {})
                    SUSPICIOUS_CREATORS = ['python', 'php', 'perl', 'ruby', 'node', 'pyPDF', 'pikepdf', 'fpdf', 'dompdf', 'reportlab', 'pdfkit']
                    if meta:
                        creator = (meta.get('creator', '') + meta.get('producer', '')).lower()
                        author = meta.get('author', '')
                        meta_str = ' | '.join([f"{k}: {v[:60]}" for k, v in meta.items() if k in ['author','creator','producer','title']])
                        details.append({"step": "PDF Metadata (PyMuPDF)", "finding": f"Metadata: {meta_str}"})
                        if any(s in creator for s in SUSPICIOUS_CREATORS):
                            risk_score += 15
                            details.append({"step": "PDF Metadata (PyMuPDF)", "finding": f"PERHATIAN: PDF dibuat secara programatis ({creator[:60]}) — pola umum phishing PDF massal."})
                    else:
                        risk_score += 10
                        details.append({"step": "PDF Metadata (PyMuPDF)", "finding": "Metadata dihapus — teknik anti-forensik yang sering digunakan penyerang."})

                    # Dangerous object keys found via XRef scan
                    dkeys = mupdf.get('dangerous_keys', [])
                    if dkeys:
                        KEY_SCORES = {'JS': 20, 'JavaScript': 20, 'OpenAction': 15, 'AA': 10, 'Launch': 30, 'EmbeddedFile': 20, 'XFA': 15, 'RichMedia': 15}
                        key_score = min(80, sum(KEY_SCORES.get(k, 5) for k in dkeys))
                        risk_score += key_score
                        details.append({"step": "PDF XRef Object Scan (PyMuPDF)", "finding": f"ANCAMAN: {len(dkeys)} kunci berbahaya ditemukan dalam object tree PDF: {', '.join(dkeys)}."})
                    else:
                        details.append({"step": "PDF XRef Object Scan (PyMuPDF)", "finding": "Tidak ada kunci berbahaya (JavaScript, Launch, OpenAction, dll) dalam object tree PDF."})

                    # JavaScript
                    if mupdf['has_javascript']:
                        js_snippets = mupdf.get('javascript_snippets', [])
                        all_js = ' '.join(js_snippets)
                        obf = _detect_js_obfuscation(all_js)
                        if obf:
                            risk_score += min(25, len(obf) * 8)
                            details.append({"step": "JavaScript Deep Analysis (PyMuPDF)", "finding": f"KRITIS: JavaScript aktif dengan {len(obf)} pola obfuscation: {'; '.join(obf[:4])}."})
                            extracted_code = js_snippets[0][:300] if js_snippets else ''
                        else:
                            details.append({"step": "JavaScript Deep Analysis (PyMuPDF)", "finding": f"JavaScript ditemukan namun tidak ada teknik obfuscation terdeteksi."})

                    # Embedded files
                    if emb > 0:
                        risk_score += min(30, emb * 10)
                        details.append({"step": "Embedded Files (PyMuPDF)", "finding": f"TINGGI: {emb} file tertanam ditemukan di dalam PDF — risiko dropper/backdoor."})

                    # Suspicious links
                    susp_links = mupdf.get('suspicious_links', [])
                    all_links = mupdf.get('all_links', [])
                    if susp_links:
                        risk_score += min(20, len(susp_links) * 7)
                        details.append({"step": "Link Analysis (PyMuPDF)", "finding": f"PERINGATAN: {len(susp_links)} link phishing ditemukan: {', '.join(susp_links[:3])}."})
                    elif all_links:
                        details.append({"step": "Link Analysis (PyMuPDF)", "finding": f"Ditemukan {len(all_links)} link. Tidak ada pola phishing terdeteksi."})

                    # Launch actions
                    launches = mupdf.get('launch_actions', [])
                    if launches:
                        risk_score += 40
                        details.append({"step": "Launch Action (PyMuPDF)", "finding": f"SANGAT KRITIS: {len(launches)} perintah Launch ditemukan — dapat mengeksekusi shell command: {str(launches[0])[:100]}."})

                    # OpenAction / AA
                    if mupdf['open_action']:
                        risk_score += 15
                        details.append({"step": "Auto-Execute Check (PyMuPDF)", "finding": "TINGGI: OpenAction terdeteksi — kode dijalankan otomatis saat PDF dibuka."})
                    elif mupdf['auto_action']:
                        risk_score += 10
                        details.append({"step": "Auto-Execute Check (PyMuPDF)", "finding": "PERINGATAN: Additional-Action (AA) terdeteksi — trigger otomatis pada interaksi pengguna."})
                    else:
                        details.append({"step": "Auto-Execute Check (PyMuPDF)", "finding": "Tidak ada OpenAction atau auto-action trigger terdeteksi."})

                    # Form fields (credential harvesting)
                    ff = mupdf.get('form_fields', 0)
                    if ff > 0:
                        risk_score += min(15, ff * 3)
                        details.append({"step": "Form Analysis (PyMuPDF)", "finding": f"PERHATIAN: {ff} form field ditemukan — kemungkinan formulir pengumpulan kredensial."})

                else:
                    details.append({"step": "PDF Engine", "finding": f"PyMuPDF error saat parsing: {mupdf.get('error', 'unknown')}. Beralih ke raw byte scanning."})
            else:
                details.append({"step": "PDF Engine", "finding": "PyMuPDF tidak tersedia. Menggunakan raw byte scanner sebagai fallback."})

            # --- PDF version & trailer ---
            version_match = re.match(rb'%PDF-(\d+\.\d+)', raw_content[:20])
            pdf_version = version_match.group(1).decode() if version_match else 'unknown'
            obj_count = len(re.findall(rb'\d+ \d+ obj', raw_content))
            details.append({"step": "PDF Structure Analysis", "finding": f"Versi PDF: {pdf_version}. Total objek: {obj_count}."})

            # --- PDF metadata forensics ---
            meta_fields = {
                b'/Author': 'Author', b'/Creator': 'Creator', b'/Producer': 'Producer',
                b'/Title': 'Title', b'/Subject': 'Subject', b'/Keywords': 'Keywords'
            }
            meta_values = {}
            for field, label in meta_fields.items():
                m = re.search(field + rb'\s*\(([^)]{1,200})\)', raw_content)
                if m:
                    meta_values[label] = m.group(1).decode('utf-8', errors='ignore')

            KNOWN_MALICIOUS_CREATORS = ['fpdf', 'dompdf', 'fpdi', 'mPDF', 'tcpdf', 'reportlab', 'pdfkit', 'ghostscript', 'cairo', 'libreoffice', 'openoffice', 'microsoft word', 'nitro']
            SUSPICIOUS_CREATORS = ['python', 'php', 'perl', 'ruby', 'node', 'javascript', 'pyPDF', 'pikepdf']

            if meta_values:
                meta_str = " | ".join([f"{k}: {v[:50]}" for k, v in meta_values.items()])
                details.append({"step": "PDF Metadata Forensics", "finding": f"Metadata: {meta_str}"})
                creator = meta_values.get('Creator', '').lower() + meta_values.get('Producer', '').lower()
                if any(s in creator for s in SUSPICIOUS_CREATORS):
                    risk_score += 15
                    details.append({"step": "PDF Metadata Forensics", "finding": f"PERHATIAN: PDF dibuat oleh tool skrip/programmatis ({creator[:50]}) — bukan authoring tool standar. Sering digunakan untuk generate phishing PDF massal."})
            else:
                risk_score += 10
                details.append({"step": "PDF Metadata Forensics", "finding": "PERHATIAN: Tidak ada metadata ditemukan. Metadata dihapus — teknik yang digunakan penyerang untuk menghilangkan jejak."})

            # --- Structural threat indicators ---
            PDF_THREATS = {
                b'/JS':                   (20, 40, "JavaScript action stream"),
                b'/JavaScript':           (20, 40, "JavaScript action (explicit)"),
                b'/OpenAction':           (15, 30, "Auto-open action saat dibuka"),
                b'/AA':                   (10, 20, "Additional-Action (trigger otomatis)"),
                b'/Launch':               (25, 50, "Shell Launch command"),
                b'/EmbeddedFile':         (20, 40, "File tersembunyi dalam PDF"),
                b'/RichMedia':            (15, 30, "RichMedia embed (aktivasi eksternal)"),
                b'/JBIG2Decode':          (15, 15, "Decoder exploit (CVE-2009-0658)"),
                b'/XFA':                  (10, 20, "XFA Form (eksekusi XML berbahaya)"),
                b'eval(':                 (20, 40, "eval() JavaScript"),
                b'this.exportDataObject':(30, 30, "exportDataObject (exfiltrate embedded)"),
                b'util.printf':           (15, 15, "util.printf (buffer overflow exploit)"),
                b'Collab.collectEmailInfo':(25, 25, "collectEmailInfo (harvesting)"),
                b'app.alert':             (5,  10, "app.alert (social engineering)"),
                b'/URI':                  (3,  12, "External URI hyperlink"),
                b'/AcroForm':             (5,  10, "AcroForm (data collection form)"),
                b'/Encrypt':             (8,  16, "Encrypted stream"),
                b'/ObjStm':              (5,  15, "Object stream (obfuscation layer)"),
                b'/XObject':             (3,   9, "External object reference"),
                b'/Annot':               (2,   6, "Annotation (potential clickjack)"),
            }

            found_pdf_threats = []
            for pattern, (score, max_s, desc) in PDF_THREATS.items():
                count = raw_content.count(pattern)
                if count > 0:
                    actual = min(max_s, score * count)
                    found_pdf_threats.append((pattern.decode('utf-8', errors='ignore'), count, actual, desc))

            if found_pdf_threats:
                total_pdf_score = min(85, sum(s for _, _, s, _ in found_pdf_threats))
                risk_score += total_pdf_score
                threat_summary = "; ".join([f"'{p}'×{c} ({d})" for p, c, _, d in found_pdf_threats[:7]])
                details.append({"step": "PDF Structure Threat Scan", "finding": f"ANCAMAN: {len(found_pdf_threats)} indikator berbahaya: {threat_summary}."})
                extracted_code = "\n".join([f"{p} (×{c}): {d}" for p, c, _, d in found_pdf_threats])
            else:
                details.append({"step": "PDF Structure Threat Scan", "finding": "Tidak ada indikator action berbahaya dalam struktur PDF. Dokumen terlihat pasif."})

            # --- Deep stream decoding + JS analysis ---
            decoded_streams = _decode_pdf_streams(raw_content)
            all_stream_text = " ".join(decoded_streams)
            if decoded_streams:
                js_snippets = []
                for stream in decoded_streams:
                    if any(kw in stream for kw in ['function', 'eval(', 'var ', 'new ', 'document.', 'window.', '.toString(', 'unescape(']):
                        js_snippets.append(stream[:500])

                if js_snippets:
                    obf_patterns = _detect_js_obfuscation(" ".join(js_snippets))
                    if obf_patterns:
                        risk_score += min(30, len(obf_patterns) * 10)
                        details.append({"step": "JavaScript Deep Analysis", "finding": f"KRITIS: Ditemukan JavaScript dalam stream dengan {len(obf_patterns)} pola obfuscation aktif: {'; '.join(obf_patterns[:4])}."})
                        if not extracted_code:
                            extracted_code = js_snippets[0][:300]
                    else:
                        details.append({"step": "JavaScript Deep Analysis", "finding": f"Ditemukan {len(js_snippets)} stream JavaScript. Tidak ada teknik obfuscation terdeteksi."})
                else:
                    details.append({"step": "JavaScript Deep Analysis", "finding": f"Berhasil mendekripsi {len(decoded_streams)} stream. Tidak ditemukan kode JavaScript aktif."})

                # Entropy of decoded content
                joined_bytes = all_stream_text.encode('utf-8', errors='ignore')
                stream_entropy = _byte_entropy(joined_bytes)
                if stream_entropy > 7.2:
                    risk_score += 10
                    details.append({"step": "Stream Entropy", "finding": f"Entropi stream tinggi ({stream_entropy:.3f}/8.0) — kemungkinan encrypted payload dalam stream."})
                else:
                    details.append({"step": "Stream Entropy", "finding": f"Entropi stream normal ({stream_entropy:.3f}/8.0)."})

            # --- Embedded URL extraction ---
            embedded_urls = re.findall(rb'https?://[^\s\)\]>"\'<\x00-\x1f]{10,200}', raw_content)
            if embedded_urls:
                unique_urls = list(set([u.decode('utf-8', errors='ignore') for u in embedded_urls]))[:15]
                PHISH_KEYWORDS = ['bit.ly', 'tinyurl', 't.co', 'goo.gl', 'ow.ly', 'rb.gy', 'cutt.ly', 'login', 'verify', 'secure', 'account', 'password', 'update', 'confirm', 'suspend', 'verify', 'banking', 'paypal', 'signin', 'credential']
                suspicious_urls = [u for u in unique_urls if any(kw in u.lower() for kw in PHISH_KEYWORDS)]
                if suspicious_urls:
                    risk_score += min(25, len(suspicious_urls) * 8)
                    details.append({"step": "Embedded URL Forensics", "finding": f"PERINGATAN: {len(suspicious_urls)} URL phishing/shortlink ditemukan: {', '.join(suspicious_urls[:4])}."})
                else:
                    details.append({"step": "Embedded URL Forensics", "finding": f"Ditemukan {len(unique_urls)} URL. Tidak ada shortlink atau pola phishing terdeteksi."})
            else:
                details.append({"step": "Embedded URL Forensics", "finding": "Tidak ada URL eksternal dalam dokumen."})

            # --- Stream count anomaly ---
            flate_count = raw_content.count(b'/FlateDecode')
            if flate_count > 50:
                risk_score += 10
                details.append({"step": "Stream Complexity", "finding": f"PERHATIAN: {flate_count} FlateDecode streams — struktur sangat kompleks, tidak wajar untuk dokumen normal."})
            else:
                details.append({"step": "Stream Complexity", "finding": f"Jumlah stream normal: {flate_count} FlateDecode streams."})

        # ═════════════════════════════════════════════════════════════════════
        # OFFICE XML (DOCX/XLSX/PPTX) ANALYSIS
        # ═════════════════════════════════════════════════════════════════════
        elif is_zip and file_type.lower() != 'apk':
            frameworks.append("Office XML Document (OOXML)")

            # --- VBA Macro ---
            if b'vbaProject.bin' in raw_content:
                risk_score += 55
                details.append({"step": "VBA Macro Detection", "finding": "KRITIS: vbaProject.bin ditemukan — modul VBA Macro aktif. Risiko eksekusi kode otomatis saat dibuka."})
                extracted_code = "vbaProject.bin detected — VBA Macro container present"

                # Try to find macro content
                macro_keywords = [b'Auto_Open', b'AutoOpen', b'AutoExec', b'Workbook_Open', b'Document_Open', b'Shell(', b'CreateObject', b'WScript', b'PowerShell', b'cmd.exe', b'URLDownloadToFile', b'GetObject', b'Environ']
                found_macro_kw = [kw.decode() for kw in macro_keywords if kw in raw_content]
                if found_macro_kw:
                    risk_score += min(30, len(found_macro_kw) * 8)
                    details.append({"step": "VBA Payload Analysis", "finding": f"SANGAT KRITIS: Auto-execution atau shell command dalam macro: {', '.join(found_macro_kw[:6])}."})
            else:
                details.append({"step": "VBA Macro Detection", "finding": "Tidak ditemukan vbaProject.bin. Dokumen bebas dari risiko macro VBA."})

            # --- External references ---
            ext_refs = re.findall(rb'Target="(https?://[^"]{10,})"', raw_content)
            if ext_refs:
                unique_ext = list(set([r.decode('utf-8', errors='ignore') for r in ext_refs]))[:15]
                SUSP_KW = ['login', 'verify', 'secure', 'account', 'payload', 'shell', 'cmd', 'powershell', 'download', 'update', 'phish', 'credential', 'token']
                suspicious_ext = [u for u in unique_ext if any(kw in u.lower() for kw in SUSP_KW)]
                if suspicious_ext:
                    risk_score += min(30, len(suspicious_ext) * 10)
                    details.append({"step": "External Relationship Check", "finding": f"PERINGATAN: {len(suspicious_ext)} external reference mencurigakan: {', '.join(suspicious_ext[:3])}."})
                else:
                    details.append({"step": "External Relationship Check", "finding": f"Ditemukan {len(unique_ext)} external link. Tidak ada target berbahaya terdeteksi."})
            else:
                details.append({"step": "External Relationship Check", "finding": "Tidak ada external relationship tersembunyi dalam dokumen."})

            # --- OLE/ActiveX ---
            if b'oleObject' in raw_content or b'ActiveX' in raw_content:
                risk_score += 25
                details.append({"step": "OLE/ActiveX Analysis", "finding": "TINGGI: OLE object atau ActiveX component ditemukan — vektor eksploitasi dokumen yang umum."})
            else:
                details.append({"step": "OLE/ActiveX Analysis", "finding": "Tidak ada OLE atau ActiveX yang tertanam."})

            # --- DDE exploit ---
            DDE_PATTERNS = [b'DDEAUTO', b'=CMD(', b'=SHELL(', b'=EXEC(', b'+CMD(', b'|CMD(', b'@SUM(', b'=HYPERLINK(']
            found_dde = [p.decode() for p in DDE_PATTERNS if p in raw_content]
            if found_dde:
                risk_score += min(40, len(found_dde) * 15)
                details.append({"step": "DDE/Formula Injection", "finding": f"KRITIS: Formula DDE berbahaya terdeteksi: {', '.join(found_dde)}. Dapat mengeksekusi perintah sistem tanpa macro."})
            else:
                details.append({"step": "DDE/Formula Injection", "finding": "Tidak ada formula DDE atau eksploitasi injeksi yang terdeteksi."})

            # --- Shared strings (XLSX formula injection) ---
            if b'sharedStrings' in raw_content:
                formula_count = len(re.findall(rb'[=+\-@|](?:CMD|SHELL|EXEC|HYPERLINK|IF\s*\()', raw_content))
                if formula_count > 0:
                    risk_score += 20
                    details.append({"step": "Spreadsheet Formula Scan", "finding": f"TINGGI: {formula_count} formula eksploitasi ditemukan dalam shared strings spreadsheet."})
                else:
                    details.append({"step": "Spreadsheet Formula Scan", "finding": "Tidak ada formula berbahaya dalam shared strings."})

            # --- Entropy of content ---
            content_entropy = _byte_entropy(raw_content[:50000])
            if content_entropy > 7.5:
                risk_score += 10
                details.append({"step": "Content Entropy", "finding": f"Entropi konten sangat tinggi ({content_entropy:.3f}/8.0) — kemungkinan payload terenkripsi dalam dokumen."})

        # ═════════════════════════════════════════════════════════════════════
        # LEGACY OFFICE OLE2 (DOC/XLS/PPT) ANALYSIS
        # ═════════════════════════════════════════════════════════════════════
        elif is_office_legacy:
            frameworks.append("Legacy Office Document (OLE2/CFB)")
            risk_score += 10  # Inherent risk of old format

            details.append({"step": "Format Risk", "finding": "Format Office lama (DOC/XLS/PPT - OLE2 Compound File Binary) terdeteksi. Format ini memiliki risiko inheren lebih tinggi."})

            MACRO_KW = [b'Macro', b'Module', b'VBA', b'VBAProject', b'Auto_Open', b'AutoOpen', b'Shell', b'WScript', b'CreateObject', b'PowerShell']
            found_macro = [kw.decode() for kw in MACRO_KW if kw in raw_content]
            if found_macro:
                risk_score += min(55, len(found_macro) * 8)
                details.append({"step": "VBA/Macro Scan", "finding": f"KRITIS: {len(found_macro)} indikator macro VBA ditemukan: {', '.join(found_macro[:6])}. Risiko eksekusi kode otomatis."})
            else:
                details.append({"step": "VBA/Macro Scan", "finding": "Tidak ada indikator macro VBA yang terdeteksi dalam file OLE ini."})

            DDE_PATTERNS = [b'DDEAUTO', b'=SHELL(', b'=EXEC(']
            found_dde = [p.decode() for p in DDE_PATTERNS if p in raw_content]
            if found_dde:
                risk_score += 35
                details.append({"step": "DDE Exploit Scan", "finding": f"KRITIS: Formula DDE eksploitasi dalam file lama: {', '.join(found_dde)}."})

        # ═════════════════════════════════════════════════════════════════════
        # RTF ANALYSIS
        # ═════════════════════════════════════════════════════════════════════
        elif is_rtf:
            frameworks.append("Rich Text Format (RTF)")

            RTF_THREATS = {
                b'\\objemb': (25, "Embedded OLE object"),
                b'\\objdata': (20, "OLE object raw data"),
                b'\\datastore': (15, "DataStore exploit pattern"),
                b'\\objupdate': (15, "OLE auto-update"),
                b'\\pict': (5, "Embedded picture (check for exploit)"),
                b'\\bin': (20, "Binary data block (common exploit vector)"),
                b'\\object': (10, "Generic object embedding"),
                b'\\dde': (30, "DDE field in RTF"),
            }
            found_rtf = []
            for pattern, (score, desc) in RTF_THREATS.items():
                if pattern in raw_content:
                    found_rtf.append((pattern.decode(), score, desc))
                    risk_score += score

            if found_rtf:
                risk_score = min(risk_score, 90)
                rtf_desc = "; ".join([f"{p} ({d})" for p, _, d in found_rtf])
                details.append({"step": "RTF Threat Analysis", "finding": f"ANCAMAN: {len(found_rtf)} indikator berbahaya dalam RTF: {rtf_desc}."})

                # Look for hex-encoded shellcode patterns
                hex_patterns = re.findall(rb'[0-9a-fA-F]{100,}', raw_content)
                if hex_patterns:
                    risk_score = min(100, risk_score + 20)
                    details.append({"step": "RTF Shellcode Check", "finding": f"KRITIS: Ditemukan {len(hex_patterns)} blok data hex panjang dalam RTF — indikasi shellcode atau payload terenkripsi (CVE-2017-11882 pattern)."})
                else:
                    details.append({"step": "RTF Shellcode Check", "finding": "Tidak ada blok hex shellcode yang mencurigakan terdeteksi."})
            else:
                details.append({"step": "RTF Threat Analysis", "finding": "Tidak ada indikator embedding berbahaya dalam RTF."})

        # ═════════════════════════════════════════════════════════════════════
        # GENERIC / UNKNOWN FORMAT
        # ═════════════════════════════════════════════════════════════════════
        else:
            frameworks.append("Document/File Media")
            risk_score += 20
            details.append({"step": "Format Check", "finding": f"Format tidak dikenal. Magic bytes: {magic.hex()}. File dengan format tidak dikenali selalu dicurigai."})

            GENERIC_THREATS = {
                b'PowerShell': (20, "PowerShell script"),
                b'cmd.exe': (25, "Command prompt execution"),
                b'WScript': (20, "Windows Script Host"),
                b'CreateObject': (15, "COM object creation"),
                b'eval(': (20, "eval() code execution"),
                b'document.write': (10, "DOM injection"),
                b'XMLHttpRequest': (5, "Hidden HTTP request"),
                b'mshta.exe': (25, "MSHTA (HTA script runner)"),
                b'regsvr32': (20, "regsvr32 (COM registration exploit)"),
                b'certutil': (20, "certutil (download & decode exploit)"),
                b'bitsadmin': (20, "bitsadmin (background download exploit)"),
            }
            found_generic = [(k.decode(), v[0], v[1]) for k, v in GENERIC_THREATS.items() if k in raw_content]
            if found_generic:
                risk_score += min(50, sum(s for _, s, _ in found_generic))
                desc = "; ".join([d for _, _, d in found_generic])
                details.append({"step": "Generic Threat Scan", "finding": f"Ditemukan {len(found_generic)} indikator skrip/payload: {desc}."})
            else:
                details.append({"step": "Generic Threat Scan", "finding": "Tidak ada indikator payload berbahaya terdeteksi."})

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
