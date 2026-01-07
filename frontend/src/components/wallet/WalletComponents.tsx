'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { LucideWallet } from 'lucide-react';

// Mock-up bottom sheet: shows only Base option after clicking Connect Wallet
export function WalletComponents() {
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div className="w-full">
      <button
        onClick={handleOpen}
        className="w-full px-4 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors"
      >
        Connect Wallet
      </button>

      {open && (
        <div className="fixed inset-0 z-50" onClick={handleClose}>
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Bottom Sheet (mobile-first) */}
          <div
            className={cn(
              'absolute left-0 right-0 bottom-0 w-full bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 rounded-t-2xl p-4',
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700 mb-3" />
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Choose Wallet</h3>
              <button onClick={handleClose} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleClose}
                className="w-full flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg px-4 py-3"
              >
                <span className="flex items-center gap-3">
                  <LucideWallet className="w-5 h-5" /> Sign in with Base
                </span>
                <span className="w-4 h-4 rounded-sm border border-zinc-400 dark:border-zinc-600" />
              </button>

              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center mt-2">
                By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}