import React, { useState } from 'react';
import { Users, Plus, Shield, KeyRound, Trash2, X, Save, CheckCircle2 } from 'lucide-react';
import type { User, UserRole } from '../../types';

interface AdminUsersViewProps {
  users: User[];
  currentUser: User;
  onSaveUser: (user: Partial<User> & { password?: string }) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({
  users,
  currentUser,
  onSaveUser,
  onDeleteUser
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STAFF' as UserRole
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'STAFF'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Blank unless resetting
      role: user.role
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    try {
      setSaving(true);
      await onSaveUser({
        ...(editingUser ? { id: editingUser.id } : {}),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        ...(formData.password ? { password: formData.password } : {})
      });
      setIsModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="admin-users-view" className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display flex items-center gap-2">
            <span>USER MANAGEMENT</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-yellow-300 border border-amber-500/30">
              SUPER ADMIN ONLY
            </span>
          </h2>
          <p className="text-xs text-purple-300/80">
            จัดการบัญชีผู้ดูแลระบบ กำหนดสิทธิ์ และรีเซ็ตรหัสผ่าน
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ ADD USER</span>
        </button>
      </div>

      <div className="rounded-3xl bg-cosmic-card border border-purple-500/20 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#180b33] border-b border-purple-900/40 text-purple-300 uppercase tracking-wider font-bold">
            <tr>
              <th className="p-3.5 pl-5">ชื่อผู้ใช้งาน</th>
              <th className="p-3.5">Email</th>
              <th className="p-3.5">สิทธิ์การใช้งาน (Role)</th>
              <th className="p-3.5 pr-5 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-900/30 text-purple-200">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-purple-900/20 transition">
                <td className="p-3.5 pl-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-purple-800/70 border border-purple-500/30 flex items-center justify-center font-bold text-white text-xs">
                      {u.name.charAt(0)}
                    </div>
                    <span className="font-bold text-white">{u.name}</span>
                  </div>
                </td>
                <td className="p-3.5 text-purple-300">{u.email}</td>
                <td className="p-3.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    u.role === 'SUPER ADMIN'
                      ? 'bg-amber-950/60 border-amber-500/40 text-yellow-300'
                      : u.role === 'ADMIN'
                      ? 'bg-purple-950/60 border-purple-500/40 text-purple-200'
                      : 'bg-zinc-900/60 border-zinc-700 text-zinc-300'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-3.5 pr-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="px-2.5 py-1 rounded-lg bg-purple-900/40 hover:bg-purple-800 text-purple-200 text-xs font-semibold cursor-pointer"
                    >
                      แก้ไข / รีเซ็ตรหัส
                    </button>
                    {u.id !== currentUser.id && (
                      <button
                        onClick={() => setDeleteConfirmId(u.id)}
                        className="p-1 rounded-lg bg-rose-950/40 hover:bg-rose-900 text-rose-300 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete confirm modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-[#1d0a33] border border-rose-500/40 text-center space-y-4">
            <h3 className="text-base font-bold text-white">ลบบัญชีผู้ใช้นี้?</h3>
            <p className="text-xs text-purple-300/80">
              ผู้ใช้นี้จะไม่สามารถเข้าสู่ระบบแอดมินได้อีกต่อไป
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-purple-900/50 text-purple-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={async () => {
                  await onDeleteUser(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="w-full max-w-md rounded-3xl bg-[#1b0c38] border border-purple-500/30 p-6 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/40">
              <h3 className="text-base font-bold text-white font-display">
                {editingUser ? 'แก้ไขสิทธิ์ & รหัสผ่าน' : 'เพิ่มผู้ใช้งานใหม่'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-purple-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-purple-300 block mb-1">
                  ชื่อ-นามสกุล / Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/50 border border-purple-800/40 text-white text-xs focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-purple-300 block mb-1">
                  Email สำหรับ Login *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/50 border border-purple-800/40 text-white text-xs focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-purple-300 block mb-1">
                  {editingUser ? 'รหัสผ่านใหม่ (เว้นว่างไว้หากไม่เปลี่ยน)' : 'รหัสผ่านเริ่มต้น *'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  placeholder={editingUser ? '••••••••' : 'ขั้นต่ำ 6 ตัวอักษร'}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/50 border border-purple-800/40 text-white text-xs focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-purple-300 block mb-1">
                  ระดับสิทธิ์ (Role) *
                </label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white text-xs focus:border-purple-400 focus:outline-none cursor-pointer"
                >
                  <option value="STAFF">STAFF (ดูและแก้ไขข้อมูลสินค้า)</option>
                  <option value="ADMIN">ADMIN (จัดการสินค้า, หมวดหมู่, โปรโมชั่น, ตั้งค่าร้าน)</option>
                  <option value="SUPER ADMIN">SUPER ADMIN (ทุกสิทธิ์ + จัดการผู้ใช้)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-purple-900/40 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-950/50 text-purple-300 hover:text-white"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
