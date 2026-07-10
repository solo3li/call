import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { 
  PackageSearch, LogOut, LayoutDashboard, Settings,
  ArrowRightLeft, Boxes, Truck, AlertOctagon, TrendingUp,
  Search, Plus
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const mockChartData = [
  { name: 'الفرع الرئيسي', الدجاج: 4000, اللحوم: 2400, الخبز: 2400 },
  { name: 'فرع مدينة نصر', الدجاج: 3000, اللحوم: 1398, الخبز: 2210 },
  { name: 'فرع التجمع', الدجاج: 2000, اللحوم: 9800, الخبز: 2290 },
  { name: 'فرع المعادي', الدجاج: 2780, اللحوم: 3908, الخبز: 2000 },
];

const mockInventoryItems = [
  { id: '1', name: 'صدور دجاج متبلة', sku: 'CHK-001', stock: 1250, unit: 'كجم', status: 'جيد' },
  { id: '2', name: 'لحم بقري مفروم', sku: 'BF-001', stock: 45, unit: 'كجم', status: 'حرج' },
  { id: '3', name: 'خبز برجر بالسمسم', sku: 'BUN-01', stock: 500, unit: 'قطعة', status: 'متوسط' },
  { id: '4', name: 'زيت قلي', sku: 'OIL-01', stock: 300, unit: 'لتر', status: 'جيد' },
];

export default function InventoryDashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex h-screen bg-[#FFFBEB] font-cairo overflow-hidden" dir="rtl">
      
      {/* Decorative Neo-Brutalist Grid Background Patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,#1A1A1A_1px,transparent_1px),linear-gradient(to_bottom,#1A1A1A_1px,transparent_1px)] bg-[size:4rem_4rem] z-0"></div>

      {/* Neo-Brutalist Sidebar */}
      <div className="w-72 bg-[#00B0FF] border-l-4 border-[#1A1A1A] flex flex-col z-10 relative">
        <div className="p-6 border-b-4 border-[#1A1A1A] bg-white flex items-center justify-center gap-3">
          <PackageSearch size={28} className="text-[#FF6B35]" strokeWidth={3} />
          <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight mt-1">نظام المخازن</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-3 border-[#1A1A1A] font-black transition-all ${activeTab === 'dashboard' ? 'bg-[#FFD700] shadow-[3px_3px_0px_#1A1A1A] translate-y-[-2px]' : 'bg-white hover:bg-[#FFD700]/50'}`}
          >
            <LayoutDashboard size={20} />
            <span>نظرة عامة</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('items')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-3 border-[#1A1A1A] font-black transition-all ${activeTab === 'items' ? 'bg-[#FFD700] shadow-[3px_3px_0px_#1A1A1A] translate-y-[-2px]' : 'bg-white hover:bg-[#FFD700]/50'}`}
          >
            <Boxes size={20} />
            <span>الأصناف والمواد</span>
          </button>

          <button 
            onClick={() => setActiveTab('transfers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-3 border-[#1A1A1A] font-black transition-all ${activeTab === 'transfers' ? 'bg-[#FFD700] shadow-[3px_3px_0px_#1A1A1A] translate-y-[-2px]' : 'bg-white hover:bg-[#FFD700]/50'}`}
          >
            <ArrowRightLeft size={20} />
            <span>التحويلات بين الفروع</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('suppliers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-3 border-[#1A1A1A] font-black transition-all ${activeTab === 'suppliers' ? 'bg-[#FFD700] shadow-[3px_3px_0px_#1A1A1A] translate-y-[-2px]' : 'bg-white hover:bg-[#FFD700]/50'}`}
          >
            <Truck size={20} />
            <span>الموردين</span>
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
            <h2 className="text-xl font-black text-[#1A1A1A]">مرحباً، أمين المخزن 👋</h2>
            <p className="text-sm font-bold text-gray-500">مراجعة الجرد: أحدث البيانات تم مزامنتها الآن</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#FFD700] border-3 border-[#1A1A1A] rounded-xl font-black shadow-[2px_2px_0px_#1A1A1A] hover:translate-y-[-1px] transition-transform">
              <Plus size={18} />
              إضافة صنف
            </button>
            <button className="p-2 border-3 border-[#1A1A1A] rounded-xl hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_#1A1A1A]">
              <Settings size={22} />
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-[#00E676] border-4 border-[#1A1A1A] rounded-[24px] p-6 shadow-[4px_4px_0px_#1A1A1A] text-[#1A1A1A]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-white p-2 rounded-xl border-2 border-[#1A1A1A]">
                      <Boxes size={24} />
                    </div>
                    <span className="text-3xl font-black">2,450</span>
                  </div>
                  <h3 className="font-black text-lg">إجمالي الأصناف</h3>
                </div>
                
                <div className="bg-[#FF1744] border-4 border-[#1A1A1A] rounded-[24px] p-6 shadow-[4px_4px_0px_#1A1A1A] text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-white text-[#1A1A1A] p-2 rounded-xl border-2 border-[#1A1A1A]">
                      <AlertOctagon size={24} />
                    </div>
                    <span className="text-3xl font-black">12</span>
                  </div>
                  <h3 className="font-black text-lg">أصناف تحت الحد الأدنى</h3>
                </div>

                <div className="bg-[#AA00FF] border-4 border-[#1A1A1A] rounded-[24px] p-6 shadow-[4px_4px_0px_#1A1A1A] text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-white text-[#1A1A1A] p-2 rounded-xl border-2 border-[#1A1A1A]">
                      <ArrowRightLeft size={24} />
                    </div>
                    <span className="text-3xl font-black">45</span>
                  </div>
                  <h3 className="font-black text-lg">تحويلات قيد الانتظار</h3>
                </div>

                <div className="bg-white border-4 border-[#1A1A1A] rounded-[24px] p-6 shadow-[4px_4px_0px_#1A1A1A] text-[#1A1A1A]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-[#FFD700] p-2 rounded-xl border-2 border-[#1A1A1A]">
                      <TrendingUp size={24} />
                    </div>
                    <span className="text-3xl font-black text-[#00E676]">+15%</span>
                  </div>
                  <h3 className="font-black text-lg">معدل الاستهلاك الشهري</h3>
                </div>
              </div>

              {/* Chart Section */}
              <div className="bg-white border-4 border-[#1A1A1A] rounded-[24px] p-6 shadow-[6px_6px_0px_#1A1A1A]">
                <h3 className="text-2xl font-black mb-6">مستويات المخزون (الفروع)</h3>
                <div className="h-80 w-full dir-ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{fontFamily: 'Cairo', fontWeight: 'bold'}} />
                      <YAxis />
                      <Tooltip contentStyle={{fontFamily: 'Cairo', borderRadius: '12px', border: '3px solid #1A1A1A', boxShadow: '3px 3px 0px #1A1A1A'}} />
                      <Legend wrapperStyle={{fontFamily: 'Cairo', fontWeight: 'bold'}} />
                      <Bar dataKey="الدجاج" stackId="a" fill="#FF6B35" stroke="#1A1A1A" strokeWidth={2} />
                      <Bar dataKey="اللحوم" stackId="a" fill="#AA00FF" stroke="#1A1A1A" strokeWidth={2} />
                      <Bar dataKey="الخبز" stackId="a" fill="#FFD700" stroke="#1A1A1A" strokeWidth={2} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Inventory Table */}
              <div className="bg-white border-4 border-[#1A1A1A] rounded-[24px] p-6 shadow-[6px_6px_0px_#1A1A1A]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black">جرد المستودع الرئيسي</h3>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="بحث عن صنف..." 
                      className="pr-10 pl-4 py-2 border-3 border-[#1A1A1A] rounded-xl font-bold focus:outline-none focus:shadow-[2px_2px_0px_#00B0FF] transition-all w-64"
                    />
                    <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-4 border-[#1A1A1A]">
                        <th className="text-right p-4 font-black">رقم الصنف (SKU)</th>
                        <th className="text-right p-4 font-black">الاسم</th>
                        <th className="text-right p-4 font-black">الكمية المتوفرة</th>
                        <th className="text-right p-4 font-black">الوحدة</th>
                        <th className="text-center p-4 font-black">الحالة</th>
                        <th className="text-left p-4 font-black">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockInventoryItems.map((item, index) => (
                        <tr key={item.id} className={`border-b-2 border-gray-200 hover:bg-gray-50 ${index === mockInventoryItems.length - 1 ? 'border-none' : ''}`}>
                          <td className="p-4 font-bold text-gray-600">{item.sku}</td>
                          <td className="p-4 font-black">{item.name}</td>
                          <td className="p-4 font-black text-xl">{item.stock}</td>
                          <td className="p-4 font-bold text-gray-500">{item.unit}</td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full font-black text-xs border-2 border-[#1A1A1A] ${
                              item.status === 'حرج' ? 'bg-[#FF1744] text-white' : 
                              item.status === 'متوسط' ? 'bg-[#FFD700] text-[#1A1A1A]' : 
                              'bg-[#00E676] text-[#1A1A1A]'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="p-4 text-left">
                            <button className="px-4 py-1.5 bg-white border-2 border-[#1A1A1A] rounded-lg font-bold text-sm shadow-[2px_2px_0px_#1A1A1A] hover:bg-gray-50 active:translate-y-[1px] active:shadow-none transition-all">
                              تعديل
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {activeTab !== 'dashboard' && (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <Boxes size={64} className="text-gray-300 mx-auto mb-4" />
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
