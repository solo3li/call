import { useCurrency } from "../utils/useCurrency";
import { Eye } from "lucide-react";
import { Order } from "../types/api";

interface OrdersTableProps {
 orders: Order[];
}

function getStatusStyle(status: string) {
 switch (status) {
 case "Completed":
 case "مكتمل":
 return "bg-carbon-success/10 text-carbon-success text-carbon-text";
 case "Delivering":
 case "جاري التوصيل":
 return "bg-[#e5f6ff] text-[#00a68f] text-carbon-text";
 case "Preparing":
 case "جاري التحضير":
 return "bg-carbon-layer text-carbon-text";
 case "Pending":
 case "قيد الانتظار":
 return "bg-carbon-warning/10 text-carbon-warning text-carbon-text";
 default:
 return "bg-carbon-error text-white";
 }
}

function getTypeStyle(type: string) {
 switch (type) {
 case "DineIn":
 case "صالة":
 return "bg-carbon-blue/10 text-carbon-blue text-carbon-text";
 case "Delivery":
 case "توصيل":
 return "bg-carbon-purple/10 text-carbon-purple text-carbon-text";
 case "Takeaway":
 case "سفري":
 return "bg-carbon-layerHover text-carbon-text text-white";
 default:
 return "bg-carbon-layerHover text-carbon-textSecondary";
 }
}

export default function OrdersTable({ orders = [] }: OrdersTableProps) {
 const { currencySymbol } = useCurrency();
 return (
 <div className="bg-carbon-layer border-carbon-border overflow-hidden">
 <div className="p-5 border-b-2 border-carbon-border flex items-center justify-between">
 <div>
 <h3 className="font-semibold text-lg"> آخر الطلبات</h3>
 <p className="text-sm text-carbon-textSecondary font-semibold">آخر ٦ طلبات واردة</p>
 </div>
 <button className="px-4 py-2 text-sm">عرض الكل</button>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="bg-carbon-bg border-b-2 border-carbon-border">
 <th className="text-right p-3 font-semibold text-sm">رقم الطلب</th>
 <th className="text-right p-3 font-semibold text-sm">العميل</th>
 <th className="text-right p-3 font-semibold text-sm hidden md:table-cell">الأصناف</th>
 <th className="text-right p-3 font-semibold text-sm">المبلغ</th>
 <th className="text-right p-3 font-semibold text-sm">الحالة</th>
 <th className="text-right p-3 font-semibold text-sm hidden sm:table-cell">النوع</th>
 <th className="text-right p-3 font-semibold text-sm hidden lg:table-cell">الوقت</th>
 <th className="text-right p-3 font-semibold text-sm">إجراء</th>
 </tr>
 </thead>
 <tbody>
 {(orders || []).map((order) => (
 <tr
 key={order.id}
 className="border-b-2 border-gray-100 hover:bg-carbon-layerHover transition-colors"
 >
 <td className="p-3 font-semibold text-carbon-blue">{order.orderNumber}</td>
 <td className="p-3 font-medium text-sm">{order.customerName || "عميل خارجي"}</td>
 <td className="p-3 text-sm text-carbon-textSecondary font-semibold hidden md:table-cell max-w-[200px] truncate">
 {order.itemsSummary}
 </td>
 <td className="p-3 font-semibold text-sm">{order.totalAmount} {currencySymbol}</td>
 <td className="p-3">
 <span className={`px-2 py-1 text-xs font-medium ${getStatusStyle(order.status)}`}>
 {order.status === "Pending" ? "معلق" : order.status === "Preparing" ? "تحضير" : order.status === "Delivering" ? "جاري التوصيل" : order.status === "Completed" ? "مكتمل" : "ملغي"}
 </span>
 </td>
 <td className="p-3 hidden sm:table-cell">
 <span className={`px-2 py-1 text-xs font-medium ${getTypeStyle(order.orderType)}`}>
 {order.orderType}
 </span>
 {(order.orderType === "Delivery" || order.orderType === "توصيل") && order.driverName && (
 <div className="mt-2 bg-carbon-bg border-carbon-border rounded-none p-1.5 flex flex-col gap-0.5 w-max">
 <div className="text-[10px] font-semibold text-carbon-blue flex items-center gap-1">
 <span className="text-[10px]"></span> {order.driverName}
 </div>
 {order.driverPhone && <div className="text-[9px] font-medium text-carbon-blue/80 dir-ltr text-right">{order.driverPhone}</div>}
 </div>
 )}
 </td>
 <td className="p-3 text-sm text-carbon-textSecondary font-semibold hidden lg:table-cell">
 {new Date(order.createdAt).toLocaleTimeString('ar-SA')}
 </td>
 <td className="p-3">
 <button className="p-1.5">
 <Eye size={16} />
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 );
}
