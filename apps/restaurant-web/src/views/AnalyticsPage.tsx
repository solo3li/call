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
    <div className="space-y-6">
      <div className={`bg-brand-purple neo-card p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-white`}>
        <div className="flex items-center gap-4">
          <div className="neo-card-flat bg-white p-3 text-neo-text">
            <BarChart3 size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black">تحليلات الأداء</h2>
            <p className="font-bold opacity-80">راقب نمو مبيعاتك، سلوك العملاء، وكفاءة الفروع</p>
          </div>
        </div>
        <div className="flex gap-2">
            <button onClick={fetchStats} className="neo-btn bg-white text-neo-text p-2.5">
                <RefreshCcw size={18} />
            </button>
            <select className="neo-input bg-white text-neo-text font-bold" value={timeRange} onChange={(e) => setFilter(e.target.value)}>
                <option value="today">اليوم</option>
                <option value="last7days">آخر 7 أيام</option>
                <option value="month">هذا الشهر</option>
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="إجمالي المبيعات" value={formatCurrency(stats?.totalRevenue || 0)} icon={DollarSign} color="bg-brand-green" trend="+12%" />
          <StatCard title="عدد الطلبات" value={stats?.totalOrders || 0} icon={ShoppingBag} color="bg-brand-yellow" trend="+5%" />
          <StatCard title="متوسط قيمة الطلب" value={formatCurrency((stats?.totalRevenue || 0) / (stats?.totalOrders || 1))} icon={TrendingUp} color="bg-brand-cyan" trend="+2%" />
          <StatCard title="العملاء النشطون" value="128" icon={Users} color="bg-brand-pink" trend="+8%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="neo-card p-6 bg-white">
            <h3 className="font-black text-lg mb-6 flex items-center gap-2">
                <DollarSign className="text-brand-green" />
                تحليل الإيرادات اليومية
            </h3>
            <div className="h-[350px]">
                <RevenueChart data={stats?.revenueData || []} />
            </div>
        </div>
        <div className="neo-card p-6 bg-white">
            <h3 className="font-black text-lg mb-6 flex items-center gap-2">
                <ShoppingBag className="text-brand-orange" />
                كثافة الطلبات خلال اليوم
            </h3>
            <div className="h-[350px]">
                <OrdersChart data={stats?.ordersPerHour || []} />
            </div>
        </div>
      </div>

      <div className="neo-card p-6 bg-white">
          <h3 className="font-black text-lg mb-4">أهم الفروع أداءً</h3>
          <div className="overflow-x-auto">
              <table className="w-full text-right">
                  <thead>
                      <tr className="border-b-2 border-gray-100">
                          <th className="p-3 font-black">الفرع</th>
                          <th className="p-3 font-black">الطلبات</th>
                          <th className="p-3 font-black">المبيعات</th>
                          <th className="p-3 font-black">النمو</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                      {stats?.topBranches?.map((branch: any) => (
                          <tr key={branch.id}>
                              <td className="p-3 font-bold">{branch.name}</td>
                              <td className="p-3 font-bold">{branch.orders}</td>
                              <td className="p-3 font-black text-brand-green">{formatCurrency(branch.revenue)}</td>
                              <td className="p-3">
                                  <span className={`flex items-center gap-1 font-bold ${branch.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                      {branch.trend.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {branch.trend}
                                  </span>
                              </td>
                          </tr>
                      ))}
                      {(!stats?.topBranches || stats.topBranches.length === 0) && (
                          <tr>
                              <td colSpan={4} className="p-3 text-center text-gray-500">لا توجد بيانات للفروع بعد.</td>
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
        <div className="neo-card p-5 bg-white">
            <div className="flex items-center justify-between mb-4">
                <div className={`${color} p-2 rounded-lg border-2 border-neo-border`}>
                    <Icon size={20} />
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-full border-2 border-neo-border ${trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {trend}
                </span>
            </div>
            <p className="text-xs font-bold text-gray-500">{title}</p>
            <p className="text-2xl font-black mt-1">{value}</p>
        </div>
    );
}
