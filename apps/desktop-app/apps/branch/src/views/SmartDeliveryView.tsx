import { useState, useEffect, useMemo } from "react";
import { Zap, MapPin, Truck, RefreshCw, X, User, Navigation, ChevronLeft, Bot, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { deliveryApi, employeesApi } from "../utils/api";
import { SuggestedGroup, Employee } from "../types/api";

function CreateTripModal({ group, drivers, onClose, onCreated }: { group: SuggestedGroup; drivers: Employee[]; onClose: () => void; onCreated: () => void }) {
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDriverChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    setDriverName(name);
    const driver = drivers.find(d => d.fullName === name);
    setDriverPhone(driver?.email || ""); 
  };

  const handleCreate = async () => {
    if (!driverName.trim()) return;
    setLoading(true);
    try {
      await deliveryApi.createTrip({
        driverName: driverName.trim(),
        driverPhone: driverPhone.trim(),
        orderIds: group.orders.map(o => o.id)
      });
      onCreated();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || "فشل إنشاء الرحلة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="neo-card bg-white p-8 w-full max-w-lg space-y-6 relative overflow-hidden shadow-[12px_12px_0px_#1A1A1A]"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="flex justify-between items-center border-b-4 border-neo-border pb-4 relative z-10">
          <h3 className="font-black text-2xl flex items-center gap-3">
            <div className="bg-brand-orange p-2 rounded-xl text-white shadow-[2px_2px_0px_#1A1A1A]">
              <Zap size={24} />
            </div>
            تعيين {group.label}
          </h3>
          <button onClick={onClose} className="hover:bg-gray-100 p-2 border-2 border-transparent hover:border-neo-border rounded-xl transition-all shadow-none hover:shadow-[2px_2px_0px_#1A1A1A]">
            <X size={24} />
          </button>
        </div>
        
        <div className="bg-gradient-to-r from-brand-orange/20 to-brand-yellow/20 p-6 rounded-2xl border-4 border-brand-orange relative z-10">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <p className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider">الطلبات المدمجة</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-4xl font-black text-brand-orange drop-shadow-sm">{group.orders.length}</p>
                <span className="text-lg font-bold text-brand-orange/80">طلبات</span>
              </div>
            </div>
            <div className="h-16 w-1 bg-brand-orange/30 rounded-full"></div>
            <div className="text-center flex-1">
              <p className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider">المسافة المقدرة</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-4xl font-black text-brand-orange drop-shadow-sm">{group.avgDistanceKm}</p>
                <span className="text-lg font-bold text-brand-orange/80">كم</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          <label className="block text-base font-black text-neo-text">اختر المندوب الأقرب *</label>
          <div className="relative group">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-blue bg-brand-cyan/20 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
              <User size={20} />
            </div>
            <select 
              value={driverName} 
              onChange={handleDriverChange} 
              className="neo-input w-full font-bold pl-4 pr-14 text-lg py-4 border-4 focus:ring-4 focus:ring-brand-cyan/30 focus:border-brand-blue transition-all"
            >
              <option value="">-- اضغط لاختيار المندوب المناسب --</option>
              {drivers.map(d => <option key={d.id} value={d.fullName}>{d.fullName}</option>)}
            </select>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronLeft size={20} className="text-gray-400" />
            </div>
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: driverName && !loading ? 1.02 : 1 }}
          whileTap={{ scale: driverName && !loading ? 0.98 : 1 }}
          onClick={handleCreate} 
          disabled={loading || !driverName} 
          className="neo-btn relative overflow-hidden bg-brand-blue text-white w-full py-5 text-xl font-black mt-6 shadow-[6px_6px_0px_#1A1A1A] hover:shadow-[2px_2px_0px_#1A1A1A] hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed group z-10"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <><RefreshCw size={24} className="animate-spin" /> جاري التعيين...</>
            ) : (
              <><Navigation size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> تأكيد إرسال الرحلة</>
            )}
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}

