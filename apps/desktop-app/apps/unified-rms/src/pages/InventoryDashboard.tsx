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
    <div className="flex h-screen bg-carbon-bg text-carbon-text font-cairo overflow-hidden" dir="rtl">
      


      {/* Sidebar */}
      <div className="w-52 bg-carbon-layer border-l border-carbon-border flex flex-col z-10 relative">
        <div className="p-4 border-b border-carbon-border bg-carbon-layer flex items-center gap-3">
          <PackageSearch size={24} className="text-carbon-blue" />
          <h1 className="text-lg font-bold text-white tracking-tight mt-1">المخازن</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-none font-bold transition-colors ${activeTab === 'dashboard' ? 'bg-carbon-blue text-white border-l-4 border-white' : 'text-carbon-textSecondary hover:bg-carbon-layerHover hover:text-white'}`}
          >
            <LayoutDashboard size={18} />
            <span className="text-sm">نظرة عامة</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('items')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-none font-bold transition-colors ${activeTab === 'items' ? 'bg-carbon-blue text-white border-l-4 border-white' : 'text-carbon-textSecondary hover:bg-carbon-layerHover hover:text-white'}`}
          >
            <Boxes size={18} />
            <span className="text-sm">الأصناف والمواد</span>
          </button>

          <button 
            onClick={() => setActiveTab('transfers')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-none font-bold transition-colors ${activeTab === 'transfers' ? 'bg-carbon-blue text-white border-l-4 border-white' : 'text-carbon-textSecondary hover:bg-carbon-layerHover hover:text-white'}`}
          >
            <ArrowRightLeft size={18} />
            <span className="text-sm">التحويلات بين الفروع</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('suppliers')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-none font-bold transition-colors ${activeTab === 'suppliers' ? 'bg-carbon-blue text-white border-l-4 border-white' : 'text-carbon-textSecondary hover:bg-carbon-layerHover hover:text-white'}`}
          >
            <Truck size={18} />
            <span className="text-sm">الموردين</span>
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
            <h2 className="text-lg font-bold text-white">مرحباً، أمين المخزن</h2>
            <p className="text-xs font-normal text-carbon-textSecondary">مراجعة الجرد: أحدث البيانات تم مزامنتها الآن</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-carbon-blue text-white rounded-none font-bold hover:bg-carbon-blueHover transition-colors text-sm">
              <Plus size={16} />
              إضافة صنف
            </button>
            <button className="p-2 text-carbon-textSecondary hover:bg-carbon-layerHover hover:text-white rounded-none transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-carbon-layer border border-carbon-border p-5 text-white">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-carbon-blue">
                      <Boxes size={24} />
                    </div>
                    <span className="text-2xl font-bold">2,450</span>
                  </div>
                  <h3 className="font-normal text-sm text-carbon-textSecondary">إجمالي الأصناف</h3>
                </div>
                
                <div className="bg-carbon-layer border border-carbon-border p-5 text-white">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-[#da1e28]">
                      <AlertOctagon size={24} />
                    </div>
                    <span className="text-2xl font-bold">12</span>
                  </div>
                  <h3 className="font-normal text-sm text-carbon-textSecondary">أصناف تحت الحد الأدنى</h3>
                </div>

                <div className="bg-carbon-layer border border-carbon-border p-5 text-white">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-[#8a3ffc]">
                      <ArrowRightLeft size={24} />
                    </div>
                    <span className="text-2xl font-bold">45</span>
                  </div>
                  <h3 className="font-normal text-sm text-carbon-textSecondary">تحويلات قيد الانتظار</h3>
                </div>

                <div className="bg-carbon-layer border border-carbon-border p-5 text-white">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-[#24a148]">
                      <TrendingUp size={24} />
                    </div>
                    <span className="text-2xl font-bold text-[#24a148]">+15%</span>
                  </div>
                  <h3 className="font-normal text-sm text-carbon-textSecondary">معدل الاستهلاك الشهري</h3>
                </div>
              </div>

              {/* Chart Section */}
              <div className="bg-carbon-layer border border-carbon-border p-5">
                <h3 className="text-lg font-bold mb-6 text-white">مستويات المخزون (الفروع)</h3>
                <div className="h-80 w-full dir-ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#393939" vertical={false} />
                      <XAxis dataKey="name" tick={{fill: '#c6c6c6', fontSize: 12}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fill: '#c6c6c6', fontSize: 12}} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: '#393939'}} contentStyle={{backgroundColor: '#262626', border: '1px solid #393939', color: '#fff'}} />
                      <Legend wrapperStyle={{fontSize: 12, color: '#c6c6c6'}} />
                      <Bar dataKey="الدجاج" stackId="a" fill="#0f62fe" />
                      <Bar dataKey="اللحوم" stackId="a" fill="#8a3ffc" />
                      <Bar dataKey="الخبز" stackId="a" fill="#009d9a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Inventory Table */}
              <div className="bg-carbon-layer border border-carbon-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">جرد المستودع الرئيسي</h3>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="بحث عن صنف..." 
                      className="pr-10 pl-4 py-2 bg-carbon-bg border-b border-carbon-border text-white text-sm focus:outline-none focus:border-carbon-blue transition-colors w-64"
                    />
                    <Search className="absolute right-3 top-2.5 text-carbon-textSecondary" size={16} />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-carbon-textSecondary uppercase bg-carbon-bg">
                      <tr>
                        <th className="text-right p-3 font-normal">رقم الصنف (SKU)</th>
                        <th className="text-right p-3 font-normal">الاسم</th>
                        <th className="text-right p-3 font-normal">الكمية المتوفرة</th>
                        <th className="text-right p-3 font-normal">الوحدة</th>
                        <th className="text-center p-3 font-normal">الحالة</th>
                        <th className="text-left p-3 font-normal">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-carbon-border">
                      {mockInventoryItems.map((item) => (
                        <tr key={item.id} className="hover:bg-carbon-layerHover transition-colors">
                          <td className="p-3 text-carbon-textSecondary">{item.sku}</td>
                          <td className="p-3 font-semibold text-white">{item.name}</td>
                          <td className="p-3 text-white">{item.stock}</td>
                          <td className="p-3 text-carbon-textSecondary">{item.unit}</td>
                          <td className="p-3 text-center">
                            <span className={`inline-block px-2 py-0.5 text-xs ${
                              item.status === 'حرج' ? 'bg-[#da1e28] text-white' : 
                              item.status === 'متوسط' ? 'bg-[#f1c21b] text-black' : 
                              'bg-[#24a148] text-white'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="p-3 text-left">
                            <button className="text-carbon-blue hover:text-carbon-blueHover font-semibold text-xs">
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
