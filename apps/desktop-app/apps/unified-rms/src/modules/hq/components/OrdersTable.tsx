import { useCurrency } from "../utils/useCurrency";
import { Order } from "../types/api";

interface OrdersTableProps {
 orders: Order[];
}

function getStatusStyle(status: string) {
 switch (status) {
 case "Completed":
 case "مكتمل":
 return "bg-carbon-success/10 text-carbon-success"; // Green 10 / Green 60
 case "Delivering":
 case "جاري التوصيل":
 return "bg-carbon-blue/10 text-carbon-blue"; // Blue 10 / Blue 60
 case "Preparing":
 case "جاري التحضير":
 return "bg-[#fff1f1] text-[#da1e28]"; // Red 10 / Red 60
 case "Pending":
 case "قيد الانتظار":
 return "bg-carbon-warning/10 text-carbon-warning"; // Yellow 10 / Yellow 60
 default:
 return "bg-[#f4f4f4] text-[#525252]"; // Gray 10 / Gray 60
 }
}

function getTypeStyle(type: string) {
 switch (type) {
 case "DineIn":
 case "صالة":
 return "bg-carbon-blue/10 text-carbon-blue";
 case "Delivery":
 case "توصيل":
 return "bg-[#f4f4f4] text-[#161616]";
 case "Takeaway":
 case "سفري":
 return "bg-carbon-layerHover text-carbon-text";
 default:
 return "bg-[#f4f4f4] text-[#525252]";
 }
}

export default function OrdersTable({ orders = [] }: OrdersTableProps) {
 const { currencySymbol } = useCurrency();
 return (
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-carbon-bg border-b border-carbon-border">
 <th className="text-right p-3 font-semibold text-xs text-carbon-textSecondary">رقم الطلب</th>
 <th className="text-right p-3 font-semibold text-xs text-carbon-textSecondary">العميل</th>
 <th className="text-right p-3 font-semibold text-xs text-carbon-textSecondary hidden md:table-cell">الأصناف</th>
 <th className="text-right p-3 font-semibold text-xs text-carbon-textSecondary">المبلغ</th>
 <th className="text-right p-3 font-semibold text-xs text-carbon-textSecondary">الحالة</th>
 <th className="text-right p-3 font-semibold text-xs text-carbon-textSecondary hidden sm:table-cell">النوع</th>
 <th className="text-right p-3 font-semibold text-xs text-carbon-textSecondary hidden lg:table-cell">الوقت</th>
 <th className="text-right p-3 font-semibold text-xs text-carbon-textSecondary">إجراء</th>
 </tr>
 </thead>
 <tbody>
 {(orders || []).map((order) => (
 <tr
 key={order.id}
 className="border-b border-carbon-border hover:bg-carbon-layerHover transition-colors"
 >
 <td className="p-3 font-medium text-sm text-carbon-blue">{order.orderNumber}</td>
 <td className="p-3 font-medium text-sm text-carbon-text">{order.customerName || "عميل خارجي"}</td>
 <td className="p-3 text-sm text-carbon-textSecondary hidden md:table-cell max-w-[200px] truncate">
 {order.itemsSummary}
 </td>
 <td className="p-3 font-medium text-sm text-carbon-text">{order.totalAmount} {currencySymbol}</td>
 <td className="p-3">
 <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(order.status)}`}>
 {order.status === "Pending" ? "معلق" : order.status === "Preparing" ? "تحضير" : order.status === "Delivering" ? "جاري التوصيل" : order.status === "Completed" ? "مكتمل" : "ملغي"}
 </span>
 </td>
 <td className="p-3 hidden sm:table-cell">
 <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeStyle(order.orderType)}`}>
 {order.orderType}
 </span>
 {(order.orderType === "Delivery" || order.orderType === "توصيل") && order.driverName && (
 <div className="mt-2 text-xs font-medium text-carbon-textSecondary flex flex-col">
 <span>{order.driverName}</span>
 {order.driverPhone && <span className="text-[10px] dir-ltr text-right">{order.driverPhone}</span>}
 </div>
 )}
 </td>
 <td className="p-3 text-sm text-carbon-textSecondary hidden lg:table-cell">
 {new Date(order.createdAt).toLocaleTimeString('ar-SA')}
 </td>
 <td className="p-3">
 <button className="text-carbon-blue hover:text-carbon-blueHover text-sm font-medium">
 عرض
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 );
}
