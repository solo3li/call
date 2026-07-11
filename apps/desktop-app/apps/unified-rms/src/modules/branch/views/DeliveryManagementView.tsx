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
    <div className="bg-carbon-layer border border-carbon-border p-5 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-xl flex items-center gap-2">
          <Truck className="text-carbon-blue" /> إدارة التوصيل
        </h2>
        <button onClick={fetchTrips} disabled={loading} className="px-4 py-2 text-sm font-medium transition-colors bg-carbon-layer text-carbon-text border border-carbon-border hover:bg-carbon-layerHover px-3 py-1 text-sm flex items-center gap-1 disabled:opacity-50">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> تحديث
        </button>
      </div>

      <div className="space-y-3 pt-4 border-t-2 border-carbon-border">
        <h3 className="font-semibold flex items-center gap-2">
          <Map size={18} /> الرحلات النشطة ({activeTrips.length})
        </h3>
        
        {loading && activeTrips.length === 0 ? (
          <div className="text-center font-semibold animate-pulse py-10">جاري التحميل...</div>
        ) : activeTrips.length === 0 ? (
          <p className="text-center text-carbon-textSecondary font-medium py-8">لا توجد رحلات نشطة</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTrips.map(trip => (
              <div key={trip.id} className="bg-carbon-layer border border-carbon-border bg-[#edf5ff] text-[#0f62fe]/5 p-4 border-2 border-brand-blue">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-lg">{trip.tripNumber}</h4>
                  <span className="px-2 py-1 text-xs font-medium bg-[#edf5ff] text-[#0f62fe] text-white text-xs">{trip.status}</span>
                </div>
                <div className="flex items-center gap-2 mb-3 bg-white p-2 rounded-sm border border-carbon-border">
                  <User size={16} className="text-carbon-blue" />
                  <span className="font-semibold">{trip.driverName}</span>
                </div>
                <p className="text-sm font-medium text-carbon-textSecondary mb-3">{trip.orders.length} طلبات</p>
                <div className="flex gap-2">
                  {trip.mapsUrl && (
                    <a href={trip.mapsUrl} target="_blank" rel="noreferrer" className="px-4 py-2 text-sm font-medium transition-colors bg-carbon-blue text-white hover:bg-carbon-blueHover flex-1 bg-white text-carbon-blue text-sm py-1.5 text-center flex justify-center items-center gap-1">
                      <Map size={14} /> خريطة
                    </a>
                  )}
                  <button onClick={() => completeTrip(trip.id)} className="px-4 py-2 text-sm font-medium transition-colors bg-carbon-blue text-white hover:bg-carbon-blueHover flex-1 bg-[#fcf4d6] text-[#b47a00] text-white text-sm py-1.5">
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
