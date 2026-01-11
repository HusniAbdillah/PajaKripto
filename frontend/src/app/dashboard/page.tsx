'use client';

import React, { useState, useEffect } from 'react';
import { ArrowDownLeft, Send, RefreshCw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { useProtectedRoute } from '@/hooks/useWalletProtection';
import { useWalletTransactions } from '@/hooks/useWalletTransactions';
import { Address } from '@/types';
import { TaxTabContent } from '@/components/dashboard/TaxTabContent';
import { TransactionsTabContent } from '@/components/dashboard/TransactionsTabContent';
import { OptimizeTabContent } from '@/components/dashboard/OptimizeTabContent';
import { BottomNavigation } from '@/components/dashboard/BottomNavigation';
import { Header } from '@/components/layout/Header';
import { TestWalletInput } from '@/components/dashboard/TestWalletInput';

type Transaction = {
  id: string;
  timestamp: string;
  type: 'RECEIVE' | 'TRANSFER' | 'SWAP' | 'MINT';
  // Processed data from useWalletTransactions hook
  primaryAsset?: string;
  primaryAmount?: number;
  secondaryAsset?: string;
  secondaryAmount?: number;
  // Legacy fields for fallback
  asset?: string;
  amount?: number;
  price_at_date?: number;
  from?: string;
  to?: string;
  fee_eth?: number;
  asset_sent?: string;
  amount_sent?: number;
  asset_received?: string;
  amount_received?: number;
  price_sent_at_date?: number;
  note?: string;
  cost_eth?: number;
  price_eth_at_date?: number;
};

export default function Dashboard() {
  // All hooks must be called first, before any early returns
  const { isConnected, isConnecting } = useProtectedRoute();
  const { t, lang, setLang } = useLanguage();
  
  // State for address selection
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  
  // Search state only
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  // Tab and filter states
  const [activeTab, setActiveTab] = useState<'tax' | 'transactions' | 'optimize'>('tax');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['ALL']);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Use wallet transactions hook to get real data from backend
  // For load more, we'll request next batch with offset
  const { 
    transactions, 
    isLoading: isLoadingTransactions, 
    isError, 
    error, 
    refetch, 
    activeAddress,
    isTestMode: hookIsTestMode 
  } = useWalletTransactions({ 
    testAddress: selectedAddress || undefined 
  });

  // Simple pagination - just use transactions directly from hook for current page
  // and manually manage loaded transactions for display
  const [loadedTransactions, setLoadedTransactions] = useState<Transaction[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // When transactions from hook change, handle them appropriately
  useEffect(() => {
    if (transactions) {
      setLoadedTransactions(transactions);
    }
  }, [transactions]);

  // Clear transactions when address changes
  useEffect(() => {
    setLoadedTransactions([]);
  }, [selectedAddress, activeAddress]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (isConnecting || !isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isConnecting ? 'Checking wallet connection...' : 'Redirecting to home...'}
          </p>
        </div>
      </div>
    );
  }

  // Show transaction loading state
  const showTransactionLoading = activeTab === 'transactions' && isLoadingTransactions;

  // Handle address submission
  const handleAddressSubmit = (address: string) => {
    setSelectedAddress(address);
    setShowAddressSelector(false);
    // Reset will be handled by useEffect above
  };

  // Handle toggling address selector
  const handleToggleAddressSelector = () => {
    setShowAddressSelector(!showAddressSelector);
  };



  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return t.today;
    if (days === 1) return t.yesterday;
    if (days < 7) return `${days} ${t.daysAgo}`;
    
    return date.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatAmount = (amount: number | undefined | null) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '0';
    }
    
    // Handle very large numbers
    if (amount >= 1000000) return (amount / 1000000).toFixed(2) + 'M';
    if (amount >= 1000) return (amount / 1000).toFixed(2) + 'K';
    
    // Handle very small numbers - show in scientific notation if < 0.0001
    if (amount > 0 && amount < 0.0001) {
      const result = amount.toExponential(2);
      return result;
    }
    
    // Handle small decimal numbers - show more precision for small amounts
    if (amount < 1) {
      const result = amount.toFixed(6).replace(/\.?0+$/, ''); // Remove trailing zeros
      return result;
    }
    
    // Normal numbers
    const result = amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 4 });
    return result;
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'RECEIVE': return <ArrowDownLeft className="w-5 h-5" />;
      case 'TRANSFER': return <Send className="w-5 h-5" />;
      case 'SWAP': return <RefreshCw className="w-5 h-5" />;
      case 'MINT': return <Plus className="w-5 h-5" />;
      default: return <ArrowDownLeft className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'RECEIVE': return 'bg-success text-black';
      case 'TRANSFER': return 'bg-warning text-black';
      case 'SWAP': return 'bg-info text-black';
      case 'MINT': return 'bg-info text-black';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const toggleType = (type: string) => {
    if (type === 'ALL') {
      setSelectedTypes(['ALL']);
    } else {
      const newTypes = selectedTypes.filter(t => t !== 'ALL');
      if (newTypes.includes(type)) {
        const filtered = newTypes.filter(t => t !== type);
        setSelectedTypes(filtered.length === 0 ? ['ALL'] : filtered);
      } else {
        setSelectedTypes([...newTypes, type]);
      }
    }
  };

  const applyFilters = () => {
    setShowFilterDropdown(false);
  };

  const resetFilters = () => {
    setSelectedTypes(['ALL']);
    setSelectedMonth('all');
    setSelectedYear('all');
    setSortOrder('newest');
  };

  const years = ['all', '2025', '2024', '2023'];
  const months = ['all', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  const filteredTransactions = (loadedTransactions || [])
    .filter(tx => {
      if (selectedTypes.includes('ALL')) return true;
      return selectedTypes.includes(tx.type);
    })
    .filter(tx => {
      if (selectedYear === 'all') return true;
      return new Date(tx.timestamp).getFullYear().toString() === selectedYear;
    })
    .filter(tx => {
      if (selectedMonth === 'all') return true;
      const monthIndex = months.indexOf(selectedMonth);
      return new Date(tx.timestamp).getMonth() === monthIndex - 1;
    })
    .filter(tx => {
      const query = debouncedSearchQuery.toLowerCase();
      if (!query) return true;
      return tx.id?.toLowerCase().includes(query) ||
             tx.type?.toLowerCase().includes(query) ||
             tx.primaryAsset?.toLowerCase().includes(query) ||
             tx.asset?.toLowerCase().includes(query) ||
             tx.asset_sent?.toLowerCase().includes(query) ||
             tx.asset_received?.toLowerCase().includes(query) ||
             (tx.note && tx.note.toLowerCase().includes(query));
    })
    .sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  // Show only current page items when not searching
  const displayedTransactions = filteredTransactions;
    
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header Component */}
      <Header />

      {/* Body Content - Scrollable */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-28 max-w-6xl mx-auto w-full">
        {/* Tax Tab Content */}
        {activeTab === 'tax' && <TaxTabContent />}

        {/* Transactions Tab Content */}
        {activeTab === 'transactions' && (
          <>
            {/* Address Selection Input */}
            <TestWalletInput
              onAddressSubmit={handleAddressSubmit}
              isActive={showAddressSelector}
              onToggle={handleToggleAddressSelector}
              currentAddress={selectedAddress}
            />

            {/* Transaction loading state */}
            {showTransactionLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading transactions from {activeAddress}...</p>
                  {hookIsTestMode && <p className="text-xs text-blue-500 mt-1"></p>}
                </div>
              </div>
            )}
            
            {/* Transaction error state */}
            {isError && !isLoadingTransactions && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-red-500 mb-4">
                  <p className="font-medium">Failed to load transactions</p>
                  <p className="text-sm text-gray-500 mt-1">{error}</p>
                </div>
                <Button onClick={refetch} size="sm" variant="outline">
                  Try Again
                </Button>
              </div>
            )}

            {/* Transaction content */}
            {!showTransactionLoading && (
              <TransactionsTabContent
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                showFilterDropdown={showFilterDropdown}
                setShowFilterDropdown={setShowFilterDropdown}
                selectedTypes={selectedTypes}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                filteredTransactions={displayedTransactions}
                formatDate={formatDate}
                formatTime={formatTime}
                formatAmount={formatAmount}
                getTypeIcon={getTypeIcon}
                getTypeColor={getTypeColor}
                toggleType={toggleType}
                setSelectedMonth={setSelectedMonth}
                setSelectedYear={setSelectedYear}
                applyFilters={applyFilters}
                resetFilters={resetFilters}
                years={years}
                months={months}
                activeAddress={activeAddress}
                isTestMode={hookIsTestMode}
                onRefresh={refetch}
              />
            )}
          </>
        )}

        {/* Optimize Tab Content */}
        {activeTab === 'optimize' && <OptimizeTabContent />}
      </main>

      {/* Bottom Navigation Component */}
      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} t={t} />
    </div>
  );
}