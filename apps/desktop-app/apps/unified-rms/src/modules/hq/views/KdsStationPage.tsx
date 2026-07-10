'use client';

import { useState, useEffect, useMemo } from "react";
import { ChefHat, CheckCircle2, Flame, AlertTriangle, Search, Filter, Clock, Square, Settings } from "lucide-react";
import { ordersApi, kitchenStationsApi } from "../utils/api";
import { Order, KitchenStation } from "../types/api";
import { hasPermission, getUserBranchId, isManagerOrOwner } from "../utils/permissions";
import { motion, AnimatePresence } from "framer-motion";

const OrderCard = ({ order, handleItemStatusChange }: { order: any, handleItemStatusChange: (orderId: string, itemId: number, status: string) => void }) => {
  const minutesElapsed = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000);
  const isCritical = minutesElapsed > 15;
  const isWarning = minutesElapsed > 10 && !isCritical;
  
  let cardClasses = "bg-white border-neo-border text-neo-text shadow-[2px_2px_0px_#1A1A1A]";
  if (isCritical) {
    cardClasses = "bg-brand-red text-white border-black shadow-[3px_3px_0px_#1A1A1A]";
  } else if (isWarning) {
    cardClasses = "bg-brand-orange/20 border-brand-orange text-neo-text";
  }

  return (
    <motion.article 
      layout 
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
      className={`border-2 flex flex-col justify-between overflow-hidden shrink-0 ${cardClasses}`}
    >
      <div className="p-1.5 border-b-2 border-inherit flex justify-between items-center bg-white/50">
        <span className="text-2xl font-black leading-none">#{order.orderNumber}</span>
        <div className={`flex items-center gap-1 px-1.5 py-0.5 border border-inherit ${isCritical ? 'bg-black text-white animate-pulse' : 'bg-gray-100 text-neo-text'}`}>
          <Clock size={12} />
          <span className="text-sm font-black">{minutesElapsed}د</span>
        </div>
      </div>

      {order.externalCompanyName && (
        <div className="bg-brand-orange text-white text-[10px] font-black uppercase text-center py-0.5 border-b-2 border-inherit">
          توصيل خارجي: {order.externalCompanyName}
        </div>
      )}

      <div className="p-1.5 space-y-1.5">
        {order.stationItems.map((item: any) => {
          const isReady = item.status === "Ready";
          const isPrep = item.status === "Preparing";
          let btnClass = "bg-white border-neo-border text-neo-text";
          
          if (isCritical) {
            btnClass = isReady ? "bg-black/30 border-black/50 text-white/50 line-through" : isPrep ? "bg-black text-brand-yellow border-black" : "bg-white text-neo-text border-black";
          } else {
            btnClass = isReady ? "bg-gray-100 border-gray-200 text-gray-400 line-through" : isPrep ? "bg-brand-purple/10 border-brand-purple text-brand-purple" : "bg-white border-neo-border text-neo-text hover:bg-gray-50";
          }

          return (
            <button
              key={item.id}
              onClick={() => handleItemStatusChange(order.id, item.id, item.status)}
              className={`w-full text-right p-2 flex items-center justify-between border-2 transition-colors cursor-pointer shadow-sm ${btnClass}`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className={`font-black px-1.5 py-0.5 border-inherit border-r-2 ${isCritical && !isReady && !isPrep ? 'bg-black/10' : 'bg-gray-100'}`}>{item.quantity}</span>
                <span className="font-bold text-sm truncate">{item.menuItemName}</span>
              </div>
              <div className="shrink-0 flex items-center justify-center p-1 bg-white/50 rounded-sm border border-inherit">
                {item.status === 'Pending' && <Square size={16} className={isCritical ? 'opacity-50' : 'text-gray-400'} />}
                {item.status === 'Preparing' && <Flame size={16} className="text-brand-orange animate-pulse" />}
                {item.status === 'Ready' && <CheckCircle2 size={16} className="text-brand-green" />}
              </div>
            </button>
          );
        })}
      </div>
    </motion.article>
  );
};

