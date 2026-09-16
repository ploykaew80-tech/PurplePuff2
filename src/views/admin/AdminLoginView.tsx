import React, { useState } from 'react';
import { Lock, Mail, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';
import { adminLogin } from '../../lib/api';
import type { User } from '../../types';

interface AdminLoginViewProps {
  onLoginSuccess: (user: User) => void;
  onBackToCustomer: () => void;
  logoUrl?: string;
  storeName?: string;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onLoginSuccess,
  onBackToCustomer,
  logoUrl = '/logo.png',
  storeName = 'PURPLE PUFF'
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotNotice, setForgotNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user } = await adminLogin(email.trim(), password, remember);
      onLoginSuccess(user);
    } catch (err: any) {
      setError('Email หรือ Password ไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="admin-login-view" className="min-h-[80vh] flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Back to store button */}
        <button
          onClick={onBackToCustomer}
          className="inline-flex items-center gap-2 text-xs font-semibold text-purple-300/80 hover:text-white mb-6 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับสู่หน้าร้าน (Customer App)</span>
        </button>

        {/* Login Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#1f0d42] to-[#100722] border border-purple-500/30 glow-purple shadow-2xl">
          {/* Logo & Title */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-purple-700 via-fuchsia-600 to-indigo-600 p-[2px] shadow-lg flex items-center justify-center overflow-hidden">
              <div className="w-full h-full rounded-[14px] bg-[#120826] p-1.5 flex items-center justify-center overflow-hidden">
                <img
                  src={logoUrl}
                  alt={storeName}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>

            <h1 className="text-2xl font-black tracking-wider text-white font-display">
              {storeName}
            </h1>
            <p className="text-xs font-bold tracking-[0.2em] text-purple-300 uppercase mt-1">
              ADMIN ACCESS
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-purple-300 uppercase tracking-wider block mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="กรอกอีเมลของคุณ"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-purple-950/50 border border-purple-800/40 text-white text-xs sm:text-sm focus:border-purple-400 focus:outline-none placeholder:text-purple-400/40"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-purple-300 uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="กรอกรหัสผ่าน"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-purple-950/50 border border-purple-800/40 text-white text-xs sm:text-sm focus:border-purple-400 focus:outline-none placeholder:text-purple-400/40"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-purple-300/80 hover:text-purple-200">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="rounded bg-purple-950 border-purple-700 text-purple-600 accent-purple-600 focus:ring-0 cursor-pointer"
                />
                <span>Remember this device</span>
              </label>

              <button
                type="button"
                onClick={() => setForgotNotice(!forgotNotice)}
                className="text-purple-400 hover:text-purple-200 underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {forgotNotice && (
              <p className="text-[11px] text-purple-300/70 p-2.5 rounded-lg bg-purple-950/40 border border-purple-800/30 leading-relaxed">
                กรุณาติดต่อเจ้าหน้าที่ดูแลระบบเพื่อรีเซ็ตรหัสผ่าน
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 cursor-pointer transition active:scale-98 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>กำลังตรวจสอบสิทธิ์...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>เข้าสู่ระบบ (LOGIN)</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
