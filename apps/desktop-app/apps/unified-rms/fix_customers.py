import re

with open('src/modules/hq/views/CustomersPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'  return \(\n    <div className="space-y-4">.*', re.DOTALL)

new_jsx = """  return (
    <div className="space-y-6 max-w-7xl">
      {selectedCustomer && (
        <div className="bg-carbon-layer border border-carbon-border p-6 shadow-sm animate-fade-in space-y-6">
          <div className="flex items-center justify-between border-b border-carbon-border pb-4 mb-4">
            <h3 className="text-xl font-semibold text-carbon-text flex items-center gap-2">
              <Users size={20} className="text-carbon-blue" /> 
              تفاصيل العميل: {selectedCustomer.name}
            </h3>
            <button 
              onClick={closeDetails} 
              className="bg-carbon-layerHover border border-carbon-border text-carbon-text px-4 py-2 text-sm font-medium hover:bg-carbon-bg transition-colors flex items-center gap-2"
            >
              عودة للقائمة <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-carbon-bg border border-carbon-border p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-carbon-text border-b border-carbon-border pb-2 mb-3">
                المعلومات الأساسية
              </h4>
              <div className="space-y-3 text-sm text-carbon-textSecondary">
                <div className="flex justify-between"><span className="text-carbon-text">الاسم:</span> <span>{selectedCustomer.name}</span></div>
                <div className="flex justify-between"><span className="text-carbon-text">الهاتف:</span> <span className="dir-ltr">{selectedCustomer.phoneNumber}</span></div>
                <div className="flex justify-between"><span className="text-carbon-text">إجمالي الطلبات:</span> <span>{selectedCustomer.totalOrders}</span></div>
                <div className="flex justify-between"><span className="text-carbon-text">إجمالي المدفوعات:</span> <span className="text-carbon-success font-semibold">{formatCurrency(selectedCustomer.totalSpent)}</span></div>
              </div>
            </div>

            <div className="bg-carbon-bg border border-carbon-border p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-carbon-text border-b border-carbon-border pb-2 mb-3 flex items-center gap-2">
                <MapPin size={16} /> العناوين المحفوظة
              </h4>
              {selectedCustomer.customerAddresses && selectedCustomer.customerAddresses.length > 0 ? (
                <ul className="space-y-3">
                  {selectedCustomer.customerAddresses.map((addr, idx) => (
                    <li key={idx} className="bg-carbon-layer border border-carbon-border p-3 text-sm flex gap-3 items-start">
                      <MapPin size={16} className="mt-0.5 text-carbon-warning shrink-0" />
                      <div>
                        <p className="text-carbon-text">{addr.addressDetails}</p>
                        {addr.deliveryZoneName && <p className="text-xs text-carbon-success mt-1 font-medium">المنطقة: {addr.deliveryZoneName}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-carbon-textSecondary italic text-center py-4">لا توجد عناوين مسجلة</p>
              )}
            </div>
          </div>

          <div className="bg-carbon-bg border border-carbon-border p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-carbon-text border-b border-carbon-border pb-3 mb-4 flex items-center gap-2">
              <History size={16} /> سجل الطلبات السابقة
            </h4>
            {loadingOrders ? (
              <p className="text-sm text-center py-8 text-carbon-textSecondary animate-pulse">جاري تحميل الطلبات...</p>
            ) : customerOrders.length > 0 ? (
              <div className="overflow-x-auto border border-carbon-border">
                <table className="w-full text-right text-sm">
                  <thead className="bg-carbon-layer border-b border-carbon-border text-carbon-textSecondary">
                    <tr>
                      <th className="py-3 px-4 font-medium border-l border-carbon-border">رقم الطلب</th>
                      <th className="py-3 px-4 font-medium border-l border-carbon-border">التاريخ</th>
                      <th className="py-3 px-4 font-medium border-l border-carbon-border">النوع</th>
                      <th className="py-3 px-4 font-medium border-l border-carbon-border">الحالة</th>
                      <th className="py-3 px-4 font-medium border-l border-carbon-border">الإجمالي</th>
                      <th className="py-3 px-4 font-medium text-center">التفاصيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-carbon-border">
                    {customerOrders.map(order => (
                      <tr key={order.id} className="hover:bg-carbon-layerHover transition-colors">
                        <td className="py-3 px-4 font-medium dir-ltr text-right text-carbon-text border-l border-carbon-border">{order.orderNumber}</td>
                        <td className="py-3 px-4 text-carbon-textSecondary border-l border-carbon-border">{new Date(order.createdAt).toLocaleString('ar-EG')}</td>
                        <td className="py-3 px-4 text-carbon-text border-l border-carbon-border">{order.orderType}</td>
                        <td className="py-3 px-4 border-l border-carbon-border">
                          <span className={`px-2 py-1 rounded-sm text-xs font-medium border ${order.status === 'Delivered' || order.status === 'Completed' ? 'bg-carbon-success/10 text-carbon-success border-carbon-success/20' : 'bg-carbon-warning/10 text-carbon-warning border-carbon-warning/20'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-carbon-success border-l border-carbon-border">{formatCurrency(order.totalAmount)}</td>
                        <td className="py-3 px-4 text-center">
                          <button onClick={() => handleOrderClick(order)} className="p-1.5 text-carbon-blue hover:bg-carbon-blue/10 rounded transition-colors" title="عرض التفاصيل">
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-center py-8 text-carbon-textSecondary">لا توجد طلبات سابقة</p>
            )}
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={closeOrderModal}>
          <div className="bg-carbon-layer border border-carbon-border w-full max-w-lg max-h-[90vh] flex flex-col shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-carbon-border flex items-center justify-between bg-carbon-bg">
              <h3 className="font-semibold text-base flex items-center gap-2 text-carbon-text">
                <Package size={18} className="text-carbon-blue" />
                تفاصيل الطلب {selectedOrder.orderNumber}
              </h3>
              <button onClick={closeOrderModal} className="text-carbon-textSecondary hover:text-carbon-text transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              {loadingOrderDetails ? (
                <div className="py-12 text-center text-sm text-carbon-textSecondary animate-pulse">جاري تحميل التفاصيل...</div>
              ) : orderDetails ? (
                <>
                  <div className="bg-carbon-bg border border-carbon-border p-4 text-sm space-y-3">
                    <div className="flex justify-between"><span className="text-carbon-textSecondary">النوع:</span> <span className="text-carbon-text font-medium">{orderDetails.orderType}</span></div>
                    <div className="flex justify-between"><span className="text-carbon-textSecondary">التاريخ:</span> <span className="text-carbon-text">{new Date(orderDetails.createdAt).toLocaleString('ar-EG')}</span></div>
                    {orderDetails.driverName && <div className="flex justify-between"><span className="text-carbon-textSecondary">السائق:</span> <span className="text-carbon-text">{orderDetails.driverName}</span></div>}
                    {orderDetails.kitchenNotes && <div className="flex justify-between border-t border-carbon-border pt-3 mt-3"><span className="text-carbon-textSecondary">ملاحظات:</span> <span className="text-carbon-warning">{orderDetails.kitchenNotes}</span></div>}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-carbon-text border-b border-carbon-border pb-2">المنتجات</h4>
                    <ul className="space-y-2">
                      {orderDetails.items?.map((item: any) => (
                        <li key={item.id} className="flex items-center justify-between bg-carbon-bg border border-carbon-border p-3 text-sm">
                          <div className="flex items-center gap-3">
                            <span className="bg-carbon-layer px-2 py-1 border border-carbon-border font-semibold text-carbon-text">{item.quantity}x</span>
                            <span className="text-carbon-text">{item.menuItemName}</span>
                          </div>
                          <span className="font-semibold text-carbon-text">{formatCurrency(item.price * item.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="border-t border-carbon-border pt-4 text-sm space-y-2">
                    <div className="flex justify-between text-carbon-textSecondary">
                      <span>تكلفة التوصيل</span>
                      <span>{formatCurrency(orderDetails.deliveryCost || 0)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base text-carbon-success pt-2">
                      <span>الإجمالي</span>
                      <span>{formatCurrency(orderDetails.totalAmount)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-sm text-carbon-error">فشل في تحميل التفاصيل</div>
              )}
            </div>
            <div className="p-4 border-t border-carbon-border bg-carbon-bg flex justify-end">
              <button 
                onClick={closeOrderModal} 
                className="bg-carbon-layer border border-carbon-border text-carbon-text px-6 py-2 text-sm font-medium hover:bg-carbon-layerHover transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {!selectedCustomer && (
        <>
          <div className="bg-carbon-layer border-b border-carbon-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Users size={24} className="text-carbon-text" />
              <div>
                <h2 className="text-xl font-semibold text-carbon-text">قاعدة بيانات العملاء</h2>
                <p className="text-sm text-carbon-textSecondary mt-1">تصفح العملاء، السجل، العناوين، والإحصائيات</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-carbon-textSecondary" size={16} />
                <input
                  type="text"
                  placeholder="بحث (اسم، هاتف)..."
                  className="w-64 bg-carbon-bg border border-carbon-border px-4 py-2.5 text-sm focus:outline-none focus:border-carbon-blue text-carbon-text pr-10 transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setShowAddForm(!showAddForm)} 
                className="bg-carbon-blue text-white hover:bg-carbon-blueHover transition-colors px-6 py-2.5 text-sm font-medium flex items-center gap-2"
              >
                {showAddForm ? <X size={16} /> : <Plus size={16} />}
                <span>{showAddForm ? 'إلغاء' : 'عميل جديد'}</span>
              </button>
            </div>
          </div>

          {showAddForm && (
            <form onSubmit={handleAdd} className="bg-carbon-layer border border-carbon-border p-6 shadow-sm animate-fade-in space-y-6">
              <h3 className="text-base font-semibold text-carbon-text border-b border-carbon-border pb-3 mb-4 flex items-center gap-2">
                <Users size={18} className="text-carbon-blue" />
                إضافة عميل جديد
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm text-carbon-textSecondary">اسم العميل *</label>
                  <input 
                    required 
                    type="text" 
                    value={newCustomer.name} 
                    onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} 
                    className="w-full bg-carbon-bg border-b border-carbon-border px-4 py-2.5 text-sm focus:outline-none focus:border-carbon-blue text-carbon-text transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm text-carbon-textSecondary">رقم الهاتف *</label>
                  <input 
                    required 
                    type="text" 
                    value={newCustomer.phoneNumber} 
                    onChange={e => setNewCustomer({...newCustomer, phoneNumber: e.target.value})} 
                    className="w-full bg-carbon-bg border-b border-carbon-border px-4 py-2.5 text-sm focus:outline-none focus:border-carbon-blue text-carbon-text transition-colors dir-ltr text-left"
                    placeholder="05XXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm text-carbon-textSecondary flex items-center justify-between">
                    <span>العنوان أو الإحداثيات *</span>
                    {newCustomer.address.trim().match(/^-?\\d+\\.?\\d*,\\s*-?\\d+\\.?\\d*$/) && (
                      <span className="text-xs font-medium text-carbon-success flex items-center gap-1">
                        <MapPin size={12} /> إحداثيات ✓
                      </span>
                    )}
                  </label>
                  <input 
                    required 
                    type="text" 
                    value={newCustomer.address} 
                    onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} 
                    className="w-full bg-carbon-bg border-b border-carbon-border px-4 py-2.5 text-sm focus:outline-none focus:border-carbon-blue text-carbon-text transition-colors"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-carbon-border flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)} 
                  className="px-6 py-2 bg-transparent text-carbon-text hover:bg-carbon-layerHover border border-carbon-border transition-colors text-sm font-medium"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className="bg-carbon-blue text-white hover:bg-carbon-blueHover transition-colors px-6 py-2 text-sm font-medium flex items-center gap-2"
                >
                  <Check size={16} /> حفظ العميل
                </button>
              </div>
            </form>
          )}

          <div className="bg-carbon-layer border border-carbon-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-carbon-bg border-b border-carbon-border text-carbon-textSecondary text-xs">
                  <tr>
                    <th className="px-4 py-3 font-medium border-l border-carbon-border">العميل</th>
                    <th className="px-4 py-3 font-medium border-l border-carbon-border w-40">الهاتف</th>
                    <th className="px-4 py-3 font-medium border-l border-carbon-border">العنوان</th>
                    <th className="px-4 py-3 font-medium border-l border-carbon-border w-40">النشاط</th>
                    <th className="px-4 py-3 font-medium text-center w-24">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-carbon-border bg-carbon-layer">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-sm text-carbon-textSecondary">
                        لا توجد نتائج مطابقة
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <tr 
                        key={customer.id} 
                        onClick={() => handleCustomerClick(customer)} 
                        className="hover:bg-carbon-layerHover text-carbon-text transition-colors cursor-pointer group"
                      >
                        <td className="px-4 py-3 border-l border-carbon-border align-middle">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-carbon-bg text-carbon-text border border-carbon-border flex items-center justify-center text-sm font-medium group-hover:bg-carbon-layer transition-colors">
                              {customer.name?.[0] || '👤'}
                            </div>
                            <span className="font-semibold text-sm group-hover:text-carbon-blue transition-colors">{customer.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 border-l border-carbon-border align-middle">
                          <div className="flex items-center gap-2 font-medium text-sm text-carbon-textSecondary dir-ltr text-right">
                            <Phone size={14} className="text-carbon-textSecondary" />
                            <span>{customer.phoneNumber}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 border-l border-carbon-border align-middle">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm text-carbon-text">
                              <MapPin size={14} className="text-carbon-textSecondary shrink-0" />
                              <span className="truncate max-w-[250px]">{customer.customerAddresses?.[0]?.addressDetails || 'لا يوجد عنوان مسجل'}</span>
                            </div>
                            {(customer.customerAddresses?.[0]?.latitude && customer.customerAddresses?.[0]?.longitude) && (
                              <span className="text-xs text-carbon-success font-medium flex items-center gap-1 pl-6">
                                إحداثيات متوفرة
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 border-l border-carbon-border align-middle">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 font-medium text-xs">
                              <ShoppingBag size={12} className="text-carbon-warning" />
                              <span className="text-carbon-text">{customer.totalOrders} طلبات</span>
                            </div>
                            <div className="flex items-center gap-2 font-medium text-xs">
                              <span className="w-3"></span>
                              <span className="text-carbon-success">{formatCurrency(customer.totalSpent)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-middle text-center">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(customer.id); }} 
                            className="p-1.5 text-carbon-textSecondary hover:text-carbon-error hover:bg-carbon-layerHover transition-colors border border-transparent hover:border-carbon-border"
                            title="حذف العميل"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
"""

new_content = pattern.sub(lambda m: new_jsx, content)

with open('src/modules/hq/views/CustomersPage.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("CustomersPage updated.")
