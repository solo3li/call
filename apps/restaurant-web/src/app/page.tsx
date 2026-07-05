import Link from "next/link";
import { Rocket, Utensils, Star, LineChart, Users } from "lucide-react";
import { MarketingHeader, MarketingFooter } from "../views/MarketingPages";

export default function Home() {
  return (
    <div className="font-cairo dir-rtl bg-neo-bg min-h-screen flex flex-col overflow-hidden">
      <MarketingHeader />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-20 md:py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-8 relative z-20">
            <div className="inline-block bg-brand-lime border-4 border-neo-border px-6 py-2 rounded-xl font-black text-lg rotate-[-3deg] shadow-[4px_4px_0px_#1A1A1A] animate-pulse">
              🚀 النظام رقم 1 لإدارة المطاعم
            </div>
            <h1 className="text-6xl md:text-8xl font-black leading-[1.1] tracking-tight uppercase">
              أدِر مطعمك <br />
              <span className="bg-brand-orange text-white px-2 border-4 border-neo-border inline-block rotate-1 shadow-[6px_6px_0px_#1A1A1A] mt-4">
                بقبضة من حديد
              </span>
            </h1>
            <p className="text-2xl font-bold text-gray-800 leading-relaxed max-w-lg mt-6">
              تخلّص من الفوضى. كاشير سريع، منيو إلكتروني، تقارير حيّة، وإدارة مطبخ متكاملة في شاشة واحدة تنبض بالحياة.
            </p>
            <div className="flex flex-wrap items-center gap-6 pt-6">
              <Link href="/register" className="neo-btn bg-brand-purple text-white text-2xl font-black px-10 py-5 flex items-center gap-3 border-4 border-neo-border shadow-[8px_8px_0px_#1A1A1A] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[4px_4px_0px_#1A1A1A] transition-all">
                <Rocket size={28} strokeWidth={3} />
                <span>ابدأ الآن</span>
              </Link>
              <a href="#features" className="neo-btn bg-white text-gray-900 text-2xl font-black px-10 py-5 border-4 border-neo-border shadow-[8px_8px_0px_#1A1A1A] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[4px_4px_0px_#1A1A1A] transition-all">
                كيف نعمل؟
              </a>
            </div>
          </div>
          
          <div className="relative z-10 hidden lg:block">
            {/* Hard geometric backdrop */}
            <div className="absolute top-10 -left-10 w-full h-full bg-brand-cyan border-4 border-neo-border rounded-3xl -rotate-6"></div>
            <div className="absolute -bottom-10 -right-10 w-3/4 h-full bg-brand-pink border-4 border-neo-border rounded-full rotate-12"></div>
            
            <div className="bg-white p-4 relative z-20 rotate-[2deg] hover:rotate-0 transition-transform duration-500 border-4 border-neo-border rounded-2xl shadow-[16px_16px_0px_#1A1A1A]">
              <img src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80" alt="Restaurant staff serving high-quality dishes" className="rounded-xl border-4 border-neo-border object-cover h-[500px] w-full" />
              
              {/* Floating badges with hard shadows */}
              <div className="absolute -top-8 -right-8 bg-brand-yellow px-6 py-4 border-4 border-neo-border shadow-[6px_6px_0px_#1A1A1A] rotate-3">
                <span className="font-black text-2xl">💰 +45% مبيعات</span>
              </div>
              <div className="absolute -bottom-8 -left-8 bg-brand-green text-white px-6 py-4 border-4 border-neo-border shadow-[6px_6px_0px_#1A1A1A] -rotate-3">
                <span className="font-black text-2xl">⏱️ أسرع 3x</span>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee Section */}
        <div className="bg-brand-yellow border-y-4 border-neo-border py-4 overflow-hidden relative z-20 flex whitespace-nowrap -rotate-1 scale-105 shadow-[0px_8px_0px_#1A1A1A]">
          <div className="animate-marquee inline-block font-black text-2xl text-neo-border space-x-8 space-x-reverse uppercase">
            {[...Array(6)].map((_, i) => (
              <span key={i} className="mx-4 flex items-center gap-4 inline-flex">
                <span>⭐ موثوق من 500+ مطعم</span>
                <span>•</span>
                <span>🚀 دعم فني 24/7</span>
                <span>•</span>
                <span>⚡ كاشير لا يتوقف</span>
                <span>•</span>
              </span>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="bg-brand-blue border-b-4 border-neo-border py-24 relative z-10 pt-32">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="mb-20 text-center space-y-6">
              <h2 className="text-5xl md:text-6xl font-black text-white uppercase inline-block bg-neo-border px-6 py-2 shadow-[8px_8px_0px_#FFD700] rotate-1">
                الترسانة الكاملة لمطعمك
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { icon: Utensils, title: "كاشير لا يرحم", desc: "نقطة بيع سريعة كالبرق، تعمل حتى لو انقطع الإنترنت. لا مزيد من الطوابير الطويلة.", color: "bg-brand-pink", shadow: "shadow-[8px_8px_0px_#1A1A1A]", rotate: "-rotate-1" },
                { icon: LineChart, title: "تقارير تشرح الصدر", desc: "أرقامك وأرباحك واضحة ومرئية لحظة بلحظة. تعرف على مبيعاتك وأنت جالس في بيتك.", color: "bg-brand-yellow", shadow: "shadow-[8px_8px_0px_#1A1A1A]", rotate: "rotate-2" },
                { icon: Users, title: "فريق كالجيش", desc: "إدارة الصلاحيات والموظفين بضغطة زر. تتبع من يبيع أكثر وكافئ المميزين.", color: "bg-brand-lime", shadow: "shadow-[8px_8px_0px_#1A1A1A]", rotate: "-rotate-2" },
              ].map((f, i) => (
                <div key={i} className={`bg-white p-10 border-4 border-neo-border ${f.shadow} ${f.rotate} hover:rotate-0 hover:-translate-y-2 hover:shadow-[12px_12px_0px_#1A1A1A] transition-all duration-300 rounded-2xl`}>
                  <div className={`w-20 h-20 ${f.color} border-4 border-neo-border rounded-xl flex items-center justify-center mb-8 shadow-[4px_4px_0px_#1A1A1A]`}>
                    <f.icon size={40} strokeWidth={2.5} className="text-neo-border" />
                  </div>
                  <h3 className="text-3xl font-black mb-4">{f.title}</h3>
                  <p className="text-xl font-bold text-gray-700 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-neo-bg border-b-4 border-neo-border overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-20">
              <h2 className="text-5xl font-black uppercase inline-block bg-white border-4 border-neo-border px-6 py-2 shadow-[8px_8px_0px_#1A1A1A] -rotate-1">
                قالوا عنا 🗣️
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="bg-brand-green text-white p-10 border-4 border-neo-border shadow-[12px_12px_0px_#1A1A1A] rounded-3xl relative rotate-1">
                <div className="absolute -top-6 -right-6 text-7xl">💬</div>
                <div className="flex gap-2 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} className="fill-brand-yellow text-brand-yellow" size={28} />)}
                </div>
                <p className="text-2xl font-bold leading-relaxed mb-8">
                  "من يوم ما استخدمنا أوبنو، الطوابير اختفت والمبيعات زادت 30%. السيستم سريع وما يعلق أبداً!"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white border-4 border-neo-border rounded-full shadow-[4px_4px_0px_#1A1A1A] flex items-center justify-center text-2xl font-black text-brand-green">أ.م</div>
                  <div>
                    <h4 className="font-black text-xl">أحمد محمد</h4>
                    <p className="font-bold opacity-90">صاحب مطعم برجر ستيشن</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-brand-purple text-white p-10 border-4 border-neo-border shadow-[12px_12px_0px_#1A1A1A] rounded-3xl relative -rotate-1 mt-12 md:mt-0">
                <div className="absolute -top-6 -right-6 text-7xl">💬</div>
                <div className="flex gap-2 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} className="fill-brand-yellow text-brand-yellow" size={28} />)}
                </div>
                <p className="text-2xl font-bold leading-relaxed mb-8">
                  "لوحة التحكم خيالية. أقدر أتابع مبيعات فرعي في الرياض وجدة من جوالي وأنا في البيت. نظام مريح جداً."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-brand-yellow border-4 border-neo-border rounded-full shadow-[4px_4px_0px_#1A1A1A] flex items-center justify-center text-2xl font-black text-brand-purple">س.ع</div>
                  <div>
                    <h4 className="font-black text-xl">سارة عبدالله</h4>
                    <p className="font-bold opacity-90">مديرة كافيه لاروز</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 bg-brand-pink relative overflow-hidden">
          <div className="absolute inset-0 pattern-dots opacity-20"></div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-6xl md:text-8xl font-black text-neo-border mb-8 uppercase leading-tight tracking-tight">
              جاهز للقفزة <br/>الكبرى؟
            </h2>
            <p className="text-3xl font-bold text-gray-900 mb-12">
              انضم لمئات المطاعم الناجحة اليوم.
            </p>
            <Link href="/register" className="inline-block bg-white text-neo-border text-3xl font-black px-12 py-6 border-4 border-neo-border shadow-[12px_12px_0px_#1A1A1A] hover:translate-y-[4px] hover:translate-x-[4px] hover:shadow-[4px_4px_0px_#1A1A1A] transition-all rounded-2xl rotate-2">
              ابدأ تجربتك المجانية 🔥
            </Link>
          </div>
        </section>
      </main>
      
      <MarketingFooter />
    </div>
  );
}
