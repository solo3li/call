import os
import glob

def clean_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return

    # General bg/colors
    content = content.replace('bg-white', 'bg-carbon-layer')
    content = content.replace('bg-gray-50', 'bg-carbon-bg')
    content = content.replace('bg-gray-100', 'bg-carbon-bg')
    content = content.replace('bg-gray-200', 'bg-carbon-layerHover')
    content = content.replace('text-gray-900', 'text-carbon-text')
    content = content.replace('text-gray-600', 'text-carbon-textSecondary')
    content = content.replace('text-gray-500', 'text-carbon-textSecondary')
    content = content.replace('text-gray-800', 'text-carbon-text')
    
    # Shadows and borders
    content = content.replace('shadow-md', 'shadow-sm')
    content = content.replace('shadow-lg', 'shadow-sm')
    content = content.replace('shadow-neo', '')
    content = content.replace('shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]', '')
    content = content.replace('border-2', 'border')
    content = content.replace('border-3', 'border')
    content = content.replace('border-4', 'border')
    content = content.replace('border-black', 'border-carbon-border')
    content = content.replace('border-gray-200', 'border-carbon-border')
    content = content.replace('border-gray-300', 'border-carbon-border')
    content = content.replace('border-[#1A1A1A]', 'border-carbon-border')
    content = content.replace('border-neo-border', 'border-carbon-border')
    content = content.replace('divide-y-2', 'divide-y')
    content = content.replace('divide-black', 'divide-carbon-border')
    content = content.replace('divide-neo-border', 'divide-carbon-border')
    
    # Primary/brand colors
    content = content.replace('bg-blue-600', 'bg-carbon-blue')
    content = content.replace('bg-blue-700', 'bg-carbon-blueHover')
    content = content.replace('hover:bg-blue-700', 'hover:bg-carbon-blueHover')
    content = content.replace('text-blue-600', 'text-carbon-blue')
    content = content.replace('text-[#0f62fe]', 'text-carbon-blue')
    content = content.replace('bg-[#0f62fe]', 'bg-carbon-blue')
    content = content.replace('bg-[#edf5ff]', 'bg-carbon-blue/10')
    content = content.replace('text-red-600', 'text-carbon-error')
    content = content.replace('text-green-600', 'text-carbon-success')
    content = content.replace('bg-red-50', 'bg-carbon-error/10')
    content = content.replace('bg-green-50', 'bg-carbon-success/10')
    content = content.replace('bg-green-100', 'bg-carbon-success/10')
    content = content.replace('bg-red-100', 'bg-carbon-error/10')
    content = content.replace('text-red-700', 'text-carbon-error')
    content = content.replace('text-green-700', 'text-carbon-success')
    
    # Specific weird colors
    content = content.replace('bg-[#fff0f7]', 'bg-carbon-purple/10')
    content = content.replace('text-[#ff7eb6]', 'text-carbon-purple')
    content = content.replace('bg-[#defbe6]', 'bg-carbon-success/10')
    content = content.replace('text-[#198038]', 'text-carbon-success')
    content = content.replace('bg-brand-pink', 'bg-carbon-purple')
    content = content.replace('text-brand-pink', 'text-carbon-purple')
    content = content.replace('bg-brand-yellow', 'bg-carbon-warning')
    content = content.replace('text-brand-yellow', 'text-carbon-warning')
    content = content.replace('bg-brand-purple', 'bg-carbon-purple')
    content = content.replace('bg-brand-orange', 'bg-carbon-warning')

    # Specific menu category colors from screenshot 5 (Menu page)
    # They are hardcoded somewhere, let's also just catch custom style or hardcoded hexes
    content = content.replace('bg-[#e8daff]', 'bg-carbon-layerHover')
    content = content.replace('text-[#6929c4]', 'text-carbon-text')

    # Border radiuses
    content = content.replace('rounded-xl', 'rounded-sm')
    content = content.replace('rounded-2xl', 'rounded-sm')
    content = content.replace('rounded-3xl', 'rounded-sm')
    content = content.replace('rounded-lg', 'rounded-sm')
    content = content.replace('rounded-md', 'rounded-sm')
    content = content.replace('rounded-full', 'rounded-full') # keep rounded-full for avatars/icons

    # Deduplicate
    for _ in range(3):
        content = content.replace('bg-carbon-layer bg-carbon-layer', 'bg-carbon-layer')
        content = content.replace('bg-carbon-bg bg-carbon-bg', 'bg-carbon-bg')
        content = content.replace('border-carbon-border border-carbon-border', 'border-carbon-border')
        content = content.replace('  ', ' ')
        content = content.replace('shadow-sm shadow-sm', 'shadow-sm')
        content = content.replace('border border', 'border')
        content = content.replace('border border-carbon-border', 'border border-carbon-border')

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
                clean_file(os.path.join(root, f))
print("Cleanup complete.")
