'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useFarcasterFrame } from '@/hooks/useFarcasterFrame';
import { sdk } from '@farcaster/miniapp-sdk';

interface FarcasterContextType {
  isReady: boolean;
  isInMiniApp: boolean;
  context: Awaited<typeof sdk.context> | null;
  sdk: typeof sdk;
}

const FarcasterContext = createContext<FarcasterContextType | null>(null);

export function FarcasterProvider({ children }: { children: ReactNode }) {
  const frame = useFarcasterFrame();

  return (
    <FarcasterContext.Provider value={frame}>
      {children}
    </FarcasterContext.Provider>
  );
}

export function useFarcaster() {
  const context = useContext(FarcasterContext);
  if (!context) {
    throw new Error('useFarcaster must be used within FarcasterProvider');
  }
  return context;
}
