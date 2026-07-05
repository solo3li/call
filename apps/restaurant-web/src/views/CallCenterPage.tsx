import { useFormatCurrency } from "../utils/useFormatCurrency";
import { useState, useMemo, useEffect } from "react";
import { 

  Search, 
  Plus, 
  Minus, 
  CreditCard, 
  ShoppingCart,
  Phone,
  User,
  MapPin,
  Store,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Edit3,
  Edit2
} from "lucide-react";

import { menuApi, branchesApi, customersApi, ordersApi, getImageUrl, deliveryApi } from "../utils/api";
import { MenuCategory, MenuItem, Branch, Customer, CustomerAddress, DeliveryZone } from "../types/api";
import { useDashboard } from "../context/DashboardContext";



// Robust phone normalization and comparison
const normalizePhone = (phone: string) => {
  if (!phone) return "";
  // Remove all non-digit characters
  let clean = phone.replace(/\D/g, "");
  // If it starts with 00966, remove it
  if (clean.startsWith("00966")) clean = clean.substring(5);
  // If it starts with 966, remove it
  if (clean.startsWith("966")) clean = clean.substring(3);
  // Remove leading zero if present
  if (clean.startsWith("0")) clean = clean.substring(1);
  return clean;
};

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
}

export default function CallCenterPage({ editOrderId, setEditOrderId }: { editOrderId?: string | null, setEditOrderId?: (id: string | null) => void }) {
  const formatCurrency = useFormatCurrency();
  const { customers: apiCustomers, refreshCustomers } = useDashboard();
  // Real API State
  const [loading, setLoading] = useState(false);
  const [apiCategories, setApiCategories] = useState<MenuCategory[]>([]);
  const [apiItems, setApiItems] = useState<MenuItem[]>([]);
  const [apiBranches, setApiBranches] = useState<Branch[]>([]);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState("");
  const [orderErrorMessage, setOrderErrorMessage] = useState("");

  // Customer Edit State
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editCustomerPhone, setEditCustomerPhone] = useState("");

  // Cart & POS State
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Call Center Specific State
  const [mobileNumber, setMobileNumber] = useState("");
  const [isCustomerFound, setIsCustomerFound] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [foundCustomerId, setFoundCustomerId] = useState<string | null>(null);
  
  const [orderType, setOrderType] = useState<"takeaway" | "delivery">("takeaway");
  const [selectedBranch, setSelectedBranch] = useState("");
  
  // Delivery specific
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [newAddress, setNewAddress] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState<number | "">("");
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [customerAddresses, setCustomerAddresses] = useState<CustomerAddress[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [zoneUploading, setZoneUploading] = useState(false);

  // Edit Order specific state
  const [editingOrderDetails, setEditingOrderDetails] = useState<any>(null);

  // Fetch API Data on Mount
  useEffect(() => {
    const fetchApiData = async () => {
      try {
        setLoading(true);
        const [catsRes, itemsRes, branchesRes] = await Promise.all([
          menuApi.getCategories().catch(() => ({ data: [] })),
          menuApi.getItems().catch(() => ({ data: [] })),
          branchesApi.getAll().catch(() => ({ data: [] })),
        ]);
        if (catsRes.data?.length) setApiCategories(catsRes.data);
        if (itemsRes.data?.length) setApiItems(itemsRes.data);
        if (branchesRes.data?.length) {
          setApiBranches(branchesRes.data);
          // Auto-select first branch if none selected
          if (branchesRes.data.length > 0 && !editOrderId) {
            setSelectedBranch(branchesRes.data[0].id);
          }
        }
      } catch (err) {
        console.error("Error fetching API data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApiData();
  }, [editOrderId]);

  useEffect(() => {
    if (editOrderId && apiItems.length > 0 && apiCustomers.length > 0) {
      setLoading(true);
      ordersApi.getById(editOrderId).then(res => {
        const order = res.data;
        setEditingOrderDetails(order);
        
        const mappedCart = order.items.map((i: any) => ({
          id: i.menuItemId,
          name: i.menuItemName,
          price: i.price,
          quantity: i.quantity,
          emoji: "🍽️"
        }));
        setCart(mappedCart);
        setOrderType(order.orderType === "Delivery" || order.orderType === "توصيل" ? "delivery" : "takeaway");
        setCustomerName(order.customerName);
        if (order.branchId) setSelectedBranch(order.branchId);
        
        const foundCust = apiCustomers.find(c => c.name === order.customerName || c.id === order.customerId);
        if (foundCust) {
           setFoundCustomerId(foundCust.id);
           setMobileNumber(foundCust.phoneNumber);
           setIsCustomerFound(true);
           setCustomerAddresses(foundCust.customerAddresses || []);
           if (order.addressId) {
             setSelectedAddressId(order.addressId);
           }
        }
      }).catch(err => console.error("Error fetching edit order", err))
        .finally(() => setLoading(false));
    }
  }, [editOrderId, apiItems, apiCustomers]);

  useEffect(() => {
    if (selectedBranch && selectedBranch.length > 30) {
      deliveryApi.getZones(selectedBranch).then(res => {
        setDeliveryZones(res.data);
      }).catch(err => console.error("Error fetching zones", err));
    } else {
      setDeliveryZones([]);
    }
  }, [selectedBranch]);

  const categories = useMemo(() => {
    const names = apiCategories.map(c => c.name);
    return ["الكل", ...Array.from(new Set(names))];
  }, [apiCategories]);

  const itemsWithCategories = useMemo(() => {
    return apiItems.map((item) => {
      const cat = apiCategories.find(c => c.id === item.categoryId);
      return {
        id: item.id,
        name: item.name,
        price: item.price,
        category: cat ? cat.name : "عام",
        emoji: cat?.icon || "🍽️",
        imageUrl: item.imageUrl
      };
    });
  }, [apiItems, apiCategories]);

  const displayBranches = useMemo(() => {
    return apiBranches.map(b => ({ id: b.id, name: b.name }));
  }, [apiBranches]);

  const displayItems = useMemo(() => {
    return itemsWithCategories.filter(item => {
      const matchesCategory = activeCategory === "الكل" || item.category === activeCategory;
      const matchesSearch = item.name.includes(searchQuery);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, itemsWithCategories]);

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, emoji: item.emoji }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleMobileSearch = () => {
    if (mobileNumber.length >= 3) {
      const searchNorm = normalizePhone(mobileNumber);
      // Search API customers first with normalized comparison
      const apiFound = apiCustomers.find(c => {
        const cNorm = normalizePhone(c.phoneNumber);
        return cNorm === searchNorm || (cNorm.length >= 3 && searchNorm.includes(cNorm)) || (searchNorm.length >= 3 && cNorm.includes(searchNorm));
      });

      if (apiFound) {
        setIsCustomerFound(true);
        setCustomerName(apiFound.name);
        setFoundCustomerId(apiFound.id);
        const addresses = apiFound.customerAddresses || [];
        setCustomerAddresses(addresses);
        if (addresses.length > 0) {
          setSelectedAddressId(addresses[0].id);
          setIsAddingNewAddress(false);
        } else {
          setIsAddingNewAddress(true);
        }
        return;
      }
      setIsCustomerFound(false);
      setCustomerName("");
      setFoundCustomerId(null);
      setCustomerAddresses([]);
      setSelectedAddressId(null);
      setIsAddingNewAddress(true);
    }
  };

  const parseAddressCoords = (address: string): { latitude?: number; longitude?: number } => {
    const match = address.trim().match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    if (match) {
      return { latitude: parseFloat(match[1]), longitude: parseFloat(match[2]) };
    }
    return {};
  };

  const handleAddNewAddress = async () => {
    if (!foundCustomerId) {
      // Need to create customer first
      try {
        const res = await customersApi.create({
          name: customerName || "عميل جديد",
          phoneNumber: mobileNumber
        });
        setFoundCustomerId(res.data.id);
        await refreshCustomers();
        const coords = parseAddressCoords(newAddress);
        const addrRes = await deliveryApi.addCustomerAddress(res.data.id, {
          addressDetails: newAddress,
          deliveryZoneId: selectedZoneId || undefined,
          ...coords
        });
        await refreshCustomers();
        setCustomerAddresses(prev => [...prev, addrRes.data]);
        setSelectedAddressId(addrRes.data.id);
        setIsAddingNewAddress(false);
        setNewAddress("");
        setSelectedZoneId("");
      } catch (err) {
        alert("فشل إضافة العميل والعنوان");
      }
    } else {
      try {
        const coords = parseAddressCoords(newAddress);
        const addrRes = await deliveryApi.addCustomerAddress(foundCustomerId, {
          addressDetails: newAddress,
          deliveryZoneId: selectedZoneId || undefined,
          ...coords
        });
        await refreshCustomers();
        setCustomerAddresses(prev => [...prev, addrRes.data]);
        setSelectedAddressId(addrRes.data.id);
        setIsAddingNewAddress(false);
        setNewAddress("");
        setSelectedZoneId("");
      } catch (err) {
        alert("فشل إضافة العنوان");
      }
    }
  };

  const handleUpdateCustomer = async () => {
    if (!foundCustomerId) return;
    try {
      setLoading(true);
      await customersApi.update(foundCustomerId, {
        name: editCustomerName,
        phoneNumber: editCustomerPhone
      });
      await refreshCustomers();
      setCustomerName(editCustomerName);
      setMobileNumber(editCustomerPhone);
      setIsEditingCustomer(false);
    } catch (err) {
      alert("فشل تحديث بيانات العميل");
    } finally {
      setLoading(false);
    }
  };

  const handleAddZone = async (name: string, cost: number) => {
    if (!selectedBranch) return;
    try {
      const res = await deliveryApi.createZone({
        name,
        deliveryCost: cost,
        branchId: selectedBranch
      });
      setDeliveryZones(prev => [...prev, res.data]);
    } catch (err) {
      alert("فشل إضافة المنطقة");
    }
  };

  const handleConfirmOrder = async () => {
    setOrderErrorMessage("");
    setOrderSuccessMessage("");
    try {
      setLoading(true);
      
      let customerId = foundCustomerId;

      // If customer doesn't exist yet, create them
      if (!customerId) {
        try {
          const newCustRes = await customersApi.create({
            name: customerName || "عميل جديد",
            phoneNumber: mobileNumber,
          });
          customerId = newCustRes.data.id;
          setFoundCustomerId(customerId);
        } catch (custErr) {
          console.error("Could not create customer", custErr);
        }
      }

      // If delivery and new address was typed but not saved, save it now
      let finalAddressId = selectedAddressId;
      if (orderType === "delivery" && !finalAddressId && newAddress && customerId) {
        try {
          const coords = parseAddressCoords(newAddress);
          const addrRes = await deliveryApi.addCustomerAddress(customerId, {
            addressDetails: newAddress,
            deliveryZoneId: selectedZoneId || undefined,
            ...coords
          });
          finalAddressId = addrRes.data.id;
        } catch (addrErr) {
          console.error("Could not save address", addrErr);
        }
      }

      // Create order payload
      const orderPayload = {
        items: cart.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity
        })),
        orderType: orderType === "delivery" ? "توصيل" : "استلام",
        customerName: customerName || "عميل بدون اسم",
        branchId: selectedBranch || undefined,
        customerId: customerId,
        addressId: finalAddressId
      };

      if (editOrderId) {
        await ordersApi.update(editOrderId, orderPayload);
        setOrderSuccessMessage(`تم تحديث الطلب بنجاح!`);
        setTimeout(() => {
          if (setEditOrderId) setEditOrderId(null);
        }, 1500);
      } else {
        const res = await ordersApi.create(orderPayload);
        setOrderSuccessMessage(`تم تأكيد الطلب بنجاح! رقم الطلب: ${res.data.orderNumber}`);
      }
      
      setCart([]);
      setMobileNumber("");
      setCustomerName("");
      setFoundCustomerId(null);
      setIsCustomerFound(false);
      setNewAddress("");
      setSelectedAddressId(null);
    } catch (err: any) {
      console.error("Error creating/updating order", err);
      const errorMessage = err.response?.data?.message || "حدث خطأ أثناء تأكيد الطلب. يرجى المحاولة مرة أخرى.";
      setOrderErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = orderType === "delivery" 
    ? (customerAddresses.find(a => a.id === selectedAddressId)?.deliveryCost || 15) 
    : 0;
  const cartTax = (cartTotal + deliveryFee) * 0.15;
  const cartGrandTotal = cartTotal + deliveryFee + cartTax;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
      {/* Menu / POS Section */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {editOrderId && (
          <div className="neo-card bg-brand-yellow/20 p-4 border-2 border-brand-yellow flex items-center justify-between">
            <h3 className="font-black text-brand-orange flex items-center gap-2"><Edit3 size={18}/> جاري تعديل الطلب</h3>
            <button 
              onClick={() => { if(setEditOrderId) setEditOrderId(null); }}
              className="neo-btn bg-white px-3 py-1.5 text-xs font-black shadow-[2px_2px_0px_#1A1A1A]"
            >
              إلغاء التعديل
            </button>
          </div>
        )}
        {/* Search and Filters */}
        <div className="neo-card p-4 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-neo-border" strokeWidth={3} />
            <input 
              type="text" 
              placeholder="ابحث عن صنف..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="neo-input w-full !pr-12 border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] font-bold"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`neo-btn px-4 py-2 whitespace-nowrap text-sm font-black border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] transition-all hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_#1A1A1A] ${activeCategory === cat ? 'bg-brand-yellow' : 'bg-white'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
            {displayItems.map(item => (
              <button 
                key={item.id}
                onClick={() => addToCart(item)}
                className="flex items-center justify-between p-2 border-2 border-neo-border bg-white shadow-[2px_2px_0px_#1A1A1A] hover:bg-brand-yellow hover:-translate-y-px transition-all active:translate-y-[2px] active:shadow-none"
              >
                <div className="flex flex-col text-right w-[calc(100%-40px)]">
                  <span className="font-black text-[11px] leading-tight line-clamp-2 text-neo-text">{item.name}</span>
                  <span className="font-black text-xs text-brand-blue mt-0.5">{formatCurrency(item.price)}</span>
                </div>
                <div className="w-8 h-8 bg-[#FFFBEB] border-2 border-neo-border flex shrink-0 items-center justify-center overflow-hidden shadow-[1px_1px_0px_#1A1A1A]">
                  {item.imageUrl ? (
                   <img src={getImageUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover" />
                  ) : (                    
                   <span className="text-lg leading-none">{item.emoji}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Customer & Call Center Flow Section */}
      <div className="w-full lg:w-[450px] flex flex-col gap-4 h-full overflow-y-auto pr-1">
        
        {/* Step 1: Customer Phone */}
        <div className="neo-card p-4 border-2 border-neo-border shadow-[4px_4px_0px_#1A1A1A] bg-white">
          <h3 className="font-black text-lg flex items-center gap-2 mb-3">
            <Phone size={20} strokeWidth={3} className="text-brand-orange" />
            ١. بيانات المتصل
          </h3>
          
          {!isCustomerFound && (
            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                placeholder="رقم الجوال (مثال: 050123...)" 
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="neo-input flex-1 border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] font-bold text-left dir-ltr"
                maxLength={25}
                disabled={isEditingCustomer}
              />
              <button 
                onClick={handleMobileSearch}
                disabled={isEditingCustomer}
                className="neo-btn bg-brand-blue text-white px-4 border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] font-black hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_#1A1A1A] transition-all disabled:opacity-50"
              >
                بحث
              </button>
            </div>
          )}

          {!isCustomerFound && mobileNumber.length >= 3 && (
            <div className="space-y-2 mt-3 animate-fade-in">
              <div className="bg-brand-yellow/20 border-2 border-brand-yellow p-2 rounded-md flex items-center gap-2 font-bold text-xs text-brand-orange">
                عميل جديد، سيتم الحفظ تلقائياً
              </div>
              <input 
                type="text" 
                placeholder="اسم العميل الجديد" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="neo-input w-full border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] font-bold text-sm"
              />
            </div>
          )}

          {isCustomerFound && !isEditingCustomer && (
            <div className="bg-[#FFFBEB] border-2 border-neo-border p-3 rounded-lg shadow-[2px_2px_0px_#1A1A1A] space-y-3 animate-fade-in">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-pink border-2 border-neo-border flex items-center justify-center font-black text-lg">
                    {customerName?.[0] || '👤'}
                  </div>
                  <div>
                    <h4 className="font-black text-sm flex items-center gap-2">
                      {customerName}
                      <span className="bg-brand-green text-white text-[9px] px-1.5 py-0.5 rounded-full border border-neo-border">مسجل</span>
                    </h4>
                    <p className="text-xs font-bold text-gray-500 dir-ltr text-right">{mobileNumber}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => {
                    setEditCustomerName(customerName);
                    setEditCustomerPhone(mobileNumber);
                    setIsEditingCustomer(true);
                  }} className="w-7 h-7 bg-white border-2 border-neo-border rounded flex items-center justify-center hover:bg-brand-yellow transition-colors" title="تعديل البيانات">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => {
                    setMobileNumber("");
                    setCustomerName("");
                    setFoundCustomerId(null);
                    setIsCustomerFound(false);
                    setCustomerAddresses([]);
                    setSelectedAddressId(null);
                  }} className="w-7 h-7 bg-brand-red text-white border-2 border-neo-border rounded flex items-center justify-center hover:opacity-90 transition-colors" title="مسح">
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div className="border-t-2 border-dashed border-neo-border pt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-gray-500 uppercase">عناوين التوصيل السريع:</span>
                  <button 
                    onClick={() => {
                      setOrderType("delivery");
                      setIsAddingNewAddress(true);
                    }} 
                    className="text-[10px] font-black text-brand-blue underline hover:text-brand-orange transition-colors"
                  >
                    + إضافة عنوان
                  </button>
                </div>
                
                {customerAddresses.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                    {customerAddresses.map(addr => (
                      <button 
                        key={addr.id}
                        onClick={() => {
                          setSelectedAddressId(addr.id);
                          setOrderType("delivery");
                          setIsAddingNewAddress(false);
                        }}
                        className={`flex items-center gap-2 text-[11px] font-bold p-2 rounded-md border-2 transition-all text-right ${selectedAddressId === addr.id ? 'bg-brand-blue text-white border-neo-border translate-x-1 shadow-[2px_2px_0px_#1A1A1A]' : 'bg-white border-neo-border/20 hover:border-neo-border hover:shadow-[2px_2px_0px_#1A1A1A]'}`}
                      >
                        <MapPin size={12} className={selectedAddressId === addr.id ? 'text-white shrink-0' : 'text-brand-blue shrink-0'} />
                        <span className="line-clamp-2 flex-1 leading-tight">{addr.addressDetails}</span>
                        {selectedAddressId === addr.id && <CheckCircle size={12} className="shrink-0" />}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border-2 border-neo-border border-dashed p-3 rounded-md text-center">
                    <p className="text-xs font-bold text-gray-400">لا توجد عناوين توصيل لهذا العميل.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {isEditingCustomer && (
            <div className="bg-brand-yellow/10 border-2 border-brand-yellow p-3 rounded-lg shadow-[2px_2px_0px_#1A1A1A] space-y-3 mt-3 animate-fade-in">
              <h4 className="font-black text-sm text-brand-orange flex items-center gap-1"><Edit3 size={14}/> تحديث بيانات العميل</h4>
              <input 
                type="text" 
                value={editCustomerName}
                onChange={e => setEditCustomerName(e.target.value)}
                className="neo-input w-full text-sm"
                placeholder="اسم العميل"
              />
              <input 
                type="text" 
                value={editCustomerPhone}
                onChange={e => setEditCustomerPhone(e.target.value)}
                className="neo-input w-full text-sm dir-ltr text-right"
                placeholder="رقم الجوال"
                maxLength={25}
              />
              <div className="flex gap-2 pt-1">
                 <button onClick={handleUpdateCustomer} disabled={loading} className="neo-btn bg-brand-green flex-1 py-1.5 text-xs border-2 border-neo-border shadow-[1px_1px_0px_#1A1A1A]">حفظ التحديث</button>
                 <button onClick={() => setIsEditingCustomer(false)} className="neo-btn bg-white px-3 py-1.5 text-xs border-2 border-neo-border shadow-[1px_1px_0px_#1A1A1A]">إلغاء</button>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Order Details */}
        <div className="neo-card flex-1 flex flex-col overflow-hidden border-2 border-neo-border shadow-[4px_4px_0px_#1A1A1A] bg-white min-h-[300px]">
          <div className="p-4 border-b-2 border-neo-border bg-[#FFFBEB] flex items-center justify-between">
            <h3 className="font-black text-lg flex items-center gap-2">
              <ShoppingCart size={20} strokeWidth={3} />
              ٢. الطلب
            </h3>
            <span className="neo-badge bg-brand-yellow border-2 border-neo-border shadow-[1px_1px_0px_#1A1A1A]">{cart.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-neo-border gap-2 opacity-60">
                <ShoppingCart size={32} />
                <p className="font-black">السلة فارغة</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center gap-2 bg-[#FFFBEB] p-2 rounded-lg border-2 border-neo-border shadow-[1px_1px_0px_#1A1A1A]">
                  <div className="flex-1">
                    <h4 className="font-black text-sm line-clamp-1">{item.name}</h4>
                    <p className="text-xs font-black text-brand-blue">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 neo-btn bg-brand-red text-white p-0 flex items-center justify-center border-2 border-neo-border"
                    >
                      <Minus size={14} strokeWidth={3} />
                    </button>
                    <span className="font-black w-4 text-center text-sm">{item.quantity}</span>
                    <button 
                      onClick={() => addToCart(item)}
                      className="w-6 h-6 neo-btn bg-brand-green p-0 flex items-center justify-center border-2 border-neo-border"
                    >
                      <Plus size={14} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Step 3: Fulfillment */}
        <div className="neo-card p-4 border-2 border-neo-border shadow-[4px_4px_0px_#1A1A1A] bg-white space-y-4">
          <h3 className="font-black text-lg flex items-center gap-2">
            <Store size={20} strokeWidth={3} />
            ٣. التوصيل والاستلام
          </h3>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setOrderType("takeaway")}
              className={`flex-1 py-2 font-black border-2 border-neo-border rounded-lg transition-all shadow-[2px_2px_0px_#1A1A1A] ${orderType === "takeaway" ? "bg-brand-yellow text-neo-border" : "bg-[#FFFBEB] hover:bg-gray-100"}`}
            >
              استلام (سفري)
            </button>
            <button 
              onClick={() => setOrderType("delivery")}
              className={`flex-1 py-2 font-black border-2 border-neo-border rounded-lg transition-all shadow-[2px_2px_0px_#1A1A1A] ${orderType === "delivery" ? "bg-brand-blue text-white" : "bg-[#FFFBEB] hover:bg-gray-100"}`}
            >
              توصيل
            </button>
          </div>

          <div className="space-y-3">
            {/* Customer Name Input (Always needed unless found) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">اسم العميل</label>
              <input 
                type="text" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="أدخل اسم العميل..."
                className="neo-input w-full border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] font-bold bg-[#FFFBEB]"
              />
            </div>

            {/* Branch Selection (Always needed) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">توجيه الطلب للفرع</label>
              <div className="relative">
                <select 
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="neo-input w-full border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] font-bold bg-[#FFFBEB] appearance-none"
                >
                  <option value="" disabled>اختر الفرع...</option>
                  {displayBranches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Delivery specific: Address */}
            {orderType === "delivery" && (
              <div className="pt-2 border-t-2 border-dashed border-neo-border">
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <MapPin size={14} /> عنوان التوصيل
                </label>
                
                {customerAddresses.length > 0 && !isAddingNewAddress ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <select 
                        value={selectedAddressId || ""}
                        onChange={(e) => setSelectedAddressId(parseInt(e.target.value))}
                        className="neo-input w-full border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] font-bold bg-[#FFFBEB] appearance-none"
                      >
                        <option value="" disabled>اختر عنواناً...</option>
                        {customerAddresses.map((addr) => (
                          <option key={addr.id} value={addr.id}>{addr.addressDetails} ({addr.deliveryZoneName || 'بدون منطقة'})</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <button 
                      onClick={() => setIsAddingNewAddress(true)}
                      className="text-xs font-black text-brand-blue underline"
                    >
                      + إضافة عنوان جديد لهذا العميل
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea 
                      placeholder="أدخل عنوان التوصيل أو الإحداثيات (مثال: 24.7136,46.6753)..."
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      className="neo-input w-full border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] font-bold bg-[#FFFBEB] h-20 resize-none"
                    />
                    {newAddress.trim().match(/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/) && (
                      <div className="flex items-center gap-1 text-xs font-bold text-brand-green bg-green-50 px-2 py-1 rounded border border-green-200">
                        <MapPin size={12} /> تم اكتشاف إحداثيات GPS تلقائياً ✓
                      </div>
                    )}
                    <select 
                      className="neo-input w-full border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] font-bold bg-[#FFFBEB]"
                      value={selectedZoneId}
                      onChange={(e) => setSelectedZoneId(e.target.value === "" ? "" : parseInt(e.target.value))}
                    >
                      <option value="">اختر منطقة التوصيل (اختياري)</option>
                      {deliveryZones.map(z => (
                        <option key={z.id} value={z.id}>{z.name} (+{z.deliveryCost} ر.س)</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button 
                        onClick={handleAddNewAddress}
                        disabled={!newAddress}
                        className="neo-btn bg-brand-green flex-1 py-1.5 text-xs font-black border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] disabled:opacity-50"
                      >
                        حفظ العنوان
                      </button>
                      {customerAddresses.length > 0 && (
                        <button 
                          onClick={() => setIsAddingNewAddress(false)}
                          className="neo-btn bg-white px-3 py-1.5 text-xs font-black border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A]"
                        >
                          إلغاء
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Total & Submit */}
        <div className="neo-card p-4 border-2 border-neo-border shadow-[4px_4px_0px_#1A1A1A] bg-gray-50">
          <div className="space-y-1 mb-3">
             <div className="flex justify-between text-xs font-bold">
              <span className="text-gray-600">المجموع الفرعي</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            {orderType === "delivery" && (
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-600">رسوم التوصيل</span>
                <span>{formatCurrency(deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs font-bold">
              <span className="text-gray-600">الضريبة (١٥٪)</span>
              <span>{formatCurrency(cartTax)}</span>
            </div>
            <div className="flex justify-between text-lg font-black pt-2 border-t-2 border-neo-border mt-2 mb-3">
              <span>الإجمالي</span>
              <span className="text-brand-orange">{formatCurrency(cartGrandTotal)}</span>
            </div>

            {orderSuccessMessage && (
              <div className="bg-brand-green/20 border-2 border-brand-green p-3 rounded-lg flex items-center gap-2 font-black text-sm text-brand-green shadow-[2px_2px_0px_#1A1A1A] mb-3 animate-fade-in">
                <CheckCircle size={20} className="shrink-0" />
                <span>{orderSuccessMessage}</span>
              </div>
            )}
            {orderErrorMessage && (
              <div className="bg-brand-red/20 border-2 border-brand-red p-3 rounded-lg flex items-center gap-2 font-black text-sm text-brand-red shadow-[2px_2px_0px_#1A1A1A] mb-3 animate-fade-in">
                <AlertCircle size={20} className="shrink-0" />
                <span>{orderErrorMessage}</span>
              </div>
            )}
          </div>
          
          <button 
            disabled={cart.length === 0 || !customerName || !selectedBranch || (orderType === "delivery" && !selectedAddressId && !newAddress) || loading}
            onClick={handleConfirmOrder}
            className="neo-btn bg-brand-green w-full py-4 flex items-center justify-center gap-2 text-lg font-black border-2 border-neo-border shadow-[4px_4px_0px_#1A1A1A] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#1A1A1A] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_#1A1A1A]"
          >
            {loading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <CreditCard size={24} strokeWidth={2.5} />
            )}
            {loading ? "جاري الحفظ..." : (editOrderId ? "تحديث الطلب" : "تأكيد الطلب")}
          </button>
        </div>

      </div>
    </div>
  );
}
