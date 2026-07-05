"use client";

import { useState, useEffect } from "react";
import api from "../utils/api";

export default function AiSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [options, setOptions] = useState<any>({
    dialects: [],
    emotions: [],
    styles: [],
    voices: [],
  });

  const [aiSettings, setAiSettings] = useState<any>({
    isAiActive: true,
    voiceProfileId: null,
    voiceDialectId: null,
    voiceEmotionId: null,
    voiceStyleId: null,
    systemPrompt: "",
    escalationExtension: "",
  });

  const [sipSettings, setSipSettings] = useState<any>({
    trunkHost: "",
    trunkUsername: "",
    trunkPassword: "",
    trunkPort: 5060,
    maxChannels: 10,
    didNumber: "",
    agentExtension: "",
    agentPassword: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      setOptionsError(null);

      // Fetch all in parallel, but handle each result independently
      const [optsResult, aiResult, sipResult] = await Promise.allSettled([
        api.get("/hq/ai-settings/options"),
        api.get("/hq/ai-settings"),
        api.get("/hq/sip-settings"),
      ]);

      // Handle options - these are global and don't need tenant auth
      if (optsResult.status === "fulfilled") {
        const data = optsResult.value.data;
        setOptions({
          dialects: data.dialects || [],
          emotions: data.emotions || [],
          styles: data.styles || [],
          voices: data.voices || [],
        });
      } else {
        console.error("Failed to fetch options:", optsResult.reason);
        setOptionsError("تعذّر تحميل الخيارات من الخادم. تحقق من الاتصال.");
      }

      // Handle AI settings - requires auth + tenant
      if (aiResult.status === "fulfilled" && aiResult.value.data) {
        const ai = aiResult.value.data;
        setAiSettings({
          isAiActive: ai.isAiActive ?? true,
          voiceProfileId: ai.voiceProfileId ?? null,
          voiceDialectId: ai.voiceDialectId ?? null,
          voiceEmotionId: ai.voiceEmotionId ?? null,
          voiceStyleId: ai.voiceStyleId ?? null,
          systemPrompt: ai.systemPrompt ?? "",
          escalationExtension: ai.escalationExtension ?? "",
        });
      } else if (aiResult.status === "rejected") {
        console.error("Failed to fetch AI settings:", aiResult.reason);
      }

      // Handle SIP settings - requires auth + tenant
      if (sipResult.status === "fulfilled" && sipResult.value.data) {
        setSipSettings(sipResult.value.data);
      } else if (sipResult.status === "rejected") {
        console.error("Failed to fetch SIP settings:", sipResult.reason);
      }

      setLoading(false);
    };

    fetchSettings();
  }, []);

  const handleSaveAi = async () => {
    setSaving(true);
    try {
      await api.put("/hq/ai-settings", aiSettings);
      alert("تم حفظ إعدادات الذكاء الاصطناعي بنجاح!");
    } catch (err) {
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSip = async () => {
    setSaving(true);
    try {
      await api.put("/hq/sip-settings", sipSettings);
      alert("تم حفظ إعدادات الـ SIP بنجاح!");
    } catch (err) {
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-lg font-bold">جاري التحميل...</div>
    );

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-gray-900">
          إعدادات الذكاء الاصطناعي والمكالمات
        </h1>
        <p className="text-gray-600">
          تحكم كامل في موظف الاستقبال الآلي وإعدادات خطوط الهاتف (SIP).
        </p>
      </div>

      {/* Options error banner */}
      {optionsError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          ⚠️ {optionsError}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* AI Voice Configuration */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">
              موظف الاستقبال الآلي (AI Agent)
            </h3>
            <p className="text-sm text-gray-500">
              تخصيص شخصية وأسلوب الموظف الآلي
            </p>
          </div>
          <div className="p-6 space-y-4 flex-grow">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-700">
                تفعيل الرد الآلي
              </label>
              <input
                type="checkbox"
                className="w-5 h-5 accent-blue-600"
                checked={aiSettings.isAiActive}
                onChange={(e) =>
                  setAiSettings({ ...aiSettings, isAiActive: e.target.checked })
                }
              />
            </div>

            {/* Dialect */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                اللهجة (Dialect)
              </label>
              <select
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={aiSettings.voiceDialectId?.toString() || ""}
                onChange={(e) =>
                  setAiSettings({
                    ...aiSettings,
                    voiceDialectId: parseInt(e.target.value),
                  })
                }
              >
                <option value="">اختر اللهجة</option>
                {options.dialects.map((d: any) => (
                  <option key={d.id} value={d.id.toString()}>
                    {d.name}
                  </option>
                ))}
              </select>
              {options.dialects.length === 0 && (
                <p className="text-xs text-red-500">
                  لا توجد لهجات متاحة — تحقق من اتصالك بالخادم
                </p>
              )}
            </div>

            {/* Emotion */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                الإحساس والمشاعر (Emotion)
              </label>
              <select
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={aiSettings.voiceEmotionId?.toString() || ""}
                onChange={(e) =>
                  setAiSettings({
                    ...aiSettings,
                    voiceEmotionId: parseInt(e.target.value),
                  })
                }
              >
                <option value="">اختر المشاعر</option>
                {options.emotions.map((e: any) => (
                  <option key={e.id} value={e.id.toString()}>
                    {e.name}
                  </option>
                ))}
              </select>
              {options.emotions.length === 0 && (
                <p className="text-xs text-red-500">
                  لا توجد مشاعر متاحة — تحقق من اتصالك بالخادم
                </p>
              )}
            </div>

            {/* Voice Profile */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                بروفايل الصوت (Voice Profile)
              </label>
              <select
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={aiSettings.voiceProfileId?.toString() || ""}
                onChange={(e) =>
                  setAiSettings({
                    ...aiSettings,
                    voiceProfileId: parseInt(e.target.value),
                  })
                }
              >
                <option value="">اختر الصوت</option>
                {options.voices.map((v: any) => (
                  <option key={v.id} value={v.id.toString()}>
                    {v.name} ({v.gender === "male" ? "ذكر" : "أنثى"})
                  </option>
                ))}
              </select>
              {options.voices.length === 0 && (
                <p className="text-xs text-red-500">
                  لا توجد أصوات متاحة — تحقق من اتصالك بالخادم
                </p>
              )}
            </div>

            {/* Style */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                أسلوب الإلقاء (Style)
              </label>
              <select
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={aiSettings.voiceStyleId?.toString() || ""}
                onChange={(e) =>
                  setAiSettings({
                    ...aiSettings,
                    voiceStyleId: parseInt(e.target.value),
                  })
                }
              >
                <option value="">اختر الأسلوب</option>
                {options.styles.map((s: any) => (
                  <option key={s.id} value={s.id.toString()}>
                    {s.name}
                  </option>
                ))}
              </select>
              {options.styles.length === 0 && (
                <p className="text-xs text-red-500">
                  لا توجد أساليب متاحة — تحقق من اتصالك بالخادم
                </p>
              )}
            </div>

            {/* System Prompt */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                التعليمات الشخصية (System Prompt)
              </label>
              <textarea
                placeholder="أدخل التعليمات الإضافية للذكاء الاصطناعي (مثل: ركز على عرض الوجبات الجديدة أولاً)"
                className="w-full border border-gray-300 rounded-md p-2 h-32 focus:ring-2 focus:ring-blue-500 outline-none"
                value={aiSettings.systemPrompt || ""}
                onChange={(e) =>
                  setAiSettings({ ...aiSettings, systemPrompt: e.target.value })
                }
              />
            </div>
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleSaveAi}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
            >
              حفظ إعدادات الذكاء الاصطناعي
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Escalation & MicroSIP Accounts */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-blue-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-blue-900">
                  اختبار و تحويل المكالمات (MicroSIP)
                </h3>
                <p className="text-sm text-blue-700">
                  بيانات الحسابات لإعداد تطبيق MicroSIP
                </p>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Agent Account */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-blue-800 border-b border-blue-200 pb-1 flex-grow">حساب الموظف البشري (Agent) - لاستقبال الشكاوى</h4>
                  <button 
                    onClick={() => {
                      const text = `Account Name: Agent ${sipSettings.agentExtension || "101"}\nSIP Server: 167.71.66.188:5062\nUsername: ${sipSettings.agentExtension || "-"}\nDomain: 167.71.66.188:5062\nLogin: ${sipSettings.agentExtension || "-"}\nPassword: ${sipSettings.agentPassword || "-"}\nTransport: TCP`;
                      navigator.clipboard.writeText(text);
                    }}
                    className="mr-4 text-xs bg-white text-blue-600 px-3 py-1.5 rounded border border-blue-200 hover:bg-blue-50 font-bold shadow-sm transition-colors"
                  >
                    📋 نسخ الكل
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-4 rounded-md border border-blue-100 shadow-sm">
                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded group hover:bg-gray-100 transition-colors">
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold block uppercase">Account Name (اسم الحساب)</label>
                      <p className="font-mono text-sm font-bold text-gray-900">Agent {sipSettings.agentExtension || "101"}</p>
                    </div>
                    <button onClick={() => navigator.clipboard.writeText(`Agent ${sipSettings.agentExtension || "101"}`)} className="text-gray-400 hover:text-blue-600 p-1 bg-white rounded shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity" title="نسخ">📋</button>
                  </div>
                  
                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded group hover:bg-gray-100 transition-colors">
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold block uppercase">SIP Server & Domain</label>
                      <p className="font-mono text-sm font-bold text-gray-900">167.71.66.188:5062</p>
                    </div>
                    <button onClick={() => navigator.clipboard.writeText("167.71.66.188:5062")} className="text-gray-400 hover:text-blue-600 p-1 bg-white rounded shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity" title="نسخ">📋</button>
                  </div>

                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded group hover:bg-gray-100 transition-colors">
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold block uppercase">Username & Login</label>
                      <p className="font-mono text-sm font-bold text-gray-900">{sipSettings.agentExtension || "-"}</p>
                    </div>
                    <button onClick={() => navigator.clipboard.writeText(sipSettings.agentExtension || "")} className="text-gray-400 hover:text-blue-600 p-1 bg-white rounded shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity" title="نسخ">📋</button>
                  </div>

                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded group hover:bg-gray-100 transition-colors">
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold block uppercase">Password (كلمة المرور)</label>
                      <p className="font-mono text-sm font-bold text-gray-900">{sipSettings.agentPassword || "-"}</p>
                    </div>
                    <button onClick={() => navigator.clipboard.writeText(sipSettings.agentPassword || "")} className="text-gray-400 hover:text-blue-600 p-1 bg-white rounded shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity" title="نسخ">📋</button>
                  </div>
                  
                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded md:col-span-2 group hover:bg-gray-100 transition-colors">
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold block uppercase">Transport (نوع الاتصال)</label>
                      <p className="font-mono text-sm font-bold text-gray-900">TCP <span className="text-xs font-normal text-red-500">(هام جداً)</span></p>
                    </div>
                    <button onClick={() => navigator.clipboard.writeText("TCP")} className="text-gray-400 hover:text-blue-600 p-1 bg-white rounded shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity" title="نسخ">📋</button>
                  </div>
                </div>
              </div>

              {/* Client Tester Account */}
              <div className="space-y-3 pt-4 border-t border-blue-100">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-purple-800 border-b border-purple-200 pb-1 flex-grow">حساب العميل (Client) - لاختبار الذكاء الاصطناعي</h4>
                  <button 
                    onClick={() => {
                      const text = `Account Name: Client Tester\nSIP Server: 167.71.66.188:5062\nUsername: 999\nDomain: 167.71.66.188:5062\nLogin: 999\nPassword: tester123\nTransport: TCP`;
                      navigator.clipboard.writeText(text);
                    }}
                    className="mr-4 text-xs bg-white text-purple-600 px-3 py-1.5 rounded border border-purple-200 hover:bg-purple-50 font-bold shadow-sm transition-colors"
                  >
                    📋 نسخ الكل
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-purple-50 p-4 rounded-md border border-purple-100 shadow-sm">
                  <div className="flex justify-between items-center bg-white p-2 rounded group hover:bg-purple-100 transition-colors">
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold block uppercase">Account Name (اسم الحساب)</label>
                      <p className="font-mono text-sm font-bold text-gray-900">Client Tester</p>
                    </div>
                    <button onClick={() => navigator.clipboard.writeText("Client Tester")} className="text-gray-400 hover:text-purple-600 p-1 bg-gray-50 rounded shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity" title="نسخ">📋</button>
                  </div>
                  
                  <div className="flex justify-between items-center bg-white p-2 rounded group hover:bg-purple-100 transition-colors">
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold block uppercase">SIP Server & Domain</label>
                      <p className="font-mono text-sm font-bold text-gray-900">167.71.66.188:5062</p>
                    </div>
                    <button onClick={() => navigator.clipboard.writeText("167.71.66.188:5062")} className="text-gray-400 hover:text-purple-600 p-1 bg-gray-50 rounded shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity" title="نسخ">📋</button>
                  </div>

                  <div className="flex justify-between items-center bg-white p-2 rounded group hover:bg-purple-100 transition-colors">
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold block uppercase">Username & Login</label>
                      <p className="font-mono text-sm font-bold text-gray-900">999</p>
                    </div>
                    <button onClick={() => navigator.clipboard.writeText("999")} className="text-gray-400 hover:text-purple-600 p-1 bg-gray-50 rounded shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity" title="نسخ">📋</button>
                  </div>

                  <div className="flex justify-between items-center bg-white p-2 rounded group hover:bg-purple-100 transition-colors">
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold block uppercase">Password (كلمة المرور)</label>
                      <p className="font-mono text-sm font-bold text-gray-900">tester123</p>
                    </div>
                    <button onClick={() => navigator.clipboard.writeText("tester123")} className="text-gray-400 hover:text-purple-600 p-1 bg-gray-50 rounded shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity" title="نسخ">📋</button>
                  </div>
                  
                  <div className="flex justify-between items-center bg-white p-2 rounded md:col-span-2 group hover:bg-purple-100 transition-colors">
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold block uppercase">Transport (نوع الاتصال)</label>
                      <p className="font-mono text-sm font-bold text-gray-900">TCP <span className="text-xs font-normal text-red-500">(هام جداً)</span></p>
                    </div>
                    <button onClick={() => navigator.clipboard.writeText("TCP")} className="text-gray-400 hover:text-purple-600 p-1 bg-gray-50 rounded shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity" title="نسخ">📋</button>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-800 leading-relaxed bg-yellow-50 p-4 rounded-md border border-yellow-200 shadow-sm mt-4">
                <p className="font-bold mb-2">💡 طريقة الاختبار (كيف تجرب النظام):</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>استخدم بيانات <strong>حساب العميل (999)</strong> للاتصال من MicroSIP.</li>
                  <li>اتصل على الرقم <code className="bg-white px-1 py-0.5 rounded border border-gray-200 font-bold text-blue-600">200</code> للحديث مع الذكاء الاصطناعي كأنك عميل.</li>
                  <li>إذا طلبت تقديم شكوى، سيقوم الذكاء الاصطناعي بتحويلك إلى <strong>التحويلة البشرية (Agent)</strong> المحددة أدناه.</li>
                </ol>
              </div>

              <div className="space-y-2 pt-4 border-t border-blue-100">
                <label className="text-sm font-bold text-gray-700">
                  تحويلة التصعيد الافتراضية للموظف (Escalation Extension)
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={
                    aiSettings.escalationExtension ||
                    sipSettings.agentExtension ||
                    ""
                  }
                  onChange={(e) =>
                    setAiSettings({
                      ...aiSettings,
                      escalationExtension: e.target.value,
                    })
                  }
                  placeholder="رقم التحويلة للتحويل البشري"
                />
              </div>
            </div>
          </div>

          {/* SIP Trunk Config */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                إعدادات خط الاتصال (SIP Trunk)
              </h3>
              <p className="text-sm text-gray-500">
                اربط نظام المكالمات الخاص بك بخطوط SIP خارجية
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  الخادم المستضيف (SIP Host/Provider)
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-gray-400 outline-none"
                  placeholder="sip.provider.com"
                  value={sipSettings.trunkHost || ""}
                  onChange={(e) =>
                    setSipSettings({
                      ...sipSettings,
                      trunkHost: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    اسم المستخدم (Username)
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-gray-400 outline-none"
                    value={sipSettings.trunkUsername || ""}
                    onChange={(e) =>
                      setSipSettings({
                        ...sipSettings,
                        trunkUsername: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    كلمة المرور (Password)
                  </label>
                  <input
                    type="password"
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-gray-400 outline-none"
                    value={sipSettings.trunkPassword || ""}
                    onChange={(e) =>
                      setSipSettings({
                        ...sipSettings,
                        trunkPassword: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    رقم الهوية (DID Number)
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-gray-400 outline-none"
                    placeholder="966500000000"
                    value={sipSettings.didNumber || ""}
                    onChange={(e) =>
                      setSipSettings({
                        ...sipSettings,
                        didNumber: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    عدد القنوات (Max Channels)
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-gray-400 outline-none"
                    value={sipSettings.maxChannels || 10}
                    onChange={(e) =>
                      setSipSettings({
                        ...sipSettings,
                        maxChannels: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={handleSaveSip}
                disabled={saving}
                className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
              >
                حفظ إعدادات الخط
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
