'use client';

import { Link } from "react-router-dom";
import { useNavigate as useRouter } from "react-router-dom";
import { LogIn, Rocket, ShieldCheck, Utensils, Star, CheckCircle2, Store, Users, LineChart, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { authApi } from "../utils/api";

export function MarketingHeader() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  return (
    <header className="sticky top-4 z-50 px-4 md:px-6">
      <div className="max-w-6xl mx-auto bg-white border-4 border-neo-border rounded-2xl shadow-[4px_4px_0px_#1A1A1A] px-6 py-4 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push("/")}>
          <div className="w-10 h-10 bg-[#FFFBEB] border-2 border-neo-border flex items-center justify-center rounded-lg shadow-[2px_2px_0px_#1A1A1A] group-hover:translate-y-[-1px] group-hover:shadow-[3px_3px_0px_#1A1A1A] overflow-hidden transition-all p-1">
            <img src="/logo.png" alt="OPNO Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-black text-xl hover:text-brand-orange transition-colors">أوبنو</h1>
        </div>
        <nav className="hidden md:flex items-center gap-4 font-bold text-gray-700">
          <Link href="/" className="hover:bg-brand-orange/10 px-3 py-1.5 rounded-lg border-2 border-transparent hover:border-neo-border hover:text-brand-orange transition-all">الرئيسية</Link>
          <Link href="/pricing" className="hover:bg-brand-yellow/15 px-3 py-1.5 rounded-lg border-2 border-transparent hover:border-neo-border hover:text-brand-yellow transition-all">الباقات والأسعار</Link>
          <Link href="/contact" className="hover:bg-brand-blue/10 px-3 py-1.5 rounded-lg border-2 border-transparent hover:border-neo-border hover:text-brand-blue transition-all">اتصل بنا</Link>
          <Link href="/download" className="hover:bg-brand-green/10 px-3 py-1.5 rounded-lg border-2 border-transparent hover:border-neo-border hover:text-brand-green transition-all">تحميل التطبيقات</Link>
        </nav>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link href="/profile" className="neo-btn bg-brand-yellow hover:bg-brand-yellow/90 flex items-center gap-2 px-4 py-2 hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#1A1A1A] active:translate-y-[1px] active:shadow-[1px_1px_0px_#1A1A1A] transition-all">
              <Store size={18} />
              <span className="font-black">حسابي</span>
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden md:block font-black hover:text-brand-orange transition-colors px-4">
                تسجيل الدخول
              </Link>
              <Link href="/register" className="neo-btn bg-brand-purple text-white flex items-center gap-2 px-5 py-2 hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#1A1A1A] active:translate-y-[1px] active:shadow-[1px_1px_0px_#1A1A1A] transition-all">
                <Rocket size={18} />
                <span className="font-black">ابدأ مجاناً</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="bg-neo-card border-t-2 border-neo-border py-12 mt-20">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#FFFBEB] neo-card-flat flex items-center justify-center overflow-hidden p-1">
              <img src="/logo.png" alt="OPNO Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="font-black text-xl">أوبنو</h2>
          </div>
          <p className="font-bold text-gray-600 max-w-sm">
            نظام إدارة المطاعم والكافيهات السحابي الأسهل والأسرع. صمم لزيادة أرباحك وتنظيم عملياتك.
          </p>
        </div>
        <div>
          <h3 className="font-black mb-4">روابط سريعة</h3>
          <ul className="space-y-2 font-bold text-gray-600">
            <li><Link href="/" className="hover:text-brand-orange">الرئيسية</Link></li>
            <li><Link href="/pricing" className="hover:text-brand-orange">الأسعار</Link></li>
            <li><Link href="/login" className="hover:text-brand-orange">دخول</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-black mb-4">تواصل معنا</h3>
          <ul className="space-y-2 font-bold text-gray-600">
            <li>support@foodrms.com</li>
            <li>+966 50 000 0000</li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 mt-12 pt-6 border-t-2 border-neo-border text-center font-bold text-gray-500">
        © {new Date().getFullYear()} أوبنو. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}

export function PricingPage() {
  return (
    <div className="font-cairo dir-rtl bg-neo-bg min-h-screen flex flex-col">
      <MarketingHeader />
      <main className="flex-grow py-20 px-6 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-10 right-10 text-6xl opacity-20 rotate-12">🍔</div>
        <div className="absolute bottom-20 left-10 text-6xl opacity-20 -rotate-12">🧾</div>

        <div className="max-w-4xl mx-auto text-center space-y-6 mb-16 relative z-10">
          <div className="inline-block bg-brand-yellow border-2 border-neo-border px-4 py-1 rounded-full font-black text-sm -rotate-2 mb-4">
            🔥 بدون رسوم تأسيس خفية
          </div>
          <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tight leading-tight">
            أسعار واضحة.<br />
            <span className="bg-brand-orange text-white px-4 border-4 border-neo-border inline-block rotate-1 mt-2 shadow-[4px_4px_0px_#1A1A1A]">
              صفر مفاجآت.
            </span>
          </h1>
          <p className="text-2xl font-bold text-gray-700 max-w-2xl mx-auto leading-relaxed mt-6">
            اختر الأداة التي ستضاعف أرباح مطعمك اليوم. ركز على الطبخ، واترك الإدارة لأوبنو.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:px-12 relative z-10">
          {/* Basic Plan */}
          <div className="bg-white border-4 border-neo-border rounded-2xl p-8 flex flex-col shadow-[8px_8px_0px_#1A1A1A] hover:-translate-y-2 hover:shadow-[12px_12px_0px_#1A1A1A] transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-black mb-2">البداية الذكية</h2>
                <p className="font-bold text-gray-500">للمطاعم والكافيهات الناشئة</p>
              </div>
              <div className="w-12 h-12 bg-brand-cyan border-2 border-neo-border rounded-xl flex items-center justify-center text-2xl shadow-[2px_2px_0px_#1A1A1A]">
                🌱
              </div>
            </div>
            
            <div className="mb-8 pb-8 border-b-4 border-neo-border border-dashed">
              <span className="text-6xl font-black">199</span>
              <span className="text-2xl font-bold text-gray-600"> ر.س / شهر</span>
            </div>
            
            <ul className="space-y-4 mb-10 flex-grow">
              {[
                { text: 'نقطة بيع (POS) واحدة سريعة جداً', icon: '⚡' },
                { text: 'منيو إلكتروني ذكي (QR)', icon: '📱' },
                { text: 'إدارة الطلبات والعملاء الأساسية', icon: '📋' },
                { text: 'تقارير يومية مبسطة', icon: '📊' }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 font-bold text-lg text-gray-800">
                  <span className="w-8 h-8 bg-gray-100 border-2 border-neo-border rounded flex items-center justify-center text-sm shadow-[1px_1px_0px_#1A1A1A] shrink-0">{item.icon}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
            
            <Link href="/register" className="w-full bg-brand-yellow border-2 border-neo-border text-center py-4 text-xl font-black rounded-xl shadow-[4px_4px_0px_#1A1A1A] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#1A1A1A] transition-all">
              اشترك الآن
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-brand-purple text-white border-4 border-neo-border rounded-2xl p-8 flex flex-col shadow-[8px_8px_0px_#1A1A1A] hover:-translate-y-2 hover:shadow-[12px_12px_0px_#1A1A1A] transition-all duration-300 relative transform md:-translate-y-4">
            <div className="absolute -top-6 right-1/2 translate-x-1/2 bg-brand-green text-neo-border font-black px-6 py-2 rounded-full border-4 border-neo-border text-lg shadow-[4px_4px_0px_#1A1A1A] whitespace-nowrap rotate-2 z-20">
              الأكثر طلباً 🚀
            </div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-black mb-2 text-white">إمبراطورية الغذاء</h2>
                <p className="font-bold text-white/80">للفروع المتعددة والعمليات المعقدة</p>
              </div>
              <div className="w-12 h-12 bg-brand-orange border-2 border-neo-border rounded-xl flex items-center justify-center text-2xl shadow-[2px_2px_0px_#1A1A1A]">
                👑
              </div>
            </div>
            
            <div className="mb-8 pb-8 border-b-4 border-neo-border border-dashed">
              <span className="text-6xl font-black text-white">499</span>
              <span className="text-2xl font-bold text-white/80"> ر.س / شهر</span>
            </div>
            
            <ul className="space-y-4 mb-10 flex-grow">
              {[
                { text: 'كل مميزات باقة "البداية الذكية"', icon: '✨' },
                { text: 'نقاط بيع (POS) غير محدودة', icon: '♾️' },
                { text: 'إدارة فروع متعددة مركزياً', icon: '🏢' },
                { text: 'شاشة مطبخ (KDS) حية', icon: '👨‍🍳' },
                { text: 'تقارير تحليلية ومحاسبية عميقة', icon: '📈' }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 font-bold text-lg text-white">
                  <span className="w-8 h-8 bg-white/20 border-2 border-white rounded flex items-center justify-center text-sm shadow-[1px_1px_0px_white] shrink-0">{item.icon}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
            
            <Link href="/register" className="w-full bg-brand-orange border-2 border-neo-border text-white text-center py-4 text-xl font-black rounded-xl shadow-[4px_4px_0px_#1A1A1A] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#1A1A1A] transition-all">
              ابدأ تجربتك فوراً
            </Link>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}

export function ProfilePage() {
  const router = useRouter();
  const [tenantId, setTenantId] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    
    setTenantId(localStorage.getItem("tenantId") || "");
    setUserName(localStorage.getItem("userName") || "");
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="font-cairo dir-rtl bg-neo-bg min-h-screen flex flex-col">
      <MarketingHeader />
      <main className="flex-grow py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-black mb-8">إدارة الحساب</h1>
          
          <div className="neo-card bg-white p-8 space-y-8">
            <div className="flex items-center gap-6 pb-8 border-b-2 border-neo-border">
              <div className="w-24 h-24 bg-brand-orange neo-card-flat flex items-center justify-center text-4xl">
                🏪
              </div>
              <div>
                <h2 className="text-2xl font-black">{userName || "مطعمي"}</h2>
                <p className="font-bold text-gray-500">رقم الحساب: {tenantId}</p>
                <div className="mt-2 inline-block bg-brand-green text-white font-bold px-3 py-1 text-sm border-2 border-neo-border rounded-lg">
                  حالة الاشتراك: نشط
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-black">الدخول إلى النظام</h3>
                <p className="font-bold text-gray-600 text-sm">
                  انتقل إلى لوحة التحكم الخاصة بمطعمك للبدء في إدارة أعمالك.
                </p>
                <button onClick={handleGoToDashboard} className="neo-btn bg-brand-purple text-white w-full py-4 flex items-center justify-center gap-2 text-lg">
                  <LayoutDashboard size={20} />
                  <span>الذهاب إلى لوحة التحكم</span>
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-black">إعدادات الحساب</h3>
                <button className="neo-btn bg-gray-100 text-gray-700 w-full py-3 flex items-center gap-3 px-4">
                  <ShieldCheck size={18} />
                  <span>تغيير كلمة المرور</span>
                </button>
                <button className="neo-btn bg-brand-yellow w-full py-3 flex items-center gap-3 px-4">
                  <Star size={18} />
                  <span>ترقية الباقة</span>
                </button>
                <button onClick={handleLogout} className="neo-btn bg-brand-red text-white w-full py-3 flex items-center gap-3 px-4">
                  <LogIn size={18} className="rotate-180" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="font-cairo dir-rtl bg-neo-bg min-h-screen flex flex-col">
      <MarketingHeader />
      <main className="flex-grow py-20 px-6">
        <div className="max-w-3xl mx-auto neo-card bg-white p-8 md:p-12">
          <h1 className="text-4xl font-black mb-4 text-center">تواصل مع فريق الدعم</h1>
          <p className="text-lg font-bold text-gray-600 text-center mb-8">نحن هنا لمساعدتك في أي وقت. أرسل استفسارك وسنرد عليك بأسرع وقت.</p>
          {submitted ? (
            <div className="bg-brand-green text-white p-6 rounded-xl border-2 border-neo-border text-center font-bold text-lg">
              ✅ تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-6">
              <div>
                <label className="block font-black mb-2 text-sm">الاسم الكامل</label>
                <input type="text" required placeholder="أحمد محمد" className="neo-input w-full" />
              </div>
              <div>
                <label className="block font-black mb-2 text-sm">البريد الإلكتروني</label>
                <input type="email" required placeholder="name@restaurant.com" className="neo-input w-full dir-ltr text-right" />
              </div>
              <div>
                <label className="block font-black mb-2 text-sm">موضوع الرسالة</label>
                <input type="text" required placeholder="استفسار عن الباقات" className="neo-input w-full" />
              </div>
              <div>
                <label className="block font-black mb-2 text-sm">نص الرسالة</label>
                <textarea rows={4} required placeholder="اكتب استفسارك هنا..." className="neo-input w-full"></textarea>
              </div>
              <button type="submit" className="neo-btn bg-brand-orange text-white w-full py-4 text-lg">إرسال الرسالة 🚀</button>
            </form>
          )}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}