'use client';

import { Wallet } from '@coinbase/onchainkit/wallet';

export function WalletComponents() {
  return (
    <div className="w-full">
      <Wallet>
        <button className="w-full px-4 py-2.5 bg-primary hover:bg-primary/90 text-white font-reguler rounded-lg transition-colors">
          Connect Wallet
        </button>
      </Wallet>
    </div>
  );
}