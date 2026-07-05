import { useState, useEffect, useMemo } from "react";
import { Shield, Lock, Plus, Trash2, Check, ShieldAlert, UserCheck, Activity, CreditCard, Settings, Users } from "lucide-react";
import { rolesApi, departmentsApi } from "../utils/api";
import { Role, Permission, Department } from "../types/api";

const mockPermissions: Permission[] = [
  // --- ORDERS ---
  { id: "Orders.View", name: "عرض الطلبات", description: "رؤية قائمة الطلبات وحالتها", category: "الطلبات" },
  { id: "Orders.Create", name: "إنشاء طلب جديد", description: "إضافة طلبات جديدة عبر النظام", category: "الطلبات" },
  { id: "Orders.Edit", name: "تعديل الطلبات", description: "تعديل محتوى الطلبات القائمة", category: "الطلبات" },
  { id: "Orders.Void", name: "إلغاء/حذف الطلبات", description: "إلغاء الطلبات النشطة أو حذفها", category: "الطلبات" },
  { id: "Orders.Status", name: "تغيير حالة الطلب", description: "تحديث حالة الطلب (تجهيز، توصيل، إلخ)", category: "الطلبات" },
  { id: "Orders.Refund", name: "إدارة المرتجعات", description: "معالجة عمليات الاسترجاع والمبالغ المستردة", category: "الطلبات" },

  // --- MENU ---
  { id: "Menu.View", name: "عرض القائمة", description: "رؤية قائمة الطعام والتصنيفات", category: "القائمة" },
  { id: "Menu.CreateItem", name: "إضافة أصناف جديدة", description: "إضافة أطباق أو مشروبات جديدة للمنيو", category: "القائمة" },
  { id: "Menu.EditItem", name: "تعديل الأصناف والأسعار", description: "تحديث أسعار ومكونات المنيو", category: "القائمة" },
  { id: "Menu.DeleteItem", name: "حذف الأصناف", description: "حذف أصناف من قائمة الطعام", category: "القائمة" },
  { id: "Menu.ManageCategories", name: "إدارة التصنيفات", description: "إضافة أو تعديل تصنيفات المنيو", category: "القائمة" },
  { id: "Menu.ToggleAvailability", name: "التحكم في التوفر", description: "تحديد الأصناف المتاحة أو التي نفذت", category: "القائمة" },

  // --- STAFF ---
  { id: "Staff.View", name: "عرض الموظفين", description: "رؤية قائمة فريق العمل", category: "الموظفين" },
  { id: "Staff.Create", name: "إضافة موظفين جدد", description: "تسجيل موظفين جدد في النظام", category: "الموظفين" },
  { id: "Staff.Edit", name: "تعديل بيانات الموظفين", description: "تحديث بيانات وصور الموظفين", category: "الموظفين" },
  { id: "Staff.Delete", name: "حذف الموظفين", description: "إزالة موظفين من النظام", category: "الموظفين" },
  { id: "Staff.ManageRoles", name: "إدارة الأدوار والصلاحيات", description: "تخصيص صلاحيات الوصول للموظفين", category: "الموظفين" },
  { id: "Staff.Performance", name: "عرض تقارير الأداء", description: "متابعة أداء الموظفين وعدد طلباتهم", category: "الموظفين" },

  // --- ANALYTICS ---
  { id: "Analytics.Financial", name: "التقارير المالية", description: "رؤية الأرباح والمصروفات الإجمالية", category: "التقارير" },
  { id: "Analytics.Sales", name: "تقارير المبيعات", description: "تحليل المبيعات حسب اليوم، الصنف أو الفرع", category: "التقارير" },
  { id: "Analytics.Inventory", name: "تقارير المخزون", description: "متابعة حركة المواد والمخزون", category: "التقارير" },
  { id: "Analytics.Export", name: "تصدير البيانات", description: "تصدير التقارير بصيغة Excel أو PDF", category: "التقارير" },

  // --- CUSTOMERS ---
  { id: "Customers.View", name: "عرض العملاء", description: "رؤية قائمة العملاء وبيانات تواصلهم", category: "العملاء" },
  { id: "Customers.Manage", name: "إدارة العملاء", description: "إضافة أو تعديل بيانات العملاء", category: "العملاء" },
  { id: "Customers.History", name: "سجل الطلبات", description: "رؤية تاريخ طلبات كل عميل", category: "العملاء" },

  // --- SETTINGS ---
  { id: "Settings.General", name: "الإعدادات العامة", description: "إدارة بيانات المطعم والفرع الرئيسي", category: "الإعدادات" },
  { id: "Settings.Branches", name: "إعدادات الفروع", description: "إضافة وإدارة فروع المطعم المختلفة", category: "الإعدادات" },
  { id: "Settings.Bot", name: "إعدادات البوت", description: "ربط وإعداد بوت التلجرام للطلبات", category: "الإعدادات" },
  { id: "Settings.Subscription", name: "الاشتراك والدفع", description: "إدارة باقة الاشتراك والفواتير", category: "الإعدادات" },
];

