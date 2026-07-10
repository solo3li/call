import { useFormatCurrency } from "../utils/useFormatCurrency";
import { useState, useEffect, useMemo, useRef } from "react";
import { 
  Users, Plus, Star, Trash2, ShieldCheck, CalendarDays, 
  ShoppingBag, UserCheck, UtensilsCrossed, Store, MapPin, ChefHat,
  Clock, CheckCircle2, XCircle, ChevronRight, Filter, Mail, RefreshCw, Check,
  Settings, Save, Bell, ThumbsUp, MessageSquare, QrCode, X, Share2, ExternalLink, Tag, Edit3, Eye, History, Search, Truck
} from "lucide-react";
import { staffApi, menuApi, branchesApi, ordersApi, dashboardApi, telegramBotApi, getImageUrl, deliveryApi, employeesApi, rolesApi, departmentsApi, currenciesApi, tenantSettingsApi, kitchenStationsApi } from "../utils/api";
import { Staff, MenuCategory, MenuItem, Branch, Order, DeliveryZone, Employee, Role, Department, Currency, KitchenStation } from "../types/api";
import { QRCodeSVG } from 'qrcode.react';
import { EmployeeQrModal } from '../components/EmployeeQrModal';



function StatusPill({ label, color }: { label: string; color: string }) {
  return <span className={`neo-badge ${color}`}>{label}</span>;
}

