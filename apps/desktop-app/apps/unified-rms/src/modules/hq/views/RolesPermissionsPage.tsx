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
 case "الطلبات": return <Activity size={18} className="text-carbon-blue" />;
 case "القائمة": return <Shield size={18} className="text-carbon-success" />;
 case "الموظفين": return <UserCheck size={18} className="text-brand-purple" />;
 case "التقارير": return <CreditCard size={18} className="text-carbon-purple" />;
 case "العملاء": return <Users size={18} className="text-brand-cyan" />;
 case "الإعدادات": return <Settings size={18} className="text-carbon-warning" />;
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

 if (loading) return <div className="p-20 text-center font-semibold text-2xl animate-pulse">جاري تحميل الصلاحيات... </div>;

 return (
 <div className="space-y-6 max-w-7xl">
 {/* Header */}
 <div className="bg-carbon-layer border-b border-carbon-border p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div className="flex items-center gap-4">
 <Lock size={24} className="text-carbon-text" />
 <div>
 <h2 className="text-xl font-semibold text-carbon-text">الأدوار والصلاحيات</h2>
 <p className="text-sm text-carbon-textSecondary mt-1">إدارة مستويات الوصول وصلاحيات فريق العمل بصرامة</p>
 </div>
 </div>
 <button 
 onClick={handleCreateRole} 
 className="bg-carbon-blue text-white hover:bg-carbon-blueHover transition-colors px-6 py-2.5 text-sm font-medium flex items-center justify-center gap-2"
 >
 <Plus size={16} />
 <span>دور جديد</span>
 </button>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
 {/* Roles List - 4 Columns */}
 <div className="lg:col-span-4 bg-carbon-layer border border-carbon-border h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
 <div className="p-4 border-b border-carbon-border bg-carbon-bg">
 <h3 className="font-semibold text-sm text-carbon-text">الأدوار الحالية</h3>
 </div>
 <div className="flex flex-col">
 {roles.map(role => {
 const isActive = selectedRole?.id === role.id;
 return (
 <div 
 key={role.id} 
 onClick={() => { setSelectedRole(role); setIsEditing(true); }}
 className={`p-4 cursor-pointer transition-colors border-b border-carbon-border border-r-4 ${
 isActive 
 ? 'border-r-carbon-blue bg-carbon-layerHover' 
 : 'border-r-transparent hover:bg-carbon-layerHover/50'
 }`}
 >
 <div className="flex justify-between items-start">
 <div>
 <h4 className={`font-semibold text-sm ${isActive ? 'text-carbon-blue' : 'text-carbon-text'}`}>{role.name}</h4>
 <p className="text-xs text-carbon-textSecondary mt-1">{role.departmentName || "عام"}</p>
 </div>
 <div className="px-2 py-0.5 bg-carbon-bg text-xs font-medium text-carbon-textSecondary border border-carbon-border">
 {role.staffCount} موظف
 </div>
 </div>
 <div className="mt-3 flex gap-1.5 flex-wrap">
 {role.permissions.slice(0, 3).map(pId => (
 <span key={pId} className="text-[10px] font-medium px-2 py-0.5 bg-carbon-bg border border-carbon-border text-carbon-textSecondary truncate max-w-[80px]">
 {permissions.find(p => p.id === pId)?.name}
 </span>
 ))}
 {role.permissions.length > 3 && (
 <span className="text-[10px] font-medium px-2 py-0.5 bg-carbon-layerHover text-carbon-textSecondary border border-carbon-border">
 +{role.permissions.length - 3}
 </span>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* Role Editor - 8 Columns */}
 <div className="lg:col-span-8">
 {isEditing && selectedRole ? (
 <div className="bg-carbon-layer border border-carbon-border animate-fade-in flex flex-col h-[calc(100vh-200px)]">
 {/* Editor Header */}
 <div className="p-6 border-b border-carbon-border bg-carbon-bg flex flex-col sm:flex-row justify-between gap-4">
 <div className="flex-1 space-y-4">
 <div>
 <label className="block text-xs text-carbon-textSecondary mb-1">اسم الدور</label>
 <input 
 type="text" 
 value={selectedRole.name} 
 onChange={e => setSelectedRole({...selectedRole, name: e.target.value})}
 placeholder="أدخل اسم الدور..."
 className="w-full bg-carbon-layer border-b border-carbon-border px-4 py-2 text-lg font-semibold focus:outline-none focus:border-carbon-blue text-carbon-text transition-colors"
 />
 </div>
 <div>
 <label className="block text-xs text-carbon-textSecondary mb-1">القسم المرتبط</label>
 <select 
 value={selectedRole.departmentId || ""} 
 onChange={e => setSelectedRole({...selectedRole, departmentId: e.target.value})}
 className="w-full bg-carbon-layer border-b border-carbon-border px-4 py-2 text-sm focus:outline-none focus:border-carbon-blue text-carbon-text transition-colors appearance-none"
 >
 <option value="" disabled>اختر القسم (مطلوب)</option>
 {departments.map(d => (
 <option key={d.id} value={d.id}>{d.name}</option>
 ))}
 </select>
 </div>
 </div>
 <div className="flex gap-2 items-end">
 <button 
 onClick={() => { setIsEditing(false); setSelectedRole(null); }} 
 className="px-6 py-2 bg-transparent text-carbon-text hover:bg-carbon-layerHover border border-carbon-border transition-colors text-sm font-medium"
 >
 إلغاء
 </button>
 <button 
 onClick={handleSave} 
 className="px-6 py-2 bg-carbon-blue text-white hover:bg-carbon-blueHover transition-colors text-sm font-medium flex items-center gap-2"
 >
 <Check size={16} />
 حفظ التعديلات
 </button>
 </div>
 </div>

 {/* Permissions Content */}
 <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
 {/* Templates */}
 <div className="mb-6 p-4 bg-carbon-bg border border-carbon-border">
 <p className="text-xs font-semibold text-carbon-textSecondary mb-3 flex items-center gap-2">
 <ShieldAlert size={14} className="text-carbon-blue" />
 قوالب سريعة للصلاحيات:
 </p>
 <div className="flex flex-wrap gap-2">
 {roleTemplates.map(t => (
 <button 
 key={t.name}
 onClick={() => handleApplyTemplate(t)}
 className="px-3 py-1.5 bg-carbon-layer border border-carbon-border text-xs font-medium text-carbon-text hover:border-carbon-blue hover:text-carbon-blue transition-colors"
 >
 {t.name}
 </button>
 ))}
 </div>
 </div>

 {/* Permissions Categories */}
 <div className="space-y-8">
 {Object.entries(permissionsByCategory).map(([category, perms]) => (
 <div key={category} className="space-y-4">
 <div className="flex items-center gap-3 border-b border-carbon-border pb-2">
 <div className="p-1.5 bg-carbon-bg border border-carbon-border">
 {getCategoryIcon(category)}
 </div>
 <h4 className="font-semibold text-sm text-carbon-text">{category}</h4>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {perms.map(perm => {
 const isActive = selectedRole.permissions.includes(perm.id);
 return (
 <label 
 key={perm.id} 
 className={`p-3 border flex items-start gap-3 cursor-pointer transition-colors ${
 isActive 
 ? 'border-carbon-blue bg-carbon-blue/5' 
 : 'border-carbon-border bg-carbon-layer hover:bg-carbon-layerHover'
 }`}
 >
 <div className="mt-0.5 relative flex items-center justify-center">
 <input 
 type="checkbox"
 className="peer appearance-none w-4 h-4 border border-carbon-border bg-carbon-layer checked:bg-carbon-blue checked:border-carbon-blue transition-colors cursor-pointer"
 checked={isActive}
 onChange={() => togglePermission(perm.id)}
 />
 <Check size={12} strokeWidth={3} className="text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100" />
 </div>
 <div className="flex-1">
 <p className="font-medium text-sm text-carbon-text leading-tight mb-1">{perm.name}</p>
 <p className="text-xs text-carbon-textSecondary leading-snug">{perm.description}</p>
 </div>
 </label>
 );
 })}
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 ) : (
 <div className="bg-carbon-bg border border-carbon-border h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center p-8">
 <div className="w-16 h-16 bg-carbon-layer border border-carbon-border flex items-center justify-center mb-6 text-carbon-textSecondary">
 <Shield size={32} />
 </div>
 <h3 className="font-semibold text-xl text-carbon-text mb-2">إدارة الصلاحيات</h3>
 <p className="text-sm text-carbon-textSecondary max-w-sm">
 اختر دوراً من القائمة الجانبية لتعديل صلاحياته، أو قم بإنشاء دور جديد لتخصيص مستوى وصول محدد لفريق العمل.
 </p>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
