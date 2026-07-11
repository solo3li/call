import { useCurrency } from "../utils/useCurrency";
import { useState, useEffect } from "react";
import { TrendingUp, ShoppingBag, DollarSign, Users, Star } from "lucide-react";
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
      icon: DollarSign,
      color: "bg-[#defbe6] text-[#198038]",
      emoji: "",
    },
    {
      title: "الطلبات",
      value: stats?.totalOrders?.toString() || "٠",
      unit: "طلب",
      change: "+٨.٣٪",
      trend: "up",
      icon: ShoppingBag,
      color: "bg-[#fcf4d6] text-[#b47a00]",
      emoji: "",
    },

    {
      title: "طلبات معلقة",
      value: stats?.pendingOrders?.toString() || "٠",
      unit: "طلب",
      change: "-١",
      trend: "down",
      icon: Star,
      color: "bg-carbon-layer",
      emoji: "",
    },
  ];

  if (!mounted) return <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 h-32 animate-pulse bg-carbon-layer border border-carbon-border"></div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {displayStats.map((stat, index) => (
        <div
          key={index}
          className="bg-carbon-layer border border-carbon-border p-5 relative"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-normal text-carbon-textSecondary">{stat.title}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-medium text-white">{stat.value}</span>
                <span className="text-sm font-normal text-carbon-textSecondary">{stat.unit}</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp size={16} className="text-[#24a148]" />
                <span className="text-sm font-semibold text-[#24a148]">{stat.change}</span>
                <span className="text-xs text-carbon-textSecondary font-normal">عن أمس</span>
              </div>
            </div>
            <div className="text-3xl opacity-80">{stat.emoji}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
