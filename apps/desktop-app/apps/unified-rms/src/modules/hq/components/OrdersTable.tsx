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
      return "bg-brand-green text-neo-text";
    case "Delivering":
    case "جاري التوصيل":
      return "bg-brand-cyan text-neo-text";
    case "Preparing":
    case "جاري التحضير":
      return "bg-brand-yellow text-neo-text";
    case "Pending":
    case "قيد الانتظار":
      return "bg-brand-orange text-neo-text";
    default:
      return "bg-brand-red text-white";
  }
}

function getTypeStyle(type: string) {
  switch (type) {
    case "DineIn":
    case "صالة":
      return "bg-brand-blue text-neo-text";
    case "Delivery":
    case "توصيل":
      return "bg-brand-pink text-neo-text";
    case "Takeaway":
    case "سفري":
      return "bg-brand-purple text-white";
    default:
      return "bg-gray-200 text-gray-700";
  }
}

export default function OrdersTable({ orders = [] }: OrdersTableProps) {
  const { currencySymbol } = useCurrency();
  return (
    <div className="neo-card overflow-hidden">
      <div className="p-5 border-b-2 border-neo-border flex items-center justify-between">
        <div>
          <h3 className="font-black text-lg">🧾 آخر الطلبات</h3>
          <p className="text-sm text-gray-500 font-semibold">آخر ٦ طلبات واردة</p>
        </div>
        <button className="neo-btn bg-brand-yellow px-4 py-2 text-sm">عرض الكل</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-neo-border">
              <th className="text-right p-3 font-black text-sm">رقم الطلب</th>
              <th className="text-right p-3 font-black text-sm">العميل</th>
              <th className="text-right p-3 font-black text-sm hidden md:table-cell">الأصناف</th>
              <th className="text-right p-3 font-black text-sm">المبلغ</th>
              <th className="text-right p-3 font-black text-sm">الحالة</th>
              <th className="text-right p-3 font-black text-sm hidden sm:table-cell">النوع</th>
              <th className="text-right p-3 font-black text-sm hidden lg:table-cell">الوقت</th>
              <th className="text-right p-3 font-black text-sm">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {(orders || []).map((order) => (
              <tr
                key={order.id}
                className="border-b-2 border-gray-100 hover:bg-yellow-50 transition-colors"
              >
                <td className="p-3 font-black text-brand-blue">{order.orderNumber}</td>
                <td className="p-3 font-bold text-sm">{order.customerName || "عميل خارجي"}</td>
                <td className="p-3 text-sm text-gray-600 font-semibold hidden md:table-cell max-w-[200px] truncate">
                  {order.itemsSummary}
                </td>
                <td className="p-3 font-black text-sm">{order.totalAmount} {currencySymbol}</td>
                <td className="p-3">
                  <span className={`neo-badge ${getStatusStyle(order.status)}`}>
                    {order.status === "Pending" ? "معلق" : order.status === "Preparing" ? "تحضير" : order.status === "Delivering" ? "جاري التوصيل" : order.status === "Completed" ? "مكتمل" : "ملغي"}
                  </span>
                </td>
                <td className="p-3 hidden sm:table-cell">
                  <span className={`neo-badge ${getTypeStyle(order.orderType)}`}>
                    {order.orderType}
                  </span>
                  {(order.orderType === "Delivery" || order.orderType === "توصيل") && order.driverName && (
                    <div className="mt-2 bg-[#F0F8FF] border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] rounded-none p-1.5 flex flex-col gap-0.5 w-max">
                      <div className="text-[10px] font-black text-brand-blue flex items-center gap-1">
                        <span className="text-[10px]">🚗</span> {order.driverName}
                      </div>
                      {order.driverPhone && <div className="text-[9px] font-bold text-brand-blue/80 dir-ltr text-right">{order.driverPhone}</div>}
                    </div>
                  )}
                </td>
                <td className="p-3 text-sm text-gray-500 font-semibold hidden lg:table-cell">
                  {new Date(order.createdAt).toLocaleTimeString('ar-SA')}
                </td>
                <td className="p-3">
                  <button className="neo-btn bg-white p-1.5">
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
