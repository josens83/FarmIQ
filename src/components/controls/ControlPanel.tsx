import React, { useState } from 'react';
import { Settings, ShoppingCart, Cpu, TrendingUp } from 'lucide-react';
import { EquipmentPanel } from './EquipmentPanel';
import { ShopPanel } from './ShopPanel';
import { AutomationPanel } from './AutomationPanel';

type ControlTab = 'equipment' | 'shop' | 'automation';

export const ControlPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ControlTab>('equipment');

  const tabs: { id: ControlTab; label: string; icon: React.ReactNode }[] = [
    { id: 'equipment', label: '장비', icon: <Settings className="w-4 h-4" /> },
    { id: 'automation', label: '자동화', icon: <Cpu className="w-4 h-4" /> },
    { id: 'shop', label: '상점', icon: <ShoppingCart className="w-4 h-4" /> }
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-800 to-slate-900 border-t border-slate-700">
      {/* Tab Bar */}
      <div className="flex items-center border-b border-slate-700 px-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'text-green-400 border-green-400'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:block">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'equipment' && <EquipmentPanel />}
        {activeTab === 'automation' && <AutomationPanel />}
        {activeTab === 'shop' && <ShopPanel />}
      </div>
    </div>
  );
};
