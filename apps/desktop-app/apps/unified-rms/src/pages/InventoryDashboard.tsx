import React, { useState } from 'react';
import AppShell from '../layouts/AppShell';
import { 
  Boxes, LayoutDashboard, Settings, 
  Search, Plus, LogOut, ArrowRightLeft,
  AlertOctagon, TrendingUp
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { name: 'الفرع الرئيسي', 'الدجاج': 4000, 'اللحوم': 2400, 'الخبز': 2400 },
  { name: 'فرع العليا', 'الدجاج': 3000, 'اللحوم': 1398, 'الخبز': 2210 },
  { name: 'فرع الياسمين', 'الدجاج': 2000, 'اللحوم': 9800, 'الخبز': 2290 },
  { name: 'فرع الملز', 'الدجاج': 2780, 'اللحوم': 3908, 'الخبز': 2000 },
];

const mockInventoryItems = [
  { id: 1, sku: 'ITM-001', name: 'صدور دجاج طازجة', stock: 150, unit: 'كجم', status: 'جيد' },
  { id: 2, sku: 'ITM-002', name: 'لحم بقري مفروم', stock: 20, unit: 'كجم', status: 'حرج' },
  { id: 3, sku: 'ITM-003', name: 'خبز برجر بطاطس', stock: 500, unit: 'حبة', status: 'متوسط' },
  { id: 4, sku: 'ITM-004', name: 'طماطم طازجة', stock: 45, unit: 'كجم', status: 'جيد' },
  { id: 5, sku: 'ITM-005', name: 'جبنة شيدر شرائح', stock: 15, unit: 'كجم', status: 'حرج' },
];

export default function InventoryDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <AppShell pageTitle="إدارة المخزون">
      <div className="flex flex-col gap-6 h-full">
        <div className="flex items-center justify-between bg-carbon-layer border border-carbon-border p-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="بحث في المخزون..." 
              className="pr-10 pl-4 py-2 bg-carbon-bg border border-carbon-border text-carbon-text text-sm focus:outline-none focus:border-carbon-blue transition-colors w-64"
            />
            <Search className="absolute right-3 top-2.5 text-carbon-textSecondary" size={16} />
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-carbon-blue text-white font-bold hover:bg-carbon-blueHover transition-colors text-sm">
              <Plus size={16} />
              إضافة صنف
            </button>
            <button className="p-2 text-carbon-textSecondary hover:bg-carbon-layerHover hover:text-carbon-text transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Dynamic Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-carbon-layer border border-carbon-border p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-carbon-blue">
                    <Boxes size={24} />
                  </div>
                  <span className="text-2xl font-bold text-carbon-text">2,450</span>
                </div>
                <h3 className="font-normal text-sm text-carbon-textSecondary">إجمالي الأصناف</h3>
              </div>
              
              <div className="bg-carbon-layer border border-carbon-border p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-carbon-error">
                    <AlertOctagon size={24} />
                  </div>
                  <span className="text-2xl font-bold text-carbon-text">12</span>
                </div>
                <h3 className="font-normal text-sm text-carbon-textSecondary">أصناف تحت الحد الأدنى</h3>
              </div>

              <div className="bg-carbon-layer border border-carbon-border p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-[#8a3ffc]">
                    <ArrowRightLeft size={24} />
                  </div>
                  <span className="text-2xl font-bold text-carbon-text">45</span>
                </div>
                <h3 className="font-normal text-sm text-carbon-textSecondary">تحويلات قيد الانتظار</h3>
              </div>

              <div className="bg-carbon-layer border border-carbon-border p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-carbon-success">
                    <TrendingUp size={24} />
                  </div>
                  <span className="text-2xl font-bold text-carbon-success">+15%</span>
                </div>
                <h3 className="font-normal text-sm text-carbon-textSecondary">معدل الاستهلاك الشهري</h3>
              </div>
            </div>

            {/* Chart Section */}
            <div className="bg-carbon-layer border border-carbon-border p-5">
              <h3 className="text-lg font-bold mb-6 text-carbon-text">مستويات المخزون (الفروع)</h3>
              <div className="h-80 w-full dir-ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                    <XAxis dataKey="name" tick={{fill: '#525252', fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill: '#525252', fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f4f4f4'}} contentStyle={{backgroundColor: '#ffffff', border: '1px solid #e0e0e0', color: '#161616'}} />
                    <Legend wrapperStyle={{fontSize: 12, color: '#525252'}} />
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
                <h3 className="text-lg font-bold text-carbon-text">جرد المستودع الرئيسي</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-carbon-textSecondary uppercase bg-carbon-bg border-b border-carbon-border">
                    <tr>
                      <th className="text-right p-3 font-semibold">رقم الصنف (SKU)</th>
                      <th className="text-right p-3 font-semibold">الاسم</th>
                      <th className="text-right p-3 font-semibold">الكمية المتوفرة</th>
                      <th className="text-right p-3 font-semibold">الوحدة</th>
                      <th className="text-center p-3 font-semibold">الحالة</th>
                      <th className="text-left p-3 font-semibold">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-carbon-border">
                    {mockInventoryItems.map((item) => (
                      <tr key={item.id} className="hover:bg-carbon-layerHover transition-colors">
                        <td className="p-3 text-carbon-textSecondary">{item.sku}</td>
                        <td className="p-3 font-semibold text-carbon-text">{item.name}</td>
                        <td className="p-3 text-carbon-text">{item.stock}</td>
                        <td className="p-3 text-carbon-textSecondary">{item.unit}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-2 py-0.5 text-xs font-semibold ${
                            item.status === 'حرج' ? 'bg-carbon-error text-white' : 
                            item.status === 'متوسط' ? 'bg-carbon-warning text-black' : 
                            'bg-carbon-success text-white'
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
              <Boxes size={64} className="text-carbon-border mx-auto mb-4" />
              <h3 className="text-2xl font-black text-carbon-textSecondary">هذه الشاشة قيد التطوير</h3>
              <p className="font-bold text-carbon-textSecondary mt-2">جاري العمل على استكمال باقي الصفحات الفرعية.</p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
