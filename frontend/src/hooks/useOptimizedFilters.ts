'use client';

import { useState, useEffect, useMemo } from 'react';

interface Transaction {
  id: string;
  timestamp: string;
  type: 'RECEIVE' | 'TRANSFER' | 'SWAP' | 'MINT';
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
}

interface UseOptimizedFiltersOptions {
  transactions: Transaction[];
  selectedTypes: string[];
  selectedMonth: string;
  selectedYear: string;
  searchQuery: string;
  sortOrder: 'newest' | 'oldest';
  debounceMs?: number;
}

interface UseOptimizedFiltersResult {
  filteredTransactions: Transaction[];
  isFiltering: boolean;
  totalCount: number;
  filteredCount: number;
}

export function useOptimizedFilters({
  transactions,
  selectedTypes,
  selectedMonth,
  selectedYear,
  searchQuery,
  sortOrder,
  debounceMs = 300
}: UseOptimizedFiltersOptions): UseOptimizedFiltersResult {
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [isFiltering, setIsFiltering] = useState(false);

  // Debounce search query
  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setIsFiltering(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  const months = ['all', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  // Memoized filtered transactions for performance
  const filteredTransactions = useMemo(() => {
    if (transactions.length === 0) return [];

    console.time('🔍 Filtering transactions');

    let filtered = transactions;

    // Type filter
    if (!selectedTypes.includes('ALL')) {
      filtered = filtered.filter(tx => selectedTypes.includes(tx.type));
    }

    // Year filter
    if (selectedYear !== 'all') {
      filtered = filtered.filter(tx => {
        return new Date(tx.timestamp).getFullYear().toString() === selectedYear;
      });
    }

    // Month filter  
    if (selectedMonth !== 'all') {
      const monthIndex = months.indexOf(selectedMonth);
      filtered = filtered.filter(tx => {
        return new Date(tx.timestamp).getMonth() === monthIndex - 1;
      });
    }

    // Search filter (using debounced query)
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(tx => {
        return tx.id.toLowerCase().includes(query) ||
               tx.type.toLowerCase().includes(query) ||
               (tx.asset && tx.asset.toLowerCase().includes(query)) ||
               (tx.asset_sent && tx.asset_sent.toLowerCase().includes(query)) ||
               (tx.asset_received && tx.asset_received.toLowerCase().includes(query)) ||
               (tx.note && tx.note.toLowerCase().includes(query));
      });
    }

    // Sort transactions
    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    console.timeEnd('🔍 Filtering transactions');
    console.log(`🔍 Filtered ${transactions.length} → ${filtered.length} transactions`);

    return filtered;
  }, [
    transactions,
    selectedTypes,
    selectedYear,
    selectedMonth,
    debouncedSearchQuery,
    sortOrder,
    months
  ]);

  return {
    filteredTransactions,
    isFiltering,
    totalCount: transactions.length,
    filteredCount: filteredTransactions.length,
  };
}