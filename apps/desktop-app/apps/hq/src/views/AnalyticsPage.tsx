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

  if (loading) return <div className="p-20 text-center font-black text-2xl animate-pulse">جاري تحليل البيانات... 📊</div>;

  return (
    <div className="space-y-4">
      <div className={`bg-brand-purple neo-card p-3 flex flex-row items-center justify-between text-white shadow-[2px_2px_0px_#1A1A1A]`}>
        <div className="flex items-center gap-3">
          <BarChart3 size={20} />
          <h2 className="text-lg font-black">تحليلات الأداء</h2>
        </div>
        <div className="flex gap-2">
            <button onClick={fetchStats} className="neo-btn bg-white text-neo-text px-3 py-1 shadow-sm">
                <RefreshCcw size={14} />
            </button>
            <select className="neo-input bg-white text-neo-text font-bold text-xs py-1 h-8" value={timeRange} onChange={(e) => setFilter(e.target.value)}>
                <option value="today">اليوم</option>
                <option value="last7days">آخر 7 أيام</option>
                <option value="month">هذا الشهر</option>
            </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <StatCard title="المبيعات" value={formatCurrency(stats?.totalRevenue || 0)} icon={DollarSign} color="bg-brand-green" trend="+12%" />
          <StatCard title="الطلبات" value={stats?.totalOrders || 0} icon={ShoppingBag} color="bg-brand-yellow" trend="+5%" />
          <StatCard title="متوسط الطلب" value={formatCurrency((stats?.totalRevenue || 0) / (stats?.totalOrders || 1))} icon={TrendingUp} color="bg-brand-cyan" trend="+2%" />
          <StatCard title="العملاء" value="128" icon={Users} color="bg-brand-pink" trend="+8%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="neo-card p-4 bg-white border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A]">
            <h3 className="font-black text-sm mb-4 flex items-center gap-2">
                <DollarSign className="text-brand-green" size={16} />
                تحليل الإيرادات
            </h3>
            <div className="h-[250px]">
                <RevenueChart data={stats?.revenueData || []} />
            </div>
        </div>
        <div className="neo-card p-4 bg-white border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A]">
            <h3 className="font-black text-sm mb-4 flex items-center gap-2">
                <ShoppingBag className="text-brand-orange" size={16} />
                كثافة الطلبات
            </h3>
            <div className="h-[250px]">
                <OrdersChart data={stats?.ordersPerHour || []} />
            </div>
        </div>
      </div>

      <div className="neo-card p-0 bg-white border-4 border-neo-border shadow-[4px_4px_0px_#1A1A1A]">
          <table className="w-full text-right border-collapse">
              <thead>
                  <tr className="bg-gray-100 border-b-2 border-neo-border text-[10px]">
                      <th className="px-2 py-1.5 font-black border-l border-neo-border">الفرع</th>
                      <th className="px-2 py-1.5 font-black border-l border-neo-border">الطلبات</th>
                      <th className="px-2 py-1.5 font-black border-l border-neo-border">المبيعات</th>
                      <th className="px-2 py-1.5 font-black border-l border-neo-border">النمو</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-neo-border text-xs">
                  {stats?.topBranches?.map((branch: any) => (
                      <tr key={branch.id} className="hover:bg-gray-50">
                          <td className="px-2 py-1.5 font-bold border-l border-neo-border">{branch.name}</td>
                          <td className="px-2 py-1.5 font-bold border-l border-neo-border">{branch.orders}</td>
                          <td className="px-2 py-1.5 font-black text-brand-green border-l border-neo-border">{formatCurrency(branch.revenue)}</td>
                          <td className="px-2 py-1.5 border-l border-neo-border">
                              <span className={`flex items-center gap-1 font-bold text-[10px] ${branch.trend.startsWith('+') ? 'text-green-600 bg-green-100 px-1 w-max' : 'text-red-600 bg-red-100 px-1 w-max'}`}>
                                  {branch.trend.startsWith('+') ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />} {branch.trend}
                              </span>
                          </td>
                      </tr>
                  ))}
                  {(!stats?.topBranches || stats.topBranches.length === 0) && (
                      <tr>
                          <td colSpan={4} className="p-3 text-center text-gray-500 font-bold text-[10px]">لا توجد بيانات</td>
                      </tr>
                  )}
              </tbody>
          </table>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, trend }: any) {
    return (
        <div className="neo-card p-3 bg-white border-2 border-neo-border shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
                <div className={`${color} p-1.5 border border-neo-border`}>
                    <Icon size={14} className="text-white" />
                </div>
                <span className={`text-[9px] font-black px-1.5 py-0.5 border border-neo-border ${trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {trend}
                </span>
            </div>
            <div>
                <p className="text-[10px] font-bold text-gray-500">{title}</p>
                <p className="text-sm font-black truncate">{value}</p>
            </div>
        </div>
    );
}
