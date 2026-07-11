import re
import os

def clean_brutalist(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return

    # Brutalist transform classes
    content = re.sub(r'hover:translate-x-\[-?\d+px\]', '', content)
    content = re.sub(r'hover:translate-y-\[-?\d+px\]', '', content)
    content = re.sub(r'active:translate-y-\[\d+px\]', '', content)
    
    # Specific borders
    content = content.replace('border-brand-pink', 'border-carbon-border')
    content = content.replace('border-brand-orange', 'border-carbon-blue')
    content = content.replace('border-brand-green', 'border-carbon-success')
    content = content.replace('border-brand-yellow', 'border-carbon-warning')
    content = content.replace('border-dashed', 'border-solid')
    content = content.replace('border-carbon-border-flat', 'border-carbon-border')

    # Specific colors
    content = content.replace('bg-[#fcf4d6]', 'bg-carbon-warning/10')
    content = content.replace('text-[#b47a00]', 'text-carbon-warning')
    content = content.replace('bg-[#ECFDF5]', 'bg-carbon-success/10')
    content = content.replace('bg-[#FFFBEB]', 'bg-carbon-layerHover')
    
    # Weird redundant text colors like text-carbon-purple/20 text-carbon-purple (dedup.py artifact?)
    content = content.replace('bg-carbon-purple/10 text-carbon-purple/10 ', 'bg-carbon-purple/10 text-carbon-purple ')
    content = content.replace('bg-carbon-purple/10 text-carbon-purple/20 ', 'bg-carbon-purple/10 text-carbon-purple ')

    # Redundant borders
    for _ in range(2):
        content = content.replace('  ', ' ')
        content = content.replace(' border border-carbon-border border-carbon-border', ' border border-carbon-border')
        content = content.replace(' border-carbon-border border-carbon-border', ' border-carbon-border')

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
                clean_brutalist(os.path.join(root, f))
print("De-brutalization complete.")
