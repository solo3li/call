'use client';

import { useState, useEffect, useMemo } from "react";
import { Truck, User, RefreshCw, Clock, Search, MapPin, CheckCircle2, ChevronRight, Zap, AlertTriangle, Activity } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { ordersApi, employeesApi, externalCompaniesApi } from "../utils/api";
import { Order, Employee } from "../types/api";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Paper, Typography, InputBase, IconButton, Chip } from "@mui/material";

export default function DeliveryDashboard() {
  const { recentOrders, refresh, deliveryType, setDeliveryType, externalCompanyId, setExternalCompanyId } = useDashboard();
  const [drivers, setDrivers] = useState<Employee[]>([]);
  const [externalCompanies, setExternalCompanies] = useState<any[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  useEffect(() => {
    fetchDrivers();
    externalCompaniesApi.getAll().then(res => setExternalCompanies(res.data)).catch(console.error);
  }, []);

  const fetchDrivers = async () => {
    try {
      const res = await employeesApi.getAll();
      const deliveryStaff = res.data.filter((e: Employee) => e.isDelivery);
      setDrivers(deliveryStaff);
    } catch (err) {
      console.error("Error fetching drivers:", err);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const handleAssignDriver = async (orderId: string, driverName: string, driverPhone: string) => {
    setAssignLoading(true);
    try {
      await ordersApi.assignDriver(orderId, driverName, driverPhone);
      setAssigningOrderId(null);
      refresh();
    } catch (error: any) {
      alert(error.response?.data?.message || "فشل تعيين المندوب");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleBulkAssign = async (driverName: string, driverPhone: string) => {
    if (selectedOrderIds.length === 0) return;
    setAssignLoading(true);
    try {
      await Promise.all(selectedOrderIds.map(id => ordersApi.assignDriver(id, driverName, driverPhone)));
      setSelectedOrderIds([]);
      refresh();
    } catch (error: any) {
      alert("حدث خطأ أثناء الإسناد الجماعي");
    } finally {
      setAssignLoading(false);
    }
  };

  const toggleOrderSelection = (id: string) => {
    setSelectedOrderIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Derive Data
  const deliveryOrders = recentOrders.filter(o =>
    (o.orderType === "توصيل" || o.orderType === "Delivery") &&
    (o.status !== "Cancelled" && o.status !== "ملغي")
  );

  const filteredOrders = deliveryOrders.filter(o => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (o.orderNumber?.toString() || "").includes(searchLower) ||
      (o.customerName?.toLowerCase() || "").includes(searchLower) ||
      (o.driverName?.toLowerCase() || "").includes(searchLower)
    );
  });

  const { inKitchen, readyForDriver, inDelivery, completed } = useMemo(() => {
    let k: any[] = [];
    let r: any[] = [];
    let d: any[] = [];
    let c: any[] = [];

    filteredOrders.forEach(o => {
      if (o.status === "Completed" || o.status === "مكتمل") {
        c.push(o);
      } else if (o.status === "Delivering" || o.status === "قيد التوصيل") {
        d.push(o);
      } else if (o.status === "Ready" || o.status === "جاهز") {
        r.push(o);
      } else {
        k.push(o);
      }
    });

    // Sort all arrays by oldest first (longest wait time at the top)
    const sortByOldest = (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    k.sort(sortByOldest);
    r.sort(sortByOldest);
    d.sort(sortByOldest);
    c.sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

    return { inKitchen: k, readyForDriver: r, inDelivery: d, completed: c };
  }, [filteredOrders]);

  // Driver Status Logic
  const busyDriverNames = Array.from(new Set(inDelivery.map(o => o.driverName).filter(Boolean)));
  const availableDrivers = drivers.filter(d => !busyDriverNames.includes(d.fullName));
  const busyDrivers = drivers.filter(d => busyDriverNames.includes(d.fullName));

  // Avg wait time (for ready orders)
  const avgWaitTime = useMemo(() => {
    if (readyForDriver.length === 0) return 0;
    const total = readyForDriver.reduce((acc, order) => {
      return acc + (new Date().getTime() - new Date(order.createdAt).getTime()) / 60000;
    }, 0);
    return Math.round(total / readyForDriver.length);
  }, [readyForDriver]);

  // Global Status Logic
  let globalStatus = { text: "توصيل طبيعي", color: "bg-brand-green text-white", icon: <CheckCircle2 size={14} /> };
  if (readyForDriver.length > 0 && availableDrivers.length === 0) {
    globalStatus = { text: "أزمة توصيل!", color: "bg-brand-red text-white animate-pulse", icon: <AlertTriangle size={14} /> };
  } else if (readyForDriver.length > availableDrivers.length * 2) {
    globalStatus = { text: "ضغط توصيل", color: "bg-brand-orange text-white", icon: <Activity size={14} /> };
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', bgcolor: 'grey.50', position: 'relative' }}>
      
      {/* High Volume Dense Header */}
      <Paper square elevation={1} sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', p: 1, gap: 1, zIndex: 20 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          <Chip 
            icon={globalStatus.icon} 
            label={globalStatus.text} 
            color={globalStatus.text === "أزمة توصيل!" ? "error" : globalStatus.text === "ضغط توصيل" ? "warning" : "success"}
            size="small" 
            sx={{ fontWeight: 'bold', borderRadius: 1 }}
          />
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}>Delivery Command</Typography>
        </Box>

        {/* Compact Analytics Strip */}
        <div className="flex gap-2 items-center text-[10px] font-bold uppercase">
          <div className="bg-brand-blue text-white px-2 py-1 border border-gray-200 flex gap-1 items-center">
            <Truck size={10} /> طلبات نشطة: {deliveryOrders.length}
          </div>
          <div className="bg-brand-green text-white px-2 py-1 border border-gray-200 flex gap-1 items-center">
            <User size={10} /> متاح: {availableDrivers.length}
          </div>
          <div className="bg-brand-orange text-white px-2 py-1 border border-gray-200 flex gap-1 items-center">
            <MapPin size={10} /> في مهمة: {busyDrivers.length}
          </div>
          <div className={`${avgWaitTime > 15 ? 'bg-brand-red text-white animate-pulse' : 'bg-gray-200 text-gray-900'} px-2 py-1 border border-gray-200 flex gap-1 items-center`}>
            <Clock size={10} /> انتظار: {avgWaitTime}د
          </div>
        </div>

        {/* Compact Filter Bar */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexGrow: 1, justifyContent: 'flex-end', maxWidth: 600 }}>
          <select 
            className="border-2 border-black rounded-none px-2 py-1 text-[11px] font-bold focus:outline-none focus:bg-brand-yellow"
            value={deliveryType}
            onChange={(e) => {
              setDeliveryType(e.target.value);
              if (e.target.value === "Internal") {
                setExternalCompanyId("All");
              }
            }}
          >
            <option value="All">الكل (أنواع)</option>
            <option value="Internal">داخلي</option>
            <option value="External">خارجي</option>
          </select>
          <select
            className="border-2 border-black rounded-none px-2 py-1 text-[11px] font-bold focus:outline-none focus:bg-brand-yellow disabled:opacity-50 disabled:bg-gray-100"
            value={externalCompanyId}
            onChange={(e) => setExternalCompanyId(e.target.value)}
            disabled={deliveryType === "Internal"}
          >
            <option value="All">الكل (شركات)</option>
            <option value="Unspecified">غير محدد</option>
            {externalCompanies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <Paper variant="outlined" sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '100%', borderRadius: 1 }}>
            <Search size={16} color="disabled" style={{ marginLeft: 4 }} />
            <InputBase
              sx={{ ml: 1, flex: 1, fontSize: '0.75rem', fontWeight: 'bold' }}
              placeholder="ابحث عن طلب، عميل، مندوب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Paper>
          <IconButton onClick={refresh} size="small" sx={{ border: '1px solid #e5e7eb', borderRadius: 1, bgcolor: 'grey.100' }}>
            <RefreshCw size={16} />
          </IconButton>
        </Box>
      </Paper>

      {/* Main Board */}
      <div className="flex flex-col lg:flex-row flex-grow overflow-hidden p-2 gap-2">
        
        {/* Kanban Board (80%) */}
        <div className="flex-grow flex flex-col sm:flex-row gap-2 overflow-x-auto custom-scrollbar">
          
          {/* Column 1: In Kitchen */}
          <div className="flex-1 bg-gray-200/50 border-2 border-gray-300 p-1.5 min-w-[200px] flex flex-col gap-2 relative">
            <div className="sticky top-0 z-10 bg-gray-200 border-b-2 border-gray-300 py-1 text-center shadow-sm">
              <h2 className="font-bold text-gray-700 text-[11px] flex items-center justify-center gap-1">
                قيد التجهيز ({inKitchen.length})
              </h2>
            </div>
            <div className="overflow-y-auto flex-grow space-y-2 custom-scrollbar pr-1">
              <AnimatePresence>
                {inKitchen.map(order => {
                  const mins = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000);
                  return (
                    <motion.div 
                      layout 
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={order.id} 
                      className="bg-white border-2 border-gray-300 p-2 shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={selectedOrderIds.includes(order.id)}
                            onChange={() => toggleOrderSelection(order.id)}
                            className="w-4 h-4 accent-black cursor-pointer"
                          />
                          <span className="font-bold text-base leading-none">#{order.orderNumber}</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1 border border-gray-200">{mins}د</span>
                      </div>
                      <p className="text-[10px] font-bold text-gray-600 truncate pl-6">{order.customerName}</p>
                      {order.isExternalDelivery ? (
                        <p className="text-[9px] font-bold text-brand-orange bg-brand-orange/10 px-1 mt-0.5 inline-block border border-brand-orange/30">
                          توصيل خارجي{order.externalCompanyName ? ` - ${order.externalCompanyName}` : ''}
                        </p>
                      ) : (
                        <p className="text-[9px] font-bold text-brand-green bg-brand-green/10 px-1 mt-0.5 inline-block border border-brand-green/30">
                          توصيل داخلي
                        </p>
                      )}
                      {!order.externalCompanyName && order.address && <p className="text-[9px] font-bold text-gray-500 truncate pl-6 mt-0.5">{order.address}</p>}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Column 2: Ready for Driver */}
          <div className="flex-1 bg-brand-yellow/10 border-2 border-brand-yellow/50 p-1.5 min-w-[200px] flex flex-col gap-2 relative">
            <div className="sticky top-0 z-10 bg-brand-yellow text-gray-900 border-b-2 border-brand-yellow py-1 text-center shadow-sm">
              <h2 className="font-bold text-[11px] flex items-center justify-center gap-1">
                <Zap size={12} className="text-brand-orange animate-pulse" />
                جاهز للتوصيل ({readyForDriver.length})
              </h2>
            </div>
            <div className="overflow-y-auto flex-grow space-y-2 custom-scrollbar pr-1">
              <AnimatePresence>
                {readyForDriver.map(order => {
                  const mins = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000);
                  const isCritical = mins > 15;
                  
                  let cardBg = isCritical ? 'bg-brand-red text-white border-black shadow-sm' : 'bg-white border-brand-orange shadow-[2px_2px_0px_#F97316]';
                  
                  return (
                    <motion.div 
                      layout 
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={order.id} 
                      className={`border-2 p-2 relative ${cardBg}`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-start gap-2">
                          <input 
                            type="checkbox" 
                            checked={selectedOrderIds.includes(order.id)}
                            onChange={() => toggleOrderSelection(order.id)}
                            className="w-4 h-4 mt-1 accent-black cursor-pointer shrink-0"
                          />
                          <div>
                            <span className="font-bold text-lg leading-none">#{order.orderNumber}</span>
                            <p className={`text-[10px] font-bold mt-0.5 truncate ${isCritical ? 'text-gray-100' : 'text-gray-700'}`}>{order.customerName}</p>
                            {order.address && <p className={`text-[9px] font-bold mt-0.5 truncate ${isCritical ? 'text-gray-300' : 'text-gray-500'}`}>{order.address}</p>}
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 border flex items-center gap-0.5 shrink-0 ${isCritical ? 'bg-black border-black text-white animate-pulse' : 'bg-brand-orange border-brand-orange text-white'}`}>
                          <Clock size={10} /> {mins}د
                        </span>
                      </div>
                      
                      {/* Ultra-Fast Quick Assign Dropdown */}
                      <div className="mt-2">
                        {order.isExternalDelivery ? (
                          <div className="w-full bg-brand-orange text-white py-1.5 text-[11px] font-bold shadow-sm flex justify-center items-center gap-1 uppercase">
                             توصيل خارجي{order.externalCompanyName ? ` - ${order.externalCompanyName}` : ''}
                          </div>
                        ) : assigningOrderId === order.id ? (
                          <div className="bg-white text-gray-900 border border-gray-200 p-1 shadow-sm w-full mb-1">
                            <div className="max-h-32 overflow-y-auto custom-scrollbar">
                              {availableDrivers.length === 0 ? (
                                <p className="text-[10px] text-center text-brand-red font-bold py-1">لا يوجد مناديب متاحين!</p>
                              ) : (
                                availableDrivers.map(d => (
                                  <button 
                                    key={d.id} 
                                    onClick={() => handleAssignDriver(order.id, d.fullName, d.mobileNumber || '')}
                                    disabled={assignLoading}
                                    className="w-full text-right p-1.5 text-[11px] font-bold hover:bg-brand-green hover:text-white border-b border-gray-100 last:border-0 flex justify-between items-center transition-colors"
                                  >
                                    <span className="truncate">{d.fullName}</span>
                                    <ChevronRight size={12} />
                                  </button>
                                ))
                              )}
                            </div>
                            <button onClick={() => setAssigningOrderId(null)} className="w-full text-center bg-gray-100 text-[10px] font-bold py-1.5 mt-1 hover:bg-gray-200">إلغاء</button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setAssigningOrderId(order.id)}
                            className="w-full bg-brand-blue text-white py-1.5 text-[11px] font-bold border border-gray-200 shadow-sm hover:bg-brand-yellow hover:text-gray-900 active:translate-y-px active:shadow-none transition-all flex justify-center items-center gap-1 uppercase"
                          >
                            <Truck size={12} /> تعيين
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Column 3: Out for Delivery */}
          <div className="flex-1 bg-brand-blue/5 border-2 border-brand-blue/30 p-1.5 min-w-[200px] flex flex-col gap-2 relative">
            <div className="sticky top-0 z-10 bg-brand-blue text-white border-b-2 border-brand-blue py-1 text-center shadow-sm">
              <h2 className="font-bold text-[11px] flex items-center justify-center gap-1">
                <Truck size={12} /> قيد التوصيل ({inDelivery.length})
              </h2>
            </div>
            <div className="overflow-y-auto flex-grow space-y-2 custom-scrollbar pr-1">
              <AnimatePresence>
                {inDelivery.map(order => (
                  <motion.div 
                    layout 
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={order.id} 
                    className="bg-brand-blue text-white border border-gray-200 p-2 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-lg leading-none">#{order.orderNumber}</span>
                      <div className="text-left">
                        <p className="text-[9px] font-bold opacity-80 truncate max-w-[150px]">{order.customerName}</p>
                        {order.address && <p className="text-[8px] font-bold opacity-60 truncate max-w-[150px]">{order.address}</p>}
                      </div>
                    </div>
                    <div className="bg-white text-gray-900 px-1.5 py-1 border border-gray-200 flex items-center gap-1">
                      <div className="w-4 h-4 bg-brand-blue flex items-center justify-center shrink-0">
                        <User size={10} className="text-white" />
                      </div>
                      <div className="overflow-hidden flex-1 flex justify-between items-center">
                        <p className="text-[10px] font-bold truncate">{order.driverName}</p>
                        {order.driverPhone && <p className="text-[8px] font-bold text-gray-500">{order.driverPhone}</p>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          {/* Column 4: Completed */}
          <div className="flex-1 bg-brand-green/5 border-2 border-brand-green/30 p-1.5 min-w-[200px] flex flex-col gap-2 relative">
            <div className="sticky top-0 z-10 bg-brand-green text-white border-b-2 border-brand-green py-1 text-center shadow-sm">
              <h2 className="font-bold text-[11px] flex items-center justify-center gap-1">
                <CheckCircle2 size={12} /> مكتمل ({completed.length})
              </h2>
            </div>
            <div className="overflow-y-auto flex-grow space-y-2 custom-scrollbar pr-1">
              <AnimatePresence>
                {completed.slice(0, 20).map(order => (
                  <motion.div 
                    layout 
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={order.id} 
                    className="bg-brand-green/10 text-brand-green border-2 border-brand-green/50 p-2 shadow-sm opacity-80"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-base leading-none">#{order.orderNumber}</span>
                      <CheckCircle2 size={12} />
                    </div>
                    <p className="text-[10px] font-bold text-gray-700 truncate">{order.customerName}</p>
                    {order.address && <p className="text-[9px] font-bold text-gray-500 truncate mt-0.5">{order.address}</p>}
                    {order.driverName && (
                      <p className="text-[9px] font-bold text-brand-green mt-1">بواسطة: {order.driverName}</p>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Compact Fleet Side Panel (20%) */}
        <div className="w-full lg:w-48 bg-white border border-gray-200 shadow-sm p-2 flex flex-col shrink-0">
          <h2 className="text-[11px] font-bold mb-2 flex items-center justify-between border-b border-gray-200 pb-1">
            <span>أسطول التوصيل</span>
            <span className="bg-gray-50 px-1.5 text-[9px] border border-gray-200">{drivers.length}</span>
          </h2>

          <div className="overflow-y-auto flex-grow pr-1 custom-scrollbar">
            {loadingDrivers ? (
              <p className="text-center text-gray-400 text-[10px] font-bold animate-pulse">جاري الجلب...</p>
            ) : drivers.length === 0 ? (
              <p className="text-center text-gray-400 text-[10px] font-bold">لا يوجد مناديب.</p>
            ) : (
              <div className="space-y-3">
                {/* Available Drivers List */}
                <div>
                  <h3 className="text-[10px] font-bold text-brand-green mb-1 flex items-center gap-1 border-b border-gray-100 pb-0.5">
                    <CheckCircle2 size={10} /> متاح ({availableDrivers.length})
                  </h3>
                  <div className="space-y-0.5">
                    {availableDrivers.map(d => (
                      <div key={d.id} className="flex items-center gap-1.5 p-1 hover:bg-brand-green/5 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 bg-brand-green rounded-full shrink-0"></span>
                        <span className="truncate">{d.fullName}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Busy Drivers List */}
                {busyDrivers.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-bold text-brand-orange mb-1 flex items-center gap-1 border-b border-gray-100 pb-0.5">
                      <Truck size={10} /> مشغول ({busyDrivers.length})
                    </h3>
                    <div className="space-y-0.5">
                      {busyDrivers.map(d => {
                        const myOrders = inDelivery.filter(o => o.driverName === d.fullName);
                        return (
                          <div key={d.id} className="flex flex-col gap-0.5 p-1 bg-gray-50 border border-gray-100">
                            <div className="flex items-center justify-between text-[10px] font-bold text-gray-900">
                              <span className="truncate">{d.fullName}</span>
                              <span className="text-[8px] bg-brand-orange text-white px-1">{myOrders.length} طلب</span>
                            </div>
                            <div className="flex gap-0.5 flex-wrap">
                              {myOrders.map(mo => (
                                <span key={mo.id} className="text-[8px] font-bold text-gray-500">#{mo.orderNumber}</span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {selectedOrderIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black text-white p-3 border-4 border-brand-yellow shadow-[8px_8px_0px_#1A1A1A] z-50 flex flex-col sm:flex-row items-center gap-4 max-w-2xl w-[90%]"
          >
            <div className="flex items-center gap-3 shrink-0">
              <span className="bg-brand-yellow text-black px-3 py-1 text-2xl font-bold">{selectedOrderIds.length}</span>
              <span className="font-bold text-lg uppercase tracking-wider">طلبات للتعيين</span>
            </div>
            
            <div className="flex-grow w-full">
              <select 
                className="w-full bg-white text-black border-4 border-white p-2 text-lg font-bold cursor-pointer focus:outline-none focus:border-brand-yellow transition-colors"
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  const [name, phone] = val.split('|');
                  handleBulkAssign(name, phone);
                  e.target.value = ""; // reset selection
                }}
                disabled={assignLoading}
              >
                <option value="">-- إسناد المندوب فوراً --</option>
                {availableDrivers.map(d => (
                  <option key={d.id} value={`${d.fullName}|${d.mobileNumber || ''}`}>{d.fullName}</option>
                ))}
              </select>
            </div>
            {assignLoading && <RefreshCw className="animate-spin text-brand-yellow shrink-0" size={24} />}
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
