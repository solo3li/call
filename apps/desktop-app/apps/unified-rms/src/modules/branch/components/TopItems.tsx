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

 if (!mounted) return <div className="bg-carbon-layer border-carbon-border p-5 h-64 animate-pulse bg-carbon-bg"></div>;

 return (
 <div className="bg-carbon-layer border-carbon-border p-5">
 <div className="mb-4">
 <h3 className="font-semibold text-lg"> الأصناف الأكثر مبيعاً</h3>
 <p className="text-sm text-carbon-textSecondary font-semibold">هذا الشهر</p>
 </div>
 <div className="space-y-3">
 {items.map((item: any, index: number) => (
 <div
 key={item.id}
 className="flex items-center gap-3 p-3 rounded-sm border-carbon-border hover:bg-carbon-layerHover transition-colors group"
 >
 {/* Rank */}
 <div
 className={`w-8 h-8 rounded-sm flex items-center justify-center font-semibold text-sm border-carbon-border ${
 index === 0
 ? "bg-carbon-layer"
 : index === 1
 ? "bg-carbon-layerHover"
 : index === 2
 ? "bg-carbon-warning/10 text-carbon-warning"
 : "bg-carbon-layer"
 }`}
 >
 {index + 1}
 </div>
 {/* Emoji */}
 <span className="text-2xl group-hover:animate-float">{item.emoji}</span>
 {/* Info */}
 <div className="flex-1 min-w-0">
 <p className="font-medium text-sm truncate">{item.name}</p>
 <p className="text-xs text-carbon-textSecondary font-semibold">{item.orders} طلب</p>
 </div>
 {/* Revenue */}
 <div className="text-left">
 <p className="font-semibold text-sm">{item.revenue.toLocaleString()} {currencySymbol}</p>
 <div className="flex items-center gap-1">
 {item.trend.startsWith("+") ? (
 <TrendingUp size={12} className="text-carbon-success" />
 ) : (
 <TrendingDown size={12} className="text-red-500" />
 )}
 <span
 className={`text-xs font-medium ${
 item.trend.startsWith("+") ? "text-carbon-success" : "text-red-500"
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
