import { useFormatCurrency } from "../utils/useFormatCurrency";
import { useState, useEffect } from "react";
import { 
 BarChart3, TrendingUp, TrendingDown, Users, 
 ShoppingBag, DollarSign, Calendar, Filter, 
 ArrowUpRight, ArrowDownRight, RefreshCcw
} from "lucide-react";
import { dashboardApi } from "../utils/api";
import { DashboardStats } from "../types/api";
import { RevenueChart, OrdersChart } from "../components/Charts";

export function AnalyticsPage() {
 const formatCurrency = useFormatCurrency();
 const [stats, setStats] = useState<DashboardStats | null>(null);
 const [loading, setLoading] = useState(true);
 const [timeRange, setFilter] = useState("last7days");

 const fetchStats = async () => {
   try {
     setLoading(true);
     const res = await dashboardApi.getStats();
     setStats(res.data);
   } catch (err) {
     console.error(err);
   } finally {
     setLoading(false);
   }
 };

 useEffect(() => {
   fetchStats();
 }, []);

 if (loading) return <div className="p-20 text-center font-semibold text-2xl animate-pulse">جاري تحليل البيانات... ☕</div>;

 return (
   <div className="space-y-6 max-w-7xl">
     <div className="bg-carbon-layer border-b border-carbon-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
       <div className="flex items-center gap-4">
         <BarChart3 size={24} className="text-carbon-text" />
         <div>
           <h2 className="text-xl font-semibold text-carbon-text">تحليلات الأداء والتقارير</h2>
           <p className="text-sm text-carbon-textSecondary mt-1">مؤشرات الأداء، المبيعات، ومراقبة العمليات</p>
         </div>
       </div>
       <div className="flex gap-3">
         <button onClick={fetchStats} className="bg-transparent text-carbon-text hover:bg-carbon-layerHover border border-carbon-border transition-colors px-4 py-2.5 text-sm font-medium flex items-center gap-2">
           <RefreshCcw size={16} /> تحديث
         </button>
         <select className="bg-carbon-bg border-b border-carbon-border px-4 py-2.5 text-sm focus:outline-none focus:border-carbon-blue text-carbon-text appearance-none pr-8 cursor-pointer transition-colors" value={timeRange} onChange={(e) => setFilter(e.target.value)}>
           <option value="today">اليوم</option>
           <option value="last7days">آخر 7 أيام</option>
           <option value="month">هذا الشهر</option>
         </select>
       </div>
     </div>

     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
       <StatCard title="إجمالي المبيعات" value={formatCurrency(stats?.totalRevenue || 0)} icon={DollarSign} color="bg-carbon-success/10 text-carbon-success" trend="+12%" />
       <StatCard title="إجمالي الطلبات" value={stats?.totalOrders || 0} icon={ShoppingBag} color="bg-carbon-blue/10 text-carbon-blue" trend="+5%" />
       <StatCard title="متوسط قيمة الطلب" value={formatCurrency((stats?.totalRevenue || 0) / (stats?.totalOrders || 1))} icon={TrendingUp} color="bg-carbon-warning/10 text-carbon-warning" trend="+2%" />
       <StatCard title="العملاء النشطين" value="128" icon={Users} color="bg-carbon-purple/10 text-carbon-purple" trend="+8%" />
     </div>

     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       <div className="bg-carbon-layer border border-carbon-border p-6 shadow-sm">
         <h3 className="font-semibold text-base mb-6 flex items-center gap-2 text-carbon-text border-b border-carbon-border pb-3">
           <DollarSign className="text-carbon-success" size={18} />
           تحليل الإيرادات
         </h3>
         <div className="h-[300px]">
           <RevenueChart data={stats?.revenueData || []} />
         </div>
       </div>
       <div className="bg-carbon-layer border border-carbon-border p-6 shadow-sm">
         <h3 className="font-semibold text-base mb-6 flex items-center gap-2 text-carbon-text border-b border-carbon-border pb-3">
           <ShoppingBag className="text-carbon-warning" size={18} />
           كثافة الطلبات
         </h3>
         <div className="h-[300px]">
           <OrdersChart data={stats?.ordersPerHour || []} />
         </div>
       </div>
     </div>

     <div className="bg-carbon-layer border border-carbon-border overflow-hidden shadow-sm">
       <div className="p-5 border-b border-carbon-border bg-carbon-bg">
         <h3 className="font-semibold text-base text-carbon-text">أداء الفروع</h3>
       </div>
       <div className="overflow-x-auto">
         <table className="w-full text-right">
           <thead className="bg-carbon-bg border-b border-carbon-border text-carbon-textSecondary text-sm">
             <tr>
               <th className="px-6 py-4 font-medium border-l border-carbon-border">الفرع</th>
               <th className="px-6 py-4 font-medium border-l border-carbon-border">الطلبات</th>
               <th className="px-6 py-4 font-medium border-l border-carbon-border">المبيعات</th>
               <th className="px-6 py-4 font-medium">النمو</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-carbon-border bg-carbon-layer">
             {stats?.topBranches?.map((branch: any) => (
               <tr key={branch.id} className="hover:bg-carbon-layerHover transition-colors">
                 <td className="px-6 py-4 font-semibold text-carbon-text border-l border-carbon-border align-middle">{branch.name}</td>
                 <td className="px-6 py-4 font-medium text-carbon-text border-l border-carbon-border align-middle">{branch.orders}</td>
                 <td className="px-6 py-4 font-semibold text-carbon-success border-l border-carbon-border align-middle">{formatCurrency(branch.revenue)}</td>
                 <td className="px-6 py-4 align-middle">
                   <span className={`flex items-center gap-1 font-medium text-xs px-2 py-1 w-max rounded-sm ${branch.trend.startsWith('+') ? 'text-carbon-success bg-carbon-success/10 border border-carbon-success/20' : 'text-carbon-error bg-carbon-error/10 border border-carbon-error/20'}`}>
                    {branch.trend.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {branch.trend}
                   </span>
                 </td>
               </tr>
             ))}
             {(!stats?.topBranches || stats.topBranches.length === 0) && (
               <tr>
                 <td colSpan={4} className="p-8 text-center text-carbon-textSecondary font-medium text-sm">لا توجد بيانات متاحة</td>
               </tr>
             )}
           </tbody>
         </table>
       </div>
     </div>
   </div>
 );
}

function StatCard({ title, value, icon: Icon, color, trend }: any) {
 return (
   <div className="bg-carbon-layer border border-carbon-border p-6 shadow-sm flex flex-col justify-between">
     <div className="flex items-center justify-between mb-4">
       <div className={`${color} p-2 rounded-sm border border-current opacity-80`}>
         <Icon size={20} className="currentColor" />
       </div>
       <span className={`text-xs font-semibold px-2 py-1 border ${trend.startsWith('+') ? 'bg-carbon-success/10 text-carbon-success border-carbon-success/20' : 'bg-carbon-error/10 text-carbon-error border-carbon-error/20'}`}>
         {trend}
       </span>
     </div>
     <div>
       <p className="text-sm font-medium text-carbon-textSecondary mb-1">{title}</p>
       <p className="text-2xl font-semibold text-carbon-text">{value}</p>
     </div>
   </div>
 );
}