export default function KdsStationPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [stations, setStations] = useState<KitchenStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderTypeFilter, setOrderTypeFilter] = useState("الكل");

  // Local state for selected station
  const [selectedStation, setSelectedStation] = useState<string>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem("kds_selected_station") || "" : "";
  });

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
  }, []);

  const handleStationChange = (stationName: string) => {
    setSelectedStation(stationName);
    localStorage.setItem("kds_selected_station", stationName);
  };

  const handleItemStatusChange = async (orderId: string, itemId: number, currentStatus: string) => {
    if (!hasPermission('Orders.Status')) return;
    
    let nextStatus = "Preparing";
    if (currentStatus === "Preparing") nextStatus = "Ready";
    if (currentStatus === "Ready") nextStatus = "Pending";

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          items: o.items.map((i: any) => i.id === itemId ? { ...i, status: nextStatus } : i)
        };
      }
      return o;
    }));

    try {
      await ordersApi.updateItemStatus(orderId, itemId, nextStatus);
      fetchOrders();
    } catch (err) {
      fetchOrders();
    }
  };

  const stationOrders = useMemo(() => {
    if (!selectedStation) return [];
    
    return orders
      .map(order => ({
        ...order,
        stationItems: (order.items || []).filter((i: any) => (i.kitchenStationName || "عام") === selectedStation)
      }))
      .filter(order => order.stationItems.length > 0)
      .filter(order => order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(order => orderTypeFilter === "الكل" || order.orderType === orderTypeFilter)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [orders, selectedStation, searchQuery, orderTypeFilter]);

  const { pendingOrders, preparingOrders, readyOrders } = useMemo(() => {
    const pending: any[] = [];
    const preparing: any[] = [];
    const ready: any[] = [];

    stationOrders.forEach(o => {
      const allPending = o.stationItems.every((i: any) => i.status === 'Pending');
      const allReady = o.stationItems.every((i: any) => i.status === 'Ready');
      
      if (allPending) {
        pending.push(o);
      } else if (allReady) {
        ready.push(o);
      } else {
        preparing.push(o);
      }
    });
    return { pendingOrders: pending, preparingOrders: preparing, readyOrders: ready };
  }, [stationOrders]);

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
        <div className="bg-brand-yellow p-12 flex flex-col items-center gap-6 text-center border-4 border-neo-border shadow-[12px_12px_0px_#1A1A1A] max-w-2xl w-full">
          <AlertTriangle size={64} strokeWidth={2.5} className="text-neo-text" />
          <h2 className="text-5xl font-black text-neo-text uppercase tracking-tight">توقف!</h2>
          <p className="font-bold text-2xl text-neo-text leading-snug">مخصصة لطاقم المطبخ فقط.</p>
        </div>
      </div>
    );
  }

  if (loading && stations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center font-black text-4xl animate-pulse flex items-center gap-4">
          <ChefHat size={48} /><span>جاري التحميل...</span>
        </div>
      </div>
    );
  }

  const activeStations = ["عام", ...Array.from(new Set(stations.map(s => s.name)))];

  if (!selectedStation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 bg-neo-bg">
        <div className="bg-white p-10 flex flex-col items-center text-center border-4 border-neo-border shadow-[8px_8px_0px_#1A1A1A] max-w-2xl w-full">
          <Settings size={64} className="text-brand-blue mb-6" />
          <h1 className="text-4xl font-black mb-4">إعداد المحطة</h1>
          <p className="text-xl font-bold text-gray-500 mb-8">اختر محطة الطهي</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
            {activeStations.map(st => (
              <button 
                key={st} onClick={() => handleStationChange(st)}
                className="bg-brand-yellow text-neo-text p-6 border-4 border-neo-border shadow-[4px_4px_0px_#1A1A1A] hover:translate-y-[-2px] active:translate-y-[2px] font-black text-2xl flex flex-col items-center gap-3"
              >
                <ChefHat size={32} /><span>{st}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Always show these order types even if there are no active orders of this type
  const defaultOrderTypes = ["توصيل", "استلام", "محلي"];
  const dynamicOrderTypes = Array.from(new Set(orders.map(o => o.orderType))).filter(t => !defaultOrderTypes.includes(t));
  const orderTypes = ["الكل", ...defaultOrderTypes, ...dynamicOrderTypes];

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-gray-50 relative">
      {/* Dense Header */}
      <header className="flex flex-col lg:flex-row items-center justify-between p-2 border-b-2 border-neo-border bg-white shrink-0 z-20 shadow-[0_2px_0px_#1A1A1A] gap-2">
        <div className="flex items-center gap-3 w-full lg:w-auto shrink-0 justify-between lg:justify-start">
          <div className="bg-black text-white px-3 py-1.5 border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] flex items-center gap-2 font-black">
            <ChefHat size={16} /> <span className="uppercase text-sm">{selectedStation}</span>
          </div>
          <span className="bg-gray-200 text-xs font-black px-2 py-1 rounded border border-gray-300 hidden sm:block">
            {stationOrders.length} طلبات نشطة
          </span>
        </div>
        
        {/* Order Type Tabs */}
        <div className="flex gap-1 w-full lg:w-auto overflow-x-auto custom-scrollbar pb-1 lg:pb-0 flex-1 lg:justify-center">
          {orderTypes.map(type => (
            <button
              key={type}
              onClick={() => setOrderTypeFilter(type)}
              className={`px-4 py-1.5 text-xs font-black border-2 border-neo-border whitespace-nowrap transition-all active:scale-95 ${orderTypeFilter === type ? 'bg-brand-yellow text-neo-text shadow-[2px_2px_0px_#1A1A1A] -translate-y-0.5' : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          <div className="relative flex-1 lg:w-40 shrink-0">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2" />
            <input
              type="text" placeholder="رقم الطلب..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-neo-border py-1 pr-7 pl-2 text-xs font-bold focus:outline-none shadow-[2px_2px_0px_#1A1A1A]"
            />
          </div>
          <button onClick={() => handleStationChange("")} className="bg-gray-100 text-[10px] font-black px-2 py-1 border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] hover:bg-gray-200 shrink-0">
            تغيير المحطة
          </button>
        </div>
      </header>

      {/* Dense Station Board */}
      <div className="flex-grow overflow-hidden flex flex-col md:flex-row p-2 gap-4">
        {stationOrders.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-4">
            <div className="w-16 h-16 bg-white border-4 border-neo-border rounded-full flex items-center justify-center shadow-sm">
              <CheckCircle2 size={32} className="text-brand-green" />
            </div>
            <p className="text-xl font-black">المحطة نظيفة! 🍳</p>
          </div>
        ) : (
          <>
            {/* Pending Column */}
            <div className="flex-1 flex flex-col bg-gray-100 border-4 border-neo-border shadow-[4px_4px_0px_#1A1A1A] overflow-hidden">
              <div className="bg-brand-yellow p-3 border-b-4 border-neo-border flex items-center justify-between z-10">
                <h3 className="font-black text-xl flex items-center gap-2"><Square size={20} /> في الانتظار</h3>
                <span className="bg-black text-white px-2 py-0.5 text-sm font-black rounded-full">{pendingOrders.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3 relative">
                {pendingOrders.map(order => <OrderCard key={order.id} order={order} handleItemStatusChange={handleItemStatusChange} />)}
              </div>
            </div>

            {/* Preparing Column */}
            <div className="flex-1 flex flex-col bg-gray-100 border-4 border-neo-border shadow-[4px_4px_0px_#1A1A1A] overflow-hidden">
              <div className="bg-brand-orange p-3 border-b-4 border-neo-border flex items-center justify-between z-10">
                <h3 className="font-black text-xl flex items-center gap-2"><Flame size={20} className="animate-pulse" /> على النار</h3>
                <span className="bg-black text-white px-2 py-0.5 text-sm font-black rounded-full">{preparingOrders.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3 relative">
                {preparingOrders.map(order => <OrderCard key={order.id} order={order} handleItemStatusChange={handleItemStatusChange} />)}
              </div>
            </div>

            {/* Ready Column */}
            <div className="flex-1 flex flex-col bg-gray-100 border-4 border-neo-border shadow-[4px_4px_0px_#1A1A1A] overflow-hidden">
              <div className="bg-brand-green p-3 border-b-4 border-neo-border flex items-center justify-between z-10">
                <h3 className="font-black text-xl flex items-center gap-2 text-white"><CheckCircle2 size={20} /> مكتمل</h3>
                <span className="bg-black text-white px-2 py-0.5 text-sm font-black rounded-full">{readyOrders.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3 relative">
                {readyOrders.map(order => <OrderCard key={order.id} order={order} handleItemStatusChange={handleItemStatusChange} />)}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
