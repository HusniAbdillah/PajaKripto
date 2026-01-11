'use client';

import React from 'react';
import Image from 'next/image';
import { RefreshCw, BanknoteArrowDown, BanknoteArrowUp } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageSwitch } from '@/components/layout/LanguageSwitch';
import { WalletComponents } from '@/components/wallet/WalletComponents';

interface DashboardLayoutProps {
  activeTab: 'tax' | 'transactions' | 'optimize';
  onTabChange: (tab: 'tax' | 'transactions' | 'optimize') => void;
  children: React.ReactNode;
}

export function DashboardLayout({ activeTab, onTabChange, children }: DashboardLayoutProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header - Sticky */}
      <nav className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur-sm flex-shrink-0">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image 
              src="/pajakripto_logo.jpeg" 
              alt="PajaKripto Logo" 
              width={40} 
              height={40}
              className="rounded-lg"
            />
            <span className="text-lg font-semibold text-foreground">
              {t.app_name}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitch />
            <WalletComponents />
          </div>
        </div>
      </nav>

      {/* Body Content - Scrollable */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-28">
        {children}
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-card border border-border rounded-top px-4 py-3 shadow-lg flex items-center gap-6 backdrop-blur-sm bg-card/98 flex justify-around">
          {/* Tax Button */}
          <button 
            onClick={() => onTabChange('tax')}
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
            onClick={() => onTabChange('transactions')}
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
            onClick={() => onTabChange('optimize')}
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
    </div>
  );
}
