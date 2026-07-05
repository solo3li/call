import { useState, useEffect } from "react";
import { Truck, Phone, User, X, RefreshCw, Clock, Map, MapPin } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { deliveryApi, employeesApi } from "../utils/api";
import { SuggestedGroup, DeliveryTrip, Employee } from "../types/api";

function CreateTripModal({ group, onClose, onCreated }: { group: SuggestedGroup; onClose: () => void; onCreated: () => void }) {
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState<Employee[]>([]);

  useEffect(() => {
    employeesApi.getAll().then(res => setDrivers(res.data.filter(e => e.isDelivery))).catch(console.error);
  }, []);

  const handleDriverChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    setDriverName(name);
    const driver = drivers.find(d => d.fullName === name);
    setDriverPhone(driver?.email || ""); // temporary mapping email to phone if available
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="neo-card bg-white p-6 w-full max-w-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-black flex items-center gap-2"><MapPin size={20} className="text-brand-blue" /> تعيين {group.label}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg border-2 border-neo-border">
          <p className="font-bold text-sm">{group.orders.length} طلبات • متوسط {group.avgDistanceKm} كم</p>
        </div>
        <div>
          <label className="block text-xs font-black mb-1">المندوب *</label>
          <select value={driverName} onChange={handleDriverChange} className="neo-input w-full font-bold">
            <option value="">اختر المندوب...</option>
            {drivers.map(d => <option key={d.id} value={d.fullName}>{d.fullName}</option>)}
          </select>
        </div>
        <button onClick={handleCreate} disabled={loading || !driverName} className="neo-btn bg-brand-blue text-white w-full py-2">
          {loading ? "جاري الإنشاء..." : "إنشاء رحلة التوصيل"}
        </button>
      </div>
    </div>
  );
}

export default function DeliveryDashboard() {
  const { refresh } = useDashboard();
  const [suggestedGroups, setSuggestedGroups] = useState<SuggestedGroup[]>([]);
  const [activeTrips, setActiveTrips] = useState<DeliveryTrip[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<SuggestedGroup | null>(null);

  const fetchTrips = async () => {
    try {
      const res = await deliveryApi.getTrips();
      setActiveTrips(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchTrips(); }, []);

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
    setSuggestedGroups([]);
    fetchTrips();
    refresh();
  };

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
    <>
      {selectedGroup && <CreateTripModal group={selectedGroup} onClose={() => setSelectedGroup(null)} onCreated={handleTripCreated} />}
      <div className="neo-card p-5 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-black text-xl flex items-center gap-2"><Truck className="text-brand-blue" /> التوصيل الذكي</h2>
          <button onClick={fetchTrips} className="neo-btn bg-white px-3 py-1 text-sm"><RefreshCw size={14} /> تحديث</button>
        </div>

        <div className="bg-brand-yellow/20 border-2 border-brand-yellow p-4 rounded-xl flex justify-between items-center">
          <div>
            <h3 className="font-black text-lg">الطلبات المعلقة</h3>
            <p className="text-sm text-gray-600 font-bold">استخدم الذكاء الاصطناعي لتجميع الطلبات القريبة</p>
          </div>
          <button onClick={loadSuggestions} disabled={loadingSuggestions} className="neo-btn bg-brand-orange text-white py-2">
            {loadingSuggestions ? "جاري التحليل..." : "🤖 اقتراح مجموعات تلقائي"}
          </button>
        </div>

        {suggestedGroups.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-black">المجموعات المقترحة ({suggestedGroups.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestedGroups.map(group => (
                <div key={group.groupIndex} className="neo-card bg-white p-4 border-dashed border-2">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-black text-lg text-brand-blue">{group.label}</h4>
                    <span className="neo-badge bg-gray-100">{group.orders.length} طلبات</span>
                  </div>
                  <ul className="text-sm font-bold text-gray-600 mb-4 space-y-1">
                    {group.orders.map(o => <li key={o.id}>• {o.orderNumber} - {o.customerName}</li>)}
                  </ul>
                  <button onClick={() => setSelectedGroup(group)} className="neo-btn bg-brand-green text-white w-full py-1.5 text-sm">
                    تعيين لمندوب
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3 pt-4 border-t-2 border-neo-border">
          <h3 className="font-black flex items-center gap-2"><Map size={18} /> الرحلات النشطة ({activeTrips.length})</h3>
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
          {activeTrips.length === 0 && <p className="text-center text-gray-500 font-bold py-8">لا توجد رحلات نشطة</p>}
        </div>
      </div>
    </>
  );
}
