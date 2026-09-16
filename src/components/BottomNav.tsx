import React from 'react';
import { Home, Grid, Tag, MessageCircle } from 'lucide-react';

export type CustomerTab = 'HOME' | 'CATALOG' | 'PROMOTION' | 'CONTACT';

interface BottomNavProps {
  activeTab: CustomerTab;
  onTabChange: (tab: CustomerTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'HOME' as CustomerTab, label: 'HOME', icon: Home },
    { id: 'CATALOG' as CustomerTab, label: 'CATALOG', icon: Grid },
    { id: 'PROMOTION' as CustomerTab, label: 'PROMOTION', icon: Tag },
    { id: 'CONTACT' as CustomerTab, label: 'CONTACT', icon: MessageCircle }
  ];

  return (
    <nav 
      id="customer-bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0e071e]/95 backdrop-blur-lg border-t border-purple-900/40 px-3 py-2 pb-safe"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id.toLowerCase()}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer min-w-[64px] ${
                isActive
                  ? 'text-white'
                  : 'text-purple-300/60 hover:text-purple-200'
              }`}
            >
              <div 
                className={`p-1.5 rounded-xl transition ${
                  isActive 
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-600/30 glow-purple-sm' 
                    : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span 
                className={`text-[10px] font-bold tracking-wider mt-1 ${
                  isActive ? 'text-purple-200' : 'text-purple-400/60'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
