import { useCurrency } from "../utils/useCurrency";
import { useDashboard } from "../context/DashboardContext";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useState, useEffect } from "react";

export default function TopItems() {
  const { stats } = useDashboard();
  const { currencySymbol } = useCurrency();
  const items = stats?.topItems || [];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="neo-card p-5 h-64 animate-pulse bg-gray-50"></div>;

  return (
    <div className="neo-card p-5">
      <div className="mb-4">
        <h3 className="font-black text-lg">🏆 الأصناف الأكثر مبيعاً</h3>
        <p className="text-sm text-gray-500 font-semibold">هذا الشهر</p>
      </div>
      <div className="space-y-3">
        {items.map((item: any, index: number) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-lg border-2 border-neo-border hover:bg-yellow-50 transition-colors group"
          >
            {/* Rank */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm border-2 border-neo-border ${
                index === 0
                  ? "bg-brand-yellow"
                  : index === 1
                  ? "bg-gray-200"
                  : index === 2
                  ? "bg-brand-orange"
                  : "bg-white"
              }`}
            >
              {index + 1}
            </div>
            {/* Emoji */}
            <span className="text-2xl group-hover:animate-float">{item.emoji}</span>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{item.name}</p>
              <p className="text-xs text-gray-500 font-semibold">{item.orders} طلب</p>
            </div>
            {/* Revenue */}
            <div className="text-left">
              <p className="font-black text-sm">{item.revenue.toLocaleString()} {currencySymbol}</p>
              <div className="flex items-center gap-1">
                {item.trend.startsWith("+") ? (
                  <TrendingUp size={12} className="text-green-600" />
                ) : (
                  <TrendingDown size={12} className="text-red-500" />
                )}
                <span
                  className={`text-xs font-bold ${
                    item.trend.startsWith("+") ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {item.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
