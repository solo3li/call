import re
import os

def deduplicate_classes(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return

    # Remove duplicated standard button classes that might have been prepended
    content = content.replace('px-4 py-2 text-sm font-medium transition-colors bg-carbon-blue text-white hover:bg-carbon-blueHover ', '')
    content = content.replace('px-4 py-2 text-sm font-medium transition-colors bg-carbon-layer text-carbon-text border-carbon-border hover:bg-carbon-layerHover ', '')
    
    # Fix category buttons to be just standard Carbon UI buttons
    content = content.replace('className={`px-4 py-2 text-sm ${activeCategory === "الكل" ? "bg-carbon-success/10 text-carbon-success" : "bg-carbon-bg"}`}', 'className={`px-4 py-2 text-sm font-medium transition-colors border border-carbon-border ${activeCategory === "الكل" ? "bg-carbon-blue text-white" : "bg-carbon-layer text-carbon-text hover:bg-carbon-layerHover"}`}')
    content = content.replace('className={`px-4 py-2 text-sm flex items-center gap-2 ${activeCategory === cat.id ? "bg-carbon-success/10 text-carbon-success" : "bg-carbon-bg"}`}', 'className={`px-4 py-2 text-sm font-medium transition-colors border border-carbon-border flex items-center gap-2 ${activeCategory === cat.id ? "bg-carbon-blue text-white" : "bg-carbon-layer text-carbon-text hover:bg-carbon-layerHover"}`}')

    # Fix table headers that got stuck with #FFFBEB
    content = content.replace('bg-[#FFFBEB]', 'bg-carbon-layerHover')
    
    # Let's write it back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

base_dirs = [
    '/root/call/apps/desktop-app/apps/unified-rms/src/modules/hq/views',
    '/root/call/apps/desktop-app/apps/unified-rms/src/modules/hq/components',
    '/root/call/apps/desktop-app/apps/unified-rms/src/modules/branch/views',
    '/root/call/apps/desktop-app/apps/unified-rms/src/modules/branch/components',
]

for d in base_dirs:
    for root, dirs, files in os.walk(d):
        for f in files:
            if f.endswith('.tsx') or f.endswith('.ts'):
                deduplicate_classes(os.path.join(root, f))
print("Deduplication complete.")
