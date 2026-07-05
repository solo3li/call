'use client';

import { useState } from "react";
import { LogIn, UserPlus, Mail, Lock, Store, ArrowRight, ArrowLeft, Smartphone, ShieldCheck, KeyRound, CheckCircle2, RefreshCw } from "lucide-react";
import { authApi } from "../utils/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthPage({ isLogin = true }: { isLogin?: boolean }) {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"manager-login" | "employee-login" | "register">(isLogin ? "manager-login" : "register");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [restaurantName, setRestaurantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState("");
  
  // Forgot password state
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetError, setResetError] = useState("");

  const handleRedirectAfterLogin = (token: string, userName: string, userRole: string, tenant: { id: string; subdomain: string; loginUrl?: string; currencyCode?: string; currencySymbol?: string }, branchId?: string | null, permissions?: string[]) => {
    localStorage.setItem("token", token);
    localStorage.setItem("tenantId", tenant.id);
    localStorage.setItem("userName", userName);
    localStorage.setItem("userRole", userRole);
    localStorage.setItem("branchId", branchId || "");
    localStorage.setItem("permissions", JSON.stringify(permissions || []));
    if (tenant.currencyCode) localStorage.setItem("currencyCode", tenant.currencyCode);
    if (tenant.currencySymbol) localStorage.setItem("currencySymbol", tenant.currencySymbol);

    setSuccess(true);
    setTimeout(() => {
      router.push("/profile");
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Clear old data to prevent context contamination
    localStorage.removeItem("token");
    localStorage.removeItem("tenantId");

    try {
      if (authMode === "manager-login") {
        const response = await authApi.login({ email, password });
        const { token, userName, userRole, tenant, branchId, permissions } = response.data;
        handleRedirectAfterLogin(token, userName, userRole, tenant, branchId, permissions);

      } else if (authMode === "employee-login") {
        const response = await authApi.loginEmployee({ totpCode: totpCode.trim() });
        const { token, userName, userRole, tenant, branchId, permissions } = response.data;
        handleRedirectAfterLogin(token, userName, userRole, tenant, branchId, permissions);

      } else {
        const response = await authApi.register({
          restaurantName,
          email,
          password,
          fullName: restaurantName
        });
        const { token, userName, userRole, tenant, branchId, permissions } = response.data;
        handleRedirectAfterLogin(token, userName, userRole, tenant, branchId, permissions);
      }
    } catch (err: any) {
      let errorMessage = "فشل الطلب. يرجى التحقق من البيانات.";
      if (err.response?.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.errors) {
          const firstErrorKey = Object.keys(err.response.data.errors)[0];
          errorMessage = err.response.data.errors[firstErrorKey][0];
        } else if (err.response.data.title) {
          errorMessage = err.response.data.title;
        }
      }
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError("");
    setResetSuccess("");
    try {
      const response = await authApi.resetPassword({ email: resetEmail, newPassword: resetNewPassword });
      setResetSuccess(response.data.message);
      setResetEmail("");
      setResetNewPassword("");
      // Auto-close after success and pre-fill login email
      setTimeout(() => {
        setEmail(resetEmail);
        setShowReset(false);
        setError("");
      }, 2500);
    } catch (err: any) {
      const msg = err.response?.data?.message || "فشل تغيير كلمة المرور. يرجى المحاولة مرة أخرى.";
      setResetError(msg);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FFFBEB] font-cairo py-12 relative overflow-hidden" dir="rtl">
      
      {/* Decorative Neo-Brutalist Grid Background Patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,#1A1A1A_1px,transparent_1px),linear-gradient(to_bottom,#1A1A1A_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      {/* Back to home float badge */}
      <Link href="/" className="absolute top-6 right-6 z-20 flex items-center gap-2 px-5 py-2.5 bg-white border-3 border-[#1A1A1A] rounded-xl font-black text-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#1A1A1A] active:translate-y-[1px] active:shadow-[1px_1px_0px_#1A1A1A] transition-all text-sm">
        <ArrowRight size={18} strokeWidth={3} />
        <span>الرئيسية</span>
      </Link>

      <div className="w-full max-w-[480px] px-4 z-10">
        <div className="relative">
          
          {/* Spectacular Yellow 3D Backplate Shadow Card */}
          <div className="absolute inset-0 bg-[#FFD700] border-4 border-[#1A1A1A] rounded-[28px] translate-x-3 translate-y-3 -rotate-1 z-0"></div>
          
          {/* Main Content Ledger Card */}
          <div className="relative z-10 bg-white border-4 border-[#1A1A1A] rounded-[28px] p-8 md:p-10 shadow-none">

            {/* Premium Logo Section */}
            <div className="flex flex-col items-center mb-8">
              <img 
                src="/logo.png" 
                alt="OPNO Logo" 
                className="w-24 h-24 object-contain mb-4 transform hover:scale-105 transition-transform duration-300"
              />
              <h1 className="text-4xl font-black bg-[#FF6B35] text-white px-6 py-2 border-3 border-[#1A1A1A] rotate-1 inline-block shadow-[4px_4px_0px_#1A1A1A] rounded-xl tracking-tight">
                أوبنو
              </h1>
              <p className="font-bold text-gray-500 text-sm mt-5 text-center leading-relaxed">
                {authMode === "manager-login" && 'مرحباً بك مجدداً في نظام الإدارة'}
                {authMode === "employee-login" && 'بوابة الموظفين — التحقق عبر BoardToken'}
                {authMode === "register" && 'ابدأ الآن وأنشئ حساب مطعمك السحابي'}
              </p>
            </div>

            {/* Mode Switcher Keyboard Deck */}
            <div className="grid grid-cols-3 gap-1 bg-[#F9FAFB] border-3 border-[#1A1A1A] rounded-2xl p-1.5 mb-8 shadow-[3px_3px_0px_#1A1A1A]">
              <button
                type="button"
                onClick={() => { setAuthMode("manager-login"); setError(""); }}
                className={`py-3 rounded-xl font-black text-xs transition-all flex flex-col md:flex-row items-center justify-center gap-1.5 border-2 ${
                  authMode === "manager-login" 
                    ? "bg-[#FF6B35] text-white border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] translate-y-[-2px]" 
                    : "bg-transparent text-gray-500 border-transparent hover:text-[#1A1A1A]"
                }`}
              >
                <Store size={14} strokeWidth={3} />
                <span>المدراء</span>
              </button>
              
              <button
                type="button"
                onClick={() => { setAuthMode("employee-login"); setError(""); setTotpCode(""); }}
                className={`py-3 rounded-xl font-black text-xs transition-all flex flex-col md:flex-row items-center justify-center gap-1.5 border-2 ${
                  authMode === "employee-login" 
                    ? "bg-[#AA00FF] text-white border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] translate-y-[-2px]" 
                    : "bg-transparent text-gray-500 border-transparent hover:text-[#1A1A1A]"
                }`}
              >
                <Smartphone size={14} strokeWidth={3} />
                <span>الموظفين</span>
              </button>
              
              <button
                type="button"
                onClick={() => { setAuthMode("register"); setError(""); }}
                className={`py-3 rounded-xl font-black text-xs transition-all flex flex-col md:flex-row items-center justify-center gap-1.5 border-2 ${
                  authMode === "register" 
                    ? "bg-[#00E676] text-[#1A1A1A] border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] translate-y-[-2px]" 
                    : "bg-transparent text-gray-500 border-transparent hover:text-[#1A1A1A]"
                }`}
              >
                <UserPlus size={14} strokeWidth={3} />
                <span>حساب جديد</span>
              </button>
            </div>

            {/* Error Message Alert Card */}
            {error && !showReset && (
              <div className="mb-4">
                <div className="p-4 bg-[#FF1744] text-white border-3 border-[#1A1A1A] rounded-2xl font-black text-sm text-center flex items-center justify-center gap-2 shadow-[3px_3px_0px_#1A1A1A] rotate-[-1deg]">
                  ⚠️ {error}
                </div>
                {authMode === "manager-login" && (
                  <button
                    type="button"
                    onClick={() => { setShowReset(true); setResetEmail(email); }}
                    className="mt-3 w-full text-center text-sm font-black text-[#FF6B35] hover:underline flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw size={14} strokeWidth={3} />
                    نسيت كلمة المرور؟ اضغط هنا لإعادة تعيينها
                  </button>
                )}
              </div>
            )}

            {/* ─── FORGOT PASSWORD RESET PANEL ─── */}
            {showReset && (
              <div className="mb-6 bg-[#FFFBEB] border-3 border-[#FF6B35] rounded-2xl p-5 shadow-[4px_4px_0px_#FF6B35]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 bg-[#FF6B35] border-2 border-[#1A1A1A] rounded-xl flex items-center justify-center shrink-0">
                    <RefreshCw size={16} strokeWidth={3} className="text-white" />
                  </div>
                  <div>
                    <p className="font-black text-sm text-[#1A1A1A]">إعادة تعيين كلمة المرور</p>
                    <p className="text-xs font-bold text-gray-500">أدخل بريدك وكلمة المرور الجديدة</p>
                  </div>
                </div>

                {resetSuccess && (
                  <div className="mb-3 p-3 bg-[#00E676] text-[#1A1A1A] border-2 border-[#1A1A1A] rounded-xl font-black text-xs text-center flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} strokeWidth={3} /> {resetSuccess}
                  </div>
                )}
                {resetError && (
                  <div className="mb-3 p-3 bg-[#FF1744] text-white border-2 border-[#1A1A1A] rounded-xl font-black text-xs text-center">
                    ⚠️ {resetError}
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-3">
                  <div className="relative flex items-center border-3 border-[#1A1A1A] rounded-xl overflow-hidden focus-within:shadow-[2px_2px_0px_#FF6B35] transition-all">
                    <div className="absolute right-0 top-0 bottom-0 w-10 bg-[#FF6B35]/10 border-l-2 border-[#1A1A1A] flex items-center justify-center">
                      <Mail className="text-[#1A1A1A]" size={16} strokeWidth={2.5} />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="البريد الإلكتروني المسجل"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pr-14 pl-3 py-3 text-sm font-bold bg-white text-[#1A1A1A] focus:outline-none placeholder-gray-400 dir-ltr text-right"
                    />
                  </div>
                  <div className="relative flex items-center border-3 border-[#1A1A1A] rounded-xl overflow-hidden focus-within:shadow-[2px_2px_0px_#FF6B35] transition-all">
                    <div className="absolute right-0 top-0 bottom-0 w-10 bg-[#FF6B35]/10 border-l-2 border-[#1A1A1A] flex items-center justify-center">
                      <Lock className="text-[#1A1A1A]" size={16} strokeWidth={2.5} />
                    </div>
                    <input
                      type="password"
                      required
                      minLength={8}
                      placeholder="كلمة المرور الجديدة (8+ أحرف)"
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      className="w-full pr-14 pl-3 py-3 text-sm font-bold bg-white text-[#1A1A1A] focus:outline-none placeholder-gray-400 dir-ltr text-right"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="flex-1 py-3 bg-[#FF6B35] text-white border-2 border-[#1A1A1A] rounded-xl font-black text-sm hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#1A1A1A] active:translate-y-[1px] transition-all shadow-[2px_2px_0px_#1A1A1A]"
                    >
                      {resetLoading ? "جاري التغيير..." : "تغيير كلمة المرور"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowReset(false); setResetError(""); setResetSuccess(""); }}
                      className="px-4 py-3 bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] rounded-xl font-black text-sm hover:bg-gray-100 transition-all shadow-[2px_2px_0px_#1A1A1A]"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Success Animation Card */}
            {success && (
              <div className="mb-6 p-4 bg-[#00E676] text-[#1A1A1A] border-3 border-[#1A1A1A] rounded-2xl font-black text-sm text-center flex flex-col items-center justify-center gap-2 shadow-[3px_3px_0px_#1A1A1A]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={22} strokeWidth={3} />
                  <span>تم بنجاح! جاري الانتقال...</span>
                </div>
                <p className="text-[10px] opacity-80 mt-1">يرجى الانتظار لتوجيهك للوحة التحكم</p>
              </div>
            )}

            {/* Input Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Restaurant Name Slot (Register Mode Only) */}
              {authMode === "register" && (
                <div className="space-y-2">
                  <label className="font-black text-sm block text-[#1A1A1A]">اسم المطعم</label>
                  <div className="relative flex items-center border-3 border-[#1A1A1A] rounded-xl overflow-hidden focus-within:shadow-[3px_3px_0px_#448AFF] focus-within:translate-y-[-1px] transition-all">
                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-[#FF6B35]/10 border-l-3 border-[#1A1A1A] flex items-center justify-center rounded-r-lg">
                      <Store className="text-[#1A1A1A]" size={20} strokeWidth={2.5} />
                    </div>
                    <input
                      type="text"
                      required
                      disabled={loading || success}
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      placeholder="مثال: مطعم السحاب السعيد"
                      className="w-full pr-16 pl-4 py-3.5 text-sm font-bold bg-white text-[#1A1A1A] focus:outline-none placeholder-gray-400"
                    />
                  </div>
                </div>
              )}

              {authMode === "employee-login" ? (
                /* ─── EMPLOYEE TOTP MECHANICS ─── */
                <div className="space-y-5">
                  
                  {/* Pair App Instructions Block */}
                  <div className="bg-[#FFFBEB] border-3 border-[#1A1A1A] rounded-2xl p-4 flex gap-4 items-start shadow-[3px_3px_0px_#1A1A1A]">
                    <div className="w-12 h-12 bg-[#AA00FF]/15 border-2 border-[#AA00FF] rounded-xl flex items-center justify-center shrink-0">
                      <Smartphone className="text-[#AA00FF]" size={24} strokeWidth={3} />
                    </div>
                    <div>
                      <p className="font-black text-sm text-[#AA00FF]">طريقة تسجيل دخول الموظفين</p>
                      <ol className="mt-1.5 space-y-1.5 text-xs font-black text-gray-700 list-decimal list-inside">
                        <li>افتح تطبيق <strong className="text-[#FF6B35] underline">BoardToken</strong> على جوالك.</li>
                        <li>أدخل الرمز المكوّن من <strong className="text-[#AA00FF]">10 خانات (حروف وأرقام)</strong>.</li>
                      </ol>
                    </div>
                  </div>

                  {/* TOTP Input Register */}
                  <div className="space-y-2">
                    <label className="font-black text-sm flex items-center gap-2 text-[#1A1A1A]">
                      <ShieldCheck size={18} className="text-[#AA00FF]" strokeWidth={3} />
                      رمز تسجيل الدخول المؤقت
                    </label>
                    <div className="relative flex items-center border-3 border-[#1A1A1A] rounded-xl overflow-hidden focus-within:shadow-[3px_3px_0px_#AA00FF] focus-within:translate-y-[-1px] transition-all">
                      <div className="absolute right-0 top-0 bottom-0 w-12 bg-[#AA00FF]/10 border-l-3 border-[#1A1A1A] flex items-center justify-center rounded-r-lg">
                        <KeyRound className="text-[#1A1A1A]" size={20} strokeWidth={2.5} />
                      </div>
                      <input
                        id="totp-code-input"
                        type="text"
                        required
                        disabled={loading || success}
                        maxLength={10}
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value.replace(/[^A-Za-z0-9]/g, ''))}
                        placeholder="مثال: AB12C3D4EF"
                        autoComplete="one-time-code"
                        className="w-full pr-16 pl-4 py-4 text-2xl tracking-[0.2em] font-black dir-ltr text-center uppercase bg-white text-[#1A1A1A] focus:outline-none placeholder-gray-300"
                      />
                    </div>
                    <p className="text-xs font-bold text-gray-400 text-center">
                      يتكون الرمز من 10 خانات من الأرقام والحروف اللاتينية الكبيرة
                    </p>
                  </div>
                </div>
              ) : (
                /* ─── MANAGER / REGISTER FLUID FIELDS ─── */
                <>
                  {/* Email Input Register */}
                  <div className="space-y-2">
                    <label className="font-black text-sm block text-[#1A1A1A]">البريد الإلكتروني</label>
                    <div className="relative flex items-center border-3 border-[#1A1A1A] rounded-xl overflow-hidden focus-within:shadow-[3px_3px_0px_#448AFF] focus-within:translate-y-[-1px] transition-all">
                      <div className="absolute right-0 top-0 bottom-0 w-12 bg-[#FF6B35]/10 border-l-3 border-[#1A1A1A] flex items-center justify-center rounded-r-lg">
                        <Mail className="text-[#1A1A1A]" size={20} strokeWidth={2.5} />
                      </div>
                      <input
                        type="email"
                        required
                        disabled={loading || success}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@restaurant.com"
                        className="w-full pr-16 pl-4 py-3.5 text-sm font-bold bg-white text-[#1A1A1A] focus:outline-none placeholder-gray-400 dir-ltr text-right"
                      />
                    </div>
                  </div>

                  {/* Password Input Register */}
                  <div className="space-y-2">
                    <label className="font-black text-sm block text-[#1A1A1A]">كلمة المرور</label>
                    <div className="relative flex items-center border-3 border-[#1A1A1A] rounded-xl overflow-hidden focus-within:shadow-[3px_3px_0px_#448AFF] focus-within:translate-y-[-1px] transition-all">
                      <div className="absolute right-0 top-0 bottom-0 w-12 bg-[#FF6B35]/10 border-l-3 border-[#1A1A1A] flex items-center justify-center rounded-r-lg">
                        <Lock className="text-[#1A1A1A]" size={20} strokeWidth={2.5} />
                      </div>
                      <input
                        type="password"
                        required
                        disabled={loading || success}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pr-16 pl-4 py-3.5 text-sm font-bold bg-white text-[#1A1A1A] focus:outline-none placeholder-gray-400 dir-ltr text-right"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Physical Neo Submit Button */}
              <button
                type="submit"
                disabled={loading || success}
                className={`w-full py-4 text-xl flex items-center justify-center gap-3 border-3 border-[#1A1A1A] rounded-2xl font-black hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#1A1A1A] active:translate-y-[1px] active:shadow-[1px_1px_0px_#1A1A1A] transition-all text-[#1A1A1A] ${
                  authMode === 'register' 
                    ? 'bg-[#00E676] shadow-[3px_3px_0px_#1A1A1A]' 
                    : authMode === 'employee-login' 
                      ? 'bg-[#AA00FF] text-white shadow-[3px_3px_0px_#1A1A1A]' 
                      : 'bg-[#FF6B35] text-white shadow-[3px_3px_0px_#1A1A1A]'
                }`}
              >
                {loading ? (
                  <span>جاري التحقق...</span>
                ) : success ? (
                  <span>تم الدخول!</span>
                ) : (
                  <>
                    <span>
                      {authMode === "manager-login" && 'دخول المدراء'}
                      {authMode === "employee-login" && 'تأكيد الرمز والدخول'}
                      {authMode === "register" && 'إنشاء حساب جديد'}
                    </span>
                    {authMode === "register" ? <UserPlus size={20} strokeWidth={3} /> : <LogIn size={20} strokeWidth={3} />}
                  </>
                )}
              </button>
            </form>

            {/* bottom Switch Section */}
            <div className="mt-8 pt-6 border-t-3 border-[#1A1A1A] text-center">
              <p className="font-bold text-gray-600">
                {authMode === "register" ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}
                <button
                  onClick={() => setAuthMode(authMode === "register" ? "manager-login" : "register")}
                  className="text-[#FF6B35] font-black mr-2 hover:underline inline-flex items-center gap-1.5"
                >
                  {authMode === "register" ? 'سجل دخولك' : 'سجل الآن'}
                  {authMode === "register" ? <ArrowRight size={14} className="mt-0.5" strokeWidth={3} /> : <ArrowLeft size={14} className="mt-0.5" strokeWidth={3} />}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}