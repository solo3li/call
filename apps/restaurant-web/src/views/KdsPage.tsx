'use client';

import { useState, useEffect, useMemo } from "react";
import { ChefHat, CheckCircle2, Flame, Info, AlertTriangle, ArrowRight, Search, Filter, Truck, Phone, User } from "lucide-react";
import { ordersApi } from "../utils/api";
import { Order } from "../types/api";
import { hasPermission, getUserBranchId, isManagerOrOwner } from "../utils/permissions";

export default function KdsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [orderTypeFilter, setOrderTypeFilter] = useState("الكل");

  // Determine branch filter on mount (client-only)
  const userBranchId = typeof window !== 'undefined' ? getUserBranchId() : null;
  const isMgr = typeof window !== 'undefined' ? isManagerOrOwner() : true;

  const fetchOrders = async () => {
    try {
      const branchParam = !isMgr && userBranchId ? userBranchId : undefined;
      const res = await ordersApi.getAll(branchParam);
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const canView = hasPermission('Orders.View') || hasPermission('Orders.Status');
    setHasAccess(canView);
    if (canView) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 10000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!hasPermission('Orders.Status')) {
      alert("ليس لديك صلاحية تغيير حالة الطلب.");
      return;
    }
    try {
      await ordersApi.updateStatus(id, newStatus);
      fetchOrders();
    } catch (err) {
      alert("فشل تحديث الحالة. يرجى المحاولة مرة أخرى.");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search filter
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.itemsSummary.toLowerCase().includes(searchQuery.toLowerCase());

      // Type filter
      const matchesType = orderTypeFilter === "الكل" || order.orderType === orderTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [orders, searchQuery, orderTypeFilter]);

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
        <div className="bg-brand-yellow p-12 flex flex-col items-center gap-6 text-center border-4 border-neo-border shadow-[12px_12px_0px_#1A1A1A] max-w-2xl w-full">
          <AlertTriangle size={64} strokeWidth={2.5} className="text-neo-text" />
          <h2 className="text-5xl font-black text-neo-text uppercase tracking-tight">توقف!</h2>
          <p className="font-bold text-2xl text-neo-text leading-snug">
            هذه المنطقة مخصصة لطاقم المطبخ فقط.
          </p>
        </div>
      </div>
    );
  }

  const pendingOrders = filteredOrders.filter((o) => o.status === "Pending");
  const preparingOrders = filteredOrders.filter((o) => o.status === "Preparing");
  const completedOrders = filteredOrders.filter((o) => o.status === "Completed");

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center font-black text-4xl animate-pulse flex items-center gap-4">
          <ChefHat size={48} />
          <span>جاري تسخين الشاشات...</span>
        </div>
      </div>
    );
  }

  // Unique order types for filter dropdown
  const orderTypes = ["الكل", ...Array.from(new Set(orders.map(o => o.orderType)))];

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-neo-bg">
      {/* Impeccable Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between p-4 border-b-4 border-neo-border bg-white shrink-0 gap-4">
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 bg-brand-yellow border-4 border-neo-border shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center">
            <ChefHat size={24} strokeWidth={2.5} className="text-neo-text" />
          </div>
          <div>
            <h1 className="text-3xl font-black leading-none text-neo-text">شاشة المطبخ</h1>
          </div>
        </div>

        {/* Advanced Filter Bar - Compacted */}
        <div className="flex flex-col sm:flex-row gap-3 items-center flex-grow max-w-3xl">
          <div className="relative flex-grow w-full sm:w-auto">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="ابحث برقم الطلب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-neo-border py-2 pr-10 pl-4 text-lg font-bold focus:outline-none focus:border-brand-blue shadow-[2px_2px_0px_#1A1A1A]"
            />
          </div>
          <div className="relative w-full sm:w-40 shrink-0">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Filter className="w-5 h-5 text-neo-text" />
            </div>
            <select
              value={orderTypeFilter}
              onChange={(e) => setOrderTypeFilter(e.target.value)}
              className="w-full bg-brand-orange text-white border-4 border-neo-border py-2 pr-10 pl-4 text-lg font-black cursor-pointer focus:outline-none shadow-[2px_2px_0px_#1A1A1A] appearance-none"
            >
              {orderTypes.map(type => (
                <option key={type} value={type} className="bg-white text-neo-text font-bold">{type}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Board - High Density 3 Columns */}
      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">

        {/* Column 1: PENDING (High Density Grid) */}
        <section className="flex-1 flex flex-col border-b-4 lg:border-b-0 lg:border-l-4 border-neo-border bg-[#FFF8E7]">
          <div className="p-3 border-b-4 border-neo-border bg-brand-orange text-neo-text flex items-center justify-between shrink-0">
            <h2 className="text-xl font-black">طلبات جديدة</h2>
            <span className="text-xl font-black bg-white px-2 border-4 border-neo-border shadow-[2px_2px_0px_#1A1A1A]">{pendingOrders.length}</span>
          </div>

          <div className="flex-grow overflow-y-auto p-3">
            {pendingOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 opacity-50 min-h-[150px]">
                <Info size={32} />
                <p className="text-xl font-black">لا توجد طلبات</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2">
                {pendingOrders.map((order) => (
                  <article key={order.id} className="bg-white border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] p-2 flex flex-col justify-between hover:translate-y-[-1px] transition-transform">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black bg-brand-yellow px-1 border border-neo-border uppercase self-start leading-tight">{order.orderType}</span>
                        <h3 className="text-xl font-black text-neo-text leading-none mt-1">{order.orderNumber}</h3>
                      </div>
                      <span className="text-xs font-black text-neo-text bg-gray-100 px-1 border border-neo-border leading-tight">
                        {new Date(order.createdAt).toLocaleTimeString("ar-SA", { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="py-1 border-t-2 border-neo-border border-dashed flex-grow">
                      <p className="font-bold text-xs leading-tight text-neo-text line-clamp-3 whitespace-pre-line">
                        {order.itemsSummary}
                      </p>
                    </div>

                    <button
                      onClick={() => handleStatusChange(order.id.toString(), "Preparing")}
                      className="w-full bg-neo-text text-white py-1 px-2 border-2 border-neo-border flex items-center justify-between hover:bg-brand-orange hover:text-neo-text transition-colors shadow-[2px_2px_0px_#1A1A1A] active:translate-y-px active:translate-x-px active:shadow-none cursor-pointer mt-1"
                    >
                      <span className="font-black text-xs">بدء التحضير</span>
                      <ArrowRight size={14} strokeWidth={3} />
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Column 2: PREPARING (High Density Grid) */}
        <section className="flex-1 flex flex-col border-b-4 lg:border-b-0 lg:border-l-4 border-neo-border bg-white">
          <div className="p-3 border-b-4 border-neo-border bg-brand-purple text-white flex items-center justify-between shrink-0">
            <h2 className="text-xl font-black">جاري التحضير</h2>
            <span className="text-xl font-black bg-neo-text text-brand-purple px-2 border-4 border-neo-border shadow-[2px_2px_0px_#FFFFFF]">{preparingOrders.length}</span>
          </div>

          <div className="flex-grow overflow-y-auto p-3">
            {preparingOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2 opacity-50 min-h-[150px]">
                <Flame size={32} />
                <p className="text-xl font-black">المطبخ هادئ</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2">
                {preparingOrders.map((order) => (
                  <article key={order.id} className="bg-brand-purple text-white border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] p-2 flex flex-col justify-between hover:translate-y-[-1px] transition-transform">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-1">
                        <div className="bg-white text-neo-text px-1.5 py-0.5 border-2 border-neo-border font-black text-xl leading-none">
                          {order.orderNumber}
                        </div>
                        {(order.orderType === "توصيل" || order.orderType === "Delivery") && (
                          <span className="bg-brand-blue text-white text-[8px] font-black px-1 border border-neo-border">🚗</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 bg-black px-1.5 py-0.5 border border-neo-border">
                        <Flame size={10} className="text-brand-orange animate-pulse" />
                        <span className="text-[9px] font-black font-mono">
                          {new Date(order.createdAt).toLocaleTimeString("ar-SA", { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white text-neo-text p-1.5 border-2 border-neo-border flex-grow mt-1">
                      <p className="font-bold text-xs leading-tight line-clamp-3 whitespace-pre-line">
                        {order.itemsSummary}
                      </p>
                      {/* Show driver info if delivery order and driver assigned */}
                      {(order.orderType === "توصيل" || order.orderType === "Delivery") && order.driverName && (
                        <div className="mt-1.5 pt-1.5 border-t border-gray-200 flex flex-col">
                          <span className="text-[9px] font-black text-brand-blue truncate">🚗 {order.driverName}</span>
                          {order.driverPhone && <span className="text-[8px] font-bold text-gray-500 dir-ltr">{order.driverPhone}</span>}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleStatusChange(order.id.toString(), "Completed")}
                      className="w-full bg-brand-green text-neo-text py-1 px-2 border-2 border-neo-border flex items-center justify-center gap-1 hover:bg-white transition-colors shadow-[2px_2px_0px_#1A1A1A] active:translate-y-px active:translate-x-px active:shadow-none cursor-pointer mt-1"
                    >
                      <CheckCircle2 size={14} strokeWidth={3} />
                      <span className="font-black text-xs">جاهز</span>
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Column 3: COMPLETED (Narrow Sidebar) */}
        <section className="w-full lg:w-32 xl:w-40 flex flex-col bg-brand-green/10 shrink-0">
          <div className="p-3 border-b-4 border-neo-border bg-brand-green text-neo-text flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} strokeWidth={3} />
          </div>

          <div className="flex-grow overflow-y-auto p-2 space-y-2">
            {completedOrders.length === 0 ? (
              <div className="h-full flex items-center justify-center opacity-50">
                <span className="text-xs font-bold text-gray-500">لا يوجد</span>
              </div>
            ) : (
              completedOrders.map((order) => (
                <div key={order.id} className="bg-white border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] p-2 flex flex-col items-center opacity-80 hover:opacity-100 transition-opacity">
                  <span className="text-xs font-bold text-gray-400 mb-1">{new Date(order.createdAt).toLocaleTimeString("ar-SA", { hour: '2-digit', minute: '2-digit' })}</span>
                  <h3 className="text-xl font-black text-gray-400 line-through decoration-brand-green decoration-2 leading-none">{order.orderNumber}</h3>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
