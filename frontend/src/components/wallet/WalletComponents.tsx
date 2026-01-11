'use client';

import { Wallet } from '@coinbase/onchainkit/wallet';

export function WalletComponents() {
  return (
    <div className="wallet-wrapper">
      <Wallet />
      <style dangerouslySetInnerHTML={{
        __html: `
          .wallet-wrapper {
            display: contents;
            position: relative;
            z-index: 9999;
          }
          .wallet-wrapper button {
            padding: 6px 12px !important;
            font-size: 12px !important;
            border-radius: 8px !important;
            background-color: #14532d !important;
            color: white !important;
            transition: all 0.2s !important;
            position: relative;
            z-index: 100;
          }
          .wallet-wrapper button:hover {
            background-color: #166534 !important;
          }
          
          .wallet-wrapper button * {
            color: white !important;
            fill: white !important;
            stroke: white !important;
            
          }
          
          .wallet-wrapper button svg,
          .wallet-wrapper button svg * {
            color: white !important;
            fill: white !important;
            stroke: white !important;
          }
          
          .wallet-wrapper button span {
            color: white !important;
          }

          /* Force OnChainKit modals to highest z-index */
          .wallet-wrapper [data-testid="ockWalletModal"],
          .wallet-wrapper [data-testid="ockWalletDropdown"],
          .wallet-wrapper [data-testid="ockAccountModal"] {
            z-index: 10000 !important;
          }

          /* Force all modal-related elements to top */
          .wallet-wrapper div[role="dialog"],
          .wallet-wrapper div[role="menu"],
          .wallet-wrapper [data-radix-portal],
          .wallet-wrapper [data-radix-popper-content-wrapper] {
            z-index: 10000 !important;
          }
        `
      }} />
    </div>
  );
}