'use client';

import { useState } from 'react';
import { FarcasterInfo } from '@/components/farcaster/FarcasterInfo';

export function FarcasterDebug() {
  const [mockMode, setMockMode] = useState(false);

  if (!mockMode) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setMockMode(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm shadow-lg hover:bg-purple-700"
        >
          Enable Mock Farcaster
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-xl max-w-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-sm">Farcaster Debug Mode</h3>
        <button
          onClick={() => setMockMode(false)}
          className="text-zinc-500 hover:text-zinc-700 text-xs"
        >
          ✕
        </button>
      </div>
      <FarcasterInfo />
      <div className="mt-3 text-xs text-zinc-500">
        <p>Testing mode active</p>
        <p>Deploy to test with real Farcaster</p>
      </div>
    </div>
  );
}
