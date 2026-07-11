import sys

def modify_analytics_page(filepath):
    try:
        with open(filepath, 'r') as f:
            content = f.read()

        # Fix Header
        content = content.replace('className={`bg-[#e8daff] text-[#6929c4] bg-carbon-layer border border-carbon-border p-3 flex flex-row items-center justify-between text-white `}', 'className={`bg-carbon-layer border border-carbon-border p-3 flex flex-row items-center justify-between`}')
        
        # Fix StatCard usage
        content = content.replace('color="bg-[#defbe6] text-[#198038]"', 'color="bg-carbon-success/10 text-carbon-success"')
        content = content.replace('color="bg-carbon-layer"', 'color="bg-carbon-blue/10 text-carbon-blue"')
        content = content.replace('color="bg-[#e5f6ff] text-[#00a68f]"', 'color="bg-carbon-warning/10 text-carbon-warning"')
        content = content.replace('color="bg-[#fff0f7] text-[#ff7eb6]"', 'color="bg-carbon-purple/10 text-carbon-purple"')
        
        # Fix Charts Container
        content = content.replace('bg-carbon-layer border border-carbon-border p-4 bg-white border border-carbon-border', 'bg-carbon-layer border border-carbon-border p-4')
        
        # Fix Table Container
        content = content.replace('bg-carbon-layer border border-carbon-border p-0 bg-white border border-carbon-border', 'bg-carbon-layer border border-carbon-border p-0 overflow-hidden')
        content = content.replace('bg-gray-100', 'bg-carbon-bg')
        content = content.replace('border-b-2', 'border-b')
        content = content.replace('divide-neo-border', 'divide-carbon-border')
        
        # Fix StatCard Component definition
        content = content.replace('className="bg-carbon-layer border border-carbon-border p-3 bg-white border border-carbon-border shadow-sm flex flex-col justify-between"', 'className="bg-carbon-layer border border-carbon-border p-3 flex flex-col justify-between"')
        content = content.replace('className="text-white"', 'className="currentColor"')
        content = content.replace('bg-green-100 text-green-700', 'bg-carbon-success/10 text-carbon-success')
        content = content.replace('bg-red-100 text-red-700', 'bg-carbon-error/10 text-carbon-error')
        content = content.replace('text-green-600 bg-green-100', 'text-carbon-success bg-carbon-success/10')
        content = content.replace('text-red-600 bg-red-100', 'text-carbon-error bg-carbon-error/10')

        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed {filepath}")
    except FileNotFoundError:
        print(f"Skipped {filepath} (Not Found)")

def modify_charts(filepath):
    try:
        with open(filepath, 'r') as f:
            content = f.read()

        # Update Tooltip colors
        content = content.replace('background: "#ffffff"', 'background: "var(--carbon-layer, #161616)"')
        content = content.replace('border: "1px solid #e0e0e0"', 'border: "1px solid var(--carbon-border, #393939)"')
        content = content.replace('color: "#161616"', 'color: "var(--carbon-text, #f4f4f4)"')
        content = content.replace("fill: '#525252'", "fill: 'var(--carbon-textSecondary, #c6c6c6)'")
        content = content.replace('stroke="#e0e0e0"', 'stroke="var(--carbon-border, #393939)"')

        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed {filepath}")
    except FileNotFoundError:
        print(f"Skipped {filepath} (Not Found)")


base_dir = '/root/call/apps/desktop-app/apps/unified-rms/src/modules'
modify_analytics_page(f'{base_dir}/hq/views/AnalyticsPage.tsx')
modify_analytics_page(f'{base_dir}/branch/views/AnalyticsPage.tsx')

modify_charts(f'{base_dir}/hq/components/Charts.tsx')
modify_charts(f'{base_dir}/branch/components/Charts.tsx')

