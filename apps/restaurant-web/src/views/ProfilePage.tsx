import { useState, useEffect } from "react";
import { tenantSettingsApi } from "../utils/api";
import { Monitor, Crown, Users, MapPin, Activity, Zap, CreditCard, Settings, ArrowUpRight, TrendingUp, Bell, ChevronLeft, Download } from "lucide-react";

export function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tenantSettingsApi.getMyProfile().then(res => {
      setProfile(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="relative">
        <div className="w-24 h-24 bg-brand-yellow border-4 border-neo-border animate-spin"></div>
        <div className="absolute inset-0 bg-brand-pink border-4 border-neo-border animate-ping opacity-50 mix-blend-multiply"></div>
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 font-black text-2xl whitespace-nowrap">جاري التحميل...</div>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="p-20 text-center font-black text-2xl text-white bg-brand-red border-4 border-neo-border shadow-[8px_8px_0px_#000] rotate-[-2deg] max-w-xl mx-auto mt-20">
      حدث خطأ في جلب البيانات
    </div>
  );

  const planName = profile.plan?.name || "الخطة الأساسية";
  const maxBranches = profile.plan?.maxBranches || 1;
  const maxEmployees = profile.plan?.maxEmployees || 5;
  const branchesPercent = Math.min(100, (profile.usage.branchesCount / maxBranches) * 100);
  const employeesPercent = Math.min(100, (profile.usage.employeesCount / maxEmployees) * 100);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Marquee */}
      <div className="w-full overflow-hidden bg-brand-lime border-y-4 border-neo-border py-2 -mx-4 md:-mx-8 px-4 md:px-8 shadow-[0_4px_0px_#000]">
        <div className="whitespace-nowrap inline-block animate-[marquee_20s_linear_infinite] font-black text-neo-text uppercase tracking-wider text-sm md:text-base">
          🚀 تحديث جديد: تم إطلاق تطبيق السائقين! • 🔔 تذكير: قم بتحديث تطبيق الكاشير • 🌟 أوبنو - الإدارة كما يجب أن تكون • 🚀 تحديث جديد: تم إطلاق تطبيق السائقين!
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-brand-yellow translate-x-3 translate-y-3 border-4 border-neo-border rounded-xl"></div>
        <div className="relative bg-white p-8 md:p-10 border-4 border-neo-border rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-4">
            <div className="inline-block bg-brand-cyan px-4 py-1 border-2 border-neo-border font-black shadow-[2px_2px_0px_#000] rotate-[-2deg]">
              لوحة تحكم المالك
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-neo-text leading-tight">
              أهلاً بك، <span className="text-brand-pink underline decoration-4 underline-offset-4">{profile.userName}</span>! 👋
            </h2>
            <p className="font-bold text-gray-600 text-lg md:text-xl max-w-2xl">
              أنت تدير <span className="bg-brand-yellow/30 px-1">{profile.restaurantName}</span>. هنا تجد كل ما تحتاجه لإدارة إمبراطوريتك.
            </p>
          </div>
          <div className="shrink-0 flex gap-4">
            <button className="w-14 h-14 bg-brand-cyan border-4 border-neo-border shadow-[4px_4px_0px_#000] rounded-full flex items-center justify-center hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0px_#000] transition-all">
              <Settings size={24} strokeWidth={3} />
            </button>
            <button className="w-14 h-14 bg-brand-pink border-4 border-neo-border shadow-[4px_4px_0px_#000] rounded-full flex items-center justify-center hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0px_#000] transition-all relative">
              <Bell size={24} strokeWidth={3} className="text-white" />
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-brand-yellow border-2 border-neo-border flex items-center justify-center font-black text-xs rounded-full">3</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        
        {/* Usage Card (Span 1) */}
        <div className="bg-white border-4 border-neo-border shadow-[8px_8px_0px_#000] rounded-xl p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform group">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-2xl flex items-center gap-2">
              <Crown className="text-brand-yellow" size={28} strokeWidth={3} /> باقتك: {planName}
            </h3>
            <button className="text-sm font-bold border-b-2 border-neo-border hover:text-brand-blue">ترقية</button>
          </div>
          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="font-bold flex items-center gap-2"><MapPin size={18} /> الفروع</span>
                <span className="font-black text-xl">{profile.usage.branchesCount} <span className="text-sm text-gray-500">/ {maxBranches}</span></span>
              </div>
              <div className="w-full bg-gray-100 h-6 border-2 border-neo-border p-0.5 rounded-full relative overflow-hidden">
                <div className="bg-brand-green h-full rounded-full transition-all duration-1000" style={{ width: `${branchesPercent}%` }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="font-bold flex items-center gap-2"><Users size={18} /> الموظفين</span>
                <span className="font-black text-xl">{profile.usage.employeesCount} <span className="text-sm text-gray-500">/ {maxEmployees}</span></span>
              </div>
              <div className="w-full bg-gray-100 h-6 border-2 border-neo-border p-0.5 rounded-full relative overflow-hidden">
                <div className="bg-brand-blue h-full rounded-full transition-all duration-1000" style={{ width: `${employeesPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop App Gateway (Span 2) */}
        <div className="md:col-span-1 xl:col-span-2 bg-neo-text border-4 border-neo-border shadow-[8px_8px_0px_#FF00E6] rounded-xl p-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-cyan/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
          
          <div className="h-full bg-neo-bg/5 border-2 border-white/10 rounded-lg p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center justify-between relative z-10">
            <div className="flex-1 space-y-6 text-white text-center md:text-right">
              <div className="inline-flex items-center gap-2 bg-brand-cyan text-neo-text px-3 py-1 font-black text-sm border-2 border-neo-border shadow-[2px_2px_0px_#000]">
                <Monitor size={16} strokeWidth={3} /> تطبيق الإدارة
              </div>
              <h3 className="text-3xl md:text-4xl font-black">جاهز للتحكم في مطعمك؟</h3>
              <p className="font-bold text-gray-300 max-w-md mx-auto md:mx-0">
                استخدم تطبيق سطح المكتب للوصول إلى نقاط البيع، إدارة الطلبات، المطبخ والشاشات.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <button className="bg-brand-yellow text-neo-text border-4 border-neo-border shadow-[4px_4px_0px_#FF00E6] font-black px-6 py-3 text-lg hover:translate-y-1 hover:translate-x-1 hover:shadow-[0px_0px_0px_#FF00E6] transition-all flex items-center gap-2">
                  تحميل التطبيق <Download size={20} strokeWidth={3} />
                </button>
              </div>
            </div>
            
            {/* TOTP Terminal */}
            <div className="shrink-0 w-full md:w-auto bg-white p-4 border-4 border-neo-border shadow-[8px_8px_0px_#00E5FF] rotate-1 group-hover:rotate-0 transition-transform">
              <div className="flex items-center justify-between border-b-2 border-neo-border pb-2 mb-4">
                <span className="font-black text-sm text-neo-text flex items-center gap-2"><Zap className="text-brand-yellow" size={16}/> BoardToken</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-brand-red rounded-full border-2 border-neo-border"></div>
                  <div className="w-3 h-3 bg-brand-yellow rounded-full border-2 border-neo-border"></div>
                  <div className="w-3 h-3 bg-brand-green rounded-full border-2 border-neo-border"></div>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-4">
                {profile.qrCodeDataUri ? (
                  <div className="p-1 border-4 border-neo-border bg-white">
                    <img src={profile.qrCodeDataUri} alt="TOTP QR Code" className="w-40 h-40 object-contain" />
                  </div>
                ) : (
                  <div className="w-40 h-40 bg-gray-100 border-4 border-neo-border flex items-center justify-center font-bold text-center text-sm p-4">
                    لم يتم إنشاء الرمز
                  </div>
                )}
                
                <button
                  onClick={async () => {
                    if (confirm("إنشاء رمز جديد سيلغي الرمز القديم. متأكد؟")) {
                      const res = await tenantSettingsApi.generateMyTotp();
                      setProfile({ ...profile, qrCodeDataUri: res.data.qrCodeDataUri });
                    }
                  }}
                  className="w-full bg-brand-purple text-white border-2 border-neo-border shadow-[2px_2px_0px_#000] py-2 font-black text-sm hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000] transition-all"
                >
                  {profile.qrCodeDataUri ? "تحديث رمز الربط" : "توليد رمز جديد"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats (Span 3 on XL) */}
        <div className="md:col-span-2 xl:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-4">
          <div className="bg-brand-yellow p-6 border-4 border-neo-border shadow-[4px_4px_0px_#000] hover:-translate-y-2 hover:shadow-[8px_8px_0px_#000] transition-all group">
            <div className="w-12 h-12 bg-white border-4 border-neo-border rounded-full flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
              <TrendingUp size={24} strokeWidth={3} />
            </div>
            <p className="font-bold text-neo-text/80 text-sm">المبيعات اليوم</p>
            <p className="font-black text-3xl mt-1 dir-ltr text-right">SAR 12,450</p>
          </div>
          
          <div className="bg-brand-green p-6 border-4 border-neo-border shadow-[4px_4px_0px_#000] hover:-translate-y-2 hover:shadow-[8px_8px_0px_#000] transition-all group">
            <div className="w-12 h-12 bg-white border-4 border-neo-border rounded-full flex items-center justify-center mb-4 group-hover:-rotate-12 transition-transform">
              <Activity size={24} strokeWidth={3} />
            </div>
            <p className="font-bold text-neo-text/80 text-sm">الطلبات النشطة</p>
            <p className="font-black text-3xl mt-1">42 طلب</p>
          </div>
          
          <div className="bg-brand-pink p-6 border-4 border-neo-border shadow-[4px_4px_0px_#000] hover:-translate-y-2 hover:shadow-[8px_8px_0px_#000] transition-all group text-white">
            <div className="w-12 h-12 bg-white text-neo-text border-4 border-neo-border rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users size={24} strokeWidth={3} />
            </div>
            <p className="font-bold text-white/80 text-sm">العملاء الجدد</p>
            <p className="font-black text-3xl mt-1">+128</p>
          </div>
          
          <div className="bg-white p-6 border-4 border-neo-border shadow-[4px_4px_0px_#000] hover:-translate-y-2 hover:shadow-[8px_8px_0px_#000] transition-all group flex flex-col justify-center items-center text-center cursor-pointer">
            <div className="w-16 h-16 bg-brand-cyan border-4 border-neo-border rounded-full flex items-center justify-center mb-2 shadow-[2px_2px_0px_#000] group-hover:translate-x-2 transition-transform">
              <ArrowUpRight size={32} strokeWidth={3} />
            </div>
            <p className="font-black text-lg">التقارير الكاملة</p>
          </div>
        </div>

      </div>
    </div>
  );
}
