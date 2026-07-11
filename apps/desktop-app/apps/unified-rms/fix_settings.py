import re

filepath = "/root/call/apps/desktop-app/apps/unified-rms/src/modules/hq/views/ManagementPages.tsx"

with open(filepath, 'r') as f:
    content = f.read()

# I want to replace the `return (` block inside SettingsPage with the new one.
# It starts at `  return (` around line 2192 and ends before `// --- DELIVERY ZONES PAGE ---`

pattern = r"(export function SettingsPage\(\) \{.*?)(\n  return \([\s\S]*?\n\})(\n// --- DELIVERY ZONES PAGE ---)"

new_return_block = """
  return (
  <div className="space-y-6 max-w-5xl">
  {/* General Settings Header */}
  <div className="bg-carbon-layer border-b border-carbon-border p-5 flex items-center gap-3">
  <Settings size={24} className="text-carbon-text" />
  <h2 className="text-xl font-semibold text-carbon-text">إعدادات النظام</h2>
  </div>

  {/* General Settings Form */}
  <form onSubmit={handleSave} className="bg-carbon-layer p-6 space-y-6 shadow-sm border border-carbon-border">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div>
  <label className="block text-sm text-carbon-textSecondary mb-2">اسم المطعم</label>
  <input 
  type="text" 
  className="w-full bg-carbon-bg border-b border-carbon-border px-4 py-3 text-sm focus:outline-none focus:border-carbon-blue text-carbon-text placeholder-carbon-textSecondary transition-colors" 
  value={settings.restaurantName} 
  onChange={e => setSettings({...settings, restaurantName: e.target.value})} 
  />
  </div>

  <div>
  <label className="block text-sm text-carbon-textSecondary mb-2">النطاق الفرعي</label>
  <input 
  type="text" 
  disabled
  className="w-full bg-carbon-bg border-b border-carbon-border px-4 py-3 text-sm focus:outline-none text-carbon-textSecondary cursor-not-allowed dir-ltr text-left" 
  value={settings.subdomain} 
  />
  </div>

  <div>
  <label className="block text-sm text-carbon-textSecondary mb-2">نسبة الضريبة (٪)</label>
  <input 
  type="number" 
  className="w-full bg-carbon-bg border-b border-carbon-border px-4 py-3 text-sm focus:outline-none focus:border-carbon-blue text-carbon-text placeholder-carbon-textSecondary transition-colors" 
  value={settings.taxRate} 
  onChange={e => setSettings({...settings, taxRate: parseFloat(e.target.value) || 0})} 
  />
  </div>

  <div>
  <label className="block text-sm text-carbon-textSecondary mb-2">العملة الافتراضية</label>
  <select 
  className="w-full bg-carbon-bg border-b border-carbon-border px-4 py-3 text-sm focus:outline-none focus:border-carbon-blue text-carbon-text transition-colors appearance-none" 
  value={settings.currencyId} 
  onChange={e => setSettings({...settings, currencyId: e.target.value})} 
  >
  <option value="">-- اختر --</option>
  {currencies.map(c => (
  <option key={c.id} value={c.id}>{c.name}</option>
  ))}
  </select>
  </div>
  </div>

  <div className="pt-6 border-t border-carbon-border flex items-center justify-between">
  <div className="flex gap-6">
  <div className="flex flex-col">
  <span className="text-xs text-carbon-textSecondary">الخطة الحالية</span>
  <span className="font-semibold text-sm text-carbon-blue mt-1">النمو (Growth)</span>
  </div>
  <div className="flex flex-col">
  <span className="text-xs text-carbon-textSecondary">الفروع</span>
  <span className="font-semibold text-sm text-carbon-text mt-1">{settings.maxBranches} الحد الأقصى</span>
  </div>
  <div className="flex flex-col">
  <span className="text-xs text-carbon-textSecondary">الموظفين</span>
  <span className="font-semibold text-sm text-carbon-text mt-1">{settings.maxStaff} الحد الأقصى</span>
  </div>
  </div>

  <div className="flex items-center gap-4">
  {saved && (
  <span className="text-sm font-semibold text-carbon-success animate-fade-in">تم الحفظ بنجاح</span>
  )}
  <button type="submit" className="bg-carbon-blue text-white hover:bg-carbon-blueHover transition-colors px-6 py-2 text-sm font-medium flex items-center gap-2">
  <span>حفظ التغييرات</span>
  <Save size={16} />
  </button>
  </div>
  </div>
  </form>

  {/* Telegram Bot Header */}
  <div className="bg-carbon-layer border-b border-carbon-border p-5 flex flex-col gap-2 mt-8">
  <h2 className="text-xl font-semibold text-carbon-text flex items-center gap-3">
  <span>🤖</span> إدارة بوت التليجرام والمحاكاة المباشرة
  </h2>
  <p className="text-sm text-carbon-textSecondary pr-8">قم بتكوين البوت الخاص بمطعمك وتجربته في بيئة آمنة محاكية للواقع</p>
  </div>

  {/* Telegram Bot Grid */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Config Card */}
  <div className="bg-carbon-layer p-6 shadow-sm border border-carbon-border h-fit">
  <div className="flex items-center justify-between mb-6 pb-4 border-b border-carbon-border">
  <h3 className="font-semibold text-base text-carbon-text">إعدادات الربط</h3>
  <StatusPill 
  label={botStatus === "Active" ? "متصل" : botStatus === "Error" ? "يوجد خطأ" : "غير مفعل"} 
  color={botStatus === "Active" ? "bg-carbon-success/10 text-carbon-success" : botStatus === "Error" ? "bg-carbon-error/10 text-carbon-error" : "bg-carbon-layerHover text-carbon-textSecondary"} 
  />
  </div>

  <form onSubmit={handleSaveBotConfig} className="space-y-6">
  <div>
  <label className="block text-sm text-carbon-textSecondary mb-2">توكن البوت (Bot API Token)</label>
  <input 
  type="text" 
  placeholder="1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ"
  className="w-full bg-carbon-bg border-b border-carbon-border px-4 py-3 text-sm focus:outline-none focus:border-carbon-blue text-carbon-text placeholder-carbon-textSecondary dir-ltr text-left font-mono transition-colors" 
  value={botToken} 
  onChange={e => setBotToken(e.target.value)} 
  />
  <span className="text-xs text-carbon-textSecondary mt-2 block">يمكنك استخراج التوكن عبر @BotFather في تليجرام</span>
  </div>

  {botUsername && (
  <div className="p-4 bg-carbon-layerHover border border-carbon-border flex items-center justify-between">
  <span className="text-sm text-carbon-textSecondary">معرف البوت المرتبط:</span>
  <span className="font-medium text-carbon-blue dir-ltr">@{botUsername}</span>
  </div>
  )}

  {botMsg.text && (
  <div className={`p-4 text-sm font-medium border-l-4 ${
  botMsg.type === "success" ? "bg-carbon-success/10 text-carbon-success border-carbon-success" : "bg-carbon-error/10 text-carbon-error border-carbon-error"
  }`}>
  {botMsg.text}
  </div>
  )}

  <div className="flex gap-3 pt-4">
  <button 
  type="submit" 
  disabled={botLoading}
  className="flex-1 bg-carbon-blue text-white hover:bg-carbon-blueHover transition-colors py-3 text-sm font-medium disabled:opacity-50">
  {botLoading ? "جاري الحفظ..." : "حفظ التوكن"}
  </button>
  <button 
  type="button" 
  onClick={handleTestBot}
  disabled={botLoading || !botToken}
  className="flex-1 bg-carbon-layerHover text-carbon-text hover:bg-carbon-border transition-colors py-3 text-sm font-medium disabled:opacity-50">
  اختبار الاتصال
  </button>
  </div>
  </form>
  </div>

  {/* Simulator Card */}
  <div className="bg-carbon-layer p-6 shadow-sm border border-carbon-border flex flex-col h-[600px]">
  <div className="flex items-center justify-between mb-6 pb-4 border-b border-carbon-border">
  <h3 className="font-semibold text-base text-carbon-text">المحاكي المباشر</h3>
  <span className="px-3 py-1 text-xs font-medium bg-carbon-blue/10 text-carbon-blue rounded-full flex items-center gap-2">
  <span className="w-2 h-2 rounded-full bg-carbon-blue animate-pulse"></span>
  Live
  </span>
  </div>

  {/* Chat Messages Area */}
  <div className="flex-1 overflow-y-auto space-y-4 pr-2 flex flex-col custom-scrollbar">
  {simChat.map((msg, idx) => (
  <div key={idx} className={`flex flex-col max-w-[85%] ${msg.sender === "user" ? "self-end items-end" : "self-start items-start"}`}>
  <div className={`p-4 text-sm whitespace-pre-line font-medium leading-relaxed ${
  msg.sender === "user" ? "bg-carbon-blue text-white" : "bg-carbon-layerHover text-carbon-text"
  }`}>
  {msg.imageUrl && (
  <img src={msg.imageUrl} alt="Bot attachment" className="w-full max-h-48 object-cover mb-3" />
  )}
  <div>{msg.text}</div>
  </div>
  <span className="text-xs text-carbon-textSecondary mt-2 px-1">{msg.time}</span>
  </div>
  ))}
  {simLoading && (
  <div className="self-start bg-carbon-layerHover p-4 text-sm font-medium text-carbon-textSecondary animate-pulse">
  البوت يكتب الآن...
  </div>
  )}
  </div>

  {/* Chat Input Form */}
  <form onSubmit={handleSimulate} className="mt-6 flex gap-2">
  <input 
  type="text" 
  placeholder="اكتب رسالة لمحاكاة العميل المحتمل..." 
  className="w-full bg-carbon-bg border-b border-carbon-border px-4 py-3 text-sm focus:outline-none focus:border-carbon-blue text-carbon-text placeholder-carbon-textSecondary transition-colors"
  value={simMsg}
  onChange={e => setSimMsg(e.target.value)}
  />
  <button 
  type="submit" 
  disabled={simLoading || !simMsg.trim()}
  className="bg-carbon-blue text-white px-6 py-3 font-medium hover:bg-carbon-blueHover transition-colors disabled:opacity-50">
  إرسال
  </button>
  </form>
  </div>
  </div>
  </div>
  );
}
"""

match = re.search(pattern, content)
if match:
    new_content = content[:match.start(2)] + "\n" + new_return_block + "\n" + content[match.start(3):]
    with open(filepath, 'w') as f:
        f.write(new_content)
    print("Success")
else:
    print("Failed to find pattern")
