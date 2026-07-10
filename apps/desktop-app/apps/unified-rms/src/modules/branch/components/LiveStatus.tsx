import { Clock, Flame, ChefHat, Truck, CheckCircle2 } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";

export default function LiveStatus() {
  const { stats } = useDashboard();

  const liveStats = [
    { label: "في الانتظار", count: stats?.pendingOrders || 0, icon: Clock, color: "bg-brand-yellow", emoji: "⏳" },
    { label: "جاري التحضير", count: stats?.preparingOrders || 0, icon: Flame, color: "bg-brand-orange", emoji: "🔥" },
    { label: "في المطبخ", count: stats?.inKitchenOrders || 0, icon: ChefHat, color: "bg-brand-pink", emoji: "👨‍🍳" },
    { label: "قيد التوصيل", count: stats?.deliveryOrders || 0, icon: Truck, color: "bg-brand-blue", emoji: "🚗" },
    { label: "مكتملة اليوم", count: stats?.completedTodayOrders || 0, icon: CheckCircle2, color: "bg-brand-green", emoji: "✅" },
  ];

  return (
    <div className="neo-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 bg-brand-red rounded-full animate-pulse-glow border-2 border-neo-border"></div>
        <h3 className="font-black text-lg">البث المباشر</h3>
        <span className="neo-badge bg-brand-red text-white text-xs">LIVE</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {liveStats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.color} p-4 rounded-xl border-2 border-neo-border text-center relative overflow-hidden`}
          >
            <div className="text-2xl mb-1">{stat.emoji}</div>
            <p className="text-2xl font-black">{stat.count}</p>
            <p className="text-xs font-bold mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
