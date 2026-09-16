import React, { useState } from 'react';
import { Layers, Edit, Plus, Save, X, Sparkles } from 'lucide-react';
import type { Category, User } from '../../types';

interface AdminCategoriesViewProps {
  categories: Category[];
  currentUser: User;
  onSaveCategory: (category: Partial<Category>) => Promise<void>;
}

export const AdminCategoriesView: React.FC<AdminCategoriesViewProps> = ({
  categories,
  currentUser,
  onSaveCategory
}) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    icon: '✨',
    description: '',
    display_order: 1
  });
  const [saving, setSaving] = useState(false);

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({ ...cat });
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      icon: '✨',
      description: '',
      display_order: categories.length + 1
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    try {
      setSaving(true);
      await onSaveCategory(editingCategory ? { ...formData, id: editingCategory.id } : formData);
      setIsModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="admin-categories-view" className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display">
            CATEGORY MANAGEMENT
          </h2>
          <p className="text-xs text-purple-300/80">
            จัดการหมวดหมู่หลัก ไอคอน และคำอธิบาย ({categories.length} หมวดหมู่)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ ADD CATEGORY</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map(cat => (
          <div
            key={cat.id}
            className="p-5 rounded-3xl bg-cosmic-card border border-purple-500/20 hover:border-purple-400/40 transition flex flex-col justify-between shadow-xl group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition shadow-inner">
                  {cat.icon}
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-800/40 text-purple-300">
                  Order #{cat.display_order}
                </span>
              </div>

              <h3 className="text-base font-bold text-white font-display mb-1">
                {cat.name}
              </h3>
              <p className="text-xs text-purple-300/70 line-clamp-2">
                {cat.description || 'ไม่มีคำอธิบายเพิ่มเติม'}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-purple-900/30 flex justify-end">
              <button
                onClick={() => handleOpenEdit(cat)}
                className="px-3 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-700/60 text-purple-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>แก้ไข</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Category Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="w-full max-w-md rounded-3xl bg-[#1a0c36] border border-purple-500/30 p-6 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/40">
              <h3 className="text-base font-bold text-white font-display">
                {editingCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-purple-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-purple-300 block mb-1">
                  ชื่อหมวดหมู่ *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/50 border border-purple-800/40 text-white text-xs sm:text-sm focus:border-purple-400 focus:outline-none"
                  placeholder="เช่น ดอก POP, ขนม"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-purple-300 block mb-1">
                    อิโมจิ / ไอคอน
                  </label>
                  <input
                    type="text"
                    value={formData.icon || ''}
                    onChange={e => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/50 border border-purple-800/40 text-white text-xs sm:text-sm focus:border-purple-400 focus:outline-none text-center text-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-purple-300 block mb-1">
                    ลำดับการแสดงผล
                  </label>
                  <input
                    type="number"
                    value={formData.display_order ?? 1}
                    onChange={e => setFormData({ ...formData, display_order: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/50 border border-purple-800/40 text-white text-xs sm:text-sm focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-purple-300 block mb-1">
                  คำอธิบายหมวดหมู่
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/50 border border-purple-800/40 text-white text-xs sm:text-sm focus:border-purple-400 focus:outline-none"
                />
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
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'กำลังบันทึก...' : 'บันทึก'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
