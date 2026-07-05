import { useState, useEffect } from "react";
import { deliveryApi, ordersApi } from "../utils/api";
import { DeliveryTrip, SuggestedOrderItem } from "../types/api";
import { useCurrency } from "../utils/useCurrency";
import { MapPin, Phone, CheckCircle2, Navigation, Truck, Map, RefreshCw } from "lucide-react";

export default function DeliveryDriverView() {
  const { currencySymbol } = useCurrency();
  const [totpCode, setTotpCode] = useState("");
  const [driverName, setDriverName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [trips, setTrips] = useState<DeliveryTrip[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const savedName = localStorage.getItem("driverName");
    const savedTenantId = localStorage.getItem("tenantId");
    if (savedName && savedTenantId) {
      setDriverName(savedName);
      setIsLoggedIn(true);
      fetchDriverTrips(savedName);
    } else if (savedName && !savedTenantId) {
      localStorage.removeItem("driverName");
      localStorage.removeItem("token");
    }
  }, []);

  const fetchDriverTrips = async (name: string) => {
    setLoading(true);
    try {
      const res = await deliveryApi.getTrips();
      // Filter trips assigned to this driver and not completed
      const myTrips = res.data.filter(t => t.driverName === name && t.status !== "Completed");
      setTrips(myTrips);
    } catch (err) {
      console.error("Failed to fetch trips", err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode.trim()) return;

    try {
      const res = await fetch('/api/auth/login-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totpCode: totpCode.trim() })
      });

      if (res.ok) {
        const authData = await res.json();
        localStorage.setItem("driverName", authData.userName);
        localStorage.setItem("token", authData.token);
        if (authData.tenant?.id) {
          localStorage.setItem("tenantId", authData.tenant.id);
        }
        setIsLoggedIn(true);
        setDriverName(authData.userName);
        fetchDriverTrips(authData.userName);
      } else {
        alert("الكود غير صحيح أو منتهي الصلاحية.");
      }
    } catch (err) {
      alert("حدث خطأ أثناء الاتصال بالخادم.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("driverName");
    localStorage.removeItem("token");
    localStorage.removeItem("tenantId");
    setIsLoggedIn(false);
    setTrips([]);
    setDriverName("");
    setTotpCode("");
  };

  const openGoogleMaps = (address?: string) => {
    if (!address) return;
    const coordsMatch = address.trim().match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    let mapsUrl: string;
    if (coordsMatch) {
      mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coordsMatch[1]},${coordsMatch[2]}&travelmode=driving&dir_action=navigate`;
    } else {
      mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&travelmode=driving&dir_action=navigate`;
    }
    window.open(mapsUrl, '_blank');
  };

  const completeOrder = async (orderId: string) => {
    try {
      await ordersApi.updateStatus(orderId, "Completed");
      setConfirmingOrderId(null);
      fetchDriverTrips(driverName);
    } catch (err: any) {
      alert(err.response?.data?.message || "فشل تحديث حالة الطلب");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="neo-card bg-brand-yellow w-full max-w-sm p-6 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-neo-border mx-auto mb-4 shadow-[4px_4px_0px_#1A1A1A]">
            <Truck size={32} className="text-brand-blue" />
          </div>
          <h2 className="text-2xl font-black mb-2">تسجيل الدخول للمندوب</h2>
          <p className="text-sm font-bold text-gray-700 mb-6">الدخول باستخدام كود <strong>FoodRMS TOTP</strong></p>

          <form onSubmit={handleManualLogin} className="space-y-4 mt-2">
            <input
              type="text"
              placeholder="أدخل الرمز (6 خانات)..."
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              className="neo-input w-full text-center text-lg font-black dir-ltr"
              required
            />
            <button type="submit" className="neo-btn w-full bg-brand-blue text-white py-3 text-lg">
              دخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Active trip is the first one found (usually only one trip at a time)
  const activeTrip = trips[0];

  return (
    <div className="max-w-md mx-auto space-y-4 pb-20">
      {/* Header */}
      <div className="neo-card bg-brand-blue text-white p-4 flex items-center justify-between">
        <div>
          <h2 className="font-black text-lg flex items-center gap-2"><Truck size={20}/> رحلتي الحالية</h2>
          <p className="text-xs font-bold opacity-80">{driverName}</p>
        </div>
        <button onClick={handleLogout} className="neo-btn bg-white text-brand-red px-3 py-1.5 text-xs">
          خروج
        </button>
      </div>

      <div className="flex justify-between items-center px-2">
        <h3 className="font-black text-gray-700">التوصيل النشط</h3>
        <button onClick={() => fetchDriverTrips(driverName)} className="text-brand-blue font-black text-xs flex items-center gap-1">
          <RefreshCw size={14} /> تحديث
        </button>
      </div>

      {loading ? (
        <div className="text-center font-black animate-pulse py-10">جاري التحميل...</div>
      ) : !activeTrip ? (
        <div className="neo-card bg-gray-50 text-center py-12 border-dashed">
          <Truck size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="font-black text-gray-500">لا توجد رحلات مسندة إليك حالياً</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="neo-card bg-brand-yellow/30 p-4 border-2 border-brand-yellow">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-black text-xl">{activeTrip.tripNumber}</h3>
              <span className="neo-badge bg-white">{activeTrip.orders.length} طلبات</span>
            </div>
            {activeTrip.mapsUrl && (
              <a href={activeTrip.mapsUrl} target="_blank" rel="noreferrer" className="neo-btn w-full bg-brand-blue text-white py-3 flex items-center justify-center gap-2 font-black">
                <Map size={20} /> عرض الرحلة في خرائط جوجل
              </a>
            )}
          </div>

          <h4 className="font-black px-2 mt-4 text-brand-blue">محطات التوصيل ({activeTrip.orders.length})</h4>
          
          {activeTrip.orders.map((order: SuggestedOrderItem, index: number) => {
            const isCompleted = order.status === "Completed" || order.status === "مكتمل";
            return (
              <div key={order.id} className={`neo-card p-0 overflow-hidden ${isCompleted ? 'opacity-60' : ''}`}>
                <div className="bg-gray-100 p-3 border-b-2 border-neo-border flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-brand-blue text-white rounded-full flex items-center justify-center font-black text-xs">
                      {index + 1}
                    </span>
                    <span className="font-black text-lg">#{order.orderNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCompleted && <span className="text-brand-green flex items-center gap-1 text-xs font-bold"><CheckCircle2 size={14}/> تم التوصيل</span>}
                    <span className="neo-badge bg-white">{order.totalAmount} {currencySymbol}</span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <p className="font-black text-lg">{order.customerName}</p>
                    {order.customerAddress && (
                      <div className="text-xs font-bold text-gray-600 flex items-center gap-1 mt-1">
                        <MapPin size={12} />
                        {order.customerAddress}
                      </div>
                    )}
                  </div>
                </div>

                {!isCompleted && (
                  <div className="p-3 border-t-2 border-neo-border bg-gray-50 space-y-2">
                    {confirmingOrderId === order.id ? (
                      <div className="flex gap-2">
                        <button onClick={() => setConfirmingOrderId(null)} className="neo-btn flex-1 bg-white py-2 text-sm">إلغاء</button>
                        <button onClick={() => completeOrder(order.id)} className="neo-btn flex-[2] bg-brand-green text-white py-2 flex items-center justify-center gap-1 text-sm font-black">
                          تأكيد الاستلام والتوصيل
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => openGoogleMaps(order.customerAddress)} disabled={!order.customerAddress} className="neo-btn flex-1 bg-white text-brand-blue disabled:opacity-40">
                          <Navigation size={18} className="mx-auto" />
                        </button>
                        <button onClick={() => setConfirmingOrderId(order.id)} className="neo-btn flex-[3] bg-brand-green text-white font-black py-2">
                          تم توصيل هذا الطلب
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
