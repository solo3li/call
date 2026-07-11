import React, { useState, useEffect } from 'react';
import AppShell from '../layouts/AppShell';
import { 
  PhoneCall, LogOut, LayoutDashboard, MessageSquare, 
  Settings, PhoneIncoming, AlertTriangle, Users, 
  History, UserCheck, Bot
} from 'lucide-react';

export default function CallCenterDashboard() {
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
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleAcceptCall = () => {
    alert("تم فتح تطبيق MicroSIP والرد على المكالمة.");
    setIncomingCall(null);
  };

  const handleRejectCall = () => {
    setIncomingCall(null);
  };

  return (
    <AppShell pageTitle="مركز الاتصال">
      <div className="flex flex-col gap-6 relative h-full">
        
        {/* SignalR Incoming Call Toast */}
        {incomingCall && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-carbon-layer border border-carbon-border p-5 w-full max-w-md shadow-lg z-50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-carbon-blue flex items-center justify-center shrink-0">
                <PhoneIncoming className="text-white animate-pulse" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  مكالمة واردة <span className="bg-carbon-error text-white text-[10px] px-2 py-0.5 rounded-full">شكوى</span>
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
                className="flex-1 py-2 bg-carbon-success text-white font-bold hover:bg-[#198038] transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <PhoneCall size={16} />
                رد عبر MicroSIP
              </button>
              <button 
                onClick={handleRejectCall}
                className="px-6 py-2 bg-transparent border border-carbon-error text-carbon-error font-bold hover:bg-carbon-error hover:text-white transition-colors text-sm"
              >
                رفض
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 bg-carbon-layer border border-carbon-border p-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#24a148]/10 border border-carbon-success text-carbon-success text-sm font-bold">
            <span className="w-2 h-2 bg-carbon-success rounded-full animate-pulse"></span>
            جاهز لتلقي المكالمات
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-carbon-layer border border-carbon-border p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-carbon-blue">
                    <PhoneCall size={24} />
                  </div>
                  <span className="text-2xl font-bold text-carbon-text">124</span>
                </div>
                <h3 className="font-normal text-sm text-carbon-textSecondary">المكالمات اليوم</h3>
              </div>
              
              <div className="bg-carbon-layer border border-carbon-border p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-[#009d9a]">
                    <MessageSquare size={24} />
                  </div>
                  <span className="text-2xl font-bold text-carbon-text">45</span>
                </div>
                <h3 className="font-normal text-sm text-carbon-textSecondary">الطلبات المؤكدة</h3>
              </div>

              <div className="bg-carbon-layer border border-carbon-border p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-carbon-error">
                    <AlertTriangle size={24} />
                  </div>
                  <span className="text-2xl font-bold text-carbon-text">3</span>
                </div>
                <h3 className="font-normal text-sm text-carbon-textSecondary">الشكاوى المفتوحة</h3>
              </div>
            </div>

            {/* Bot Complaints Section */}
            <div className="bg-carbon-layer border border-carbon-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-carbon-text flex items-center gap-2">
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
                      <h4 className="font-semibold text-carbon-text text-sm">عميل من (الماسنجر)</h4>
                      <p className="text-xs text-carbon-textSecondary mt-0.5 line-clamp-1">البوت لم يستطع الرد: "الأكل وصل بارد جداً وأريد استرجاع..."</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] bg-[#da1e28]/10 text-carbon-error px-1.5 py-0.5">تصعيد للوكيل</span>
                      <span className="text-[10px] text-carbon-textSecondary">منذ 5 دقائق</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
