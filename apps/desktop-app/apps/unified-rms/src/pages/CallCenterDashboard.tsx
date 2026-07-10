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
    <div className="flex h-screen bg-carbon-bg text-carbon-text font-cairo overflow-hidden" dir="rtl">
      


      {/* Sidebar */}
      <div className="w-52 bg-carbon-layer border-l border-carbon-border flex flex-col z-10 relative">
        <div className="p-4 border-b border-carbon-border bg-carbon-layer flex items-center gap-3">
          <PhoneCall size={24} className="text-carbon-blue" />
          <h1 className="text-lg font-bold text-white tracking-tight mt-1">الكول سنتر</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-none font-bold transition-colors ${activeTab === 'dashboard' ? 'bg-carbon-blue text-white border-l-4 border-white' : 'text-carbon-textSecondary hover:bg-carbon-layerHover hover:text-white'}`}
          >
            <LayoutDashboard size={18} />
            <span className="text-sm">لوحة المراقبة</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('complaints')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-none font-bold transition-colors ${activeTab === 'complaints' ? 'bg-carbon-blue text-white border-l-4 border-white' : 'text-carbon-textSecondary hover:bg-carbon-layerHover hover:text-white'}`}
          >
            <AlertTriangle size={18} className={activeTab === 'complaints' ? 'text-white' : 'text-[#da1e28]'} />
            <span className="text-sm">شكاوى البوت</span>
            <span className="mr-auto bg-[#da1e28] text-white text-[10px] px-2 py-0.5 rounded-full">3</span>
          </button>

          <button 
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-none font-bold transition-colors ${activeTab === 'history' ? 'bg-carbon-blue text-white border-l-4 border-white' : 'text-carbon-textSecondary hover:bg-carbon-layerHover hover:text-white'}`}
          >
            <History size={18} />
            <span className="text-sm">سجل المكالمات</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('customers')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-none font-bold transition-colors ${activeTab === 'customers' ? 'bg-carbon-blue text-white border-l-4 border-white' : 'text-carbon-textSecondary hover:bg-carbon-layerHover hover:text-white'}`}
          >
            <Users size={18} />
            <span className="text-sm">قاعدة العملاء</span>
          </button>
        </div>

        <div className="p-3 border-t border-carbon-border bg-carbon-layer">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#da1e28] text-white rounded-none font-bold hover:bg-[#ba1b23] transition-colors"
          >
            <LogOut size={16} />
            <span className="text-sm">تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col z-10 relative">
        
        {/* Header */}
        <header className="h-16 bg-carbon-layer border-b border-carbon-border flex items-center justify-between px-6">
          <div>
            <h2 className="text-lg font-bold text-white">مرحباً، موظف خدمة العملاء</h2>
            <p className="text-xs font-normal text-carbon-textSecondary">حالة النظام: متصل بخوادم SignalR</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#24a148]/10 border border-[#24a148] text-[#24a148] text-sm font-bold">
              <span className="w-2 h-2 bg-[#24a148] rounded-full animate-pulse"></span>
              جاهز لتلقي المكالمات
            </div>
            <button className="p-2 text-carbon-textSecondary hover:bg-carbon-layerHover hover:text-white rounded-none transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          
          {/* SignalR Incoming Call Toast */}
          {incomingCall && (
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-carbon-layer border border-carbon-border p-5 w-full max-w-md shadow-lg z-50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-carbon-blue flex items-center justify-center shrink-0">
                  <PhoneIncoming className="text-white animate-pulse" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    مكالمة واردة <span className="bg-[#da1e28] text-white text-[10px] px-2 py-0.5 rounded-full">شكوى</span>
                  </h3>
                  <p className="font-semibold text-carbon-textSecondary mt-1">{incomingCall.callerName}</p>
                  <p className="font-semibold text-carbon-textSecondary text-sm dir-ltr text-right">{incomingCall.phoneNumber}</p>
                  
                  <div className="mt-3 bg-carbon-bg p-2 border border-carbon-border text-xs text-carbon-textSecondary">
                    آخر طلب: {incomingCall.lastOrder}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={handleAcceptCall}
                  className="flex-1 py-2 bg-[#24a148] text-white font-bold hover:bg-[#198038] transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <PhoneCall size={16} />
                  رد عبر MicroSIP
                </button>
                <button 
                  onClick={handleRejectCall}
                  className="px-6 py-2 bg-transparent border border-[#da1e28] text-[#da1e28] font-bold hover:bg-[#da1e28] hover:text-white transition-colors text-sm"
                >
                  رفض
                </button>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-carbon-layer border border-carbon-border p-5 text-white">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-carbon-blue">
                      <PhoneCall size={24} />
                    </div>
                    <span className="text-2xl font-bold">124</span>
                  </div>
                  <h3 className="font-normal text-sm text-carbon-textSecondary">المكالمات اليوم</h3>
                </div>
                
                <div className="bg-carbon-layer border border-carbon-border p-5 text-white">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-[#009d9a]">
                      <MessageSquare size={24} />
                    </div>
                    <span className="text-2xl font-bold">45</span>
                  </div>
                  <h3 className="font-normal text-sm text-carbon-textSecondary">الطلبات المؤكدة</h3>
                </div>

                <div className="bg-carbon-layer border border-carbon-border p-5 text-white">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-[#da1e28]">
                      <AlertTriangle size={24} />
                    </div>
                    <span className="text-2xl font-bold">3</span>
                  </div>
                  <h3 className="font-normal text-sm text-carbon-textSecondary">الشكاوى المفتوحة</h3>
                </div>
              </div>

              {/* Bot Complaints Section */}
              <div className="bg-carbon-layer border border-carbon-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Bot size={24} className="text-[#8a3ffc]" />
                    تحويلات البوت الذكي (الشكاوى)
                  </h3>
                  <button className="text-carbon-blue text-sm hover:text-carbon-blueHover font-semibold transition-colors">
                    عرض الكل
                  </button>
                </div>
                
                <div className="space-y-2">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="p-3 bg-carbon-bg border border-carbon-border flex items-center gap-3 hover:bg-carbon-layerHover transition-colors cursor-pointer">
                      <div className="w-10 h-10 bg-carbon-layer border border-carbon-border flex items-center justify-center shrink-0 text-carbon-textSecondary">
                        <UserCheck size={18} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white text-sm">عميل من (الماسنجر)</h4>
                        <p className="text-xs text-carbon-textSecondary mt-0.5 line-clamp-1">البوت لم يستطع الرد: "الأكل وصل بارد جداً وأريد استرجاع..."</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] bg-[#da1e28]/10 text-[#da1e28] px-1.5 py-0.5">تصعيد للوكيل</span>
                        <span className="text-[10px] text-carbon-textSecondary">منذ 5 دقائق</span>
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
