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
from urllib.parse import urlparse
import ipaddress

try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None  # type: ignore

app = Flask(__name__)

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
        'nameservers': []
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
    domain = parsed_url.netloc.replace('www.', '')
    
    # RDAP Domain Analysis (Modern WHOIS via HTTPS)
    try:
        domain_info = get_rdap_info(domain)
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
    except Exception:
        details.append({"step": "RDAP Analisis Domain", "finding": "Tidak dapat mengambil data registrasi domain."})

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
        
        response = urllib.request.urlopen(req, timeout=10, context=ctx)
            
        html_content = response.read().decode('utf-8', errors='ignore')
        
        # ======================================================
        # ANALISIS MENDALAM: HEADERS + HTML FINGERPRINTING
        # ======================================================
        
        # --- Layer 1: HTTP Response Headers ---
        server = response.headers.get('Server', '')
        powered_by = response.headers.get('X-Powered-By', '')
        via = response.headers.get('Via', '')
        cf_ray = response.headers.get('CF-Ray', '')
        content_type = response.headers.get('Content-Type', '')
        
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
        if not response.headers.get('X-Frame-Options'): missing_security.append('X-Frame-Options')
        if not response.headers.get('Content-Security-Policy'): missing_security.append('CSP')
        if not response.headers.get('X-XSS-Protection'): missing_security.append('X-XSS-Protection')
        if missing_security:
            frameworks.append(f'PERINGATAN - Header Tidak Ada: {", ".join(missing_security)}')
        
        # --- Layer 2: HTML Source Fingerprinting ---
        try:
            html_lower = html_content.lower()

            # Script and link tag sources via regex (works without bs4)
            script_srcs = ' '.join(re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', html_content, re.IGNORECASE)).lower()
            link_hrefs = ' '.join(re.findall(r'<link[^>]+href=["\']([^"\']+)["\']', html_content, re.IGNORECASE)).lower()

            if BeautifulSoup:
                soup = BeautifulSoup(html_content, 'html.parser')
                if soup.find(id='__next') or '_next' in html_content:
                    frameworks.append('JS Framework: Next.js')
                elif 'data-reactroot' in html_content or ('react' in html_lower and 'react' in script_srcs):
                    frameworks.append('JS Framework: React')
                if 'vue' in html_lower and ('v-app' in html_content or '__vue' in html_content):
                    frameworks.append('JS Framework: Vue.js')
                if 'ng-version' in html_content or ('angular' in html_lower and 'angular' in script_srcs):
                    frameworks.append('JS Framework: Angular')
                if 'svelte' in html_lower and 'svelte' in script_srcs:
                    frameworks.append('JS Framework: Svelte')
            else:
                # Regex-based JS framework detection
                if '_next' in html_lower or '__next' in html_lower:
                    frameworks.append('JS Framework: Next.js')
                elif 'data-reactroot' in html_lower or 'react' in script_srcs:
                    frameworks.append('JS Framework: React')
                if 'vue' in script_srcs or '__vue' in html_lower:
                    frameworks.append('JS Framework: Vue.js')
                if 'angular' in script_srcs or 'ng-version' in html_lower:
                    frameworks.append('JS Framework: Angular')

            # CMS & Platforms (regex, works without bs4)
            if 'wp-content' in html_lower or 'wordpress' in html_lower:
                frameworks.append('CMS: WordPress')
            if 'joomla' in html_lower or '/media/jui/' in html_lower:
                frameworks.append('CMS: Joomla')
            if 'drupal' in html_lower:
                frameworks.append('CMS: Drupal')
            if 'shopify' in html_lower:
                frameworks.append('Platform: Shopify')
            if 'woocommerce' in html_lower:
                frameworks.append('Plugin: WooCommerce')

            # Backend Frameworks
            if 'laravel' in html_lower:
                frameworks.append('Backend: Laravel (PHP)')
            if 'codeigniter' in html_lower:
                frameworks.append('Backend: CodeIgniter (PHP)')
            if 'django' in html_lower:
                frameworks.append('Backend: Django (Python)')
            if 'rails' in html_lower:
                frameworks.append('Backend: Ruby on Rails')

            # JS Libraries (via script src)
            all_srcs = script_srcs + ' ' + link_hrefs
            if 'jquery' in all_srcs or 'jquery' in html_lower:
                frameworks.append('Library: jQuery')
            if 'bootstrap' in all_srcs or 'bootstrap' in html_lower:
                frameworks.append('CSS Framework: Bootstrap')
            if 'tailwind' in all_srcs or 'tailwind' in html_lower:
                frameworks.append('CSS Framework: Tailwind CSS')
            if 'font-awesome' in all_srcs or 'fontawesome' in all_srcs:
                frameworks.append('Icon Library: Font Awesome')
            if 'google-analytics' in html_lower or 'gtag' in html_lower:
                frameworks.append('Analytics: Google Analytics')
            if 'gtm.js' in html_lower:
                frameworks.append('Analytics: Google Tag Manager')
            if 'facebook.net/en_us/fbevents' in html_lower:
                frameworks.append('Analytics: Facebook Pixel')
            if 'recaptcha' in html_lower:
                frameworks.append('Security Plugin: Google reCAPTCHA')

            # CDNs
            if 'cdn.jsdelivr.net' in html_lower:
                frameworks.append('CDN: jsDelivr')
            if 'cdnjs.cloudflare.com' in html_lower:
                frameworks.append('CDN: cdnjs (Cloudflare)')
            if 'cdn.bootstrapcdn.com' in html_lower:
                frameworks.append('CDN: Bootstrap CDN')
            if 'unpkg.com' in html_lower:
                frameworks.append('CDN: unpkg')

        except Exception:
            pass

        if not frameworks:
            frameworks.append('Web Stack: Custom / Static HTML')

        if "<input type=\"password\"" in html_content.lower() or "type='password'" in html_content.lower():
            risk_score += 30
            details.append({"step": "Analisis Konten Halaman", "finding": "TERDETEKSI: Adanya Form Input Password pada situs yang berisiko."})
            match = re.search(r'(?i)<form.*?>.*?</form>', html_content, re.DOTALL)
            if match:
                extracted_code = match.group(0)[:400] + "\n...[truncated]"

    except urllib.error.URLError as e:
        risk_score += 40
        details.append({"step": "Koneksi Jaringan", "finding": f"Target tidak dapat dijangkau ({str(e.reason)}). Kemungkinan telah di-take down."})
    except Exception as e:
        details.append({"step": "Koneksi Jaringan", "finding": f"Gagal menganalisis situs: {str(e)}"})
    encoded = urllib.parse.quote(target_url, safe='')
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