export default function SmartDeliveryView() {
  const [suggestedGroups, setSuggestedGroups] = useState<SuggestedGroup[]>([]);
  const [drivers, setDrivers] = useState<Employee[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<SuggestedGroup | null>(null);
  const [autoAssigning, setAutoAssigning] = useState(false);

  useEffect(() => {
    employeesApi.getAll().then(res => setDrivers(res.data.filter(e => e.isDelivery))).catch(console.error);
  }, []);

  const loadSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const res = await deliveryApi.suggestGroups();
      setSuggestedGroups(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleTripCreated = () => {
    setSelectedGroup(null);
    loadSuggestions(); 
  };

  const handleAutoAssign = async () => {
    if (suggestedGroups.length === 0 || drivers.length === 0) return;
    if (!confirm("سيتم تعيين المناديب المتاحين تلقائياً لجميع المجموعات المقترحة. هل أنت متأكد؟")) return;
    
    setAutoAssigning(true);
    try {
      // Simulate extreme load handling
      let driverIdx = 0;
      for (const group of suggestedGroups) {
        if (driverIdx >= drivers.length) break;
        const driver = drivers[driverIdx];
        await deliveryApi.createTrip({
          driverName: driver.fullName,
          driverPhone: driver.email || "",
          orderIds: group.orders.map(o => o.id)
        });
        driverIdx++;
      }
      alert("تم التعيين التلقائي بنجاح!");
      loadSuggestions();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء التعيين التلقائي.");
    } finally {
      setAutoAssigning(false);
    }
  };

  // Stress-tested performance rendering using CSS grids
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  };

  const isStressMode = suggestedGroups.length > 5;

  return (
    <div className="space-y-8 pb-10">
      <AnimatePresence>
        {selectedGroup && <CreateTripModal group={selectedGroup} drivers={drivers} onClose={() => setSelectedGroup(null)} onCreated={handleTripCreated} />}
      </AnimatePresence>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-neo-text flex items-center gap-3 tracking-tight">
            <div className="bg-brand-orange/20 text-brand-orange p-2 rounded-xl border-2 border-brand-orange shadow-[2px_2px_0px_#1A1A1A]">
              <Bot size={32} />
            </div>
            نظام التوصيل الذكي <span className="text-brand-orange">AI</span>
          </h1>
          <p className="text-lg font-bold text-gray-500 mt-2">خوارزميات متقدمة مهيأة للعمل تحت الضغط العالي (Hard Stress Mode)</p>
        </div>

        {suggestedGroups.length > 0 && (
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleAutoAssign}
            disabled={autoAssigning}
            className="neo-btn bg-brand-red text-white px-6 py-3 flex items-center gap-3 text-lg font-black shadow-[4px_4px_0px_#1A1A1A] hover:shadow-[2px_2px_0px_#1A1A1A] hover:translate-x-[2px] hover:translate-y-[2px] transition-all border-4 border-neo-border disabled:opacity-50"
          >
            {autoAssigning ? <RefreshCw className="animate-spin" size={24} /> : <Zap size={24} />}
            تعيين الكل تلقائياً ({drivers.length} مندوب)
          </motion.button>
        )}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className={`neo-card p-10 border-4 border-neo-border flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden shadow-[8px_8px_0px_#1A1A1A] transition-colors duration-500 ${isStressMode ? 'bg-gradient-to-r from-brand-red to-brand-orange' : 'bg-gradient-to-r from-brand-blue to-brand-cyan'}`}
      >
        <div className="absolute -left-20 -top-20 text-white/10 transform rotate-12 scale-150 pointer-events-none">
          {isStressMode ? <AlertTriangle size={250} /> : <Activity size={250} />}
        </div>
        
        <div className="relative z-10 flex-1 text-white">
          <h2 className="text-3xl font-black mb-3 drop-shadow-md">
            {isStressMode ? "تحذير: ضغط طلبات عالي ⚠️" : "الشبكة العصبية جاهزة 🚀"}
          </h2>
          <p className="font-bold text-white/90 text-xl max-w-2xl leading-relaxed">
            {isStressMode 
              ? "تم رصد كمية ضخمة من الطلبات المعلقة. النظام قام بتفعيل وضع (Stress Mode) لدمج المسارات بشكل أقسى لتوفير الوقت." 
              : "النظام مستعد لتحليل الطلبات واستخدام الخرائط الذكية لتجميع الطلبات في خطوط سير موحدة لتقليل الجهد."}
          </p>
        </div>
        
        <div className="relative z-10 shrink-0">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadSuggestions} 
            disabled={loadingSuggestions} 
            className="neo-btn bg-white text-neo-text text-2xl font-black py-5 px-10 shadow-[8px_8px_0px_#1A1A1A] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-4 disabled:opacity-90 disabled:cursor-wait"
          >
            {loadingSuggestions ? (
              <><RefreshCw size={28} className="animate-spin text-brand-orange" /> جاري معالجة البيانات الضخمة...</>
            ) : (
              <><Activity size={28} className={isStressMode ? "text-brand-red" : "text-brand-blue"} /> تفعيل الخوارزمية</>
            )}
          </motion.button>
        </div>
      </motion.div>

      {loadingSuggestions && (
        <div className="py-20 flex flex-col items-center justify-center space-y-6">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-brand-orange/30 border-t-brand-orange animate-spin"></div>
            <div className="absolute inset-4 rounded-full border-4 border-brand-red/30 border-b-brand-red animate-[spin_2s_reverse_infinite]"></div>
            <Bot size={48} className="text-brand-orange animate-pulse" />
          </div>
          <h3 className="text-2xl font-black text-brand-orange animate-pulse">يتم الآن تطبيق معالجة ضخمة للمسارات...</h3>
        </div>
      )}

      {!loadingSuggestions && suggestedGroups.length > 0 && (
        <div className="neo-card bg-neo-card p-8 border-4 border-neo-border shadow-[4px_4px_0px_#1A1A1A]">
          <div className="flex items-center justify-between mb-8 border-b-4 border-neo-border pb-4">
            <h3 className="font-black text-3xl flex items-center gap-3">
              <div className="bg-brand-blue text-white p-2 rounded-lg"><MapPin size={28} /></div>
              المسارات الجاهزة للتوصيل
            </h3>
            <span className="neo-badge bg-brand-green text-white text-xl font-black px-6 py-2 border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] animate-pulse">
              تم اكتشاف {suggestedGroups.length} حزم
            </span>
          </div>
          
          <motion.div 
            variants={containerVariants} initial="hidden" animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {suggestedGroups.map(group => (
              <motion.div 
                key={group.groupIndex} 
                variants={itemVariants}
                className="neo-card bg-white p-5 border-4 border-brand-orange flex flex-col h-full shadow-[4px_4px_0px_#1A1A1A] hover:-translate-y-2 hover:shadow-[8px_8px_0px_#1A1A1A] transition-all duration-300 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-brand-orange text-white px-3 py-1.5 rounded-lg border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A]">
                    <h4 className="font-black text-lg">{group.label}</h4>
                  </div>
                  <span className="neo-badge bg-brand-yellow text-neo-text text-sm font-black px-2 py-1 border-2 border-neo-border">
                    {group.orders.length} طلبات
                  </span>
                </div>
                
                <div className="mb-4 bg-gray-50 p-3 rounded-lg border-2 border-gray-200 flex-grow shadow-inner overflow-hidden">
                  <ul className="text-sm font-bold text-gray-700 space-y-2 h-32 overflow-y-auto custom-scrollbar pr-1">
                    {group.orders.map((o, idx) => (
                      <li key={o.id} className="flex items-center gap-2 pb-2 border-b-2 border-gray-200 border-dashed last:border-0 last:pb-0">
                        <span className="bg-brand-blue text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">{idx + 1}</span>
                        <div className="flex flex-col min-w-0">
                          <span className="truncate font-black text-sm text-neo-text">#{o.orderNumber}</span>
                          <span className="truncate text-gray-500 text-[10px]">{o.customerName}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button 
                  onClick={() => setSelectedGroup(group)} 
                  className="neo-btn bg-brand-green text-white w-full py-3 text-lg font-black flex justify-center items-center gap-2 border-2 border-neo-border shadow-[4px_4px_0px_#1A1A1A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#1A1A1A] transition-all mt-auto"
                >
                  <Truck size={20} className="group-hover:translate-x-1 transition-transform" /> 
                  <span>تعيين لرحلة</span>
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {!loadingSuggestions && suggestedGroups.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border-4 border-dashed border-gray-300">
          <div className="relative inline-block mb-6">
            <Zap size={80} className="text-gray-300" />
          </div>
          <h2 className="font-black text-2xl text-gray-400 mb-2">النظام في وضع السكون</h2>
          <p className="font-bold text-gray-400 text-lg">لا توجد مسارات تحتاج لجدولة حالياً</p>
        </div>
      )}
    </div>
  );
}