const roleTemplates = [
  { name: "مدير مطعم", permissions: mockPermissions.map(p => p.id) },
  { name: "كاشير", permissions: ["Orders.View", "Orders.Create", "Orders.Status", "Menu.View", "Menu.ToggleAvailability", "Customers.View", "Customers.Manage"] },
  { name: "شيف", permissions: ["Orders.View", "Orders.Status", "Menu.View", "Menu.ToggleAvailability"] },
  { name: "محاسب", permissions: ["Orders.View", "Analytics.Financial", "Analytics.Sales", "Analytics.Export", "Settings.Subscription"] },
];

export function RolesPermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>(mockPermissions);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, deptsRes] = await Promise.all([
        rolesApi.getAll(),
        departmentsApi.getAll()
      ]);
      setRoles(rolesRes.data || []);
      setDepartments(deptsRes.data || []);
      
      const permissionsRes = await rolesApi.getPermissions();
      if (permissionsRes.data && permissionsRes.data.length > 0) {
        // Map backend DTO {Code, Group, Name} to frontend {id, category, name, description}
        const mapped: Permission[] = permissionsRes.data.map((p: any) => ({
          id: p.code,
          name: p.name,
          category: p.group,
          // Find description from our mock/template list
          description: mockPermissions.find(m => m.id === p.code)?.description || ""
        }));
        setPermissions(mapped);
      } else {
        setPermissions(mockPermissions);
      }
    } catch (err) {
      console.error("Error fetching roles/permissions", err);
      setRoles([]);
      setPermissions(mockPermissions);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = () => {
    const newRole: Role = {
      id: "",
      name: "دور جديد",
      departmentId: departments.length > 0 ? departments[0].id : "",
      permissions: [],
      staffCount: 0
    };
    setSelectedRole(newRole);
    setIsEditing(true);
  };

  const handleApplyTemplate = (template: typeof roleTemplates[0]) => {
    if (selectedRole) {
      setSelectedRole({ ...selectedRole, name: template.name, permissions: [...template.permissions] });
    }
  };

  const togglePermission = (permId: string) => {
    if (!selectedRole) return;
    const newPerms = selectedRole.permissions.includes(permId)
      ? selectedRole.permissions.filter(id => id !== permId)
      : [...selectedRole.permissions, permId];
    setSelectedRole({ ...selectedRole, permissions: newPerms });
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    try {
      if (selectedRole.id) {
        await rolesApi.update(selectedRole.id, selectedRole);
      } else {
        await rolesApi.create(selectedRole);
      }
      setIsEditing(false);
      setSelectedRole(null);
      fetchData();
    } catch (err) {
      alert("فشل في حفظ البيانات. تأكد من اتصالك بالخادم.");
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "الطلبات": return <Activity size={18} className="text-brand-blue" />;
      case "القائمة": return <Shield size={18} className="text-brand-green" />;
      case "الموظفين": return <UserCheck size={18} className="text-brand-purple" />;
      case "التقارير": return <CreditCard size={18} className="text-brand-pink" />;
      case "العملاء": return <Users size={18} className="text-brand-cyan" />;
      case "الإعدادات": return <Settings size={18} className="text-brand-orange" />;
      default: return <Shield size={18} className="text-gray-400" />;
    }
  };

  const permissionsByCategory = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    permissions.forEach(p => {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push(p);
    });
    return groups;
  }, [permissions]);

  if (loading) return <div className="p-20 text-center font-black text-2xl animate-pulse">جاري تحميل الصلاحيات... 🛡️</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-brand-yellow neo-card p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="neo-card-flat bg-white p-3">
            <Lock size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black">الأدوار والصلاحيات</h2>
            <p className="font-bold text-neo-text/70">إدارة مستويات الوصول وصلاحيات فريق العمل</p>
          </div>
        </div>
        <button onClick={handleCreateRole} className="neo-btn bg-white px-5 py-2.5 flex items-center justify-center gap-2 border-2 border-neo-border shadow-[4px_4px_0px_#1A1A1A] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
          <Plus size={18} />
          <span>دور جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-black text-xl mb-4 bg-brand-pink text-white inline-block px-4 py-1 border-2 border-neo-border shadow-[4px_4px_0px_#1A1A1A]">
            الأدوار الحالية
          </h3>
          {roles.map(role => (
            <div 
              key={role.id} 
              onClick={() => { setSelectedRole(role); setIsEditing(true); }}
              className={`p-4 cursor-pointer transition-all border-4 border-neo-border ${
                selectedRole?.id === role.id 
                  ? 'bg-brand-orange text-white shadow-[6px_6px_0px_#1A1A1A] translate-x-[-2px] translate-y-[-2px]' 
                  : 'bg-white hover:bg-gray-50 shadow-[4px_4px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_#1A1A1A] hover:translate-x-[-2px] hover:translate-y-[-2px]'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-black text-lg leading-tight">{role.name}</h4>
                  <p className={`text-xs font-bold mt-1 ${selectedRole?.id === role.id ? 'text-white' : 'text-brand-orange'}`}>{role.departmentName || "عام"}</p>
                </div>
                <div className={`px-2 py-1 border-2 border-neo-border text-[10px] font-black ${selectedRole?.id === role.id ? 'bg-white text-brand-orange shadow-[2px_2px_0px_#1A1A1A]' : 'bg-brand-yellow text-neo-text shadow-[2px_2px_0px_#1A1A1A]'}`}>
                  {role.staffCount} موظف
                </div>
              </div>
              <div className="mt-4 flex gap-1.5 flex-wrap">
                {role.permissions.slice(0, 3).map(pId => (
                  <span key={pId} className={`text-[10px] font-black px-2 py-0.5 border border-neo-border ${selectedRole?.id === role.id ? 'bg-black/20 text-white' : 'bg-gray-100'}`}>
                    {permissions.find(p => p.id === pId)?.name}
                  </span>
                ))}
                {role.permissions.length > 3 && <span className={`text-[10px] font-black px-2 py-0.5 border border-neo-border ${selectedRole?.id === role.id ? 'bg-black/20 text-white' : 'bg-brand-pink/20 text-brand-pink'}`}>+{role.permissions.length - 3}</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2">
          {isEditing && selectedRole ? (
            <div className="bg-white p-6 md:p-8 border-4 border-neo-border shadow-[8px_8px_0px_#1A1A1A] space-y-8 animate-fade-in">
              <div className="flex flex-col xl:flex-row justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <input 
                    type="text" 
                    value={selectedRole.name} 
                    onChange={e => setSelectedRole({...selectedRole, name: e.target.value})}
                    placeholder="اسم الدور"
                    className="text-3xl font-black w-full bg-brand-yellow/30 px-4 py-2 border-l-8 border-brand-orange focus:outline-none focus:bg-brand-yellow/50 transition-colors"
                  />
                  <select 
                    value={selectedRole.departmentId || ""} 
                    onChange={e => setSelectedRole({...selectedRole, departmentId: e.target.value})}
                    className="w-full bg-gray-50 px-4 py-2 font-bold text-gray-600 border-2 border-neo-border focus:outline-none focus:bg-white"
                  >
                    <option value="" disabled>اختر القسم (مطلوب)</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 h-fit flex-wrap">
                   <button onClick={handleSave} className="neo-btn bg-brand-green px-6 py-3 flex items-center justify-center gap-2 border-2 border-neo-border shadow-[4px_4px_0px_#1A1A1A] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex-1 xl:flex-none">
                     <Check size={20} />
                     <span className="font-black text-lg">حفظ التعديلات</span>
                   </button>
                   <button onClick={() => { setIsEditing(false); setSelectedRole(null); }} className="neo-btn bg-gray-200 px-6 py-3 border-2 border-neo-border shadow-[4px_4px_0px_#1A1A1A] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex-1 xl:flex-none">
                     <span className="font-black text-lg">إلغاء</span>
                   </button>
                </div>
              </div>

              {/* Templates */}
              <div className="p-5 bg-brand-blue/10 border-4 border-neo-border shadow-[4px_4px_0px_#1A1A1A]">
                <p className="text-sm font-black mb-4 flex items-center gap-2">
                  <ShieldAlert size={18} className="text-brand-blue" />
                  هل تريد البدء بقالب جاهز للصلاحيات؟
                </p>
                <div className="flex flex-wrap gap-3">
                  {roleTemplates.map(t => (
                    <button 
                      key={t.name}
                      onClick={() => handleApplyTemplate(t)}
                      className="px-4 py-2 bg-white border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A] text-sm font-black hover:bg-brand-blue hover:text-white hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Permissions Categories */}
              <div className="space-y-10">
                {Object.entries(permissionsByCategory).map(([category, perms]) => (
                  <div key={category} className="space-y-5">
                    <div className="flex items-center gap-3 border-b-4 border-neo-border pb-3">
                      <div className="p-2 bg-gray-100 border-2 border-neo-border shadow-[2px_2px_0px_#1A1A1A]">
                        {getCategoryIcon(category)}
                      </div>
                      <h4 className="font-black text-2xl">{category}</h4>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                      {perms.map(perm => {
                        const isActive = selectedRole.permissions.includes(perm.id);
                        return (
                          <div 
                            key={perm.id} 
                            onClick={() => togglePermission(perm.id)}
                            className={`p-4 border-4 border-neo-border flex items-start gap-4 cursor-pointer transition-all ${
                              isActive 
                                ? 'bg-[#ECFDF5] shadow-[6px_6px_0px_#10B981] translate-x-[-2px] translate-y-[-2px]' 
                                : 'bg-white shadow-[4px_4px_0px_rgba(0,0,0,0.1)] hover:bg-gray-50'
                            }`}
                          >
                            <div className={`mt-1 w-6 h-6 border-4 border-neo-border flex items-center justify-center shrink-0 transition-colors ${
                              isActive ? 'bg-brand-green' : 'bg-white'
                            }`}>
                              {isActive && <Check size={16} strokeWidth={4} className="text-white" />}
                            </div>
                            <div className="flex-1">
                              <p className="font-black text-lg leading-tight">{perm.name}</p>
                              <p className="text-sm font-bold text-gray-500 mt-1 leading-snug">{perm.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-brand-pink/10 p-12 xl:p-20 flex flex-col items-center justify-center text-center border-4 border-dashed border-brand-pink shadow-[8px_8px_0px_#1A1A1A] h-full min-h-[500px]">
              <div className="w-24 h-24 bg-white border-4 border-neo-border shadow-[6px_6px_0px_#1A1A1A] rounded-full flex items-center justify-center mb-6">
                <Shield size={48} className="text-brand-pink" />
              </div>
              <h3 className="font-black text-3xl text-neo-text mb-3">الصلاحيات الذكية</h3>
              <p className="font-bold text-lg text-gray-600 max-w-md">
                اختر دوراً من القائمة الجانبية لتعديل صلاحياته، أو قم بإنشاء دور جديد بمستوى وصول مخصص وتخصيص دقيق.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
