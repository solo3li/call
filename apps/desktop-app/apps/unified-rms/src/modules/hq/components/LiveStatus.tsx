import { useDashboard } from "../context/DashboardContext";

export default function LiveStatus() {
 const { stats } = useDashboard();

 const liveStats = [
 { label: "في الانتظار", count: stats?.pendingOrders || 0, status: "warning" },
 { label: "جاري التحضير", count: stats?.preparingOrders || 0, status: "info" },
 { label: "في المطبخ", count: stats?.inKitchenOrders || 0, status: "primary" },
 { label: "قيد التوصيل", count: stats?.deliveryOrders || 0, status: "purple" },
 { label: "مكتملة اليوم", count: stats?.completedTodayOrders || 0, status: "success" },
 ];

 const getStatusColor = (status: string) => {
 switch (status) {
 case "warning": return "bg-[#f1c21b] text-black";
 case "info": return "bg-[#08bdba] text-white";
 case "primary": return "bg-carbon-blue text-white";
 case "purple": return "bg-[#8a3ffc] text-white";
 case "success": return "bg-[#24a148] text-white";
 default: return "bg-[#e0e0e0] text-black";
 }
 };

 return (
 <div className="bg-carbon-layer border-carbon-border">
 <div className="flex items-center gap-3 p-4 border-b border-carbon-border">
 <div className="w-2 h-2 bg-carbon-error rounded-full animate-pulse"></div>
 <h3 className="font-semibold text-base text-carbon-text">العمليات المباشرة</h3>
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-x-reverse border-carbon-border">
 {liveStats.map((stat, index) => (
 <div
 key={index}
 className="p-4 flex flex-col justify-between h-24"
 >
 <div className="flex items-center justify-between mb-2">
 <span className="text-xs font-medium text-carbon-textSecondary">{stat.label}</span>
 <div className={`w-2 h-2 rounded-full ${getStatusColor(stat.status).split(' ')[0]}`}></div>
 </div>
 <p className="text-2xl font-normal text-carbon-text leading-none">{stat.count}</p>
 </div>
 ))}
 </div>
 </div>
 );
}
