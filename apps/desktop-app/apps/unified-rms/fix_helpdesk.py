import re
import sys

def convert_to_carbon(content):
    # Neo-brutalism borders and shadows
    content = re.sub(r'border-[234] border-\[#1A1A1A\]/?[0-9]*', 'border border-carbon-border', content)
    content = re.sub(r'border-b-[234] border-\[#1A1A1A\]', 'border-b border-carbon-border', content)
    content = re.sub(r'border-t-[234] border-\[#1A1A1A\]', 'border-t border-carbon-border', content)
    content = re.sub(r'border-l-[234] border-\[#1A1A1A\]', 'border-l border-carbon-border', content)
    content = re.sub(r'border-r-[234] border-\[#1A1A1A\]', 'border-r border-carbon-border', content)
    content = re.sub(r'shadow-\[4px_4px_0px_#1A1A1A\]', '', content)
    
    # Colors
    content = re.sub(r'bg-\[#FF69B4\]', 'bg-carbon-layer border-b border-carbon-border', content)
    content = re.sub(r'bg-\[#FFFBEB\]', 'bg-carbon-bg', content)
    content = re.sub(r'bg-\[#FF6B35\]', 'bg-carbon-layer border-b border-carbon-border', content)
    content = re.sub(r'bg-\[#00E676\]', 'bg-carbon-blue', content)
    content = re.sub(r'bg-\[#FFD700\]', 'bg-carbon-layerHover', content)
    content = re.sub(r'bg-\[#00E5FF\]', 'bg-carbon-layerHover', content)
    content = re.sub(r'text-\[#1A1A1A\]/?(?:70|60|10)?', 'text-carbon-text', content)
    content = re.sub(r'text-\[#FF6B35\]', 'text-carbon-textSecondary', content)
    
    # Other specific fixes for HelpDeskPage
    content = re.sub(r'hover:translate-x-\[-1px\] hover:translate-y-\[-1px\]', 'hover:bg-carbon-layerHover', content)
    content = re.sub(r'hover:translate-y-px', '', content)
    content = re.sub(r'rounded-sm', 'rounded-none', content)
    content = re.sub(r'rounded-lg', 'rounded-none', content)
    content = re.sub(r'rounded-full', 'rounded-none', content)
    content = re.sub(r'rounded', 'rounded-none', content)
    content = re.sub(r'uppercase tracking-tight(?:er)?', '', content)
    
    return content

if __name__ == '__main__':
    files = sys.argv[1:]
    for file_path in files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = convert_to_carbon(content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
