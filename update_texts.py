import re

def process_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# app/faq/page.tsx
process_file(r"c:\laragon\www\phishdeep\app\faq\page.tsx", [
    ("URL atau file (APK/Dokumen)", "URL atau file APK"),
])

# app/cara-kerja/page.tsx
process_file(r"c:\laragon\www\phishdeep\app\cara-kerja\page.tsx", [
    ("unggah file APK, atau dokumen yang ingin", "atau unggah file APK yang ingin"),
])

# app/privacy/page.tsx
process_file(r"c:\laragon\www\phishdeep\app\privacy\page.tsx", [
    ("URL, file APK, dokumen, atau gambar yang", "URL atau file APK yang"),
])

print("Updated text in frontend files.")
