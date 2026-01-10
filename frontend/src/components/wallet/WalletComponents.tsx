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
          }
          .wallet-wrapper button {
            padding: 6px 12px !important;
            font-size: 14px !important;
            border-radius: 8px !important;
            background-color: #14532d !important;
            color: white !important;
            transition: all 0.2s !important;
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
        `
      }} />
    </div>
  );
}