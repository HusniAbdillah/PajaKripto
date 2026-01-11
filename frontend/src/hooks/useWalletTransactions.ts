'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Address } from '@/types';

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

interface UseWalletTransactionsOptions {
  limit?: number;
  testAddress?: string; 
}

interface UseWalletTransactionsResult {
  transactions: Transaction[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => void;
  activeAddress: string | null; // The address being used (connected or test)
  isTestMode: boolean;
}

export function useWalletTransactions(
  options: UseWalletTransactionsOptions = {}
): UseWalletTransactionsResult {
  const { limit = 50, testAddress } = options;
  const { address: connectedAddress, isConnected } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine which address to use: test address takes priority
  const activeAddress = testAddress || (isConnected ? connectedAddress : null);
  const isTestMode = !!testAddress;

  const fetchTransactions = async () => {
    console.log(`📦 Using mock data for ${activeAddress || 'no address'}`);
    
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      // Load mock data
      const mockTransactions = await import('@/data/mock/transactions.json');
      setTransactions(mockTransactions.default as Transaction[]);
      console.log(`✅ Loaded ${mockTransactions.default.length} mock transactions`);
    } catch (err: any) {
      console.error('❌ Error loading mock data:', err);
      setIsError(true);
      setError(err.message || 'Failed to load mock data');
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchTransactions();
  };

  // Fetch mock transactions on mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    isLoading,
    isError,
    error,
    refetch,
    activeAddress: activeAddress || null,
    isTestMode,
  };
}