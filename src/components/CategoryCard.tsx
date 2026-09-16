import React from 'react';
import type { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  isSelected?: boolean;
  onClick: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isSelected,
  onClick
}) => {
  return (
    <button
      id={`cat-card-${category.id}`}
      onClick={onClick}
      className={`group relative p-3 sm:p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center overflow-hidden border ${
        isSelected
          ? 'bg-gradient-to-b from-purple-700/60 to-fuchsia-900/60 border-purple-400 glow-purple shadow-lg scale-105'
          : 'bg-[#150a2c]/80 hover:bg-[#1e0e3d]/90 border-purple-800/30 hover:border-purple-500/40 hover:-translate-y-0.5'
      }`}
    >
      {/* Subtle top glow */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent group-hover:via-purple-400/60" />

      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-950/70 border border-purple-500/20 flex items-center justify-center text-2xl sm:text-3xl mb-2 group-hover:scale-110 transition shadow-inner">
        {category.icon || '✨'}
      </div>

      <span className="text-xs sm:text-sm font-bold text-white font-display line-clamp-1 tracking-tight">
        {category.name}
      </span>
      
      {category.description && (
        <span className="text-[10px] text-purple-300/60 line-clamp-1 mt-0.5 hidden sm:block">
          {category.description}
        </span>
      )}
    </button>
  );
};
