import re

with open('api/index.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Typo-Squatting
ts_code = '''
    # --- TYPO-SQUATTING ENGINE ---
    TOP_INDO_TARGETS = ['bca.co.id', 'klikbca.com', 'bri.co.id', 'bankmandiri.co.id', 'bni.co.id', 'dana.id', 'gopay.co.id', 'shopee.co.id', 'tokopedia.com']
    try:
        import Levenshtein
        is_typo = False
        for target in TOP_INDO_TARGETS:
            dist = Levenshtein.distance(root_domain, target)
            if dist > 0 and dist <= 2:
                is_typo = True
                risk_score += 60
                details.append({"step": "Typo-Squatting Engine", "finding": f"SANGAT KRITIS: Domain '{root_domain}' sangat mirip dengan '{target}'. Kemungkinan besar ini adalah penipuan (Typo-squatting)."})
                break
        if not is_typo:
            details.append({"step": "Typo-Squatting Engine", "finding": "Tidak terdeteksi pola typo-squatting pada domain ini."})
    except ImportError:
        pass
'''

anchor_ts = 'details.append({"step": "Analisis Shannon Entropy", "finding": f"Nama domain wajar (Entropy: {round(entropy, 2)}). Tidak terdeteksi algoritma pengacak (DGA)."})'
if anchor_ts in content:
    content = content.replace(anchor_ts, anchor_ts + "\n" + ts_code)

# 2. DOM Brand Spoofing
# Look for where BeautifulSoup is used. It's inside _task_scrape or analyze_link.
# Let's find "soup = BeautifulSoup(html_content, 'html.parser')"
brand_code = '''
                # --- DOM BRAND SPOOFING DETECTION ---
                dom_text = (soup.title.string if soup.title else "") + " " + " ".join([m.get('content', '') for m in soup.find_all('meta') if m.get('content')])
                dom_text = dom_text.lower()
                
                BRANDS = {
                    'bca': 'bca.co.id',
                    'bank rakyat indonesia': 'bri.co.id',
                    'bank mandiri': 'bankmandiri.co.id',
                    'bni': 'bni.co.id',
                    'tokopedia': 'tokopedia.com',
                    'shopee': 'shopee.co.id'
                }
                
                for brand, official_domain in BRANDS.items():
                    if brand in dom_text and root_domain != official_domain and root_domain != 'localhost':
                        risk_score += 70
                        details.append({"step": "Brand Spoofing Detection", "finding": f"SANGAT KRITIS: Halaman ini menyebutkan brand '{brand.upper()}', namun domain ({root_domain}) BUKAN domain resminya ({official_domain}). Ini adalah pola pasti Phishing."})
                        break
'''

anchor_brand = "iframes = soup.find_all('iframe')"
if anchor_brand in content:
    content = content.replace(anchor_brand, brand_code + "\n                " + anchor_brand)

# 3. APK Static DEX Scanning
dex_code = '''
            # --- STATIC DEX ANALYSIS ---
            try:
                import zipfile
                with zipfile.ZipFile(temp_file_path, 'r') as apk_zip:
                    dex_files = [f for f in apk_zip.namelist() if f.endswith('.dex')]
                    if dex_files:
                        for dex in dex_files[:1]: # scan the primary classes.dex
                            dex_data = apk_zip.read(dex)
                            
                            # Simple regex signature engine on raw DEX bytes
                            # 1. Look for hardcoded IP addresses (C2)
                            import re
                            ip_patterns = re.findall(b'https?://[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}', dex_data)
                            if ip_patterns:
                                risk_score += 30
                                unique_ips = list(set([ip.decode('utf-8', errors='ignore') for ip in ip_patterns]))
                                details.append({"step": "DEX Static Analysis", "finding": f"KRITIS: Ditemukan hardcoded IP/URL di dalam kode sumber (classes.dex): {', '.join(unique_ips[:2])}."})
                            
                            # 2. Signature Engine (YARA Lite)
                            MALWARE_FAMILIES = {
                                b'sendTextMessage': "Trojan SMS Stealer (Mencuri OTP)",
                                b'kredivo': "Spoofing Aplikasi Kredivo",
                                b'brimo': "Spoofing Aplikasi BRImo",
                                b'WAKELOCK': "Malware Persistence (Mencegah HP Tidur)",
                                b'AccessibilityService': "Overlay/Keylogger via Aksesibilitas"
                            }
                            found_sigs = []
                            for sig, desc in MALWARE_FAMILIES.items():
                                if sig in dex_data:
                                    found_sigs.append(desc)
                            
                            if found_sigs:
                                risk_score += min(40, len(found_sigs) * 15)
                                details.append({"step": "Regex Signature Engine", "finding": f"ANCAMAN: Ditemukan {len(found_sigs)} pola malware dalam kode (DEX): {', '.join(found_sigs)}."})
                            else:
                                details.append({"step": "Regex Signature Engine", "finding": "Tidak ditemukan pola malware umum di dalam kode DEX utama."})
            except Exception as e:
                details.append({"step": "DEX Static Analysis", "finding": f"Gagal mengekstrak/memindai classes.dex: {str(e)}"})
'''

# The original APK analysis uses `apk_entries = _parse_apk_entries(raw_content)`.
# But wait, we don't save the APK to disk in analyze_file? Oh we do have `raw_content`. We can use `io.BytesIO(raw_content)`
# Let's fix the zipfile usage.
dex_code_fixed = '''
            # --- STATIC DEX ANALYSIS ---
            try:
                import zipfile
                import io
                with zipfile.ZipFile(io.BytesIO(raw_content), 'r') as apk_zip:
                    dex_files = [f for f in apk_zip.namelist() if f.endswith('.dex')]
                    if dex_files:
                        for dex in dex_files[:1]: # scan the primary classes.dex
                            dex_data = apk_zip.read(dex)
                            
                            # Simple regex signature engine on raw DEX bytes
                            import re
                            ip_patterns = re.findall(rb'https?://[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}', dex_data)
                            if ip_patterns:
                                risk_score += 30
                                unique_ips = list(set([ip.decode('utf-8', errors='ignore') for ip in ip_patterns]))
                                details.append({"step": "DEX Static Analysis", "finding": f"KRITIS: Ditemukan hardcoded IP/URL (C2) di dalam kode sumber: {', '.join(unique_ips[:2])}."})
                            
                            # Signature Engine (YARA Lite)
                            MALWARE_FAMILIES = {
                                b'sendTextMessage': "Trojan SMS Stealer (Mencuri OTP)",
                                b'AccessibilityService': "Overlay/Keylogger via Aksesibilitas",
                                b'DeviceAdminReceiver': "Malware Persistence (Mencegah Unistall)",
                                b'package_add_': "Dropper (Install APK Tersembunyi)"
                            }
                            found_sigs = []
                            for sig, desc in MALWARE_FAMILIES.items():
                                if sig in dex_data:
                                    found_sigs.append(desc)
                            
                            if found_sigs:
                                risk_score += min(40, len(found_sigs) * 15)
                                details.append({"step": "Regex Signature Engine", "finding": f"ANCAMAN: Ditemukan {len(found_sigs)} pola malware dalam kode DEX: {', '.join(found_sigs)}."})
                            else:
                                details.append({"step": "Regex Signature Engine", "finding": "Tidak ditemukan pola malware umum di dalam kode DEX utama."})
            except Exception as e:
                details.append({"step": "DEX Static Analysis", "finding": f"Gagal mengekstrak/memindai classes.dex: {str(e)}"})
'''

# Where is the APK block?
anchor_apk = 'has_dex     = sum(1 for e in apk_entries if re.match(r\'classes\\d*\\.dex\', e))'
if anchor_apk in content:
    content = content.replace(anchor_apk, anchor_apk + "\n" + dex_code_fixed)

with open('api/index.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Backend analysis updated successfully.")
