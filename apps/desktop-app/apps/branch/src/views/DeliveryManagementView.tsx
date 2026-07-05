import { useState, useEffect } from "react";
import { Truck, User, Map, RefreshCw } from "lucide-react";
import { deliveryApi } from "../utils/api";
import { DeliveryTrip } from "../types/api";

export default function DeliveryManagementView() {
  const [activeTrips, setActiveTrips] = useState<DeliveryTrip[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await deliveryApi.getTrips();
      setActiveTrips(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const completeTrip = async (tripId: string) => {
    if (!confirm("هل أنت متأكد من إنهاء الرحلة؟")) return;
    try {
      await deliveryApi.updateTripStatus(tripId, "Completed");
      fetchTrips();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="neo-card p-5 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-black text-xl flex items-center gap-2">
          <Truck className="text-brand-blue" /> إدارة التوصيل
        </h2>
        <button onClick={fetchTrips} disabled={loading} className="neo-btn bg-white px-3 py-1 text-sm flex items-center gap-1 disabled:opacity-50">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> تحديث
        </button>
      </div>

      <div className="space-y-3 pt-4 border-t-2 border-neo-border">
        <h3 className="font-black flex items-center gap-2">
          <Map size={18} /> الرحلات النشطة ({activeTrips.length})
        </h3>
        
        {loading && activeTrips.length === 0 ? (
          <div className="text-center font-black animate-pulse py-10">جاري التحميل...</div>
        ) : activeTrips.length === 0 ? (
          <p className="text-center text-gray-500 font-bold py-8">لا توجد رحلات نشطة</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTrips.map(trip => (
              <div key={trip.id} className="neo-card bg-brand-blue/5 p-4 border-2 border-brand-blue">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-black text-lg">{trip.tripNumber}</h4>
                  <span className="neo-badge bg-brand-blue text-white text-xs">{trip.status}</span>
                </div>
                <div className="flex items-center gap-2 mb-3 bg-white p-2 rounded-lg border-2 border-neo-border">
                  <User size={16} className="text-brand-blue" />
                  <span className="font-black">{trip.driverName}</span>
                </div>
                <p className="text-sm font-bold text-gray-600 mb-3">{trip.orders.length} طلبات</p>
                <div className="flex gap-2">
                  {trip.mapsUrl && (
                    <a href={trip.mapsUrl} target="_blank" rel="noreferrer" className="neo-btn flex-1 bg-white text-brand-blue text-sm py-1.5 text-center flex justify-center items-center gap-1">
                      <Map size={14} /> خريطة
                    </a>
                  )}
                  <button onClick={() => completeTrip(trip.id)} className="neo-btn flex-1 bg-brand-orange text-white text-sm py-1.5">
                    إنهاء
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