// --- BRANCHES PAGE ---
export function BranchesPage() {
  const formatCurrency = useFormatCurrency();
  const [apiBranches, setApiBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: "", address: "", status: "Open" });
  const [shareBranch, setShareBranch] = useState<Branch | null>(null);

  const fetchBranches = () => {
    setLoading(true);
    branchesApi.getAll().then(res => {
      setApiBranches(res.data || []);
      setLoading(false);
    }).catch(err => {
      console.error("Error fetching branches", err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const displayBranches = useMemo(() => {
    return apiBranches;
  }, [apiBranches]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await branchesApi.create(newBranch);
      setShowAddForm(false);
      setNewBranch({ name: "", address: "", status: "Open" });
      fetchBranches();
    } catch (err) {
      alert("فشل الإضافة. يرجى المحاولة مرة أخرى.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف الفرع؟")) {
      try {
        await branchesApi.delete(id);
        fetchBranches();
      } catch (err) {
        alert("فشل الحذف. يرجى المحاولة مرة أخرى.");
      }
    }
  };

  const tenantId = typeof window !== 'undefined' && typeof localStorage !== 'undefined' ? localStorage.getItem('tenantId') : null;
  const getShareUrl = (bId: string) => `${typeof window !== 'undefined' ? window.location.origin : ''}/menu/public/${tenantId}/${bId}`;

  if (loading) return <div className="p-20 text-center font-black text-2xl animate-pulse">جاري تحميل الفروع... 🏪</div>;

  return (
    <div className="space-y-6">
      <div className={`bg-brand-blue neo-card p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
        <div className="flex items-center gap-4">
          <div className="neo-card-flat bg-white p-3">
            <Store size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black">إدارة الفروع</h2>
            <p className="font-bold text-neo-text/70">راقب أداء كل فرع، حالة التشغيل، ومناطق التوصيل</p>
          </div>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="neo-btn bg-white px-5 py-2.5 flex items-center justify-center gap-2">
          <Plus size={18} />
          <span>فرع جديد</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="neo-card p-5 bg-[#FFFBEB] flex flex-col gap-4 animate-fade-in">
          <h3 className="font-black text-lg">إضافة فرع جديد</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input required type="text" placeholder="اسم الفرع" className="neo-input" value={newBranch.name} onChange={e => setNewBranch({...newBranch, name: e.target.value})} />
            <input required type="text" placeholder="العنوان" className="neo-input" value={newBranch.address} onChange={e => setNewBranch({...newBranch, address: e.target.value})} />
            <select className="neo-input" value={newBranch.status} onChange={e => setNewBranch({...newBranch, status: e.target.value})}>
              <option value="Open">مفتوح</option>
              <option value="Closed">مغلق</option>
            </select>
          </div>
          <button type="submit" className="neo-btn bg-brand-green py-3 mt-2">حفظ الفرع</button>
        </form>
      )}

      {shareBranch && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShareBranch(null)}>
          <div 
            
            
            className="bg-white neo-card p-8 max-w-sm w-full text-center space-y-6"
            onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <button onClick={() => setShareBranch(null)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={24} />
              </button>
              <h3 className="text-xl font-black">مشاركة المنيو 📱</h3>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-3xl flex flex-col items-center gap-4 border-2 border-neo-border">
              <QRCodeSVG value={getShareUrl(shareBranch.id)} size={200} className="rounded-xl" />
              <p className="text-sm font-bold text-slate-500">امسح الكود لعرض منيو {shareBranch.name}</p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(getShareUrl(shareBranch.id));
                  alert('تم نسخ الرابط بنجاح! ✅');
                }}
                className="w-full neo-btn bg-brand-green py-3 flex items-center justify-center gap-2">
                <Share2 size={18} />
                <span>نسخ رابط المنيو</span>
              </button>
              <a 
                href={getShareUrl(shareBranch.id)} 
                target="_blank" 
                className="w-full neo-btn bg-white py-3 flex items-center justify-center gap-2">
                <ExternalLink size={18} />
                <span>معاينة كعميل</span>
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="neo-card bg-white p-0 overflow-hidden overflow-x-auto border-4 border-neo-border rounded-none shadow-[4px_4px_0px_#1A1A1A]">
        <table className="w-full text-right border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-brand-blue/10 border-b-2 border-neo-border text-[10px]">
              <th className="px-2 py-1.5 font-black text-neo-text border-l border-neo-border w-48">الفرع / العنوان</th>
              <th className="px-2 py-1.5 font-black text-neo-text border-l border-neo-border w-20">الحالة</th>
              <th className="px-2 py-1.5 font-black text-neo-text border-l border-neo-border w-16 text-center">طلبات</th>
              <th className="px-2 py-1.5 font-black text-neo-text border-l border-neo-border w-24">إيرادات</th>
              <th className="px-2 py-1.5 font-black text-neo-text border-l border-neo-border w-16 text-center">تقييم</th>
              <th className="px-2 py-1.5 font-black text-neo-text border-l border-neo-border">مناطق التوصيل</th>
              <th className="px-2 py-1.5 font-black text-neo-text text-center w-20">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neo-border bg-white text-xs">
            {displayBranches.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center bg-gray-50">
                  <p className="font-black text-[10px] text-gray-500">لا توجد فروع</p>
                </td>
              </tr>
            ) : (
              displayBranches.map(branch => (
                <tr key={branch.id} className="hover:bg-brand-blue/5 transition-colors">
                  <td className="border-l border-neo-border px-2 py-1.5 align-top">
                    <div className="font-black text-[11px] flex items-center gap-1">
                      <MapPin size={10} className="text-brand-blue" />
                      {branch.name}
                    </div>
                    <div className="text-[9px] font-bold text-gray-500 mt-0.5 max-w-[150px] truncate">{branch.address}</div>
                  </td>
                  <td className="border-l border-neo-border px-2 py-1.5 align-top">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-none border border-neo-border shadow-sm block w-max ${branch.status === "Open" ? "bg-brand-green text-white" : "bg-brand-red text-white"}`}>
                      {branch.status === "Open" ? "مفتوح" : "مغلق"}
                    </span>
                  </td>
                  <td className="border-l border-neo-border px-2 py-1.5 align-top text-center font-black">{branch.ordersCount}</td>
                  <td className="border-l border-neo-border px-2 py-1.5 align-top font-black text-brand-green">{formatCurrency(branch.revenue)}</td>
                  <td className="border-l border-neo-border px-2 py-1.5 align-top text-center font-black">
                    <div className="flex items-center justify-center gap-0.5">
                      {branch.rating} <Star size={10} className="text-brand-orange fill-brand-orange" />
                    </div>
                  </td>
                  <td className="border-l border-neo-border px-2 py-1.5 align-top">
                    <DeliveryZoneManager branchId={branch.id} />
                  </td>
                  <td className="px-2 py-1.5 align-top text-center">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => setShareBranch(branch)} className="p-1 bg-brand-yellow text-neo-text border border-neo-border shadow-sm hover:translate-y-px transition-all" title="مشاركة المنيو">
                        <QrCode size={12} strokeWidth={3} />
                      </button>
                      <button onClick={() => handleDelete(branch.id)} className="p-1 bg-brand-red text-white border border-neo-border shadow-sm hover:translate-y-px transition-all" title="حذف الفرع">
                        <Trash2 size={12} strokeWidth={3} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- ZONE MAP MODAL ---
function ZoneMapModal({ onSave, onClose }: { onSave: (coords: string) => void; onClose: () => void }) {
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const leafletMapRef = useRef<any>(null);
  const polygonLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    // Dynamically load Leaflet CSS
    const existingCss = document.getElementById('leaflet-css');
    if (!existingCss) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Dynamically load Leaflet JS
    const loadLeaflet = () => {
      return new Promise<void>((resolve, reject) => {
        if ((window as any).L) { resolve(); return; }
        const existingScript = document.getElementById('leaflet-js');
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve());
          existingScript.addEventListener('error', () => reject());
          return;
        }
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve();
        script.onerror = () => reject();
        document.head.appendChild(script);
      });
    };

    loadLeaflet().then(() => {
      const L = (window as any).L;
      const mapDiv = document.getElementById('zone-map');
      if (!mapDiv || leafletMapRef.current) return;

      // Initialize map centered on Riyadh
      const map = L.map('zone-map').setView([24.7136, 46.6753], 12);
      leafletMapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '\u00a9 OpenStreetMap contributors'
      }).addTo(map);

      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        const newPoint: [number, number] = [lat, lng];

        // Add marker
        const marker = L.marker([lat, lng]).addTo(map);
        marker.bindPopup(`${lat.toFixed(5)}, ${lng.toFixed(5)}`).openPopup();
        markersRef.current.push(marker);

        setPolygonPoints(prev => {
          const updated = [...prev, newPoint];
          // Remove old polygon layer and redraw
          if (polygonLayerRef.current) map.removeLayer(polygonLayerRef.current);
          if (updated.length >= 3) {
            const poly = L.polygon(updated, { color: '#FF6B35', weight: 2, fillOpacity: 0.2 }).addTo(map);
            polygonLayerRef.current = poly;
          }
          return updated;
        });
      });
    }).catch(() => console.error('Failed to load Leaflet'));

    return () => {
      // Cleanup map on unmount
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearAll = () => {
    const map = leafletMapRef.current;
    if (map) {
      markersRef.current.forEach((m: any) => map.removeLayer(m));
      markersRef.current = [];
      if (polygonLayerRef.current) {
        map.removeLayer(polygonLayerRef.current);
        polygonLayerRef.current = null;
      }
    }
    setPolygonPoints([]);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const map = leafletMapRef.current;
        if (map) {
          map.setView([parseFloat(lat), parseFloat(lon)], 14);
        }
      } else {
        alert('لم يتم العثور على نتائج لهذه المنطقة');
      }
    } catch (error) {
      console.error('Search failed', error);
      alert('حدث خطأ أثناء البحث');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = () => {
    if (polygonPoints.length < 3) {
      alert('يرجى إضافة 3 نقاط على الأقل لتحديد المنطقة');
      return;
    }
    onSave(JSON.stringify(polygonPoints));
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70">
      <div className="bg-white border-4 border-neo-border shadow-[8px_8px_0px_#1A1A1A] rounded-xl w-full max-w-3xl mx-4 overflow-hidden flex flex-col" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="bg-brand-yellow p-4 border-b-4 border-neo-border flex items-center justify-between">
          <div>
            <h3 className="font-black text-xl">🗺️ تحديد منطقة التوصيل</h3>
            <p className="text-xs font-bold text-gray-700 mt-0.5">انقر على الخريطة لإضافة نقاط المنطقة</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="neo-badge bg-brand-orange text-white">
              {polygonPoints.length} نقاط مضافة
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="bg-white p-2 border-b-4 border-neo-border flex gap-2">
          <input 
            type="text" 
            placeholder="ابحث عن مدينة، حي، أو شارع..." 
            className="neo-input flex-1 py-2 px-3 text-sm font-bold border-2 border-neo-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={isSearching}
            className="neo-btn bg-brand-blue text-white px-4 py-2 text-sm font-black disabled:opacity-50"
          >
            {isSearching ? 'جاري البحث...' : 'بحث 🔍'}
          </button>
        </form>

        {/* Map */}
        <div id="zone-map" style={{ height: '450px', width: '100%' }} />

        {/* Footer */}
        <div className="p-4 border-t-4 border-neo-border bg-gray-50 flex gap-2 justify-between">
          <button
            type="button"
            onClick={clearAll}
            className="neo-btn bg-white text-brand-red border-2 border-neo-border px-4 py-2 text-sm font-black"
          >
            مسح الكل
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="neo-btn bg-white border-2 border-neo-border px-4 py-2 text-sm font-black"
            >
              إغلاق
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="neo-btn bg-brand-green text-white border-2 border-neo-border px-4 py-2 text-sm font-black"
            >
              حفظ المنطقة ✅
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeliveryZoneManager({ branchId }: { branchId: string }) {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [newZone, setNewZone] = useState({ name: '', deliveryCost: 0, coordinates: '' });
  const [showMapModal, setShowMapModal] = useState(false);
  const [zoneSearchQuery, setZoneSearchQuery] = useState('');
  const formatCurrency = useFormatCurrency();

  useEffect(() => {
    deliveryApi.getZones(branchId).then(res => {
      setZones(res.data);
      setLoading(false);
    });
  }, [branchId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await deliveryApi.createZone({ ...newZone, branchId });
      setZones([...zones, res.data]);
      setNewZone({ name: '', deliveryCost: 0, coordinates: '' });
    } catch (err) {
      alert('فشل إضافة المنطقة');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('حذف هذه المنطقة؟')) {
      try {
        await deliveryApi.deleteZone(id);
        setZones(zones.filter(z => z.id !== id));
      } catch (err) {
        alert('فشل الحذف');
      }
    }
  };

  const getCoordCount = (coords?: string) => {
    if (!coords) return 0;
    try { return (JSON.parse(coords) as any[]).length; } catch { return 0; }
  };

  const filteredZones = zones.filter(z => z.name.toLowerCase().includes(zoneSearchQuery.toLowerCase()));

  return (
    <div className="space-y-4">
      {showMapModal && (
        <ZoneMapModal
          onSave={(coords) => {
            setNewZone(prev => ({ ...prev, coordinates: coords }));
            setShowMapModal(false);
          }}
          onClose={() => setShowMapModal(false)}
        />
      )}

      {/* Add Zone Form & Search Header */}
      <div className="bg-[#FFFBEB] p-4 border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] space-y-4">
        <form onSubmit={handleAdd} className="space-y-3">
          <p className="text-sm font-black text-neo-text flex items-center gap-2">
            <Plus size={18} className="text-brand-green" /> إضافة منطقة توصيل جديدة
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input required type="text" placeholder="اسم المنطقة" className="neo-input flex-1 py-2 px-3 text-sm font-bold" value={newZone.name} onChange={e => setNewZone({...newZone, name: e.target.value})} />
            <input required type="number" placeholder="رسوم التوصيل" className="neo-input w-full sm:w-32 py-2 px-3 text-sm font-bold" value={newZone.deliveryCost || ''} onChange={e => setNewZone({...newZone, deliveryCost: parseFloat(e.target.value) || 0})} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMapModal(true)}
                className="neo-btn bg-brand-yellow border-2 border-neo-border px-4 py-2 text-sm font-black shadow-[1px_1px_0px_#1A1A1A] hover:-translate-y-[1px]"
              >
                تحديد على الخريطة 🗺️
              </button>
              {newZone.coordinates && (
                <span className="text-xs font-black text-brand-green bg-brand-green/10 px-2 py-1 border border-brand-green/30">
                  ✅ تم تحديد {getCoordCount(newZone.coordinates)} نقطة
                </span>
              )}
            </div>
            <button type="submit" className="neo-btn bg-brand-green text-white px-6 py-2 text-sm font-black border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] hover:-translate-y-[1px]">حفظ المنطقة</button>
          </div>
        </form>

        {zones.length > 0 && (
          <div className="pt-3 border-t-2 border-dashed border-neo-border">
            <input 
              type="text" 
              placeholder="🔍 ابحث عن منطقة توصيل..." 
              className="neo-input w-full py-2 px-3 text-sm font-bold border-2 border-neo-border"
              value={zoneSearchQuery}
              onChange={e => setZoneSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Zones List */}
      <div className="space-y-2">
        {/* List Header */}
        {!loading && filteredZones.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 bg-brand-yellow border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A]">
            <span className="w-7 shrink-0" />
            <span className="w-9 shrink-0" />
            <span className="flex-1 text-[10px] font-black text-neo-text uppercase tracking-widest">اسم المنطقة</span>
            <span className="hidden sm:block text-[10px] font-black text-neo-text uppercase tracking-widest w-24 text-center">الإحداثيات</span>
            <span className="text-[10px] font-black text-neo-text uppercase tracking-widest w-20 text-center">رسوم التوصيل</span>
            <span className="w-8 shrink-0" />
          </div>
        )}

        {loading && (
          <div className="text-center py-6 text-sm font-black text-gray-400 animate-pulse">
            جاري التحميل...
          </div>
        )}

        {!loading && filteredZones.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 gap-3 border-2 border-dashed border-neo-border bg-white/50">
            <MapPin size={32} className="text-gray-300" />
            <p className="text-sm font-black text-gray-400">لا توجد مناطق توصيل مسجلة لهذا الفرع</p>
          </div>
        )}

        {filteredZones.map((z, idx) => (
          <div
            key={z.id}
            className="flex items-center gap-3 bg-white border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] px-4 py-3 hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_#1A1A1A] transition-all group"
          >
            {/* Row Number */}
            <span className="w-7 h-7 rounded-full bg-brand-orange/10 border-2 border-brand-orange flex items-center justify-center text-[11px] font-black text-brand-orange shrink-0">
              {idx + 1}
            </span>

            {/* Zone Icon */}
            <div className="w-9 h-9 bg-[#FFFBEB] border-2 border-neo-border flex items-center justify-center shrink-0">
              <MapPin size={16} className="text-brand-orange" />
            </div>

            {/* Zone Name */}
            <span className="flex-1 font-black text-sm text-neo-text truncate">{z.name}</span>

            {/* Coordinates pill */}
            <span className={`hidden sm:inline-flex items-center gap-1 text-[11px] font-black w-24 justify-center shrink-0 ${z.coordinates ? 'text-brand-blue bg-brand-blue/10 border border-brand-blue/30 px-2 py-0.5 rounded-full' : 'text-gray-300'}`}>
              {z.coordinates ? <>🗺️ {getCoordCount(z.coordinates)} نقطة</> : '—'}
            </span>

            {/* Cost Badge */}
            <span className="font-black text-sm text-white bg-brand-green border-2 border-neo-border shadow-[1px_1px_0px_#1A1A1A] px-3 py-1 shrink-0 w-20 text-center">
              {formatCurrency(z.deliveryCost)}
            </span>

            {/* Delete Button */}
            <button
              onClick={() => handleDelete(z.id)}
              className="w-8 h-8 flex items-center justify-center bg-red-50 border-2 border-neo-border text-brand-red hover:bg-brand-red hover:text-white shadow-[1px_1px_0px_#1A1A1A] hover:shadow-none transition-all shrink-0"
              title="حذف المنطقة"
            >
              <XCircle size={15} strokeWidth={2.5} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


// --- KITCHEN STATIONS PAGE ---
export function KitchenStationsPage() {
  const [stations, setStations] = useState<KitchenStation[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStation, setNewStation] = useState({ name: "", branchId: "" });
  const [editingStation, setEditingStation] = useState<KitchenStation | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stRes, brRes] = await Promise.all([
        kitchenStationsApi.getAll(),
        branchesApi.getAll()
      ]);
      setStations(stRes.data);
      setBranches(brRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: newStation.name || editingStation?.name,
        branchId: (newStation.branchId || editingStation?.branchId) || null
      };
      
      if (editingStation) {
        await kitchenStationsApi.update(editingStation.id, payload as KitchenStation);
        setEditingStation(null);
      } else {
        await kitchenStationsApi.create(payload as KitchenStation);
        setShowAddForm(false);
      }
      setNewStation({ name: "", branchId: "" });
      fetchData();
    } catch (err) {
      alert("فشل الحفظ");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف محطة المطبخ؟")) {
      try {
        await kitchenStationsApi.delete(id);
        fetchData();
      } catch (err) {
        alert("فشل الحذف");
      }
    }
  };

  if (loading) return <div className="p-20 text-center font-black text-2xl animate-pulse">جاري تحميل المحطات... 🍳</div>;

  return (
    <div className="space-y-6">
      <div className={`bg-brand-red text-white neo-card p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
        <div className="flex items-center gap-4">
          <div className="neo-card-flat bg-white text-brand-red p-3">
            <ChefHat size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black">إدارة محطات المطبخ</h2>
            <p className="font-bold text-white/80">أضف محطات التحضير وخصصها للفروع لتقسيم الطلبات</p>
          </div>
        </div>
        <button onClick={() => { setShowAddForm(!showAddForm); setEditingStation(null); }} className="neo-btn bg-white text-brand-red px-5 py-2.5 flex items-center justify-center gap-2">
          <Plus size={18} />
          <span>محطة جديدة</span>
        </button>
      </div>

      {(showAddForm || editingStation) && (
        <form onSubmit={handleSave} className="neo-card p-5 bg-[#FFFBEB] flex flex-col gap-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-lg">{editingStation ? "تعديل المحطة" : "إضافة محطة جديدة"}</h3>
            {editingStation && <button type="button" onClick={() => setEditingStation(null)} className="p-1 hover:bg-black/5 rounded-full"><X size={20} /></button>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input required type="text" placeholder="اسم المحطة (مثال: شواية، بيتزا، مشروبات)" className="neo-input" 
              value={editingStation ? editingStation.name : newStation.name} 
              onChange={e => editingStation ? setEditingStation({...editingStation, name: e.target.value}) : setNewStation({...newStation, name: e.target.value})} />
            
            <select className="neo-input" 
              value={editingStation ? (editingStation.branchId || '') : newStation.branchId} 
              onChange={e => editingStation ? setEditingStation({...editingStation, branchId: e.target.value}) : setNewStation({...newStation, branchId: e.target.value})}>
                <option value="">كل الفروع (عام)</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <button type="submit" className="neo-btn bg-brand-red text-white py-3 mt-2">
            {editingStation ? "تحديث المحطة" : "حفظ المحطة"}
          </button>
        </form>
      )}

      <div className="neo-card p-0 bg-white overflow-hidden border-4 border-neo-border shadow-[4px_4px_0px_#1A1A1A]">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-brand-red/10 border-b-2 border-neo-border text-[10px]">
              <th className="px-2 py-1.5 font-black text-neo-text border-l border-neo-border">اسم المحطة</th>
              <th className="px-2 py-1.5 font-black text-neo-text border-l border-neo-border w-48">الفرع التابع</th>
              <th className="px-2 py-1.5 font-black text-neo-text text-center w-20">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neo-border text-xs">
            {stations.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-4 text-center bg-gray-50 font-black text-[10px] text-gray-500">لا توجد محطات</td>
              </tr>
            ) : (
              stations.map(station => {
                const branchName = branches.find(b => b.id === station.branchId)?.name || "عام لجميع الفروع";
                return (
                  <tr key={station.id} className="hover:bg-brand-red/5 transition-colors">
                    <td className="px-2 py-1.5 border-l border-neo-border align-middle font-black flex items-center gap-2">
                      <ChefHat size={14} className="text-brand-red" />
                      {station.name}
                    </td>
                    <td className="px-2 py-1.5 border-l border-neo-border align-middle">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 border border-neo-border ${station.branchId ? 'bg-brand-blue/10 text-brand-blue' : 'bg-brand-yellow/30'}`}>
                        {branchName}
                      </span>
                    </td>
                    <td className="px-1 py-1.5 align-middle text-center">
                      <div className="flex gap-1 justify-center">
                        <button onClick={() => setEditingStation(station)} className="p-1 bg-brand-yellow text-neo-text border border-neo-border shadow-sm hover:translate-y-px transition-all">
                          <Edit3 size={12} strokeWidth={3} />
                        </button>
                        <button onClick={() => handleDelete(station.id)} className="p-1 bg-brand-red text-white border border-neo-border shadow-sm hover:translate-y-px transition-all">
                          <Trash2 size={12} strokeWidth={3} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// --- MENU PAGE ---

export function MenuPage() {
  const formatCurrency = useFormatCurrency();
  const [apiItems, setApiItems] = useState<MenuItem[]>([]);
  const [apiCategories, setApiCategories] = useState<MenuCategory[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [stations, setStations] = useState<KitchenStation[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | "الكل">("الكل");
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", description: "", price: 0, categoryId: 0, branchId: "", imageUrl: "", kitchenStationId: 0 });
  const [newCat, setNewCat] = useState({ name: "", icon: "🍔", imageUrl: "" });
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCat, setEditingCat] = useState<MenuCategory | null>(null);
  const [catUploading, setCatUploading] = useState(false);
  const [itemUploading, setItemUploading] = useState(false);

  const handleCatImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCatUploading(true);
    try {
      const res = await menuApi.uploadImage(file);
      if (editingCat) {
        setEditingCat(prev => prev ? { ...prev, imageUrl: res.data.url } : null);
      } else {
        setNewCat(prev => ({ ...prev, imageUrl: res.data.url }));
      }
    } catch (err) {
      alert("فشل رفع الصورة. يرجى المحاولة مرة أخرى.");
      console.error(err);
    } finally {
      setCatUploading(false);
    }
  };

  const handleItemImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setItemUploading(true);
    try {
      const res = await menuApi.uploadImage(file);
      if (editingItem) {
        setEditingItem(prev => prev ? { ...prev, imageUrl: res.data.url } : null);
      } else {
        setNewItem(prev => ({ ...prev, imageUrl: res.data.url }));
      }
    } catch (err) {
      alert("فشل رفع الصورة. يرجى المحاولة مرة أخرى.");
      console.error(err);
    } finally {
      setItemUploading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, categoriesRes, branchesRes, stationsRes] = await Promise.all([
        menuApi.getItems().catch(() => ({ data: [] })),
        menuApi.getCategories().catch(() => ({ data: [] })),
        branchesApi.getAll().catch(() => ({ data: [] })),
        kitchenStationsApi.getAll().catch(() => ({ data: [] }))
      ]);
      setApiItems(itemsRes.data || []);
      setApiCategories(categoriesRes.data || []);
      setBranches(branchesRes.data || []);
      setStations(stationsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = editingItem || newItem;
    if (data.categoryId === 0) {
      alert("يرجى اختيار الفئة");
      return;
    }
    try {
      if (editingItem) {
        await menuApi.updateItem(editingItem.id, editingItem);
        setEditingItem(null);
      } else {
        await menuApi.createItem({
          ...newItem,
          branchId: newItem.branchId || null,
          kitchenStationId: newItem.kitchenStationId || null
        });
        setShowAddForm(false);
        setNewItem({ name: "", description: "", price: 0, categoryId: 0, branchId: "", imageUrl: "", kitchenStationId: 0 });
      }
      fetchData();
    } catch (err) {
      alert("فشل العملية. يرجى المحاولة مرة أخرى.");
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await menuApi.updateCategory(editingCat.id, editingCat);
        setEditingCat(null);
      } else {
        await menuApi.createCategory(newCat);
        setShowCatForm(false);
        setNewCat({ name: "", icon: "🍔", imageUrl: "" });
      }
      fetchData();
    } catch (err) {
      alert("فشل العملية.");
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الصنف؟")) {
      try {
        await menuApi.deleteItem(id);
        fetchData();
      } catch (err) {
        alert("فشل الحذف. يرجى المحاولة مرة أخرى.");
      }
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm("حذف الفئة سيؤدي لحذف جميع أصنافها. هل أنت متأكد؟")) {
      try {
        await menuApi.deleteCategory(id);
        fetchData();
      } catch (err) {
        alert("فشل حذف الفئة.");
      }
    }
  };

  const filteredMenu = activeCategory === "الكل" ? apiItems : apiItems.filter((item) => item.categoryId === activeCategory);

  if (loading) return <div className="p-20 text-center font-black text-2xl animate-pulse">جاري تحميل القائمة... ☕</div>;

  return (
    <div className="space-y-6">
      <div className={`bg-brand-green neo-card p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
        <div className="flex items-center gap-4">
          <div className="neo-card-flat bg-white p-3">
            <UtensilsCrossed size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black">قائمة الطعام</h2>
            <p className="font-bold text-neo-text/70">إدارة الأصناف، الأسعار، التوفر، وربحية كل منتج</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCatForm(!showCatForm)} className="neo-btn bg-brand-yellow px-5 py-2.5 flex items-center justify-center gap-2">
            <Tag size={18} />
            <span>إضافة فئة</span>
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)} className="neo-btn bg-white px-5 py-2.5 flex items-center justify-center gap-2">
            <Plus size={18} />
            <span>إضافة صنف</span>
          </button>
        </div>
      </div>

      {(showCatForm || editingCat) && (
        <form onSubmit={handleAddCategory} className="neo-card p-5 bg-brand-yellow/10 flex flex-col gap-4 animate-fade-in border-brand-yellow">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-lg">{editingCat ? "تعديل الفئة" : "إضافة فئة جديدة"}</h3>
            {editingCat && <button type="button" onClick={() => setEditingCat(null)} className="p-1 hover:bg-black/5 rounded-full"><X size={20} /></button>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <input required type="text" placeholder="اسم الفئة (مثلاً: برجر، بيتزا)" className="neo-input" 
              value={editingCat ? editingCat.name : newCat.name} 
              onChange={e => editingCat ? setEditingCat({...editingCat, name: e.target.value}) : setNewCat({...newCat, name: e.target.value})} />
            <input required type="text" placeholder="أيقونة الفئة (ايموجي)" className="neo-input text-center text-2xl" 
              value={editingCat ? editingCat.icon : newCat.icon} 
              onChange={e => editingCat ? setEditingCat({...editingCat, icon: e.target.value}) : setNewCat({...newCat, icon: e.target.value})} />
            <div className="flex flex-col gap-1">
              {(editingCat ? editingCat.imageUrl : newCat.imageUrl) && (
                <div className="w-20 h-20 rounded-xl border-2 border-neo-border overflow-hidden mb-2 shadow-[2px_2px_0px_#1A1A1A]">
                  <img src={getImageUrl(editingCat ? editingCat.imageUrl : newCat.imageUrl)} className="w-full h-full object-cover" alt="Preview" />
                </div>
              )}
              <input type="text" placeholder="رابط صورة الفئة" className="neo-input" 
                value={editingCat ? (editingCat.imageUrl || '') : newCat.imageUrl} 
                onChange={e => editingCat ? setEditingCat({...editingCat, imageUrl: e.target.value}) : setNewCat({...newCat, imageUrl: e.target.value})} />
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 font-bold">أو تحميل:</span>
                <input type="file" accept="image/*" onChange={handleCatImageUpload} className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-2 file:border-neo-border file:bg-brand-yellow file:text-xs file:font-black file:shadow-[1px_1px_0px_#1A1A1A] cursor-pointer" />
                {catUploading && <span className="text-xs text-brand-yellow font-bold animate-pulse">جاري الرفع...</span>}
              </div>
            </div>
          </div>
          <button type="submit" disabled={catUploading} className="neo-btn bg-brand-yellow py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {catUploading ? "جاري رفع الصورة..." : (editingCat ? "تحديث الفئة" : "حفظ الفئة")}
          </button>
        </form>
      )}

      {(showAddForm || editingItem) && (
        <form onSubmit={handleAddItem} className="neo-card p-5 bg-[#FFFBEB] flex flex-col gap-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-lg">{editingItem ? "تعديل الصنف" : "إضافة صنف جديد"}</h3>
            {editingItem && <button type="button" onClick={() => setEditingItem(null)} className="p-1 hover:bg-black/5 rounded-full"><X size={20} /></button>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <input required type="text" placeholder="اسم الصنف" className="neo-input" 
              value={editingItem ? editingItem.name : newItem.name} 
              onChange={e => editingItem ? setEditingItem({...editingItem, name: e.target.value}) : setNewItem({...newItem, name: e.target.value})} />
            <input type="text" placeholder="الوصف" className="neo-input" 
              value={editingItem ? (editingItem.description || '') : newItem.description} 
              onChange={e => editingItem ? setEditingItem({...editingItem, description: e.target.value}) : setNewItem({...newItem, description: e.target.value})} />
            <input required type="number" placeholder="السعر" className="neo-input" 
              value={editingItem ? editingItem.price : (newItem.price || "")} 
              onChange={e => editingItem ? setEditingItem({...editingItem, price: parseFloat(e.target.value) || 0}) : setNewItem({...newItem, price: parseFloat(e.target.value) || 0})} />
            <div className="flex flex-col gap-1">
              {(editingItem ? editingItem.imageUrl : newItem.imageUrl) && (
                <div className="w-20 h-20 rounded-xl border-2 border-neo-border overflow-hidden mb-2 shadow-[2px_2px_0px_#1A1A1A]">
                  <img src={getImageUrl(editingItem ? editingItem.imageUrl : newItem.imageUrl)} className="w-full h-full object-cover" alt="Preview" />
                </div>
              )}
              <input type="text" placeholder="رابط الصورة" className="neo-input" 
                value={editingItem ? (editingItem.imageUrl || '') : newItem.imageUrl} 
                onChange={e => editingItem ? setEditingItem({...editingItem, imageUrl: e.target.value}) : setNewItem({...newItem, imageUrl: e.target.value})} />
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 font-bold">أو تحميل:</span>
                <input type="file" accept="image/*" onChange={handleItemImageUpload} className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-2 file:border-neo-border file:bg-brand-yellow file:text-xs file:font-black file:shadow-[1px_1px_0px_#1A1A1A] cursor-pointer" />
                {itemUploading && <span className="text-xs text-brand-yellow font-bold animate-pulse">جاري الرفع...</span>}
              </div>
            </div>
            <select required className="neo-input" 
              value={editingItem ? editingItem.categoryId : newItem.categoryId} 
              onChange={e => editingItem ? setEditingItem({...editingItem, categoryId: parseInt(e.target.value)}) : setNewItem({...newItem, categoryId: parseInt(e.target.value)})}>
                <option value="0">اختر الفئة</option>
                {apiCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="neo-input" 
              value={editingItem ? (editingItem.branchId || '') : newItem.branchId} 
              onChange={e => editingItem ? setEditingItem({...editingItem, branchId: e.target.value}) : setNewItem({...newItem, branchId: e.target.value})}>
                <option value="">كل الفروع (عام)</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select className="neo-input" 
              value={editingItem ? (editingItem.kitchenStationId || 0) : newItem.kitchenStationId} 
              onChange={e => editingItem ? setEditingItem({...editingItem, kitchenStationId: parseInt(e.target.value)}) : setNewItem({...newItem, kitchenStationId: parseInt(e.target.value)})}>
                <option value="0">بدون محطة (عام)</option>
                {stations.map(s => <option key={s.id} value={s.id}>{s.name} {s.branchId ? `(${branches.find(b => b.id === s.branchId)?.name})` : ''}</option>)}
            </select>
          </div>
          <button type="submit" disabled={itemUploading} className="neo-btn bg-brand-yellow py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {itemUploading ? "جاري رفع الصورة..." : (editingItem ? "تحديث الصنف" : "حفظ الصنف")}
          </button>
        </form>
      )}

      <div className="neo-card p-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between bg-white">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory("الكل")}
            className={`neo-btn px-4 py-2 text-sm ${activeCategory === "الكل" ? "bg-brand-green" : "bg-gray-50"}`}>
            الكل
          </button>
          {apiCategories.map((cat) => (
            <div key={cat.id} className="relative group">
              <button
                onClick={() => setActiveCategory(cat.id)}
                className={`neo-btn px-4 py-2 text-sm flex items-center gap-2 ${activeCategory === cat.id ? "bg-brand-green" : "bg-gray-50"}`}>
                {cat.imageUrl ? (
                  <img src={getImageUrl(cat.imageUrl)} alt={cat.name} className="w-4 h-4 rounded-full object-cover" />
                ) : (
                  <span>{cat.icon}</span>
                )}
                <span>{cat.name}</span>
              </button>
              <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setEditingCat(cat)}
                  className="bg-brand-blue text-white p-1 rounded-full border border-neo-border shadow-[1px_1px_0px_#1A1A1A] hover:translate-y-[1px]">
                  <Edit3 size={10} />
                </button>
                <button 
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="bg-brand-red text-white p-1 rounded-full border border-neo-border shadow-[1px_1px_0px_#1A1A1A] hover:translate-y-[1px]">
                  <X size={10} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="neo-card p-0 overflow-hidden bg-white border-4 border-neo-border shadow-[4px_4px_0px_#1A1A1A]">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-[#FFFBEB] border-b-2 border-neo-border text-[10px]">
              <th className="px-2 py-1.5 font-black text-neo-text border-l border-neo-border w-10 text-center">صورة</th>
              <th className="px-2 py-1.5 font-black text-neo-text border-l border-neo-border">الصنف / الوصف</th>
              <th className="px-2 py-1.5 font-black text-neo-text border-l border-neo-border w-24">الفرع</th>
              <th className="px-2 py-1.5 font-black text-neo-text border-l border-neo-border w-24">السعر</th>
              <th className="px-2 py-1.5 font-black text-neo-text text-center w-20">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neo-border text-xs">
            {filteredMenu.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center font-black text-[10px] text-gray-500 bg-gray-50">لا توجد أصناف</td>
              </tr>
            ) : (
              filteredMenu.map((item) => (
                <tr key={item.id} className="hover:bg-yellow-50 transition-colors">
                  <td className="px-2 py-1.5 border-l border-neo-border align-middle text-center">
                    <div className="w-8 h-8 rounded border border-neo-border bg-white flex items-center justify-center overflow-hidden mx-auto shadow-sm">
                      {item.imageUrl ? (
                        <img src={getImageUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm">{apiCategories.find(c => c.id === item.categoryId)?.icon || '🍕'}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-1.5 border-l border-neo-border align-middle">
                    <h4 className="font-black text-[11px]">{item.name}</h4>
                    <p className="text-[9px] font-bold text-gray-500 truncate max-w-[200px]">{item.description}</p>
                  </td>
                  <td className="px-2 py-1.5 border-l border-neo-border align-middle">
                    <span className="text-[9px] font-black text-brand-blue bg-brand-blue/10 px-1 border border-brand-blue/20">
                      {item.branchId ? branches.find(b => b.id === item.branchId)?.name : 'عام'}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 border-l border-neo-border align-middle font-black text-brand-blue">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-1 py-1.5 align-middle text-center">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => setEditingItem(item)} className="p-1 bg-brand-blue/10 text-brand-blue border border-brand-blue/30 shadow-sm hover:translate-y-px transition-all">
                          <Edit3 size={12} strokeWidth={3} />
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)} className="p-1 bg-brand-red/10 text-brand-red border border-brand-red/30 shadow-sm hover:translate-y-px transition-all">
                          <Trash2 size={12} strokeWidth={3} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- STAFF PAGE ---
export function StaffPage() {
  const formatCurrency = useFormatCurrency();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ 
    fullName: "", 
    mobileNumber: "", 
    employeeCode: "",
    departmentId: "",
    branchId: "",
    isDelivery: false,
    roles: [] as string[]
  });
  const [qrModalData, setQrModalData] = useState<{name: string, uri: string, isDelivery?: boolean} | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, rolesRes, deptRes, branchRes] = await Promise.all([
        employeesApi.getAll(),
        rolesApi.getAll(),
        departmentsApi.getAll(),
        branchesApi.getAll()
      ]);
      setEmployees(empRes.data || []);
      setRoles(rolesRes.data || []);
      setDepartments(deptRes.data || []);
      setBranches(branchRes.data || []);
    } catch (err) {
      console.error("Error fetching staff management data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...newEmployee,
        departmentId: newEmployee.departmentId || null,
        branchId: newEmployee.branchId || null
      };
      const response = await employeesApi.create(payload);
      setShowAddForm(false);
      setNewEmployee({ fullName: "", mobileNumber: "", employeeCode: "", departmentId: "", branchId: "", isDelivery: false, roles: [] });
      fetchData();
      
      if (response.data && response.data.qrCodeDataUri) {
        setQrModalData({ name: response.data.fullName, uri: response.data.qrCodeDataUri, isDelivery: response.data.isDelivery });
      }
    } catch (err: any) {
      let errorMsg = "فشل إضافة الموظف. تأكد من صحة البيانات.";
      if (err.response?.data) {
        if (Array.isArray(err.response.data)) {
          errorMsg = err.response.data.map((e: any) => e.description || e.code).join('\n');
        } else if (err.response.data.errors) {
          errorMsg = Object.values(err.response.data.errors).flat().join('\n');
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        }
      }
      alert(errorMsg);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الموظف نهائياً؟")) {
      try {
        await employeesApi.delete(id);
        fetchData();
      } catch (err) {
        alert("فشل الحذف. يرجى المحاولة مرة أخرى.");
      }
    }
  };

  const handleRegenerateTotp = async (id: string) => {
    if (confirm("هل تريد إعادة توليد رمز تسجيل الدخول للموظف؟ سيفقد الموظف قدرته على الدخول بالرمز القديم.")) {
      try {
        const res = await employeesApi.regenerateTotp(id);
        if (res.data.qrCodeDataUri) {
          setQrModalData({ name: res.data.fullName, uri: res.data.qrCodeDataUri, isDelivery: res.data.isDelivery });
        }
      } catch (err) {
        alert("فشل تحديث الرمز.");
      }
    }
  };

  const toggleRole = (roleName: string) => {
    setNewEmployee(prev => ({
      ...prev,
      roles: prev.roles.includes(roleName)
        ? prev.roles.filter(r => r !== roleName)
        : [...prev.roles, roleName]
    }));
  };

  if (loading) return <div className="p-20 text-center font-black text-2xl animate-pulse">جاري تحميل فريق العمل... 👨‍🍳</div>;

  return (
    <div className="space-y-6">
      {qrModalData && (
        <EmployeeQrModal 
          employeeName={qrModalData.name} 
          qrCodeDataUri={qrModalData.uri} 
          onClose={() => setQrModalData(null)} 
        />
      )}

      <div className="bg-brand-pink neo-card p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="neo-card-flat bg-white p-3">
            <Users size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black">إدارة الموظفين</h2>
            <p className="font-bold text-neo-text/70">إدارة الفريق، الصلاحيات، ورموز الدخول الآمنة</p>
          </div>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="neo-btn bg-white px-5 py-2.5 flex items-center justify-center gap-2">
          {showAddForm ? <X size={18} /> : <Plus size={18} />}
          <span>{showAddForm ? 'إلغاء' : 'موظف جديد'}</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="neo-card p-6 bg-[#FFFBEB] space-y-6 animate-fade-in border-4 border-neo-border shadow-[8px_8px_0px_#1A1A1A]">
          <h3 className="font-black text-xl flex items-center gap-2">
            <UserCheck className="text-brand-pink" />
            إضافة عضو جديد للفريق
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="font-black text-sm">الاسم الكامل</label>
                <input required type="text" placeholder="مثال: أحمد العتيبي" className="neo-input w-full" value={newEmployee.fullName} onChange={e => setNewEmployee({...newEmployee, fullName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="font-black text-sm">رقم الجوال (للتواصل)</label>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input required type="tel" placeholder="05XXXXXXXX" className="neo-input w-full pr-12 dir-ltr text-right" value={newEmployee.mobileNumber} onChange={e => setNewEmployee({...newEmployee, mobileNumber: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-black text-sm">القسم</label>
                <select required className="neo-input w-full" value={newEmployee.departmentId} onChange={e => setNewEmployee({...newEmployee, departmentId: e.target.value})}>
                  <option value="">اختر القسم...</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="font-black text-sm flex items-center gap-2 cursor-pointer p-4 bg-gray-50 border-2 border-transparent hover:border-brand-pink/30 rounded-2xl transition-all w-full">
                  <input type="checkbox" className="w-5 h-5 accent-brand-pink rounded-xl cursor-pointer" checked={newEmployee.isDelivery} onChange={e => setNewEmployee({...newEmployee, isDelivery: e.target.checked})} />
                  <span className="flex-1">
                    مندوب توصيل 🚗
                    <p className="text-xs text-gray-500 font-bold mt-1">تفعيل هذا الخيار سيولد كود استجابة سريعة QR لدخول المندوب السريع لتطبيق التوصيل</p>
                  </span>
                </label>
              </div>
              <div className="space-y-2">
                <label className="font-black text-sm">الفرع (اختياري - لكل الفروع اتركها فارغة)</label>
                <select className="neo-input w-full" value={newEmployee.branchId} onChange={e => setNewEmployee({...newEmployee, branchId: e.target.value})}>
                  <option value="">كل الفروع (مدير عام)</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="font-black text-sm">رمز الموظف (اختياري)</label>
                <input type="text" placeholder="EMP123" className="neo-input w-full uppercase" value={newEmployee.employeeCode} onChange={e => setNewEmployee({...newEmployee, employeeCode: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-black text-sm">الأدوار والصلاحيات (يمكنك اختيار أكثر من دور)</label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map(role => (
                  <div 
                    key={role.id}
                    onClick={() => toggleRole(role.name)}
                    className={`p-3 rounded-xl border-2 border-neo-border flex items-center gap-3 cursor-pointer transition-all ${newEmployee.roles.includes(role.name) ? 'bg-brand-pink/20 border-brand-pink' : 'bg-white hover:bg-gray-50'}`}>
                    <div className={`w-5 h-5 rounded border-2 border-neo-border flex items-center justify-center ${newEmployee.roles.includes(role.name) ? 'bg-brand-pink' : 'bg-white'}`}>
                      {newEmployee.roles.includes(role.name) && <Check size={12} className="text-white" />}
                    </div>
                    <span className="font-bold text-sm">{role.name}</span>
                  </div>
                ))}
              </div>
              {roles.length === 0 && (
                <div className="p-4 bg-gray-100 rounded-xl border-2 border-dashed border-gray-400 text-center">
                  <p className="text-xs font-bold text-gray-500">لا توجد أدوار معرفة. يرجى إضافة أدوار من صفحة الصلاحيات أولاً.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t-2 border-neo-border">
            <button type="submit" disabled={newEmployee.roles.length === 0} className="neo-btn bg-brand-green w-full py-4 text-lg font-black flex items-center justify-center gap-2 disabled:opacity-50">
              <span>تأكيد الإضافة وإصدار رمز الدخول</span>
              <ShieldCheck size={20} />
            </button>
          </div>
        </form>
      )}

      {/* Staff Table */}
      {/* Staff Table */}
      <div className="neo-card bg-white p-0 overflow-hidden overflow-x-auto border-4 border-neo-border rounded-none shadow-[4px_4px_0px_#1A1A1A]">
        <table className="w-full text-right border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-brand-pink/10 border-b-2 border-neo-border text-[10px]">
              <th className="px-2 py-1.5 font-black text-neo-text border-l border-neo-border">الموظف / الجوال</th>
              <th className="px-2 py-1.5 font-black text-neo-text border-l border-neo-border w-40">القسم / الفرع / ID</th>
              <th className="px-2 py-1.5 font-black text-neo-text border-l border-neo-border w-48">الأدوار</th>
              <th className="px-2 py-1.5 font-black text-neo-text border-l border-neo-border w-24">حالة الدخول</th>
              <th className="px-2 py-1.5 font-black text-neo-text border-l border-neo-border w-20">الحالة</th>
              <th className="px-2 py-1.5 font-black text-neo-text text-center w-24">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neo-border bg-white text-xs">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center bg-gray-50">
                  <p className="font-black text-[10px] text-gray-500">لا يوجد موظفين</p>
                </td>
              </tr>
            ) : (
              employees.map(emp => (
                <tr key={emp.id} className="hover:bg-brand-pink/5 transition-colors">
                  <td className="border-l border-neo-border px-2 py-1.5 align-middle">
                    <div className="flex items-center gap-2">
                      <div className="font-black text-[11px]">{emp.fullName}</div>
                      <div className="text-[9px] font-bold text-gray-500 dir-ltr">{emp.mobileNumber}</div>
                    </div>
                  </td>
                  
                  <td className="border-l border-neo-border px-2 py-1.5 align-middle">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[9px] font-black px-1 border border-neo-border bg-brand-yellow/30">{emp.departmentName}</span>
                      {emp.branchName && (
                        <span className="text-[9px] font-black px-1 border border-brand-blue/30 bg-brand-blue/10 text-brand-blue">{emp.branchName}</span>
                      )}
                      <span className="text-[9px] font-black text-gray-400">ID:{emp.employeeCode}</span>
                    </div>
                  </td>

                  <td className="border-l border-neo-border px-2 py-1.5 align-middle">
                    <div className="flex flex-wrap gap-1">
                      {emp.roles?.map(role => (
                        <span key={role} className="text-[9px] font-bold px-1 border border-brand-pink/30 bg-brand-pink/10 text-brand-pink">
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="border-l border-neo-border px-2 py-1.5 align-middle">
                    <div className="flex items-center gap-1">
                      <ShieldCheck size={12} className={emp.hasTotp ? "text-brand-green" : "text-gray-300"} />
                      <span className={`text-[9px] font-black ${emp.hasTotp ? "text-brand-green" : "text-gray-400"}`}>
                        {emp.hasTotp ? "مفعل" : "غير مفعل"}
                      </span>
                    </div>
                  </td>

                  <td className="border-l border-neo-border px-2 py-1.5 align-middle">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 border border-neo-border shadow-sm block w-max ${emp.status === "Available" ? "bg-brand-green text-white" : "bg-gray-400 text-white"}`}>
                      {emp.status === "Available" ? "نشط" : "غير نشط"}
                    </span>
                  </td>
                  
                  <td className="px-1 py-1.5 align-middle text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => handleRegenerateTotp(emp.id)}
                        className="p-1 bg-brand-purple/10 text-brand-purple border border-brand-purple/30 shadow-sm hover:translate-y-px transition-all" title="تحديث الرمز">
                        <RefreshCw size={12} strokeWidth={3} />
                      </button>
                      <button 
                        onClick={() => handleDelete(emp.id)}
                        className="p-1 bg-brand-red/10 text-brand-red border border-brand-red/30 shadow-sm hover:translate-y-px transition-all" title="حذف الموظف">
                        <Trash2 size={12} strokeWidth={3} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {employees.length === 0 && !loading && (
        <div className="neo-card p-12 text-center bg-gray-50 border-dashed border-4 border-gray-300">
          <Users size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-black text-gray-400">لا يوجد موظفين حالياً</h3>
          <p className="font-bold text-gray-400 mt-2">ابدأ بإضافة طاقم العمل وتوزيع الصلاحيات</p>
        </div>
      )}
    </div>
  );
}
// --- ORDERS PAGE ---
export function OrdersPage({ onEditOrder }: { onEditOrder?: (id: string) => void }) {
  const formatCurrency = useFormatCurrency();
  const [apiOrders, setApiOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("الكل");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchItem, setSearchItem] = useState("");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderTypeFilter, setOrderTypeFilter] = useState("الكل");
  const [externalFilter, setExternalFilter] = useState("الكل");
  const [branchFilter, setBranchFilter] = useState("الكل");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [quickDate, setQuickDate] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [res, branchRes] = await Promise.all([
        ordersApi.getAll(),
        branchesApi.getAll()
      ]);
      setApiOrders(res.data || []);
      setBranches(branchRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    menuApi.getItems().then(res => setMenuItems(res.data || [])).catch(console.error);
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await ordersApi.updateStatus(id, newStatus);
      fetchOrders();
      if (selectedOrderId === id) {
         fetchOrderDetails(id);
      }
    } catch (err) {
      alert("فشل تحديث الحالة. يرجى المحاولة مرة أخرى.");
    }
  };

  const fetchOrderDetails = async (id: string) => {
    setDetailsLoading(true);
    setSelectedOrderId(id);
    setIsEditing(false);
    try {
       const res = await ordersApi.getById(id);
       setOrderDetails(res.data);
       setEditForm({
         customerName: res.data.customerName,
         orderType: res.data.orderType,
         kitchenNotes: res.data.kitchenNotes,
         items: res.data.items.map((i: any) => ({ ...i }))
       });
    } catch (err) {
       console.error(err);
    } finally {
       setDetailsLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedOrderId) return;
    try {
       setDetailsLoading(true);
       await ordersApi.update(selectedOrderId, {
         customerName: editForm.customerName,
         orderType: editForm.orderType,
         kitchenNotes: editForm.kitchenNotes,
         items: editForm.items.filter((i: any) => i.quantity> 0)
       });
       setIsEditing(false);
       await fetchOrderDetails(selectedOrderId);
       fetchOrders();
    } catch(err) {
       alert("فشل تحديث الطلب");
       setDetailsLoading(false);
    }
  };

  const updateItemQty = (menuItemId: number, delta: number) => {
    setEditForm((prev: any) => {
      const items = [...prev.items];
      const existing = items.find(i => i.menuItemId === menuItemId);
      if (existing) {
        existing.quantity += delta;
      } else if (delta> 0) {
        const mi = menuItems.find(m => m.id === menuItemId);
        if (mi) items.push({ menuItemId: mi.id, menuItemName: mi.name, price: mi.price, quantity: 1 });
      }
      return { ...prev, items: items.filter(i => i.quantity> 0) };
    });
  };

  const getEffectiveDateRange = () => {
    if (quickDate) {
      const now = new Date();
      const from = new Date(now);
      if (quickDate === '1h')  from.setHours(now.getHours() - 1);
      else if (quickDate === '3h')  from.setHours(now.getHours() - 3);
      else if (quickDate === '6h')  from.setHours(now.getHours() - 6);
      else if (quickDate === '12h') from.setHours(now.getHours() - 12);
      else if (quickDate === '24h') from.setDate(now.getDate() - 1);
      else if (quickDate === '3d')  from.setDate(now.getDate() - 3);
      else if (quickDate === '7d')  from.setDate(now.getDate() - 7);
      else if (quickDate === '30d') from.setDate(now.getDate() - 30);
      return { from, to: now };
    }
    return {
      from: dateFrom ? new Date(dateFrom) : null,
      to:   dateTo   ? new Date(dateTo)   : null,
    };
  };

  const filteredOrders = apiOrders.filter(o => {
    if (filter !== "الكل" && o.status !== filter) return false;
    if (orderTypeFilter !== "الكل" && o.orderType !== orderTypeFilter) return false;
    if (externalFilter === "داخلي" && o.externalCompanyName) return false;
    if (externalFilter === "خارجي" && !o.externalCompanyName) return false;
    if (branchFilter !== "الكل" && o.branchId !== branchFilter) return false;
    const { from, to } = getEffectiveDateRange();
    if (from || to) {
      const created = new Date(o.createdAt);
      if (from && created < from) return false;
      if (to   && created > to)   return false;
    }
    if (orderSearchQuery) {
      const q = orderSearchQuery.toLowerCase();
      return o.orderNumber.toLowerCase().includes(q) || 
             o.customerName.toLowerCase().includes(q) || 
             (o.customerPhone && o.customerPhone.includes(q));
    }
    return true;
  });
  const filteredMenuItems = menuItems.filter(m => m.name.includes(searchItem));

  if (loading) return <div className="p-20 text-center font-black text-2xl animate-pulse">جاري تحميل الطلبات... 📦</div>;

  // Render Full Details Page
  if (selectedOrderId) {
    return (
      <div className="space-y-3 animate-fade-in">
        <button onClick={() => setSelectedOrderId(null)} className="neo-btn bg-white border-2 border-neo-border px-3 py-1 text-sm font-black flex items-center gap-1 hover:bg-gray-50 transition-colors">
          <ChevronRight size={16} /> عودة للقائمة
        </button>

        {detailsLoading || !orderDetails ? (
           <div className="neo-card p-10 text-center animate-pulse font-black text-xs text-gray-400 bg-white border-2 border-neo-border">جاري التحميل...</div>
        ) : (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
             {/* Main Info */}
             <div className="lg:col-span-2 space-y-3">
                <div className="neo-card bg-white p-3 border-2 border-neo-border shadow-[4px_4px_0px_#1A1A1A]">
                   <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-neo-border">
                      <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-0.5">رقم الطلب</p>
                        <h2 className="font-black text-2xl text-brand-orange">{orderDetails.orderNumber}</h2>
                      </div>
                      <StatusPill 
                        label={orderDetails.status === "Pending" ? "معلق" : orderDetails.status === "Preparing" ? "تحضير" : orderDetails.status === "Completed" ? "مكتمل" : "ملغي"} 
                        color={orderDetails.status === "Pending" ? "bg-brand-yellow" : orderDetails.status === "Preparing" ? "bg-brand-orange text-white" : orderDetails.status === "Completed" ? "bg-brand-green text-white" : "bg-brand-red text-white"} 
                      />
                   </div>

                   {/* Edit Mode Toggle */}
                   {(orderDetails.status === "Pending" || orderDetails.status === "معلق") && !isEditing && (
                      <button onClick={() => onEditOrder && onEditOrder(String(orderDetails.id))} className="neo-btn w-full bg-brand-yellow border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] py-1.5 mb-3 flex items-center justify-center gap-1 font-black text-sm hover:-translate-y-px transition-all">
                        <Edit3 size={14} /> فتح الطلب للتعديل في مركز الاتصال
                      </button>
                    )}

                   {isEditing ? (
                      <div className="space-y-3 bg-[#FFFBEB] p-3 rounded-lg border-2 border-neo-border border-dashed">
                          <h4 className="font-black text-sm text-brand-orange flex items-center gap-1"><Edit3 size={14}/> تحديث البيانات</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-black text-neo-text mb-0.5">اسم العميل</label>
                              <input type="text" className="neo-input w-full font-bold text-xs py-1 px-2" value={editForm.customerName} onChange={e => setEditForm({...editForm, customerName: e.target.value})} />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-neo-text mb-0.5">نوع الطلب</label>
                              <select className="neo-input w-full font-bold text-xs py-1 px-2" value={editForm.orderType} onChange={e => setEditForm({...editForm, orderType: e.target.value})}>
                                <option value="DineIn">محلي</option>
                                <option value="Takeaway">استلام</option>
                                <option value="Delivery">توصيل</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-neo-text mb-0.5">ملاحظات المطبخ</label>
                            <textarea className="neo-input w-full font-bold text-xs py-1 px-2 min-h-[40px]" value={editForm.kitchenNotes} onChange={e => setEditForm({...editForm, kitchenNotes: e.target.value})} />
                          </div>
                          
                          <div className="border-t-2 border-neo-border pt-3 mt-3">
                            <h4 className="font-black text-sm mb-2">تعديل الأصناف</h4>
                            <div className="space-y-1 mb-3">
                               {editForm.items.map((item: any) => (
                                  <div key={item.menuItemId} className="flex justify-between items-center bg-white border-2 border-neo-border p-1.5 rounded-sm">
                                     <span className="font-bold text-xs">{item.menuItemName}</span>
                                     <div className="flex items-center gap-2">
                                        <span className="font-black text-xs text-brand-green">{formatCurrency(item.price * item.quantity)}</span>
                                        <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded border border-neo-border">
                                          <button onClick={() => updateItemQty(item.menuItemId, -1)} className="w-5 h-5 flex items-center justify-center bg-white rounded font-black text-[10px] hover:bg-brand-red hover:text-white transition-colors">-</button>
                                          <span className="font-black w-3 text-[10px] text-center">{item.quantity}</span>
                                          <button onClick={() => updateItemQty(item.menuItemId, 1)} className="w-5 h-5 flex items-center justify-center bg-white rounded font-black text-[10px] hover:bg-brand-blue hover:text-white transition-colors">+</button>
                                        </div>
                                     </div>
                                  </div>
                               ))}
                            </div>
                            
                            <div className="bg-white p-2 rounded-sm border-2 border-neo-border">
                               <p className="font-black text-[10px] mb-1">إضافة أصناف جديدة:</p>
                               <input type="text" placeholder="ابحث عن صنف..." className="neo-input w-full mb-1 text-[10px] py-1 px-2 h-7" value={searchItem} onChange={e => setSearchItem(e.target.value)} />
                               <div className="max-h-24 overflow-y-auto custom-scrollbar space-y-0.5">
                                  {filteredMenuItems.slice(0, 10).map(mi => (
                                     <div key={mi.id} className="flex justify-between items-center p-1.5 hover:bg-brand-yellow/10 rounded-sm cursor-pointer border border-transparent hover:border-brand-yellow" onClick={() => updateItemQty(mi.id, 1)}>
                                        <span className="font-bold text-[10px]">{mi.name}</span>
                                        <span className="font-black text-[9px] text-brand-green">{formatCurrency(mi.price)}</span>
                                     </div>
                                  ))}
                               </div>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2 mt-1">
                            <button onClick={handleSaveEdit} className="neo-btn flex-1 bg-brand-green text-white py-1.5 text-xs font-black shadow-[2px_2px_0px_#1A1A1A] hover:-translate-y-px transition-transform">حفظ التغييرات ✅</button>
                            <button onClick={() => setIsEditing(false)} className="neo-btn px-4 bg-white py-1.5 text-xs font-black shadow-[2px_2px_0px_#1A1A1A] hover:-translate-y-px transition-transform">إلغاء ❌</button>
                          </div>
                      </div>
                   ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                        <div className="bg-gray-50 p-2 rounded-sm border-2 border-neo-border">
                          <span className="text-[9px] font-black text-gray-500 uppercase block mb-0.5">العميل</span>
                          <span className="font-black text-xs block truncate">{orderDetails.customerName}</span>
                          {orderDetails.customerPhone && (
                             <span className="font-bold text-[9px] text-brand-blue dir-ltr block mt-0.5 truncate">{orderDetails.customerPhone}</span>
                          )}
                          {(orderDetails.orderType === "Delivery" || orderDetails.orderType === "توصيل") && orderDetails.customerAddress && (
                            <span className="font-bold text-[9px] text-gray-600 flex items-center gap-0.5 mt-0.5 truncate">
                              <MapPin size={8} /> {orderDetails.customerAddress}
                            </span>
                          )}
                        </div>
                        <div className="bg-gray-50 p-2 rounded-sm border-2 border-neo-border">
                          <span className="text-[9px] font-black text-gray-500 uppercase block mb-0.5">النوع</span>
                          <span className="font-black text-xs">
                            {orderDetails.orderType === "Delivery" ? "توصيل 🛵" : orderDetails.orderType === "Takeaway" ? "استلام 🏃" : "محلي 🍽️"}
                          </span>
                          {orderDetails.externalCompanyName && (
                            <span className="block text-brand-orange bg-brand-orange/10 mt-1 px-1 py-0.5 text-[9px] border border-brand-orange/30 rounded font-bold uppercase">
                              توصيل خارجي: {orderDetails.externalCompanyName}
                            </span>
                          )}
                        </div>
                        <div className="bg-gray-50 p-2 rounded-sm border-2 border-neo-border">
                          <span className="text-[9px] font-black text-gray-500 uppercase block mb-0.5">الوقت</span>
                          <span className="font-black text-[10px] dir-ltr">{new Date(orderDetails.createdAt).toLocaleString("ar-SA", {hour: '2-digit', minute:'2-digit', month: 'short', day: 'numeric'})}</span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-sm border-2 border-neo-border">
                          <span className="text-[9px] font-black text-gray-500 uppercase block mb-0.5">الإجمالي</span>
                          <span className="font-black text-xs text-brand-green">{formatCurrency(orderDetails.totalAmount)}</span>
                        </div>
                      </div>
                   )}

                   {!isEditing && orderDetails.kitchenNotes && (
                      <div className="mb-3 p-2 bg-brand-yellow/20 rounded-sm border-2 border-brand-yellow">
                        <span className="text-[10px] font-black text-brand-orange block mb-0.5 flex items-center gap-1"><UtensilsCrossed size={12}/> ملاحظات المطبخ:</span>
                        <p className="font-bold text-xs">{orderDetails.kitchenNotes}</p>
                      </div>
                   )}

                   {!isEditing && (
                     <div>
                        <h4 className="font-black text-sm mb-2 flex items-center gap-1"><ShoppingBag size={14}/> تفاصيل الأصناف</h4>
                        <div className="space-y-1.5">
                          {orderDetails.items?.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center bg-gray-50 border-2 border-neo-border p-2 rounded-sm shadow-[1px_1px_0px_#1A1A1A]">
                              <div className="flex items-center gap-2">
                                <span className="bg-brand-blue text-white w-5 h-5 flex items-center justify-center rounded font-black text-[10px] border border-neo-border">{item.quantity}x</span>
                                <span className="font-black text-xs">{item.menuItemName}</span>
                              </div>
                              <span className="font-black text-sm text-brand-green">{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                     </div>
                   )}
                </div>
             </div>

             {/* Sidebar Info (Audit & Actions) */}
             <div className="lg:col-span-1 space-y-3">
                <div className="neo-card bg-white p-3 border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A]">
                   <h3 className="font-black text-sm mb-2">إجراءات سريعة</h3>
                   <div className="flex flex-col gap-2">
                      {orderDetails.status === "Pending" && (
                        <button onClick={() => handleStatusChange(String(orderDetails.id), "Preparing")} className="neo-btn bg-brand-orange text-white py-1.5 text-xs font-black flex items-center justify-center gap-1 shadow-[1px_1px_0px_#1A1A1A] hover:-translate-y-px"><Clock size={14}/> البدء بالتحضير</button>
                      )}
                      {orderDetails.status === "Preparing" && (
                        <button onClick={() => handleStatusChange(String(orderDetails.id), "Completed")} className="neo-btn bg-brand-green text-white py-1.5 text-xs font-black flex items-center justify-center gap-1 shadow-[1px_1px_0px_#1A1A1A] hover:-translate-y-px"><CheckCircle2 size={14}/> إكمال الطلب</button>
                      )}
                      {orderDetails.status !== "Completed" && orderDetails.status !== "Cancelled" && (
                        <button onClick={() => handleStatusChange(String(orderDetails.id), "Cancelled")} className="neo-btn bg-brand-red text-white py-1.5 text-xs font-black flex items-center justify-center gap-1 shadow-[1px_1px_0px_#1A1A1A] hover:-translate-y-px"><XCircle size={14}/> إلغاء الطلب</button>
                      )}
                   </div>
                </div>

                {orderDetails.audits && orderDetails.audits.length> 0 && (
                  <div className="neo-card bg-[#FFFBEB] p-3 border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A]">
                    <h4 className="font-black text-sm mb-3 flex items-center gap-1 text-neo-text"><History size={14}/> سجل التدقيق (Audit Log)</h4>
                    <div className="space-y-3 relative before:absolute before:inset-0 before:mr-1.5 before:-translate-x-px before:h-full before:w-px before:bg-brand-blue/30 dir-ltr text-right">
                      {orderDetails.audits.map((audit: any) => (
                        <div key={audit.id} className="relative flex items-start gap-2">
                          <div className="flex items-center justify-center w-4 h-4 rounded-full border border-neo-border bg-brand-yellow text-neo-text shrink-0 shadow-[1px_1px_0px_#1A1A1A] z-10 mt-1">
                            <div className="w-1 h-1 bg-neo-text rounded-full"></div>
                          </div>
                          <div className="flex-1 bg-white p-2 rounded-sm border-2 border-neo-border shadow-[1px_1px_0px_#1A1A1A]">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1">
                              <span className="font-black text-[10px] text-brand-blue">{audit.userName}</span>
                              <time className="text-[8px] font-bold text-gray-500 dir-ltr bg-gray-100 px-1 py-0.5 rounded border border-gray-200">{new Date(audit.timestamp).toLocaleString("ar-SA")}</time>
                            </div>
                            <div className="text-[8px] font-black text-white mb-1 inline-block bg-brand-orange px-1 py-0.5 rounded border border-neo-border shadow-sm uppercase tracking-wider">{audit.action}</div>
                            <p className="text-[9px] font-bold leading-relaxed text-gray-700 bg-gray-50 p-1 rounded border border-gray-200">{audit.changes}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
             </div>
           </div>
        )}
      </div>
    );
  }

  // Render List Page
  return (
    <div className="space-y-6 animate-fade-in relative">

      <div className="flex flex-col gap-2">
        <div className="bg-white p-2 flex flex-col gap-2 border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A]">
          {/* Row 1: Search + Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-neo-border" strokeWidth={3} />
              <input 
                type="text" 
                placeholder="ابحث برقم الطلب، اسم..." 
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="neo-input w-full !pr-8 border-2 border-neo-border shadow-sm font-bold py-1 text-xs h-8"
              />
            </div>

            <select 
              value={branchFilter}
              onChange={e => setBranchFilter(e.target.value)}
              className="neo-input border-2 border-neo-border font-bold py-1 px-2 h-8 shadow-sm cursor-pointer bg-white text-xs w-auto"
            >
              <option value="الكل">الفروع 🏪</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            <select 
              value={orderTypeFilter}
              onChange={e => setOrderTypeFilter(e.target.value)}
              className="neo-input border-2 border-neo-border font-bold py-1 px-2 h-8 shadow-sm cursor-pointer bg-white text-xs w-auto"
            >
              <option value="الكل">الأنواع 📦</option>
              <option value="Delivery">توصيل 🛵</option>
              <option value="DineIn">محلي 🍽️</option>
              <option value="Takeaway">استلام 🥡</option>
            </select>

            <select 
              value={externalFilter}
              onChange={e => setExternalFilter(e.target.value)}
              className="neo-input border-2 border-neo-border font-bold py-1 px-2 h-8 shadow-sm cursor-pointer bg-white text-xs w-auto"
            >
              <option value="الكل">جهة التوصيل 🌍</option>
              <option value="داخلي">داخلي (مطعمنا)</option>
              <option value="خارجي">توصيل خارجي</option>
            </select>

            <select
              value={quickDate}
              onChange={e => { setQuickDate(e.target.value); setDateFrom(''); setDateTo(''); }}
              className="neo-input border-2 border-neo-border font-bold py-1 px-2 h-8 shadow-sm cursor-pointer bg-white text-xs w-auto"
            >
              <option value="">📅 كل الفترات</option>
              <option value="1h">1 س</option>
              <option value="3h">3 س</option>
              <option value="6h">6 س</option>
              <option value="12h">12 س</option>
              <option value="24h">24 س</option>
              <option value="3d">3 ي</option>
              <option value="7d">أسبوع</option>
            </select>

            <div className="flex items-center gap-1">
              <input
                type="datetime-local"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setQuickDate(''); }}
                className="neo-input border-2 border-neo-border font-bold py-1 px-1 h-8 shadow-sm text-[10px] cursor-pointer w-32"
              />
              <span className="font-bold text-[10px] text-neo-text/60">-</span>
              <input
                type="datetime-local"
                value={dateTo}
                onChange={e => { setDateTo(e.target.value); setQuickDate(''); }}
                className="neo-input border-2 border-neo-border font-bold py-1 px-1 h-8 shadow-sm text-[10px] cursor-pointer w-32"
              />
            </div>
            
            {(dateFrom || dateTo || quickDate) && (
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); setQuickDate(''); }}
                className="neo-btn px-2 py-1 h-8 bg-red-100 border-2 border-neo-border text-[10px] font-black shadow-sm flex items-center gap-1"
              >
                <X size={12} /> مسح
              </button>
            )}
          </div>
        </div>

        {/* Dense Status Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar w-full">
          {["الكل", "Pending", "Preparing", "Delivering", "Completed", "Cancelled"].map(s => (
            <button 
              key={s} 
              onClick={() => setFilter(s)}
              className={`px-3 py-1 text-xs font-black border-2 border-neo-border transition-all flex-1 text-center justify-center whitespace-nowrap ${filter === s ? "bg-brand-yellow shadow-[inset_0px_2px_0px_rgba(0,0,0,0.2)]" : "bg-white hover:bg-gray-50 shadow-sm"}`}>
              {s === "Pending" ? "معلق ⏳" : s === "Preparing" ? "تحضير 🍳" : s === "Delivering" ? "توصيل 🛵" : s === "Completed" ? "مكتمل ✅" : s === "Cancelled" ? "ملغي ❌" : "الكل 📋"}
            </button>
          ))}
        </div>
      </div>

      <div className="neo-card bg-white p-0 overflow-hidden overflow-x-auto border-4 border-neo-border rounded-none shadow-[4px_4px_0px_#1A1A1A]">
        <table className="w-full text-right border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-brand-yellow border-b-2 border-neo-border text-[10px]">
              <th className="px-2 py-1 font-black text-neo-text border-l border-neo-border w-16">رقم</th>
              <th className="px-2 py-1 font-black text-neo-text border-l border-neo-border">العميل / الطلب</th>
              <th className="px-2 py-1 font-black text-neo-text border-l border-neo-border w-16">النوع</th>
              <th className="px-2 py-1 font-black text-neo-text border-l border-neo-border w-24">جهة التوصيل</th>
              <th className="px-2 py-1 font-black text-neo-text border-l border-neo-border w-16">الوقت</th>
              <th className="px-2 py-1 font-black text-neo-text border-l border-neo-border w-20">الحالة</th>
              <th className="px-2 py-1 font-black text-neo-text border-l border-neo-border w-16">المبلغ</th>
              <th className="px-2 py-1 font-black text-neo-text text-center w-28">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neo-border bg-white text-xs">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4 text-center bg-gray-50 border-b border-neo-border">
                  <p className="font-black text-[10px] text-gray-500">لا توجد طلبات</p>
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => {
                const minutesElapsed = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000);
                const isDelayed = minutesElapsed > 15 && order.status !== "Completed" && order.status !== "Cancelled";
                const rowBg = isDelayed ? "bg-brand-red text-white" : "hover:bg-brand-yellow/10 bg-white text-neo-text";
                const borderClasses = "border-l border-neo-border px-2 py-1 align-middle";

                return (
                <tr key={order.id} className={`${rowBg} transition-colors cursor-pointer border-b border-neo-border`} onClick={() => fetchOrderDetails(String(order.id))}>
                  <td className={`${borderClasses} font-black ${isDelayed ? 'text-white' : 'text-brand-orange'}`}>#{order.orderNumber}</td>
                  <td className={`${borderClasses}`}>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[11px] truncate max-w-[120px]">{order.customerName}</span>
                      <span className="text-[9px] font-bold opacity-70 truncate max-w-[150px]">{order.itemsSummary}</span>
                    </div>
                  </td>
                  <td className={`${borderClasses}`}>
                    <span className={`text-[9px] font-black px-1 border ${isDelayed ? 'border-white' : 'border-neo-border bg-gray-100'}`}>
                       {order.orderType === "Delivery" || order.orderType === "توصيل" ? "توصيل 🛵" : 
                       order.orderType === "Takeaway" || order.orderType === "استلام" ? "استلام 🏃" : "محلي 🍽️"}
                    </span>
                  </td>
                  <td className={`${borderClasses} font-bold text-[10px]`}>
                    {order.externalCompanyName ? (
                      <span className="text-brand-orange bg-brand-orange/10 px-1 border border-brand-orange/30 rounded">
                        {order.externalCompanyName}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className={`${borderClasses} font-bold text-[10px] whitespace-nowrap`}>
                    {new Date(order.createdAt).toLocaleTimeString("ar-SA", { hour: '2-digit', minute: '2-digit' })} 
                    <span className={`mr-1 px-1 text-[9px] font-black ${isDelayed ? 'bg-black text-white animate-pulse' : 'bg-gray-200 text-gray-600'}`}>{minutesElapsed}د</span>
                  </td>
                  <td className={`${borderClasses}`}>
                    <span className={`text-[9px] font-black px-1 border ${isDelayed ? 'border-white' : 'border-neo-border'} ${order.status === "Pending" ? "bg-brand-yellow text-neo-text" : order.status === "Preparing" ? "bg-brand-orange text-white" : order.status === "Delivering" ? "bg-brand-cyan text-neo-text" : order.status === "Completed" ? "bg-brand-green text-white" : "bg-brand-red text-white"}`}>
                       {order.status === "Pending" ? "معلق" : order.status === "Preparing" ? "تحضير" : order.status === "Delivering" ? "توصيل" : order.status === "Completed" ? "مكتمل" : "ملغي"}
                    </span>
                  </td>
                  <td className={`${borderClasses} font-black ${isDelayed ? 'text-white' : 'text-brand-green'}`}>{formatCurrency(order.totalAmount)}</td>
                  <td className="px-1 py-1 align-middle text-center border-l border-neo-border">
                    <div className="flex gap-1 justify-center">
                        {order.status === "Pending" && (
                          <button onClick={(e) => { e.stopPropagation(); handleStatusChange(String(order.id), "Preparing"); }} className="p-1 bg-brand-orange text-white border border-neo-border shadow-[1px_1px_0px_#1A1A1A] hover:translate-y-px transition-all" title="البدء بالتحضير"><Clock size={12} strokeWidth={3}/></button>
                        )}
                        {order.status === "Preparing" && (
                          <button onClick={(e) => { e.stopPropagation(); handleStatusChange(String(order.id), "Completed"); }} className="p-1 bg-brand-green text-white border border-neo-border shadow-[1px_1px_0px_#1A1A1A] hover:translate-y-px transition-all" title="إكمال الطلب"><CheckCircle2 size={12} strokeWidth={3}/></button>
                        )}
                        {order.status !== "Completed" && order.status !== "Cancelled" && (
                          <button onClick={(e) => { e.stopPropagation(); handleStatusChange(String(order.id), "Cancelled"); }} className="p-1 bg-brand-red text-white border border-neo-border shadow-[1px_1px_0px_#1A1A1A] hover:translate-y-px transition-all" title="إلغاء الطلب"><XCircle size={12} strokeWidth={3}/></button>
                        )}
                    </div>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- REVIEWS PAGE ---
export function ReviewsPage() {
  const formatCurrency = useFormatCurrency();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats().then(res => {
      setStats(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-20 text-center font-black text-2xl animate-pulse">جاري تحميل التقييمات... ⭐</div>;

  const ratings = stats?.weeklyRatings || [];
  const averageRating = ratings.length> 0 ? (ratings.reduce((acc: number, curr: any) => acc + curr.rating, 0) / ratings.length).toFixed(1) : "5.0";
  const totalReviews = stats?.totalOrders || 0;
  const notificationsList = stats?.notifications || [];

  return (
    <div className="space-y-6">
      <div className={`bg-brand-cyan neo-card p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
        <div className="flex items-center gap-4">
          <div className="neo-card-flat bg-white p-3">
            <Star size={28} className="text-brand-orange" />
          </div>
          <div>
            <h2 className="text-2xl font-black">تقييمات وآراء العملاء</h2>
            <p className="font-bold text-neo-text/70">متابعة مستوى رضا العملاء والتقييمات اليومية للمطعم</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="neo-card p-5 bg-white lg:col-span-1 flex flex-col items-center justify-center text-center">
          <h3 className="font-black text-lg mb-2">متوسط التقييم العام</h3>
          <div className="text-6xl font-black text-brand-orange my-4 flex items-center gap-2">
            <span>{averageRating}</span>
            <Star size={48} fill="#FF6B35" className="text-brand-orange" />
          </div>
          <p className="font-bold text-sm text-gray-500">تم احتساب التقييم من إجمالي {totalReviews} طلب خلال هذا الشهر</p>
        </div>

        <div className="neo-card p-5 bg-white lg:col-span-2">
          <h3 className="font-black text-lg mb-4">التقييم اليومي خلال الأسبوع</h3>
          <div className="grid grid-cols-7 gap-2 pt-4">
            {ratings.map((item: any, idx: number) => (
              <div key={idx} className="flex flex-col items-center justify-between bg-[#FFFBEB] p-3 rounded-xl border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] h-32">
                <span className="font-black text-xs text-gray-600">{item.day}</span>
                <div className="w-full bg-gray-200 h-12 rounded-lg relative overflow-hidden border border-neo-border">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-brand-orange transition-all" 
                    style={{ height: `${(item.rating / 5) * 100}%` }}
                  />
                </div>
                <span className="font-black text-sm text-brand-blue">{item.rating}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="neo-card p-5 bg-white space-y-4">
        <h3 className="font-black text-lg flex items-center gap-2">
          <MessageSquare size={20} className="text-brand-blue" />
          أحدث التعليقات والإشعارات
        </h3>
        <div className="divide-y divide-gray-100">
          {notificationsList.map((notif: any) => (
            <div key={notif.id} className="py-3 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl p-2 bg-gray-50 rounded-lg border border-neo-border shadow-[1px_1px_0px_#1A1A1A]">
                  {notif.type === "review" ? "⭐" : notif.type === "warning" ? "⚠️" : notif.type === "success" ? "🎉" : "🔔"}
                </span>
                <div>
                  <p className="font-black text-sm">{notif.text}</p>
                  <span className="text-xs font-bold text-gray-400">{notif.time}</span>
                </div>
              </div>
              {notif.unread && <span className="neo-badge bg-brand-yellow text-[10px]">جديد</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- SETTINGS PAGE ---
export function SettingsPage() {
  const formatCurrency = useFormatCurrency();
  const [settings, setSettings] = useState({
    restaurantName: typeof window !== 'undefined' && typeof localStorage !== 'undefined' ? (localStorage.getItem("userName") || "مطعم أوبنو") : "مطعم أوبنو",
    subdomain: typeof window !== 'undefined' && typeof localStorage !== 'undefined' && localStorage.getItem("userName") ? `${localStorage.getItem("userName")?.toLowerCase()}.opno.com` : "demo.opno.com",
    taxRate: 15,
    currencyId: "",
    theme: "Neo-Brutalist",
    maxBranches: 5,
    maxStaff: 20
  });
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [saved, setSaved] = useState(false);

  // Telegram Bot State
  const [botToken, setBotToken] = useState("");
  const [botUsername, setBotUsername] = useState("");
  const [botStatus, setBotStatus] = useState("Inactive");
  const [botLoading, setBotLoading] = useState(false);
  const [botMsg, setBotMsg] = useState<{ text: string; type: "success" | "error" | "" }>({ text: "", type: "" });

  // Simulator State
  const [simMsg, setSimMsg] = useState("");
  const [simChat, setSimChat] = useState<Array<{ sender: "user" | "bot"; text: string; imageUrl?: string; time: string }>>([
    { sender: "bot", text: "مرحباً بك! أنا المحاكي المباشر لبوت التليجرام الذكي الخاص بمطعمك. تحدث معي بلهجتك الطبيعية كأنك تتحدث مع موظف حقيقي (مثال: وش عندكم أكل؟، أريد طلب 2 برجر لحم، وين طلبي رقم #1005؟).", time: new Date().toLocaleTimeString("ar-SA", { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    // Load Telegram config
    telegramBotApi.getConfig().then(res => {
      if (res.data) {
        setBotToken(res.data.telegramBotToken || "");
        setBotUsername(res.data.telegramBotUsername || "");
        setBotStatus(res.data.telegramBotStatus || "Inactive");
      }
    }).catch(err => console.error("Error fetching bot config", err));

    // Load Currencies
    currenciesApi.getAll().then(res => {
      setCurrencies(res.data || []);
    }).catch(err => console.error("Error fetching currencies", err));

    // Load Tenant Settings
    tenantSettingsApi.get().then(res => {
      if (res.data) {
        setSettings(prev => ({
          ...prev,
          restaurantName: res.data.restaurantName,
          currencyId: res.data.currencyId || ""
        }));
      }
    }).catch(err => console.error("Error fetching tenant settings", err));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tenantSettingsApi.update({
        restaurantName: settings.restaurantName,
        currencyId: settings.currencyId || undefined
      });
      // Optionally update local storage so UI updates instantly
      const selectedCurrency = currencies.find(c => c.id === settings.currencyId);
      if (selectedCurrency) {
        localStorage.setItem("currencySymbol", selectedCurrency.symbol);
        localStorage.setItem("currencyCode", selectedCurrency.code);
        window.dispatchEvent(new Event("storage"));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving settings", err);
      alert("فشل حفظ الإعدادات");
    }
  };

  const handleSaveBotConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setBotLoading(true); setBotMsg({ text: "", type: "" });
    try {
      const res = await telegramBotApi.updateConfig({ telegramBotToken: botToken });
      setBotStatus(res.data.status);
      setBotUsername(res.data.username || "");
      if (res.data.success) {
        setBotMsg({ text: `تم حفظ وتفعيل البوت بنجاح! @${res.data.username}`, type: "success" });
      } else if (botToken === "") {
        setBotMsg({ text: "تم تعطيل البوت بنجاح.", type: "success" });
      } else {
        setBotMsg({ text: "تم الحفظ، لكن فشل الاتصال بالبوت. تأكد من صحة التوكن.", type: "error" });
      }
    } catch (err) {
      setBotMsg({ text: "حدث خطأ أثناء حفظ إعدادات البوت.", type: "error" });
      setBotStatus("Error");
    } finally {
      setBotLoading(false);
    }
  };

  const handleTestBot = async () => {
    setBotLoading(true); setBotMsg({ text: "", type: "" });
    try {
      const res = await telegramBotApi.testConnection({ telegramBotToken: botToken });
      setBotStatus("Active");
      setBotUsername(res.data.username || "");
      setBotMsg({ text: res.data.message, type: "success" });
    } catch (err: any) {
      setBotStatus("Error");
      setBotMsg({ text: err.response?.data?.message || "فشل الاتصال بالبوت.", type: "error" });
    } finally {
      setBotLoading(false);
    }
  };

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simMsg.trim()) return;

    const userText = simMsg;
    const newChat = [...simChat, { sender: "user" as const, text: userText, time: new Date().toLocaleTimeString("ar-SA", { hour: '2-digit', minute: '2-digit' }) }];
    setSimChat(newChat);
    setSimMsg("");
    setSimLoading(true);

    try {
      const res = await telegramBotApi.simulateMessage({ message: userText, username: settings.restaurantName });
      setSimChat([...newChat, { 
        sender: "bot" as const, 
        text: res.data.reply?.text || "لم يتم إرجاع أي رد نصي.", 
        imageUrl: res.data.reply?.imageUrl,
        time: new Date().toLocaleTimeString("ar-SA", { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } catch (err) {
      setSimChat([...newChat, { sender: "bot" as const, text: "⚠️ تعذر الاتصال بالمحاكي في الخادم.", time: new Date().toLocaleTimeString("ar-SA", { hour: '2-digit', minute: '2-digit' }) }]);
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* General Settings Header */}
      <div className={`bg-brand-pink neo-card p-3 flex flex-row items-center justify-between shadow-[2px_2px_0px_#1A1A1A]`}>
        <div className="flex items-center gap-3">
          <Settings size={20} />
          <h2 className="text-lg font-black">إعدادات النظام</h2>
        </div>
      </div>

      {/* General Settings Form */}
      <form onSubmit={handleSave} className="neo-card p-4 bg-white border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-black text-gray-700 mb-1">اسم المطعم</label>
            <input 
              type="text" 
              className="neo-input w-full border border-neo-border shadow-sm font-bold text-xs py-1 h-8" 
              value={settings.restaurantName} 
              onChange={e => setSettings({...settings, restaurantName: e.target.value})} 
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-700 mb-1">النطاق الفرعي</label>
            <input 
              type="text" 
              disabled
              className="neo-input w-full border border-neo-border shadow-sm font-bold bg-gray-100 text-left dir-ltr cursor-not-allowed text-xs py-1 h-8" 
              value={settings.subdomain} 
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-700 mb-1">نسبة الضريبة (٪)</label>
            <input 
              type="number" 
              className="neo-input w-full border border-neo-border shadow-sm font-bold text-xs py-1 h-8" 
              value={settings.taxRate} 
              onChange={e => setSettings({...settings, taxRate: parseFloat(e.target.value) || 0})} 
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-700 mb-1">العملة الافتراضية</label>
            <select 
              className="neo-input w-full border border-neo-border shadow-sm font-bold text-xs py-1 h-8" 
              value={settings.currencyId} 
              onChange={e => setSettings({...settings, currencyId: e.target.value})} 
            >
              <option value="">-- اختر --</option>
              {currencies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-neo-border flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-500">الخطة:</span>
              <span className="font-black text-xs text-brand-blue">النمو (Growth)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-500">فروع:</span>
              <span className="font-black text-xs text-brand-green">{settings.maxBranches}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-500">موظفين:</span>
              <span className="font-black text-xs text-brand-orange">{settings.maxStaff}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saved && (
              <span className="text-[10px] font-black text-brand-green animate-fade-in">تم الحفظ!</span>
            )}
            <button type="submit" className="neo-btn bg-brand-green px-4 py-1.5 flex items-center justify-center gap-1 text-xs font-black shadow-sm">
              <Save size={14} />
              <span>حفظ</span>
            </button>
          </div>
        </div>
      </form>

      {/* Telegram Bot Header */}
      <div className={`bg-brand-yellow neo-card p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
        <div className="flex items-center gap-4">
          <div className="neo-card-flat bg-white p-3 text-3xl">
            🤖
          </div>
          <div>
            <h2 className="text-2xl font-black">إدارة بوت التليجرام والمحاكاة المباشرة</h2>
            <p className="font-bold text-neo-text/70">تكوين البوت الخاص بمطعمك، استقبال الطلبات تلقائياً، ومحاكاة المحادثة المباشرة</p>
          </div>
        </div>
      </div>

      {/* Telegram Bot Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Config Card */}
        <div className="neo-card p-6 bg-white space-y-6 h-fit">
          <div className="flex items-center justify-between border-b-2 border-neo-border pb-4">
            <h3 className="font-black text-lg flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <span>إعدادات ربط البوت</span>
            </h3>
            <StatusPill 
              label={botStatus === "Active" ? "نشط ✅" : botStatus === "Error" ? "خطأ ❌" : "غير مفعل ⚠️"} 
              color={botStatus === "Active" ? "bg-brand-green" : botStatus === "Error" ? "bg-brand-red text-white" : "bg-brand-yellow"} 
            />
          </div>

          <form onSubmit={handleSaveBotConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-700 mb-2">توكن البوت (Bot API Token)</label>
              <input 
                type="text" 
                placeholder="1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                className="neo-input w-full border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] font-mono text-sm dir-ltr text-left" 
                value={botToken} 
                onChange={e => setBotToken(e.target.value)} 
              />
              <span className="text-[10px] font-bold text-gray-400 mt-1 block">احصل على التوكن من خلال @BotFather في تليجرام</span>
            </div>

            {botUsername && (
              <div className="p-3 bg-brand-blue/10 border border-brand-blue/30 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600">معرف البوت المرتبط:</span>
                <span className="font-black text-brand-blue dir-ltr">@{botUsername}</span>
              </div>
            )}

            {botMsg.text && (
              <div className={`p-3 rounded-lg border-2 font-black text-xs shadow-[2px_2px_0px_#1A1A1A] animate-fade-in ${
                botMsg.type === "success" ? "bg-brand-green/20 border-brand-green text-brand-green" : "bg-brand-red/20 border-brand-red text-brand-red"
              }`}>
                {botMsg.text}
              </div>
            )}

            <div className="flex gap-4 pt-2">
              <button 
                type="submit" 
                disabled={botLoading}
                className="neo-btn bg-brand-blue text-white flex-1 py-3 text-sm font-black shadow-[2px_2px_0px_#1A1A1A]">
                {botLoading ? "جاري الحفظ..." : "حفظ التوكن"}
              </button>
              <button 
                type="button" 
                onClick={handleTestBot}
                disabled={botLoading || !botToken}
                className="neo-btn bg-brand-yellow text-neo-text px-4 py-3 text-sm font-black shadow-[2px_2px_0px_#1A1A1A] disabled:opacity-50">
                اختبار الاتصال
              </button>
            </div>
          </form>
        </div>

        {/* Simulator Card */}
        <div className="neo-card p-6 bg-[#FFFBEB] flex flex-col h-[500px]">
          <div className="flex items-center justify-between border-b-2 border-neo-border pb-4 mb-4">
            <h3 className="font-black text-lg flex items-center gap-2">
              <span className="text-2xl">📱</span>
              <span>محاكي تليجرام المباشر</span>
            </h3>
            <span className="neo-badge bg-brand-cyan text-xs">محاكاة حية</span>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 flex flex-col border-2 border-neo-border bg-white rounded-2xl p-4 shadow-[inset_0px_2px_4px_rgba(0,0,0,0.05)]">
            {simChat.map((msg, idx) => (
              <div key={idx} className={`flex flex-col max-w-[85%] ${msg.sender === "user" ? "self-end items-end" : "self-start items-start"}`}>
                <div className={`p-3 rounded-2xl border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] text-sm whitespace-pre-line font-bold ${
                  msg.sender === "user" ? "bg-brand-green text-white rounded-tr-none" : "bg-gray-50 text-neo-text rounded-tl-none"
                }`}>
                  {msg.imageUrl && (
                    <img src={msg.imageUrl} alt="Bot attachment" className="w-full max-h-40 object-cover rounded-xl mb-2 border border-neo-border shadow-[1px_1px_0px_#1A1A1A]" />
                  )}
                  <div>{msg.text}</div>
                </div>
                <span className="text-[10px] text-gray-400 font-bold mt-1 px-1">{msg.time}</span>
              </div>
            ))}
            {simLoading && (
              <div className="self-start bg-gray-100 p-3 rounded-2xl border border-neo-border text-xs font-black animate-pulse">
                البوت يكتب الآن... ✍️
              </div>
            )}
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSimulate} className="mt-4 flex gap-2">
            <input 
              type="text" 
              placeholder="تحدث مع البوت بلهجتك الطبيعية كأنك تتحدث مع إنسان..." 
              className="neo-input flex-1 border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] text-sm font-bold"
              value={simMsg}
              onChange={e => setSimMsg(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={simLoading || !simMsg.trim()}
              className="neo-btn bg-brand-orange text-white px-6 py-3 font-black shadow-[2px_2px_0px_#1A1A1A] disabled:opacity-50">
              إرسال
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// --- DELIVERY ZONES PAGE ---

export function DeliveryZonesPage() {
  const formatCurrency = useFormatCurrency();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    branchesApi.getAll().then(res => {
      setBranches(res.data || []);
      if (res.data?.length> 0) {
        setSelectedBranchId(res.data[0].id);
      }
      setLoading(false);
    }).catch(err => {
      console.error("Error fetching branches", err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-20 text-center font-black text-2xl animate-pulse">جاري تحميل البيانات... 🚚</div>;

  const activeBranch = branches.find(b => b.id === selectedBranchId);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-brand-orange neo-card p-3 flex flex-row items-center justify-between gap-4 text-white border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A]">
        <div className="flex items-center gap-3">
          <MapPin size={20} />
          <h2 className="text-lg font-black">مناطق التوصيل</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-black text-xs">الفرع:</span>
          <select 
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="bg-white text-neo-text font-bold py-1 px-2 text-xs border-2 border-neo-border outline-none">
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="neo-card p-0 bg-white min-h-[400px] border-4 border-neo-border shadow-[4px_4px_0px_#1A1A1A]">
        {selectedBranchId && (
          <div className="p-2">
            <DeliveryZoneManager branchId={selectedBranchId} />
          </div>
        )}
      </div>
    </div>
  );
}

