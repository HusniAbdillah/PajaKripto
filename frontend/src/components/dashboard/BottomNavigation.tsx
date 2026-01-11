import React from 'react';
import { BanknoteArrowDown, BanknoteArrowUp, RefreshCw } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: 'tax' | 'transactions' | 'optimize';
  setActiveTab: (tab: 'tax' | 'transactions' | 'optimize') => void;
  t: {
    navTax: string;
    navTransactions: string;
    navOptimize: string;
  };
}

export function BottomNavigation({ activeTab, setActiveTab, t }: BottomNavigationProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-30 flex-shrink-0">
      <div className="flex items-center justify-around px-4 py-3">
        <button 
          onClick={() => setActiveTab('tax')}
          className={`flex flex-col items-center gap-1.5 px-4 py-2 rounded-full transition-all duration-300 relative ${
            activeTab === 'tax' 
              ? 'text-success' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {activeTab === 'tax' && (
            <div className="absolute inset-0 bg-success/15 rounded-full z-0"></div>
          )}
          <div className="relative z-10">
            <BanknoteArrowDown className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium relative z-10">{t.navTax}</span>
        </button>

        {/* Transactions Button */}
        <button 
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center gap-1.5 px-4 py-2 rounded-full transition-all duration-300 relative ${
            activeTab === 'transactions' 
              ? 'text-success' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {activeTab === 'transactions' && (
            <div className="absolute inset-0 bg-success/15 rounded-full z-0"></div>
          )}
          <div className="relative z-10">
            <RefreshCw className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium relative z-10">{t.navTransactions}</span>
        </button>

        {/* Optimize Button */}
        <button 
          onClick={() => setActiveTab('optimize')}
          className={`flex flex-col items-center gap-1.5 px-4 py-2 rounded-full transition-all duration-300 relative ${
            activeTab === 'optimize' 
              ? 'text-success' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {activeTab === 'optimize' && (
            <div className="absolute inset-0 bg-success/15 rounded-full z-0"></div>
          )}
          <div className="relative z-10">
            <BanknoteArrowUp className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium relative z-10">{t.navOptimize}</span>
        </button>
      </div>
    </footer>
  );
}