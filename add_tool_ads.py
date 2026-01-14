import os
import re

# Ad block to add inside tools
ad_block = '''
            <!-- Tool Ad -->
            <div style="text-align: center; margin: 2rem 0; padding: 1rem; background: var(--bg-secondary); border-radius: 12px; border: 1px solid var(--border-subtle);">
                <script async="async" data-cfasync="false" src="https://pl28401259.effectivegatecpm.com/e8/8b/0a/e88b0a7e5bf67f132b4d12b1d2d97af2.js"></script>
            </div>
'''

# Function to update a tool file
def update_tool_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if ad already exists
    if 'Tool Ad' in content:
        return False

    # Insert after tool-container, before tool-info
    pattern = r'(\s*</div>\s*<!-- end tool-container -->\s*)(\s*<div class="tool-info")'
    if re.search(pattern, content, re.DOTALL):
        content = re.sub(pattern, r'\1' + ad_block + r'\2', content, flags=re.DOTALL)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

# Get all tool HTML files
tool_files = []
for file in os.listdir('tools'):
    if file.endswith('.html'):
        tool_files.append(os.path.join('tools', file))

# Update each
updated = 0
for file in tool_files:
    if update_tool_html(file):
        updated += 1
        print(f'Updated {file}')

print(f'Updated {updated} tool files with ad blocks.')