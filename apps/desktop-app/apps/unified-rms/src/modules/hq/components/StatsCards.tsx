import { useCurrency } from "../utils/useCurrency";
import { useState, useEffect } from "react";
import { DashboardStats } from "../types/api";

interface StatsCardsProps {
  stats: DashboardStats | null;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const { currencySymbol } = useCurrency();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayStats = [
    {
      title: "إجمالي الإيرادات",
      value: mounted ? (stats?.totalRevenue?.toLocaleString() || "٠") : "٠",
      unit: currencySymbol,
      change: "+١٢.٥٪",
      trend: "up",
    },
    {
      title: "الطلبات",
      value: stats?.totalOrders?.toString() || "٠",
      unit: "طلب",
      change: "+٨.٣٪",
      trend: "up",
    },
    {
      title: "طلبات معلقة",
      value: stats?.pendingOrders?.toString() || "٠",
      unit: "طلب",
      change: "-١٪",
      trend: "down",
    },
  ];

  if (!mounted) return <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 h-32 animate-pulse bg-carbon-layer border border-carbon-border"></div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {displayStats.map((stat, index) => (
        <div
          key={index}
          className="bg-carbon-layer border border-carbon-border p-4 flex flex-col justify-between h-32"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-carbon-textSecondary">{stat.title}</h3>
          </div>
          <div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-normal text-carbon-text leading-none">{stat.value}</span>
              <span className="text-sm font-medium text-carbon-textSecondary pb-1">{stat.unit}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className={`flex items-center ${stat.trend === 'up' ? 'text-carbon-success' : 'text-carbon-error'}`}>
                {stat.trend === 'up' ? (
                  <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor">
                    <path d="M16 4L6 14l1.41 1.41L15 7.83V28h2V7.83l7.59 7.58L26 14 16 4z" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor">
                    <path d="M16 28L26 18l-1.41-1.41L17 24.17V4h-2v20.17l-7.59-7.58L6 18 16 28z" />
                  </svg>
                )}
                <span className="text-xs font-semibold ml-1">{stat.change}</span>
              </div>
              <span className="text-xs text-carbon-textSecondary">منذ اليوم السابق</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
