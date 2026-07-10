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
import { externalCompanyService, ExternalCompany } from "../services/externalCompanyService";



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

  // External Company State
  const [externalCompanies, setExternalCompanies] = useState<ExternalCompany[]>([]);
  const [selectedExternalCompany, setSelectedExternalCompany] = useState("");
  const [externalOrderId, setExternalOrderId] = useState("");

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

      try {
        const companies = await externalCompanyService.getAll();
        setExternalCompanies(companies.filter(c => c.isActive));
      } catch (err) {
        console.error("Error fetching external companies", err);
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

    if (!selectedBranch) {
      setOrderErrorMessage("يرجى اختيار الفرع قبل إتمام الطلب");
      return;
    }

    if (cart.length === 0) {
      setOrderErrorMessage("لا يمكن إتمام طلب وسلة المشتريات فارغة");
      return;
    }

    if (!selectedExternalCompany && !mobileNumber) {
      setOrderErrorMessage("يرجى إدخال رقم الجوال للعميل أولاً");
      return;
    }

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
        addressId: finalAddressId,
        externalCompanyId: selectedExternalCompany || undefined,
        externalOrderId: externalOrderId || undefined,
        customerPhone: mobileNumber || undefined
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
      setSelectedExternalCompany("");
      setExternalOrderId("");
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
    <div className="flex flex-col lg:flex-row gap-1 h-[calc(100vh-140px)]">
      {/* Menu / POS Section */}
      <div className="flex-1 flex flex-col gap-1 overflow-hidden">
        {editOrderId && (
          <div className="neo-card bg-brand-yellow/20 p-1 border border-brand-yellow flex items-center justify-between">
            <h3 className="font-black text-[9px] text-brand-orange flex items-center gap-1"><Edit3 size={10}/> جاري تعديل الطلب</h3>
            <button 
              onClick={() => { if(setEditOrderId) setEditOrderId(null); }}
              className="bg-white px-2 py-0.5 text-[8px] font-black border border-neo-border"
            >
              إلغاء
            </button>
          </div>
        )}
        {/* Search and Filters */}
        <div className="p-1 flex flex-col sm:flex-row gap-1 items-center bg-white border border-neo-border shrink-0">
          <div className="relative flex-1 w-full">
            <Search size={12} className="absolute right-1 top-1/2 -translate-y-1/2 text-neo-border" strokeWidth={3} />
            <input 
              type="text" 
              placeholder="بحث..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 !pr-5 pl-1 py-0.5 border border-neo-border font-bold text-[10px] outline-none focus:bg-white transition-colors"
            />
          </div>
          <div className="flex gap-0.5 overflow-x-auto pb-0.5 sm:pb-0 w-full sm:w-auto custom-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-1.5 py-0.5 whitespace-nowrap text-[9px] font-black border border-neo-border transition-all ${activeCategory === cat ? 'bg-brand-yellow text-neo-text shadow-sm' : 'bg-gray-50 hover:bg-white text-gray-600'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-0.5 pb-1">
            {displayItems.map(item => (
              <button 
                key={item.id}
                onClick={() => addToCart(item)}
                className="flex items-center justify-between p-0.5 border border-neo-border bg-white hover:bg-brand-yellow transition-colors"
              >
                <div className="flex flex-col text-right w-[calc(100%-20px)]">
                  <span className="font-black text-[8px] leading-tight line-clamp-1 text-neo-text">{item.name}</span>
                  <span className="font-black text-[9px] text-brand-blue leading-tight">{formatCurrency(item.price)}</span>
                </div>
                <div className="w-5 h-5 bg-[#FFFBEB] border border-neo-border flex shrink-0 items-center justify-center overflow-hidden">
                  {item.imageUrl ? (
                   <img src={getImageUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover" />
                  ) : (                    
                   <span className="text-[10px] leading-none">{item.emoji}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Customer & Call Center Flow Section */}
      <div className="w-full lg:w-[260px] flex flex-col gap-1 h-[50%] lg:h-full overflow-y-auto pr-0.5 shrink-0 border-t-2 lg:border-t-0 border-neo-border pt-1 lg:pt-0">
        
        {/* Step 1: Customer Phone */}
        <div className="bg-white p-1 border border-neo-border">
          <h3 className="font-black text-[10px] flex items-center gap-1 mb-1">
            <Phone size={10} strokeWidth={3} className="text-brand-orange" />
            ١. بيانات المتصل
          </h3>
          
          {!isCustomerFound && (
            <div className="flex gap-1 mb-0.5">
              <input 
                type="text" 
                placeholder="رقم الجوال..." 
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="flex-1 bg-gray-50 border border-neo-border font-bold text-left dir-ltr py-0.5 px-1 text-[9px] outline-none focus:bg-white"
                maxLength={25}
                disabled={isEditingCustomer}
              />
              <button 
                onClick={handleMobileSearch}
                disabled={isEditingCustomer}
                className="bg-brand-blue text-white px-2 py-0.5 text-[9px] border border-neo-border font-black transition-colors disabled:opacity-50"
              >
                بحث
              </button>
            </div>
          )}

          {!isCustomerFound && mobileNumber.length >= 3 && (
            <div className="space-y-0.5 mt-0.5 animate-fade-in">
              <div className="bg-brand-yellow/20 border border-brand-yellow p-0.5 rounded-sm flex items-center gap-0.5 font-bold text-[8px] text-brand-orange">
                عميل جديد
              </div>
              <input 
                type="text" 
                placeholder="الاسم..." 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-gray-50 border border-neo-border font-bold text-[9px] py-0.5 px-1 outline-none focus:bg-white"
              />
            </div>
          )}

          {isCustomerFound && !isEditingCustomer && (
            <div className="bg-[#FFFBEB] border border-neo-border p-1 rounded-sm space-y-1 animate-fade-in">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1">
                  <div className="w-5 h-5 bg-brand-pink border border-neo-border flex items-center justify-center font-black text-[9px]">
                    {customerName?.[0] || '👤'}
                  </div>
                  <div>
                    <h4 className="font-black text-[9px] flex items-center gap-1 leading-tight">
                      {customerName}
                      <span className="bg-brand-green text-white text-[7px] px-0.5 py-0 rounded-sm border border-neo-border">مسجل</span>
                    </h4>
                    <p className="text-[9px] font-bold text-gray-500 dir-ltr text-right leading-tight">{mobileNumber}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  <button onClick={() => {
                    setEditCustomerName(customerName);
                    setEditCustomerPhone(mobileNumber);
                    setIsEditingCustomer(true);
                  }} className="w-4 h-4 bg-white border border-neo-border rounded-sm flex items-center justify-center hover:bg-brand-yellow transition-colors" title="تعديل">
                    <Edit3 size={8} />
                  </button>
                  <button onClick={() => {
                    setMobileNumber("");
                    setCustomerName("");
                    setFoundCustomerId(null);
                    setIsCustomerFound(false);
                    setCustomerAddresses([]);
                    setSelectedAddressId(null);
                  }} className="w-4 h-4 bg-brand-red text-white border border-neo-border rounded-sm flex items-center justify-center hover:opacity-90 transition-colors" title="مسح">
                    <X size={8} />
                  </button>
                </div>
              </div>

              <div className="border-t border-dashed border-neo-border pt-1">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[8px] font-black text-gray-500 uppercase">العناوين:</span>
                  <button 
                    onClick={() => {
                      setOrderType("delivery");
                      setIsAddingNewAddress(true);
                    }} 
                    className="text-[8px] font-black text-brand-blue underline hover:text-brand-orange transition-colors"
                  >
                    + عنوان
                  </button>
                </div>
                
                {customerAddresses.length > 0 ? (
                  <div className="grid grid-cols-1 gap-0.5 max-h-32 overflow-y-auto custom-scrollbar pr-0.5">
                    {customerAddresses.map(addr => (
                      <button 
                        key={addr.id}
                        onClick={() => {
                          setSelectedAddressId(addr.id);
                          setOrderType("delivery");
                          setIsAddingNewAddress(false);
                        }}
                        className={`flex items-center gap-1 text-[8px] font-bold p-0.5 rounded-sm border transition-colors text-right ${selectedAddressId === addr.id ? 'bg-brand-blue text-white border-neo-border' : 'bg-white border-neo-border/20 hover:border-neo-border'}`}
                      >
                        <MapPin size={8} className={selectedAddressId === addr.id ? 'text-white shrink-0' : 'text-brand-blue shrink-0'} />
                        <span className="line-clamp-1 flex-1 leading-tight">{addr.addressDetails}</span>
                        {selectedAddressId === addr.id && <CheckCircle size={8} className="shrink-0" />}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-neo-border border-dashed p-1 rounded-sm text-center">
                    <p className="text-[8px] font-bold text-gray-400">لا توجد عناوين</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {isEditingCustomer && (
            <div className="bg-brand-yellow/10 border border-brand-yellow p-1 rounded-sm space-y-1 mt-1 animate-fade-in">
              <h4 className="font-black text-[9px] text-brand-orange flex items-center gap-1"><Edit3 size={10}/> تحديث البيانات</h4>
              <input 
                type="text" 
                value={editCustomerName}
                onChange={e => setEditCustomerName(e.target.value)}
                className="w-full bg-white border border-neo-border text-[9px] py-0.5 px-1 outline-none"
                placeholder="الاسم"
              />
              <input 
                type="text" 
                value={editCustomerPhone}
                onChange={e => setEditCustomerPhone(e.target.value)}
                className="w-full bg-white border border-neo-border text-[9px] py-0.5 px-1 dir-ltr text-right outline-none"
                placeholder="الجوال"
                maxLength={25}
              />
              <div className="flex gap-0.5 pt-0.5">
                 <button onClick={handleUpdateCustomer} disabled={loading} className="bg-brand-green text-white flex-1 py-0.5 text-[9px] border border-neo-border font-black">حفظ</button>
                 <button onClick={() => setIsEditingCustomer(false)} className="bg-white px-2 py-0.5 text-[9px] border border-neo-border font-black">إلغاء</button>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Order Details */}
        <div className="bg-white flex-1 flex flex-col overflow-hidden border border-neo-border min-h-[150px]">
          <div className="p-1 border-b border-neo-border bg-[#FFFBEB] flex items-center justify-between">
            <h3 className="font-black text-[10px] flex items-center gap-1">
              <ShoppingCart size={12} strokeWidth={3} />
              ٢. الطلب
            </h3>
            <span className="bg-brand-yellow border border-neo-border text-[8px] px-1 py-0 font-black">{cart.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-neo-border gap-1 opacity-60">
                <ShoppingCart size={16} />
                <p className="font-black text-[9px]">السلة فارغة</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center gap-1 bg-[#FFFBEB] p-0.5 rounded-sm border border-neo-border">
                  <div className="flex-1">
                    <h4 className="font-black text-[9px] line-clamp-1">{item.name}</h4>
                    <p className="text-[8px] font-black text-brand-blue">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-4 h-4 bg-brand-red text-white p-0 flex items-center justify-center border border-neo-border"
                    >
                      <Minus size={8} strokeWidth={3} />
                    </button>
                    <span className="font-black w-3 text-center text-[9px]">{item.quantity}</span>
                    <button 
                      onClick={() => addToCart(item)}
                      className="w-4 h-4 bg-brand-green text-white p-0 flex items-center justify-center border border-neo-border"
                    >
                      <Plus size={8} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Step 3: Fulfillment */}
        <div className="bg-white p-1 border border-neo-border space-y-1">
          <h3 className="font-black text-[10px] flex items-center gap-1">
            <Store size={10} strokeWidth={3} />
            ٣. التوصيل والاستلام
          </h3>
          
          <div className="flex gap-0.5">
            <button 
              onClick={() => setOrderType("takeaway")}
              className={`flex-1 py-0.5 text-[9px] font-black border border-neo-border rounded-sm transition-colors ${orderType === "takeaway" ? "bg-brand-yellow text-neo-text" : "bg-[#FFFBEB] hover:bg-gray-100"}`}
            >
              استلام (سفري)
            </button>
            <button 
              onClick={() => setOrderType("delivery")}
              className={`flex-1 py-0.5 text-[9px] font-black border border-neo-border rounded-sm transition-colors ${orderType === "delivery" ? "bg-brand-blue text-white" : "bg-[#FFFBEB] hover:bg-gray-100"}`}
            >
              توصيل
            </button>
          </div>

          <div className="space-y-0.5">
            {/* Customer Name Input (Always needed unless found) */}
            <div>
              <label className="block text-[8px] font-bold text-gray-700 mb-0">اسم العميل</label>
              <input 
                type="text" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="الاسم..."
                className="w-full bg-gray-50 border border-neo-border font-bold py-0.5 px-1 text-[9px] outline-none focus:bg-white"
              />
            </div>

            {/* Branch Selection (Always needed) */}
            <div>
              <label className="block text-[8px] font-bold text-gray-700 mb-0">توجيه الطلب للفرع</label>
              <div className="relative">
                <select 
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full bg-gray-50 border border-neo-border font-bold appearance-none py-0.5 px-1 text-[9px] outline-none focus:bg-white"
                >
                  <option value="" disabled>اختر الفرع...</option>
                  {displayBranches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <ChevronDown size={10} className="absolute left-1 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* External Company (Optional) */}
            <div className="pt-0.5 border-t border-dashed border-neo-border">
              <label className="block text-[8px] font-bold text-gray-700 mb-0">شركة التوصيل الخارجية (اختياري)</label>
              <div className="flex gap-1">
                <div className="relative flex-1">
                  <select
                    value={selectedExternalCompany}
                    onChange={(e) => setSelectedExternalCompany(e.target.value)}
                    className="w-full bg-gray-50 border border-neo-border font-bold appearance-none py-0.5 px-1 text-[9px] outline-none focus:bg-white"
                  >
                    <option value="">بدون تطبيق خارجي</option>
                    {externalCompanies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={10} className="absolute left-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {selectedExternalCompany && (
                  <input
                    type="text"
                    value={externalOrderId}
                    onChange={(e) => setExternalOrderId(e.target.value)}
                    placeholder="رقم الطلب الخارجي..."
                    className="flex-1 bg-gray-50 border border-neo-border font-bold py-0.5 px-1 text-[9px] outline-none focus:bg-white dir-ltr text-right"
                  />
                )}
              </div>
            </div>

            {/* Delivery specific: Address */}
            {orderType === "delivery" && !selectedExternalCompany && (
              <div className="pt-0.5 border-t border-dashed border-neo-border">
                <label className="block text-[8px] font-bold text-gray-700 mb-0 flex items-center gap-0.5">
                  <MapPin size={8} /> عنوان التوصيل
                </label>
                
                {customerAddresses.length > 0 && !isAddingNewAddress ? (
                  <div className="space-y-0.5">
                    <div className="relative">
                      <select 
                        value={selectedAddressId || ""}
                        onChange={(e) => setSelectedAddressId(parseInt(e.target.value))}
                        className="w-full bg-gray-50 border border-neo-border font-bold appearance-none py-0.5 px-1 text-[9px] outline-none"
                      >
                        <option value="" disabled>اختر عنواناً...</option>
                        {customerAddresses.map((addr) => (
                          <option key={addr.id} value={addr.id}>{addr.addressDetails} ({addr.deliveryZoneName || 'بدون'})</option>
                        ))}
                      </select>
                      <ChevronDown size={10} className="absolute left-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <button 
                      onClick={() => setIsAddingNewAddress(true)}
                      className="text-[8px] font-black text-brand-blue underline"
                    >
                      + إضافة عنوان
                    </button>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <textarea 
                      placeholder="العنوان أو الإحداثيات..."
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      className="w-full bg-gray-50 border border-neo-border font-bold h-6 py-0.5 px-1 text-[9px] resize-none outline-none"
                    />
                    {newAddress.trim().match(/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/) && (
                      <div className="flex items-center gap-0.5 text-[8px] font-bold text-brand-green bg-green-50 px-1 py-0 rounded-sm border border-green-200">
                        <MapPin size={8} /> إحداثيات GPS ✓
                      </div>
                    )}
                    <select 
                      className="w-full bg-gray-50 border border-neo-border font-bold py-0.5 px-1 text-[9px] outline-none"
                      value={selectedZoneId}
                      onChange={(e) => setSelectedZoneId(e.target.value === "" ? "" : parseInt(e.target.value))}
                    >
                      <option value="">اختر المنطقة (اختياري)</option>
                      {deliveryZones.map(z => (
                        <option key={z.id} value={z.id}>{z.name} (+{z.deliveryCost} ر.س)</option>
                      ))}
                    </select>
                    <div className="flex gap-0.5">
                      <button 
                        onClick={handleAddNewAddress}
                        disabled={!newAddress}
                        className="bg-brand-green text-white flex-1 py-0.5 text-[9px] font-black border border-neo-border disabled:opacity-50"
                      >
                        حفظ العنوان
                      </button>
                      {customerAddresses.length > 0 && (
                        <button 
                          onClick={() => setIsAddingNewAddress(false)}
                          className="bg-white px-2 py-0.5 text-[9px] font-black border border-neo-border"
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
        <div className="bg-gray-50 p-1 border border-neo-border">
          <div className="space-y-0 mb-1">
             <div className="flex justify-between text-[9px] font-bold">
              <span className="text-gray-600">المجموع الفرعي</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            {orderType === "delivery" && (
              <div className="flex justify-between text-[9px] font-bold">
                <span className="text-gray-600">رسوم التوصيل</span>
                <span>{formatCurrency(deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-[9px] font-bold">
              <span className="text-gray-600">الضريبة (١٥٪)</span>
              <span>{formatCurrency(cartTax)}</span>
            </div>
            <div className="flex justify-between text-[11px] font-black pt-0.5 border-t border-neo-border mt-0.5 mb-1">
              <span>الإجمالي</span>
              <span className="text-brand-orange">{formatCurrency(cartGrandTotal)}</span>
            </div>

            {orderSuccessMessage && (
              <div className="bg-brand-green/20 border border-brand-green p-1 rounded-sm flex items-center gap-1 font-black text-[9px] text-brand-green mb-1 animate-fade-in">
                <CheckCircle size={10} className="shrink-0" />
                <span>{orderSuccessMessage}</span>
              </div>
            )}
            {orderErrorMessage && (
              <div className="bg-brand-red/20 border border-brand-red p-1 rounded-sm flex items-center gap-1 font-black text-[9px] text-brand-red mb-1 animate-fade-in">
                <AlertCircle size={10} className="shrink-0" />
                <span>{orderErrorMessage}</span>
              </div>
            )}
          </div>
          
          <button 
            disabled={cart.length === 0 || !customerName || !selectedBranch || (orderType === "delivery" && !selectedAddressId && !newAddress) || loading}
            onClick={handleConfirmOrder}
            className="bg-brand-green w-full py-1 flex items-center justify-center gap-1 text-[10px] font-black text-white border border-neo-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600"
          >
            {loading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <CreditCard size={12} strokeWidth={2.5} />
            )}
            {loading ? "جاري..." : (editOrderId ? "تحديث" : "تأكيد")}
          </button>
        </div>

      </div>
    </div>
  );
}
