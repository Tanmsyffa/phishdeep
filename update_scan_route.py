import re

with open('api/index.py', 'r', encoding='utf-8') as f:
    content = f.read()

old_scan_route = """@app.route('/api/scan', methods=['POST'])
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
        elif scan_type.lower() == 'apk':
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
        return jsonify({"status": "error", "message": f"Server error: {str(e)}"}), 500"""

new_scan_route = """import queue
import threading
from flask import Response, stream_with_context

@app.route('/api/scan', methods=['POST'])
def scan():
    data = request.json
    if not data:
        return jsonify({"status": "error", "message": "Request body tidak valid."}), 400

    target = (data.get('target', '') or '').strip()
    scan_type = data.get('type', 'link')
    
    if not target:
        return jsonify({"status": "error", "message": "Target tidak boleh kosong."}), 400

    q = queue.Queue()

    def worker():
        try:
            q.put({"status": "progress", "message": "Memulai engine analitik PhishDeep..."})
            if scan_type.lower() == 'link':
                if not target.startswith('http://') and not target.startswith('https://'):
                    t = 'http://' + target
                else:
                    t = target
                parsed = urlparse(t)
                if not parsed.netloc or parsed.scheme in ('javascript', 'data', 'vbscript'):
                    q.put({"status": "error", "message": "URL tidak valid atau dilarang."})
                    return
                q.put({"status": "progress", "message": "Melakukan pemindaian forensik Link..."})
                res = analyze_link(t)
            elif scan_type.lower() == 'apk':
                q.put({"status": "progress", "message": "Mengunduh dan mengekstrak file APK..."})
                res = analyze_file(target, scan_type)
            else:
                q.put({"status": "error", "message": "Tipe scan tidak dikenali."})
                return
            
            risk_score, details, extracted_code, domain_info, frameworks, redirect_chain, screenshot_url = res
            results = {
                "risk_score": risk_score,
                "details": details,
                "domain_info": domain_info,
                "frameworks": frameworks,
                "redirect_chain": redirect_chain,
                "screenshot_url": screenshot_url
            }
            if extracted_code:
                results["extracted_code"] = extracted_code
            
            q.put({"status": "success", "result": results})
        except Exception as e:
            q.put({"status": "error", "message": f"Server error: {str(e)}"})

    threading.Thread(target=worker).start()

    def generate():
        while True:
            item = q.get()
            yield json.dumps(item) + "\\n"
            if item["status"] in ["success", "error"]:
                break

    return Response(stream_with_context(generate()), mimetype='application/x-ndjson')"""

if old_scan_route in content:
    content = content.replace(old_scan_route, new_scan_route)
    with open('api/index.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Scan route replaced with Streaming generator')
else:
    print('Could not find old scan route')
