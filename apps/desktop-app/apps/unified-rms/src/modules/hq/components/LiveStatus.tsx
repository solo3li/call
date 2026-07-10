import { Clock, Flame, ChefHat, Truck, CheckCircle2 } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";

export default function LiveStatus() {
  const { stats } = useDashboard();

  const liveStats = [
    { label: "في الانتظار", count: stats?.pendingOrders || 0, icon: Clock, color: "bg-[#f1c21b] text-black", emoji: "⏳" },
    { label: "جاري التحضير", count: stats?.preparingOrders || 0, icon: Flame, color: "bg-[#ff832b] text-white", emoji: "🔥" },
    { label: "في المطبخ", count: stats?.inKitchenOrders || 0, icon: ChefHat, color: "bg-[#0f62fe] text-white", emoji: "👨‍🍳" },
    { label: "قيد التوصيل", count: stats?.deliveryOrders || 0, icon: Truck, color: "bg-[#8a3ffc] text-white", emoji: "🚗" },
    { label: "مكتملة اليوم", count: stats?.completedTodayOrders || 0, icon: CheckCircle2, color: "bg-[#24a148] text-white", emoji: "✅" },
  ];

  return (
    <div className="bg-carbon-layer border border-carbon-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 bg-[#da1e28] rounded-full animate-pulse-glow"></div>
        <h3 className="font-bold text-lg text-white">البث المباشر</h3>
        <span className="bg-[#da1e28] text-white text-[10px] font-bold px-2 py-0.5 ml-2">LIVE</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {liveStats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.color} p-4 rounded-none text-center relative overflow-hidden transition-transform hover:-translate-y-1`}
          >
            <div className="text-2xl mb-1 opacity-90">{stat.emoji}</div>
            <p className="text-3xl font-bold">{stat.count}</p>
            <p className="text-xs font-semibold mt-1 opacity-90">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
