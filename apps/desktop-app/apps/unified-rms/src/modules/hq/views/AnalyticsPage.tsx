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

  if (loading) return <div className="p-20 text-center font-semibold text-2xl animate-pulse">جاري تحليل البيانات... </div>;

  return (
    <div className="space-y-4">
      <div className={`bg-carbon-layer border border-carbon-border p-3 flex flex-row items-center justify-between`}>
        <div className="flex items-center gap-3">
          <BarChart3 size={20} />
          <h2 className="text-lg font-semibold">تحليلات الأداء</h2>
        </div>
        <div className="flex gap-2">
            <button onClick={fetchStats} className="px-4 py-2 text-sm font-medium transition-colors bg-carbon-layer text-carbon-text border border-carbon-border hover:bg-carbon-layerHover text-carbon-text px-3 py-1 shadow-sm">
                <RefreshCcw size={14} />
            </button>
            <select className="w-full border border-carbon-border bg-carbon-bg px-3 py-2 text-sm focus:outline-none focus:border-carbon-blue text-carbon-text placeholder-carbon-textSecondary bg-white text-carbon-text font-medium text-xs py-1 h-8" value={timeRange} onChange={(e) => setFilter(e.target.value)}>
                <option value="today">اليوم</option>
                <option value="last7days">آخر 7 أيام</option>
                <option value="month">هذا الشهر</option>
            </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <StatCard title="المبيعات" value={formatCurrency(stats?.totalRevenue || 0)} icon={DollarSign} color="bg-carbon-success/10 text-carbon-success" trend="+12%" />
          <StatCard title="الطلبات" value={stats?.totalOrders || 0} icon={ShoppingBag} color="bg-carbon-blue/10 text-carbon-blue" trend="+5%" />
          <StatCard title="متوسط الطلب" value={formatCurrency((stats?.totalRevenue || 0) / (stats?.totalOrders || 1))} icon={TrendingUp} color="bg-carbon-warning/10 text-carbon-warning" trend="+2%" />
          <StatCard title="العملاء" value="128" icon={Users} color="bg-carbon-purple/10 text-carbon-purple" trend="+8%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-carbon-layer border border-carbon-border p-4 ">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <DollarSign className="text-carbon-success" size={16} />
                تحليل الإيرادات
            </h3>
            <div className="h-[250px]">
                <RevenueChart data={stats?.revenueData || []} />
            </div>
        </div>
        <div className="bg-carbon-layer border border-carbon-border p-4 ">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <ShoppingBag className="text-carbon-warning" size={16} />
                كثافة الطلبات
            </h3>
            <div className="h-[250px]">
                <OrdersChart data={stats?.ordersPerHour || []} />
            </div>
        </div>
      </div>

      <div className="bg-carbon-layer border border-carbon-border p-0 overflow-hidden ">
          <table className="w-full text-right border-collapse">
              <thead>
                  <tr className="bg-carbon-bg border-b border-carbon-border text-[10px]">
                      <th className="px-2 py-1.5 font-semibold border-l border-carbon-border">الفرع</th>
                      <th className="px-2 py-1.5 font-semibold border-l border-carbon-border">الطلبات</th>
                      <th className="px-2 py-1.5 font-semibold border-l border-carbon-border">المبيعات</th>
                      <th className="px-2 py-1.5 font-semibold border-l border-carbon-border">النمو</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-carbon-border text-xs">
                  {stats?.topBranches?.map((branch: any) => (
                      <tr key={branch.id} className="hover:bg-carbon-bg">
                          <td className="px-2 py-1.5 font-medium border-l border-carbon-border">{branch.name}</td>
                          <td className="px-2 py-1.5 font-medium border-l border-carbon-border">{branch.orders}</td>
                          <td className="px-2 py-1.5 font-semibold text-carbon-success border-l border-carbon-border">{formatCurrency(branch.revenue)}</td>
                          <td className="px-2 py-1.5 border-l border-carbon-border">
                              <span className={`flex items-center gap-1 font-medium text-[10px] ${branch.trend.startsWith('+') ? 'text-carbon-success bg-carbon-success/10 px-1 w-max' : 'text-carbon-error bg-carbon-error/10 px-1 w-max'}`}>
                                  {branch.trend.startsWith('+') ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />} {branch.trend}
                              </span>
                          </td>
                      </tr>
                  ))}
                  {(!stats?.topBranches || stats.topBranches.length === 0) && (
                      <tr>
                          <td colSpan={4} className="p-3 text-center text-carbon-textSecondary font-medium text-[10px]">لا توجد بيانات</td>
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
        <div className="bg-carbon-layer border border-carbon-border p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
                <div className={`${color} p-1.5 border border-carbon-border`}>
                    <Icon size={14} className="currentColor" />
                </div>
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 border border-carbon-border ${trend.startsWith('+') ? 'bg-carbon-success/10 text-carbon-success' : 'bg-carbon-error/10 text-carbon-error'}`}>
                    {trend}
                </span>
            </div>
            <div>
                <p className="text-[10px] font-medium text-carbon-textSecondary">{title}</p>
                <p className="text-sm font-semibold truncate">{value}</p>
            </div>
        </div>
    );
}
