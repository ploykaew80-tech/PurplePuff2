import React from 'react';
import { ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

interface AgeVerificationModalProps {
  onConfirm: () => void;
  onReject: () => void;
  rejected: boolean;
}

export const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({
  onConfirm,
  onReject,
  rejected
}) => {
  return (
    <div 
      id="age-verification-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div 
        id="age-verification-card"
        className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#231247] to-[#120826] border border-purple-500/30 glow-purple shadow-2xl text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-900/60 border border-purple-400/40 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-purple-300" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white mb-2 font-display">
          AGE VERIFICATION
        </h2>
        <p className="text-sm font-semibold tracking-wider text-purple-300 uppercase mb-4">
          การยืนยันอายุตามกฎหมาย
        </p>

        {rejected ? (
          <div className="p-4 mb-6 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-sm">
            <p className="font-medium">ขออภัย คุณไม่สามารถเข้าถึงร้านค้าได้</p>
            <p className="text-xs text-red-300/80 mt-1">
              ตามกฎหมายและข้อบังคับ ผู้เข้าชมต้องมีอายุตั้งแต่ 20 ปีบริบูรณ์ขึ้นไป
            </p>
          </div>
        ) : (
          <div className="text-xs sm:text-sm text-purple-200/80 leading-relaxed mb-6 space-y-2 text-left bg-purple-950/30 p-4 rounded-xl border border-purple-800/30">
            <p>
              • สินค้าภายในร้านจัดจำหน่ายสำหรับผู้มีอายุตั้งแต่ <strong>20 ปีบริบูรณ์ขึ้นไป</strong> เท่านั้น
            </p>
            <p>
              • ห้ามสตรีมีครรภ์ หรือสตรีให้นมบุตรใช้งาน
            </p>
            <p>
              • ระบบเคารพความเป็นส่วนตัวและไม่มีการเก็บข้อมูลส่วนบุคคลเกินความจำเป็น
            </p>
          </div>
        )}

        {rejected ? (
          <button
            id="age-verify-retry-btn"
            onClick={onReject}
            className="w-full py-3 px-6 rounded-xl text-sm font-semibold bg-purple-800/60 text-purple-200 hover:bg-purple-700/60 transition cursor-pointer"
          >
            ลองใหม่อีกครั้ง
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              id="age-verify-confirm-btn"
              onClick={onConfirm}
              className="flex-1 py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4 text-yellow-300" />
              I CONFIRM (อายุ 20 ปีขึ้นไป)
            </button>
            <button
              id="age-verify-reject-btn"
              onClick={onReject}
              className="py-3.5 px-4 rounded-xl font-medium text-xs text-purple-300/70 hover:text-white hover:bg-white/5 border border-purple-500/20 cursor-pointer transition flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              I DO NOT MEET
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
