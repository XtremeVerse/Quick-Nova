import os
import re

# Ad codes to add
head_ad = '''<!-- Ad Scripts -->
<script>
  atOptions = {
    'key' : '2ac4da0ed6a6a60d4a1613d2215e7dd1',
    'format' : 'iframe',
    'height' : 60,
    'width' : 468,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/2ac4da0ed6a6a60d4a1613d2215e7dd1/invoke.js"></script>
<script async="async" data-cfasync="false" src="https://pl28401263.effectivegatecpm.com/b03554437e27c7af7c3e026651b104da/invoke.js"></script>
<script src="https://pl28401272.effectivegatecpm.com/51/1c/44/511c447359e25338ff26c7f09b965585.js"></script>
<script src="https://pl28401259.effectivegatecpm.com/e8/8b/0a/e88b0a7e5bf67f132b4d12b1d2d97af2.js"></script>'''

# Function to update a file
def update_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add to head after gtag
    if 'adsbygoogle' not in content:  # Avoid duplicate
        content = re.sub(r'(\s*<script async src="https://www\.googletagmanager\.com/gtag/js\?id=G-88T5VL450S"></script>\s*<script>\s*window\.dataLayer.*?</script>)', r'\1\n    ' + head_ad.replace('\n', '\n    '), content, flags=re.DOTALL)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

# Get all HTML files
html_files = []
for root, dirs, files in os.walk('.'):
    for file in files:
        if file.endswith('.html'):
            html_files.append(os.path.join(root, file))

# Update each
for file in html_files:
    update_html(file)
    print(f'Updated {file}')

print('All HTML files updated with ad codes.')