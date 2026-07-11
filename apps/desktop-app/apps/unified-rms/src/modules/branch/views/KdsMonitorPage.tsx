'use client';

import { useState, useEffect, useMemo } from "react";
import { ChefHat, CheckCircle2, Flame, AlertTriangle, Search, Filter, Truck, Store, Clock, Activity, CheckSquare, Square } from "lucide-react";
import { ordersApi, kitchenStationsApi } from "../utils/api";
import { Order, KitchenStation } from "../types/api";
import { hasPermission, getUserBranchId, isManagerOrOwner } from "../utils/permissions";
import { motion, AnimatePresence } from "framer-motion";

export default function KdsMonitorPage() {
 const [orders, setOrders] = useState<any[]>([]);
 const [stations, setStations] = useState<KitchenStation[]>([]);
 const [loading, setLoading] = useState(true);
 const [hasAccess, setHasAccess] = useState(true);

 // Filter states
 const [searchQuery, setSearchQuery] = useState("");
 const [orderTypeFilter, setOrderTypeFilter] = useState("الكل");
 const [stationFilter, setStationFilter] = useState("الكل");

 const userBranchId = typeof window !== 'undefined' ? getUserBranchId() : null;
 const isMgr = typeof window !== 'undefined' ? isManagerOrOwner() : true;

 const fetchOrders = async () => {
 try {
 const branchParam = !isMgr && userBranchId ? userBranchId : undefined;
 const res = await ordersApi.getActiveKds(branchParam);
 setOrders(res.data || []);
 } catch (err) {
 console.error(err);
 } finally {
 setLoading(false);
 }
 };

 const fetchStations = async () => {
 try {
 const res = await kitchenStationsApi.getAll();
 setStations(res.data || []);
 } catch (err) {
 console.error(err);
 }
 };

 useEffect(() => {
 const canView = hasPermission('Orders.View') || hasPermission('Orders.Status');
 setHasAccess(canView);
 if (canView) {
 fetchStations();
 fetchOrders();
 const interval = setInterval(fetchOrders, 10000);
 return () => clearInterval(interval);
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 const handleOrderStatusChange = async (id: string, newStatus: string) => {
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
 const matchesSearch =
 order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
 order.itemsSummary.toLowerCase().includes(searchQuery.toLowerCase());
 const matchesType = orderTypeFilter === "الكل" || order.orderType === orderTypeFilter;
 const matchesStation = stationFilter === "الكل" || 
 order.items?.some((i: any) => (i.kitchenStationName || "عام") === stationFilter);
 return matchesSearch && matchesType && matchesStation;
 });
 }, [orders, searchQuery, orderTypeFilter, stationFilter]);

 // Derived Metrics & Workflow states
 const { newOrders, preparingOrders, readyOrders, delayedCount, avgPrepTime, stationLoads } = useMemo(() => {
 let n: any[] = [];
 let p: any[] = [];
 let r: any[] = [];
 let delayed = 0;
 let totalPrepTime = 0;
 let prepOrdersCount = 0;
 const loads: Record<string, number> = {};

 filteredOrders.forEach(order => {
 const items = order.items || [];
 const totalItems = items.length;
 if (totalItems === 0) return;

 const readyCount = items.filter((i: any) => i.status === "Ready").length;
 const pendingCount = items.filter((i: any) => i.status === "Pending").length;
 
 const minutesElapsed = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000);
 if (minutesElapsed > 15) delayed++;

 if (readyCount > 0 && readyCount < totalItems) {
 prepOrdersCount++;
 totalPrepTime += minutesElapsed;
 }

 // Station load (count active items)
 items.forEach((i: any) => {
 if (i.status !== "Ready") {
 const stName = i.kitchenStationName || "عام";
 loads[stName] = (loads[stName] || 0) + i.quantity;
 }
 });

 if (readyCount === totalItems) {
 r.push(order);
 } else if (pendingCount === totalItems) {
 n.push(order);
 } else {
 p.push(order);
 }
 });

 // Sort all arrays by oldest first (longest wait time at the top)
 const sortByOldest = (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
 n.sort(sortByOldest);
 p.sort(sortByOldest);
 r.sort(sortByOldest);

 return {
 newOrders: n,
 preparingOrders: p,
 readyOrders: r,
 delayedCount: delayed,
 avgPrepTime: prepOrdersCount > 0 ? Math.round(totalPrepTime / prepOrdersCount) : 0,
 stationLoads: loads
 };
 }, [filteredOrders]);

 const totalActive = newOrders.length + preparingOrders.length;
 let globalStatus = { text: "طبيعي", color: "bg-carbon-success/10 text-carbon-success text-white", icon: <CheckCircle2 size={16} /> };
 if (delayedCount > 5 || totalActive > 30) {
 globalStatus = { text: "ضغط شديد", color: "bg-carbon-error text-white animate-pulse", icon: <AlertTriangle size={16} /> };
 } else if (delayedCount > 0 || totalActive > 15) {
 globalStatus = { text: "مزدحم", color: "bg-carbon-layer text-carbon-text", icon: <Activity size={16} /> };
 }

 if (!hasAccess) {
 return (
 <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
 <div className="bg-carbon-layer p-12 flex flex-col items-center gap-6 text-center border-carbon-border max-w-2xl w-full">
 <AlertTriangle size={64} strokeWidth={2.5} className="text-carbon-text" />
 <h2 className="text-5xl font-semibold text-carbon-text uppercase tracking-tight">توقف!</h2>
 <p className="font-medium text-2xl text-carbon-text leading-snug">هذه المنطقة مخصصة لطاقم المطبخ فقط.</p>
 </div>
 </div>
 );
 }

 if (loading && orders.length === 0) {
 return (
 <div className="flex items-center justify-center min-h-[70vh]">
 <div className="text-center font-semibold text-4xl animate-pulse flex items-center gap-4">
 <ChefHat size={48} />
 <span>جاري تسخين الشاشات...</span>
 </div>
 </div>
 );
 }

 // Always show these order types even if there are no active orders of this type
 const defaultOrderTypes = ["توصيل", "استلام", "محلي"];
 const dynamicOrderTypes = Array.from(new Set(orders.map(o => o.orderType))).filter(t => !defaultOrderTypes.includes(t));
 const orderTypes = ["الكل", ...defaultOrderTypes, ...dynamicOrderTypes];
 const activeStations = ["الكل", "عام", ...Array.from(new Set(stations.map(s => s.name)))];

 const OrderCard = ({ order, isReadyColumn = false }: { order: any, isReadyColumn?: boolean }) => {
 const items = order.items || [];
 const totalItems = items.length;
 const readyItems = items.filter((i: any) => i.status === "Ready").length;
 const progress = totalItems > 0 ? Math.round((readyItems / totalItems) * 100) : 0;
 
 const minutesElapsed = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000);
 const isCritical = minutesElapsed > 15 && !isReadyColumn;
 const isWarning = minutesElapsed > 10 && !isCritical && !isReadyColumn;

 // Compact Colors
 let cardClasses = "bg-carbon-layer border-carbon-border text-carbon-text";
 let progressBg = "bg-carbon-success/10 text-carbon-success";
 
 if (isCritical) {
 cardClasses = "bg-carbon-error border-carbon-border text-white ";
 progressBg = "bg-carbon-layer"; // contrast on red
 } else if (isWarning) {
 cardClasses = "bg-carbon-warning/10 text-carbon-warning/20 border-carbon-blue text-carbon-text";
 }

 return (
 <motion.article 
 layout 
 // Snappy animations for high volume
 transition={{ type: "spring", stiffness: 500, damping: 30 }}
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.9 }}
 className={`border flex flex-col justify-between overflow-hidden ${cardClasses}`}
 >
 <div className="p-2 border-b-2 border-inherit flex justify-between items-center">
 <div className="flex items-center gap-1.5">
 <span className={`text-[9px] font-semibold px-1 py-0.5 border-inherit uppercase ${isCritical ? 'bg-black text-white' : 'bg-carbon-layer text-carbon-text'}`}>{order.orderType}</span>
 <h3 className="text-xl font-semibold leading-none shrink-0">#{order.orderNumber}</h3>
 {order.orderType === "Delivery" && <Truck size={12} className={isCritical ? 'text-white' : 'text-carbon-blue'}/>}
 </div>
 <div className={`flex items-center gap-1 px-1.5 py-0.5 border-inherit ${isCritical ? 'bg-black text-white animate-pulse' : 'bg-carbon-layer text-carbon-text'}`}>
 <Clock size={12} />
 <span className="text-sm font-semibold">{minutesElapsed}د</span>
 </div>
 </div>

 {/* Dense Progress Bar */}
 <div className="w-full bg-black/10 h-1.5 relative border-b-2 border-inherit">
 <div className={`absolute top-0 right-0 h-full transition-all duration-300 ease-out ${progressBg}`} style={{ width: `${progress}%` }} />
 </div>

 <div className="p-2 flex-grow flex flex-col gap-1">
 {/* Compact items list */}
 {!isReadyColumn && items.map((item: any) => {
 if (item.status === "Ready") return null; // Hide ready items in dense mode to save space
 return (
 <div key={item.id} className="flex justify-between items-center text-[11px] font-medium leading-tight">
 <div className="flex items-center gap-1 overflow-hidden">
 <span className="font-semibold bg-black/10 px-1 rounded-sm">{item.quantity}</span>
 <span className="truncate">{item.menuItemName}</span>
 </div>
 <div className="shrink-0 flex items-center gap-1 opacity-80">
 <span className="text-[9px]">{item.kitchenStationName || "عام"}</span>
 {item.status === 'Pending' ? <Square size={10} /> : <Flame size={10} className="animate-pulse" />}
 </div>
 </div>
 );
 })}
 {!isReadyColumn && readyItems > 0 && (
 <div className="text-[10px] text-center font-medium opacity-60 mt-1">
 + {readyItems} أصناف جاهزة
 </div>
 )}
 
 {isReadyColumn && (
 <div className="flex flex-col items-center justify-center py-2 gap-1">
 <CheckCircle2 size={24} className={isCritical ? 'text-white' : 'text-carbon-success'} />
 <span className="text-[10px] font-semibold">{totalItems} أصناف جاهزة</span>
 </div>
 )}
 </div>

 {/* Compact Action */}
 {isReadyColumn && (
 <button
 onClick={() => handleOrderStatusChange(order.id.toString(), "Completed")}
 className="w-full bg-black text-white py-2 px-1 text-xs font-semibold uppercase hover:bg-carbon-layer hover:text-black transition-colors"
 >
 تسليم الطلب
 </button>
 )}
 </motion.article>
 );
 };

 return (
 <div className="flex flex-col h-[calc(100vh-100px)] bg-carbon-bg">
 {/* High Volume Dense Header */}
 <header className="flex flex-col lg:flex-row items-center justify-between p-2 border-b-2 border-carbon-border bg-carbon-layer shrink-0 gap-2 relative z-10 ">
 <div className="flex items-center justify-between w-full lg:w-auto gap-2 shrink-0">
 <div className="flex items-center gap-2">
 <div className={`px-3 py-1.5 border-carbon-border flex items-center gap-2 font-semibold text-sm uppercase ${globalStatus.color}`}>
 {globalStatus.icon} {globalStatus.text}
 </div>
 <h1 className="text-lg font-semibold leading-none text-carbon-text hidden xl:block">KDS | Command Center</h1>
 </div>
 </div>

 {/* Order Type Tabs */}
 <div className="flex gap-1 w-full lg:w-auto overflow-x-auto custom-scrollbar pb-1 lg:pb-0 flex-1 lg:justify-center">
 {orderTypes.map(type => (
 <button
 key={type}
 onClick={() => setOrderTypeFilter(type)}
 className={`px-4 py-1.5 text-xs font-semibold border-carbon-border whitespace-nowrap transition-all active:scale-95 ${orderTypeFilter === type ? 'bg-carbon-layer text-carbon-text -translate-y-0.5' : 'bg-carbon-layer text-carbon-textSecondary hover:bg-carbon-layerHover hover:text-carbon-text'}`}
 >
 {type}
 </button>
 ))}
 </div>

 {/* Compact Filter Bar */}
 <div className="flex gap-2 items-center w-full lg:w-auto justify-end">
 <div className="relative flex-1 lg:w-40 shrink-0">
 <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2" />
 <input
 type="text"
 placeholder="بحث برقم الطلب..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-carbon-layer border-carbon-border py-1 pr-7 pl-2 text-xs font-medium focus:outline-none "
 />
 </div>
 <select
 value={stationFilter}
 onChange={(e) => setStationFilter(e.target.value)}
 className="w-28 bg-carbon-blue/10 text-carbon-blue text-white border-carbon-border py-1 px-1 text-xs font-semibold cursor-pointer "
 >
 <option value="الكل">كل المحطات</option>
 {activeStations.filter(s => s !== "الكل").map(station => <option key={station} value={station}>{station}</option>)}
 </select>
 </div>
 </header>

 {/* Dense Bottleneck Tracker */}
 <div className="bg-carbon-layer border-b-2 border-carbon-border p-1.5 flex flex-wrap gap-2 shrink-0 items-center justify-center text-xs">
 <span className="font-semibold text-gray-400 uppercase text-[10px]">الضغط:</span>
 {Object.entries(stationLoads).length === 0 ? (
 <span className="font-medium text-gray-400">لا يوجد</span>
 ) : (
 Object.entries(stationLoads).sort((a,b) => b[1] - a[1]).map(([station, load]) => (
 <div key={station} className={`flex items-center gap-1 border-carbon-border px-1.5 py-0.5 shrink-0 ${load > 5 ? 'bg-carbon-error text-white font-semibold' : load > 2 ? 'bg-carbon-warning/10 text-carbon-warning text-white font-medium' : 'bg-carbon-bg font-medium'}`}>
 <span>{station}:</span>
 <span>{load}</span>
 </div>
 ))
 )}
 </div>

 {/* Dense Workflow Board */}
 <div className="flex-grow overflow-y-auto p-2">
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 h-full items-start">
 
 {/* Column 1: New Orders */}
 <div className="bg-carbon-layerHover/50 border-carbon-border p-1.5 min-h-[500px] flex flex-col gap-2 relative">
 <div className="sticky top-0 z-10 bg-carbon-layerHover border-b-2 border-carbon-border py-1 text-center shadow-sm">
 <h2 className="font-semibold text-carbon-textSecondary text-xs flex items-center justify-center gap-1">
 طلبات جديدة ({newOrders.length})
 </h2>
 </div>
 <AnimatePresence>
 {newOrders.map(order => <OrderCard key={order.id} order={order} />)}
 </AnimatePresence>
 </div>

 {/* Column 2: Preparing */}
 <div className="bg-carbon-layerHover text-carbon-text/10 border-brand-purple/50 p-1.5 min-h-[500px] flex flex-col gap-2 relative">
 <div className="sticky top-0 z-10 bg-carbon-layerHover text-carbon-text text-white border-b-2 border-brand-purple py-1 text-center shadow-sm">
 <h2 className="font-semibold text-xs flex items-center justify-center gap-1">
 <Flame size={12} className="animate-pulse" /> قيد التحضير ({preparingOrders.length})
 </h2>
 </div>
 <AnimatePresence>
 {preparingOrders.map(order => <OrderCard key={order.id} order={order} />)}
 </AnimatePresence>
 </div>

 {/* Column 3: Ready */}
 <div className="bg-carbon-success/10 text-carbon-success/10 border-carbon-success/50 p-1.5 min-h-[500px] flex flex-col gap-2 relative">
 <div className="sticky top-0 z-10 bg-carbon-success/10 text-carbon-success text-white border-b-2 border-carbon-success py-1 text-center shadow-sm">
 <h2 className="font-semibold text-xs flex items-center justify-center gap-1">
 <CheckCircle2 size={12} /> جاهز ({readyOrders.length})
 </h2>
 </div>
 <AnimatePresence>
 {readyOrders.map(order => <OrderCard key={order.id} order={order} isReadyColumn={true} />)}
 </AnimatePresence>
 </div>

 </div>
 </div>
 </div>
 );
}
