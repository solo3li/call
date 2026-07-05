import React from "react";
import { CheckCircle2, ShieldCheck, X } from "lucide-react";

interface EmployeeQrModalProps {
  employeeName: string;
  qrCodeDataUri: string;
  isDelivery?: boolean;
  onClose: () => void;
}

export function EmployeeQrModal({ employeeName, qrCodeDataUri, isDelivery, onClose }: EmployeeQrModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in dir-rtl">
      <div className="bg-white neo-card w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors bg-gray-100 rounded-full p-1"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-brand-green/20 text-brand-green rounded-full flex items-center justify-center mb-2">
            <CheckCircle2 size={36} />
          </div>

          <h3 className="text-xl font-black text-gray-900">
            تم إضافة <span className={isDelivery ? "text-brand-pink" : "text-brand-purple"}>{employeeName}</span> بنجاح
          </h3>
          <p className="text-sm font-bold text-gray-600 px-4">
            {isDelivery ? (
              <span>هذا الرمز مخصص <span className="text-brand-pink font-black">لمندوب التوصيل 🚗</span>. دعه يمسح الرمز باستخدام تطبيق <strong>FoodRMS TOTP</strong> ليتمكن من تسجيل الدخول.</span>
            ) : (
              <span>قم بإرشاد الموظف لمسح هذا الرمز باستخدام تطبيق <strong>FoodRMS TOTP</strong> ليتمكن من تسجيل الدخول.</span>
            )}
          </p>

          <div className="p-4 bg-white border-4 border-neo-border rounded-xl shadow-[4px_4px_0px_#1A1A1A] my-4">
            <img src={qrCodeDataUri} alt="QR Code" className="w-48 h-48" />
          </div>

          <div className={`border-2 p-3 rounded-lg flex gap-3 text-right mt-2 w-full ${isDelivery ? 'bg-brand-pink/10 border-brand-pink/30' : 'bg-brand-purple/10 border-brand-purple/30'}`}>
            <ShieldCheck className={`shrink-0 mt-0.5 ${isDelivery ? 'text-brand-pink' : 'text-brand-purple'}`} size={20} />
            <p className={`text-xs font-bold ${isDelivery ? 'text-brand-pink/90' : 'text-brand-purple/90'}`}>
              هذا الرمز يُعرض مرة واحدة فقط لأسباب أمنية. تأكد من مسحه الآن.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full neo-btn bg-brand-purple text-white py-3 mt-4 text-lg font-black flex justify-center items-center gap-2"
          >
            <span>تم المسح والمتابعة</span>
          </button>
        </div>
      </div>
    </div>
  );
}
