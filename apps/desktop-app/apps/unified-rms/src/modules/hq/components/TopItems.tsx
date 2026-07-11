import { useCurrency } from "../utils/useCurrency";
import { useDashboard } from "../context/DashboardContext";
import { useState, useEffect } from "react";

export default function TopItems() {
  const { stats } = useDashboard();
  const { currencySymbol } = useCurrency();
  const items = stats?.topItems || [];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="bg-carbon-layer border border-carbon-border p-5 h-64 animate-pulse"></div>;

  return (
    <div className="bg-carbon-layer border border-carbon-border p-5">
      <div className="mb-4 border-b border-carbon-border pb-3 flex justify-between items-center">
        <h3 className="font-semibold text-base text-carbon-text">الأصناف الأكثر مبيعاً</h3>
      </div>
      <div className="space-y-0 divide-y divide-carbon-border">
        {items.map((item: any, index: number) => (
          <div
            key={item.id}
            className="flex items-center gap-4 py-3 group"
          >
            {/* Rank */}
            <div className="w-6 text-center font-semibold text-sm text-carbon-textSecondary">
              {index + 1}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-carbon-text truncate">{item.name}</p>
              <p className="text-xs text-carbon-textSecondary">{item.orders} طلب</p>
            </div>
            {/* Revenue */}
            <div className="text-left">
              <p className="font-medium text-sm text-carbon-text">{item.revenue.toLocaleString()} {currencySymbol}</p>
              <div className="flex items-center justify-end gap-1">
                <span
                  className={`text-xs font-semibold ${
                    item.trend.startsWith("+") ? "text-carbon-success" : "text-carbon-error"
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
