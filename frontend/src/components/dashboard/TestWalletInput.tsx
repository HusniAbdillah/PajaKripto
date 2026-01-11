'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/hooks/useLanguage';
import { useAccount } from 'wagmi';
import { Search, Wallet, X } from 'lucide-react';

interface TestWalletInputProps {
  onAddressSubmit: (address: string) => void;
  isActive: boolean;
  onToggle: () => void;
  currentAddress?: string;
}


export function TestWalletInput({ 
  onAddressSubmit, 
  isActive, 
  onToggle, 
  currentAddress
}: TestWalletInputProps) {
  const { lang } = useLanguage();
  const { address: connectedAddress, isConnected } = useAccount();
  const [inputAddress, setInputAddress] = useState('');
  const [error, setError] = useState('');

  // Validate Ethereum address
  const isValidAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedAddress = inputAddress.trim();
    
    // Clear previous error
    setError('');
    
    if (!trimmedAddress) {
      setError(lang === 'id' ? 'Alamat tidak boleh kosong' : 'Address cannot be empty');
      return;
    }
    
    if (!isValidAddress(trimmedAddress)) {
      setError(
        lang === 'id'
          ? 'Alamat wallet tidak valid.'
          : 'Invalid wallet address.'
      );
      return;
    }

    // If valid, submit and close
    onAddressSubmit(trimmedAddress);
    setInputAddress('');
    setError('');
    onToggle();
  };

  const handleUseConnectedWallet = () => {
    if (connectedAddress) {
      setError(''); // Clear any errors
      onAddressSubmit(connectedAddress);
      onToggle(); // Close the selector
    }
  };

  // Simple button when not active
  if (!isActive) {
    return (
      <div className="mb-6">
        <Button
          onClick={onToggle}
          variant="outline"
          className="gap-2 shadow-sm hover:shadow-md transition-all duration-200 border-dashed hover:border-solid"
        >
          <Wallet className="w-4 h-4" />
          <span className="text-sm font-medium">
            {currentAddress 
              ? `${currentAddress.slice(0, 6)}...${currentAddress.slice(-4)}`
              : (lang === 'id' ? 'Pilih Address' : 'Select Address')
            }
          </span>
        </Button>
      </div>
    );
  }

  // Clean modal-style selector
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {lang === 'id' ? 'Pilih Address' : 'Select Address'}
          </h2>
          <Button
            onClick={onToggle}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Option 1: Connected Wallet */}
          {isConnected && connectedAddress && (
            <div className="space-y-2">
              <Button
                onClick={handleUseConnectedWallet}
                className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
              >
                <Wallet className="w-5 h-5 mr-3" />
                <span className="font-medium">
                  {lang === 'id' ? 'Gunakan Wallet Terkoneksi' : 'Use Connected Wallet'}
                </span>
              </Button>
              <p className="text-xs text-center text-gray-500 font-mono bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
              </p>
            </div>
          )}

          {/* Divider */}
          {isConnected && connectedAddress && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {lang === 'id' ? 'atau' : 'or'}
              </span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            </div>
          )}

          {/* Option 2: Manual Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {lang === 'id' ? 'Masukkan address manual' : 'Enter address manually'}
            </label>
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="0x..."
                  value={inputAddress}
                  onChange={(e) => {
                    setInputAddress(e.target.value);
                    // Clear error when user starts typing
                    if (error) setError('');
                  }}
                  className={`h-12 text-sm font-mono bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl ${
                    error ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20' : ''
                  }`}
                />
                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="w-1 h-1 bg-red-500 rounded-full flex-shrink-0"></div>
                    <span>{error}</span>
                  </div>
                )}
              </div>
              <Button 
                type="submit" 
                disabled={!inputAddress.trim()}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 transition-all duration-200 rounded-xl font-medium"
              >
                {lang === 'id' ? 'Konfirmasi' : 'Confirm'}
              </Button>
            </form>
          </div>

          {currentAddress && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {lang === 'id' ? 'Address Aktif' : 'Active Address'}
                </span>
              </div>
              <p className="text-sm font-mono text-blue-600 dark:text-blue-400 mt-1">
                {currentAddress.slice(0, 6)}...{currentAddress.slice(-4)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}