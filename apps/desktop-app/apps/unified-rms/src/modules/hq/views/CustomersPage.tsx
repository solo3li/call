import { useFormatCurrency } from "../utils/useFormatCurrency";
import { useState, useEffect } from "react";
import { Users, Search, Plus, Phone, MapPin, Trash2, History, ExternalLink, ShoppingBag } from "lucide-react";
import { customersApi } from "../utils/api";
import { Customer } from "../types/api";


import { useDashboard } from "../context/DashboardContext";


// Robust phone normalization
const normalizePhone = (phone: string) => {
  if (!phone) return "";
  let clean = phone.replace(/\D/g, "");
  if (clean.startsWith("00966")) clean = clean.substring(5);
  if (clean.startsWith("966")) clean = clean.substring(3);
  if (clean.startsWith("0")) clean = clean.substring(1);
  return clean;
};

export default function CustomersPage() {
  const formatCurrency = useFormatCurrency();
  const { customers, refreshCustomers, loading } = useDashboard();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", phoneNumber: "", address: "" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    refreshCustomers();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await customersApi.create({
        name: newCustomer.name,
        phoneNumber: newCustomer.phoneNumber,
        customerAddresses: [{ addressDetails: newCustomer.address }] as any
      });
      setShowAddForm(false);
      setNewCustomer({ name: "", phoneNumber: "", address: "" });
      refreshCustomers();
    } catch (err) {
      alert("فشل الإضافة");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف العميل؟")) {
      try {
        await customersApi.delete(id);
        refreshCustomers();
      } catch (err) {
        alert("فشل الحذف");
      }
    }
  };

  const filteredCustomers = (customers || []).filter((c) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = c.name.toLowerCase().includes(query);
    const phoneMatch = normalizePhone(c.phoneNumber).includes(normalizePhone(searchQuery));
    return nameMatch || phoneMatch;
  });

  if (!mounted || loading) return <div className="p-20 text-center font-semibold text-2xl animate-pulse">جاري تحميل العملاء... 👥</div>;

  return (
    <div className="space-y-4">
      <div className={`bg-[#e5f6ff] text-[#00a68f] bg-carbon-layer border border-carbon-border p-3 flex flex-row items-center justify-between `}>
        <div className="flex items-center gap-3">
          <Users size={20} />
          <h2 className="text-lg font-semibold">قاعدة بيانات العملاء</h2>
        </div>
        <div className="flex gap-2 w-1/2">
          <div className="relative flex-1">
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="ابحث بالاسم أو الهاتف..."
              className="w-full border border-carbon-border bg-carbon-bg px-3 py-2 text-sm focus:outline-none focus:border-carbon-blue text-carbon-text placeholder-carbon-textSecondary w-full pr-8 text-xs py-1 h-8 border border-carbon-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={() => setShowAddForm(!showAddForm)} className="px-4 py-2 text-sm font-medium transition-colors bg-carbon-layer text-carbon-text border border-carbon-border hover:bg-carbon-layerHover px-3 py-1 flex items-center justify-center gap-1 shadow-sm h-8">
            <Plus size={14} />
            <span className="text-xs">جديد</span>
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-carbon-layer border border-carbon-border p-4 bg-[#FFFBEB] flex flex-col gap-3 border border-carbon-border ">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-[10px] font-semibold text-carbon-textSecondary mb-1">اسم العميل</label>
              <input required type="text" className="w-full border border-carbon-border bg-carbon-bg px-3 py-2 text-sm focus:outline-none focus:border-carbon-blue text-carbon-text placeholder-carbon-textSecondary w-full text-xs py-1 h-8" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-carbon-textSecondary mb-1">رقم الهاتف</label>
              <input required type="text" className="w-full border border-carbon-border bg-carbon-bg px-3 py-2 text-sm focus:outline-none focus:border-carbon-blue text-carbon-text placeholder-carbon-textSecondary w-full text-xs py-1 h-8" value={newCustomer.phoneNumber} onChange={e => setNewCustomer({...newCustomer, phoneNumber: e.target.value})} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-semibold text-carbon-textSecondary mb-1 flex items-center justify-between">
                <span>العنوان أو الإحداثيات</span>
                {newCustomer.address.trim().match(/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/) && (
                  <span className="text-[9px] font-medium text-carbon-success bg-green-50 px-1 rounded border border-green-200 flex items-center gap-1">
                    <MapPin size={10} /> إحداثيات ✓
                  </span>
                )}
              </label>
              <div className="flex gap-2">
                <input required type="text" className="w-full border border-carbon-border bg-carbon-bg px-3 py-2 text-sm focus:outline-none focus:border-carbon-blue text-carbon-text placeholder-carbon-textSecondary flex-1 text-xs py-1 h-8" value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} />
                <button type="submit" className="px-4 py-2 text-sm font-medium transition-colors bg-carbon-blue text-white hover:bg-carbon-blueHover py-1 px-4 h-8 text-xs shadow-sm">حفظ</button>
              </div>
            </div>
          </div>
        </form>
      )}

      <div className="bg-carbon-layer border border-carbon-border p-0 overflow-hidden bg-white border border-carbon-border ">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-[#e5f6ff] text-[#00a68f]/10 border-b-2 border-carbon-border text-[10px]">
              <th className="px-2 py-1.5 font-semibold border-l border-carbon-border">العميل</th>
              <th className="px-2 py-1.5 font-semibold border-l border-carbon-border w-28">الهاتف</th>
              <th className="px-2 py-1.5 font-semibold border-l border-carbon-border">العنوان</th>
              <th className="px-2 py-1.5 font-semibold border-l border-carbon-border w-32">النشاط</th>
              <th className="px-2 py-1.5 font-semibold text-center w-16">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neo-border text-xs">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center font-semibold text-[10px] text-carbon-textSecondary bg-carbon-bg">لا توجد نتائج</td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-[#e5f6ff] text-[#00a68f]/5 transition-colors">
                  <td className="px-2 py-1.5 border-l border-carbon-border align-middle font-semibold">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-[#fff0f7] text-[#ff7eb6]/20 rounded border border-carbon-border flex items-center justify-center text-[10px]">
                        {customer.name?.[0] || '👤'}
                      </div>
                      <span className="text-[11px]">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-2 py-1.5 border-l border-carbon-border align-middle">
                    <div className="flex items-center gap-1 font-medium text-[10px] dir-ltr text-right">
                      <Phone size={10} className="text-gray-400" />
                      <span>{customer.phoneNumber}</span>
                    </div>
                  </td>
                  <td className="px-2 py-1.5 border-l border-carbon-border align-middle">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 font-medium text-[10px] truncate max-w-[200px]">
                        <MapPin size={10} className="text-gray-400 shrink-0" />
                        <span className="truncate">{customer.customerAddresses?.[0]?.addressDetails || 'لا يوجد عنوان'}</span>
                      </div>
                      {(customer.customerAddresses?.[0]?.latitude && customer.customerAddresses?.[0]?.longitude) && (
                        <span className="text-[9px] text-carbon-success font-semibold flex items-center gap-0.5 mt-0.5">
                          <MapPin size={8} /> إحداثيات
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-1.5 border-l border-carbon-border align-middle">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1 font-medium text-[9px]">
                        <ShoppingBag size={10} className="text-carbon-warning" />
                        <span>{customer.totalOrders} طلبات</span>
                      </div>
                      <div className="flex items-center gap-1 font-medium text-[9px]">
                        <span className="text-carbon-success text-[10px]"></span>
                        <span>{formatCurrency(customer.totalSpent)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-1 py-1.5 align-middle text-center">
                    <button onClick={() => handleDelete(customer.id)} className="p-1 bg-carbon-error/10 text-carbon-error border border-brand-red/30 shadow-sm hover:translate-y-px transition-all">
                      <Trash2 size={12} strokeWidth={3} />
                    </button>
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
