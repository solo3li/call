import sys

def modify_customers_page(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Add new lucide-react imports if not exist
    if 'ArrowRight' not in content:
        content = content.replace('History, ExternalLink, ShoppingBag } from "lucide-react";', 'History, ExternalLink, ShoppingBag, ArrowRight, Eye, Package } from "lucide-react";')
    
    # Add ordersApi import
    if 'ordersApi' not in content:
        content = content.replace('const customersApi =', 'const ordersApi =') # fallback
        content = content.replace('import { customersApi } from "../utils/api";', 'import { customersApi, ordersApi } from "../utils/api";')
    
    # Add new state variables
    state_injection = """  const [mounted, setMounted] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderDetails, setOrderDetails] = useState<any | null>(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);

  const handleCustomerClick = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setLoadingOrders(true);
    try {
      const res = await ordersApi.getCustomerOrders(customer.id);
      setCustomerOrders(res.data || []);
    } catch (err) {
      console.error(err);
      alert("فشل في تحميل طلبات العميل");
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleOrderClick = async (order: any) => {
    setSelectedOrder(order);
    setLoadingOrderDetails(true);
    try {
      const res = await ordersApi.getById(order.id);
      setOrderDetails(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  const closeDetails = () => {
    setSelectedCustomer(null);
    setCustomerOrders([]);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
    setOrderDetails(null);
  };"""

    content = content.replace('  const [mounted, setMounted] = useState(false);', state_injection)

    # Change tr onclick
    content = content.replace('<tr key={customer.id} className="hover:bg-carbon-layerHover text-carbon-text transition-colors">', '<tr key={customer.id} onClick={() => handleCustomerClick(customer)} className="hover:bg-carbon-layerHover text-carbon-text transition-colors cursor-pointer">')

    # Delete button propagation stop
    content = content.replace('onClick={() => handleDelete(customer.id)}', 'onClick={(e) => { e.stopPropagation(); handleDelete(customer.id); }}')

    # Customer Details View JSX
    customer_details_view = """
      {selectedCustomer && (
        <div className="bg-carbon-layer border border-carbon-border p-4 mb-4 animate-in fade-in zoom-in-95 duration-200">
          <button onClick={closeDetails} className="mb-4 flex items-center gap-1 text-xs text-carbon-textSecondary hover:text-carbon-text transition-colors">
            <ArrowRight size={14} /> عودة للقائمة
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-carbon-bg border border-carbon-border p-3">
              <h3 className="text-sm font-semibold mb-2 text-carbon-text flex items-center gap-2">
                <Users size={14} /> تفاصيل العميل
              </h3>
              <div className="text-xs space-y-2 text-carbon-textSecondary">
                <p><strong className="text-carbon-text">الاسم:</strong> {selectedCustomer.name}</p>
                <p><strong className="text-carbon-text">الهاتف:</strong> {selectedCustomer.phoneNumber}</p>
                <p><strong className="text-carbon-text">إجمالي الطلبات:</strong> {selectedCustomer.totalOrders}</p>
                <p><strong className="text-carbon-text">إجمالي المدفوعات:</strong> {formatCurrency(selectedCustomer.totalSpent)}</p>
              </div>
            </div>

            <div className="bg-carbon-bg border border-carbon-border p-3">
              <h3 className="text-sm font-semibold mb-2 text-carbon-text flex items-center gap-2">
                <MapPin size={14} /> عناوين العميل
              </h3>
              {selectedCustomer.customerAddresses && selectedCustomer.customerAddresses.length > 0 ? (
                <ul className="text-xs space-y-2 text-carbon-textSecondary">
                  {selectedCustomer.customerAddresses.map((addr, idx) => (
                    <li key={idx} className="flex gap-2 items-start bg-carbon-layer p-2 border border-carbon-border">
                      <MapPin size={12} className="mt-0.5 shrink-0 text-carbon-warning" />
                      <div>
                        <p>{addr.addressDetails}</p>
                        {addr.deliveryZoneName && <p className="text-[10px] text-carbon-success mt-1">المنطقة: {addr.deliveryZoneName}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-carbon-textSecondary italic">لا توجد عناوين مسجلة</p>
              )}
            </div>
          </div>

          <div className="mt-4 bg-carbon-bg border border-carbon-border p-3">
            <h3 className="text-sm font-semibold mb-3 text-carbon-text flex items-center gap-2">
              <History size={14} /> سجل الطلبات
            </h3>
            {loadingOrders ? (
              <p className="text-xs text-center p-4 text-carbon-textSecondary animate-pulse">جاري تحميل الطلبات...</p>
            ) : customerOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-carbon-border text-carbon-textSecondary">
                      <th className="pb-2 px-2 font-medium">رقم الطلب</th>
                      <th className="pb-2 px-2 font-medium">التاريخ</th>
                      <th className="pb-2 px-2 font-medium">النوع</th>
                      <th className="pb-2 px-2 font-medium">الحالة</th>
                      <th className="pb-2 px-2 font-medium">الإجمالي</th>
                      <th className="pb-2 px-2 font-medium text-center">التفاصيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-carbon-border">
                    {customerOrders.map(order => (
                      <tr key={order.id} className="hover:bg-carbon-layerHover transition-colors">
                        <td className="py-2 px-2 font-medium dir-ltr text-right">{order.orderNumber}</td>
                        <td className="py-2 px-2 text-carbon-textSecondary">{new Date(order.createdAt).toLocaleString('ar-EG')}</td>
                        <td className="py-2 px-2">{order.orderType}</td>
                        <td className="py-2 px-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${order.status === 'Delivered' || order.status === 'Completed' ? 'bg-carbon-success/10 text-carbon-success border border-carbon-success/20' : 'bg-carbon-warning/10 text-carbon-warning border border-carbon-warning/20'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-2 px-2 font-medium text-carbon-success">{formatCurrency(order.totalAmount)}</td>
                        <td className="py-2 px-2 text-center">
                          <button onClick={() => handleOrderClick(order)} className="p-1 bg-carbon-layer text-carbon-blue border border-carbon-border hover:bg-carbon-blue hover:text-white transition-colors">
                            <Eye size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-center p-4 text-carbon-textSecondary">لا توجد طلبات سابقة</p>
            )}
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={closeOrderModal}>
          <div className="bg-carbon-layer border border-carbon-border w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-carbon-border flex items-center justify-between sticky top-0 bg-carbon-layer z-10">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-carbon-text">
                <Package size={16} />
                تفاصيل الطلب {selectedOrder.orderNumber}
              </h3>
              <button onClick={closeOrderModal} className="text-carbon-textSecondary hover:text-carbon-text">✕</button>
            </div>
            <div className="p-4 space-y-4">
              {loadingOrderDetails ? (
                <div className="py-10 text-center text-xs text-carbon-textSecondary animate-pulse">جاري تحميل التفاصيل...</div>
              ) : orderDetails ? (
                <>
                  <div className="bg-carbon-bg border border-carbon-border p-3 text-xs space-y-2">
                    <p><span className="text-carbon-textSecondary">النوع:</span> {orderDetails.orderType}</p>
                    <p><span className="text-carbon-textSecondary">التاريخ:</span> {new Date(orderDetails.createdAt).toLocaleString('ar-EG')}</p>
                    {orderDetails.driverName && <p><span className="text-carbon-textSecondary">السائق:</span> {orderDetails.driverName}</p>}
                    {orderDetails.kitchenNotes && <p><span className="text-carbon-textSecondary">ملاحظات:</span> <span className="text-carbon-warning">{orderDetails.kitchenNotes}</span></p>}
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-semibold mb-2 text-carbon-text">المنتجات</h4>
                    <ul className="space-y-2">
                      {orderDetails.items?.map((item: any) => (
                        <li key={item.id} className="flex items-center justify-between bg-carbon-bg border border-carbon-border p-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="bg-carbon-layer px-1.5 py-0.5 border border-carbon-border font-medium">{item.quantity}x</span>
                            <span>{item.menuItemName}</span>
                          </div>
                          <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="border-t border-carbon-border pt-3 mt-3 text-xs space-y-1">
                    <div className="flex justify-between text-carbon-textSecondary">
                      <span>تكلفة التوصيل</span>
                      <span>{formatCurrency(orderDetails.deliveryCost || 0)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-carbon-success pt-1">
                      <span>الإجمالي</span>
                      <span>{formatCurrency(orderDetails.totalAmount)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center text-xs text-carbon-error">فشل في تحميل التفاصيل</div>
              )}
            </div>
            <div className="p-3 border-t border-carbon-border bg-carbon-bg text-center">
              <button onClick={closeOrderModal} className="bg-carbon-layer border border-carbon-border text-carbon-text px-6 py-1.5 text-xs font-medium hover:bg-carbon-layerHover transition-colors">إغلاق</button>
            </div>
          </div>
        </div>
      )}
"""
    
    # Render logic
    content = content.replace('  return (\n    <div className="space-y-4">', '  return (\n    <div className="space-y-4">\n' + customer_details_view)
    
    # Hide the main table if a customer is selected
    content = content.replace('      <div className="bg-carbon-layer border border-carbon-border p-0 overflow-hidden">', '      {!selectedCustomer && (<div className="bg-carbon-layer border border-carbon-border p-0 overflow-hidden">')
    content = content.replace('      </div>\n    </div>\n  );\n}', '      </div>)}\n    </div>\n  );\n}')

    with open(filepath, 'w') as f:
        f.write(content)

modify_customers_page('src/modules/hq/views/CustomersPage.tsx')
modify_customers_page('src/modules/branch/views/CustomersPage.tsx')
print("Successfully modified CustomersPage.tsx in both HQ and Branch")
