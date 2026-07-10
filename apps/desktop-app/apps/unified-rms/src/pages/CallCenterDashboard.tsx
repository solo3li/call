import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { 
  PhoneCall, LogOut, LayoutDashboard, MessageSquare, 
  Settings, PhoneIncoming, AlertTriangle, Users, 
  History, UserCheck, Bot
} from 'lucide-react';

export default function CallCenterDashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [incomingCall, setIncomingCall] = useState<any>(null);

  // Mock SignalR Incoming Call
  useEffect(() => {
    const timer = setTimeout(() => {
      setIncomingCall({
        callerName: "أحمد محمد",
        phoneNumber: "+201012345678",
        lastOrder: "قبل يومين",
        type: "complaint"
      });
    }, 5000); // Trigger after 5 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleAcceptCall = () => {
    // Integrate MicroSIP API / logic here in the future
    alert("تم فتح تطبيق MicroSIP والرد على المكالمة.");
    setIncomingCall(null);
  };

  const handleRejectCall = () => {
    setIncomingCall(null);
  };

  return (
    <div className="flex h-screen bg-[#FFFBEB] font-cairo overflow-hidden" dir="rtl">
      
      {/* Decorative Neo-Brutalist Grid Background Patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,#1A1A1A_1px,transparent_1px),linear-gradient(to_bottom,#1A1A1A_1px,transparent_1px)] bg-[size:4rem_4rem] z-0"></div>

      {/* Neo-Brutalist Sidebar */}
      <div className="w-72 bg-[#AA00FF] border-l-4 border-[#1A1A1A] flex flex-col z-10 relative">
        <div className="p-6 border-b-4 border-[#1A1A1A] bg-white flex items-center justify-center gap-3">
          <PhoneCall size={28} className="text-[#FF6B35]" strokeWidth={3} />
          <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight mt-1">الكول سنتر</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-3 border-[#1A1A1A] font-black transition-all ${activeTab === 'dashboard' ? 'bg-[#FFD700] shadow-[3px_3px_0px_#1A1A1A] translate-y-[-2px]' : 'bg-white hover:bg-[#FFD700]/50'}`}
          >
            <LayoutDashboard size={20} />
            <span>لوحة المراقبة</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('complaints')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-3 border-[#1A1A1A] font-black transition-all ${activeTab === 'complaints' ? 'bg-[#FFD700] shadow-[3px_3px_0px_#1A1A1A] translate-y-[-2px]' : 'bg-white hover:bg-[#FFD700]/50'}`}
          >
            <AlertTriangle size={20} className="text-[#FF1744]" />
            <span>شكاوى البوت (ماسنجر/واتساب)</span>
            <span className="mr-auto bg-[#FF1744] text-white text-xs px-2 py-0.5 rounded-full border-2 border-[#1A1A1A]">3</span>
          </button>

          <button 
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-3 border-[#1A1A1A] font-black transition-all ${activeTab === 'history' ? 'bg-[#FFD700] shadow-[3px_3px_0px_#1A1A1A] translate-y-[-2px]' : 'bg-white hover:bg-[#FFD700]/50'}`}
          >
            <History size={20} />
            <span>سجل المكالمات</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('customers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-3 border-[#1A1A1A] font-black transition-all ${activeTab === 'customers' ? 'bg-[#FFD700] shadow-[3px_3px_0px_#1A1A1A] translate-y-[-2px]' : 'bg-white hover:bg-[#FFD700]/50'}`}
          >
            <Users size={20} />
            <span>قاعدة العملاء</span>
          </button>
        </div>

        <div className="p-4 border-t-4 border-[#1A1A1A] bg-white">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FF1744] text-white rounded-xl border-3 border-[#1A1A1A] font-black hover:translate-y-[-2px] hover:shadow-[3px_3px_0px_#1A1A1A] active:translate-y-[1px] active:shadow-none transition-all"
          >
            <LogOut size={20} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col z-10 relative">
        
        {/* Header */}
        <header className="h-20 bg-white border-b-4 border-[#1A1A1A] flex items-center justify-between px-8">
          <div>
            <h2 className="text-xl font-black text-[#1A1A1A]">مرحباً، موظف خدمة العملاء 👋</h2>
            <p className="text-sm font-bold text-gray-500">حالة النظام: متصل بخوادم SignalR</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#00E676]/20 border-3 border-[#00E676] rounded-xl font-black text-[#00E676]">
              <span className="w-3 h-3 bg-[#00E676] rounded-full animate-pulse border-2 border-[#1A1A1A]"></span>
              جاهز لتلقي المكالمات
            </div>
            <button className="p-2 border-3 border-[#1A1A1A] rounded-xl hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_#1A1A1A]">
              <Settings size={22} />
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          
          {/* SignalR Incoming Call Toast (Absolute Overlay) */}
          {incomingCall && (
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white border-4 border-[#1A1A1A] rounded-[24px] p-6 shadow-[8px_8px_0px_#1A1A1A] w-full max-w-md animate-bounce z-50">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-[#FF6B35] rounded-full border-3 border-[#1A1A1A] flex items-center justify-center shrink-0">
                  <PhoneIncoming className="text-white animate-pulse" size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-[#1A1A1A] flex items-center gap-2">
                    مكالمة واردة <span className="bg-[#FF1744] text-white text-[10px] px-2 py-0.5 rounded-full border-2 border-[#1A1A1A]">شكوى</span>
                  </h3>
                  <p className="font-bold text-gray-600 mt-1">{incomingCall.callerName}</p>
                  <p className="font-bold text-gray-500 text-sm dir-ltr text-right">{incomingCall.phoneNumber}</p>
                  
                  <div className="mt-3 bg-gray-100 p-2 border-2 border-dashed border-gray-300 rounded-lg text-xs font-bold text-gray-600">
                    آخر طلب: {incomingCall.lastOrder}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-5">
                <button 
                  onClick={handleAcceptCall}
                  className="flex-1 py-3 bg-[#00E676] border-3 border-[#1A1A1A] rounded-xl font-black text-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] hover:translate-y-[-2px] active:translate-y-[1px] transition-all flex items-center justify-center gap-2"
                >
                  <PhoneCall size={18} />
                  رد عبر MicroSIP
                </button>
                <button 
                  onClick={handleRejectCall}
                  className="px-6 py-3 bg-white border-3 border-[#1A1A1A] rounded-xl font-black text-[#FF1744] hover:bg-gray-50 transition-all"
                >
                  رفض
                </button>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#00B0FF] border-4 border-[#1A1A1A] rounded-[24px] p-6 shadow-[4px_4px_0px_#1A1A1A] text-[#1A1A1A]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-white p-2 rounded-xl border-2 border-[#1A1A1A]">
                      <PhoneCall size={24} />
                    </div>
                    <span className="text-3xl font-black">124</span>
                  </div>
                  <h3 className="font-black text-lg">المكالمات اليوم</h3>
                </div>
                
                <div className="bg-[#FF6B35] border-4 border-[#1A1A1A] rounded-[24px] p-6 shadow-[4px_4px_0px_#1A1A1A] text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-white text-[#1A1A1A] p-2 rounded-xl border-2 border-[#1A1A1A]">
                      <MessageSquare size={24} />
                    </div>
                    <span className="text-3xl font-black">45</span>
                  </div>
                  <h3 className="font-black text-lg">الطلبات المؤكدة</h3>
                </div>

                <div className="bg-[#FF1744] border-4 border-[#1A1A1A] rounded-[24px] p-6 shadow-[4px_4px_0px_#1A1A1A] text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-white text-[#1A1A1A] p-2 rounded-xl border-2 border-[#1A1A1A]">
                      <AlertTriangle size={24} />
                    </div>
                    <span className="text-3xl font-black">3</span>
                  </div>
                  <h3 className="font-black text-lg">الشكاوى المفتوحة</h3>
                </div>
              </div>

              {/* Bot Complaints Section */}
              <div className="bg-white border-4 border-[#1A1A1A] rounded-[24px] p-6 shadow-[6px_6px_0px_#1A1A1A]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black flex items-center gap-3">
                    <Bot size={28} className="text-[#AA00FF]" />
                    تحويلات البوت الذكي (الشكاوى)
                  </h3>
                  <button className="px-4 py-2 bg-[#FFD700] border-3 border-[#1A1A1A] rounded-xl font-black text-sm shadow-[2px_2px_0px_#1A1A1A] hover:translate-y-[-1px] transition-transform">
                    عرض الكل
                  </button>
                </div>
                
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="p-4 border-3 border-[#1A1A1A] rounded-xl flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="w-12 h-12 bg-gray-100 border-2 border-[#1A1A1A] rounded-full flex items-center justify-center shrink-0">
                        <UserCheck size={20} className="text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-[#1A1A1A]">عميل من (الماسنجر)</h4>
                        <p className="text-sm font-bold text-gray-500 mt-1 line-clamp-1">البوت لم يستطع الرد: "الأكل وصل بارد جداً وأريد استرجاع..."</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs font-bold bg-[#FF1744]/10 text-[#FF1744] px-2 py-1 rounded-md border border-[#FF1744]/20">تصعيد للوكيل</span>
                        <span className="text-xs font-bold text-gray-400">منذ 5 دقائق</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'dashboard' && (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <Bot size={64} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-black text-gray-400">هذه الشاشة قيد التطوير</h3>
                <p className="font-bold text-gray-400 mt-2">جاري العمل على استكمال باقي الصفحات الفرعية.</p>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
