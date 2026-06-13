import re

with open(r"c:\laragon\www\phishdeep\api\index.py", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove PyMuPDF imports
content = re.sub(r"try:\n\s+import pymupdf.*?\nexcept ImportError:.*?\n", "", content, flags=re.DOTALL)
content = re.sub(r"PYMUPDF_AVAILABLE = True\n", "", content)
content = re.sub(r"PYMUPDF_AVAILABLE = False\n", "", content)

# 2. Remove _analyze_pdf_pymupdf helper
content = re.sub(r"# ── Helper: Deep PDF analysis via PyMuPDF ──.*?\ndef _analyze_pdf_pymupdf.*?return result\n\n\n", "", content, flags=re.DOTALL)

# 3. Remove _decode_pdf_streams helper
content = re.sub(r"# ── Helper: PDF Stream Decoder ──.*?\ndef _decode_pdf_streams.*?return decoded\n\n\n", "", content, flags=re.DOTALL)

# 4. Remove all the elif is_pdf, is_office, etc blocks.
# We want to keep up to the end of the APK block, which is right before `elif is_pdf:`
# Let's find `elif is_pdf:`
start_idx = content.find("elif is_pdf:")
end_idx = content.find("except Exception as e:", start_idx)

if start_idx != -1 and end_idx != -1:
    replacement = '''else:
            frameworks.append("File Tidak Didukung")
            details.append({"step": "Format Check", "finding": f"Format file tidak didukung. PhishDeep saat ini hanya berfokus pada analisis Link dan aplikasi Android (APK)."})

    '''
    content = content[:start_idx] + replacement + content[end_idx:]

# 5. Clean up the scan() function where it checks scan_type
content = re.sub(r"elif scan_type\.lower\(\) in \['apk', 'doc', 'dokumen'\]:", "elif scan_type.lower() == 'apk':", content)

with open(r"c:\laragon\www\phishdeep\api\index.py", "w", encoding="utf-8") as f:
    f.write(content)

print("Backend cleanup done.")
