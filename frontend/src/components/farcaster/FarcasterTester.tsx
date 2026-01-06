'use client';

import { useFarcaster } from '@/providers/FarcasterProvider';
import { useLanguage } from '@/hooks/useLanguage';
import { useState } from 'react';

export function FarcasterTester() {
  const { isReady, isInMiniApp, context, sdk } = useFarcaster();
  const { t } = useLanguage();
  const [logs, setLogs] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  const testSDK = () => {
    addLog('Testing SDK...');
    addLog(`SDK Ready: ${isReady}`);
    addLog(`In Mini App: ${isInMiniApp}`);
    addLog(`User FID: ${context?.user?.fid || 'Not found'}`);
    addLog(`Username: ${context?.user?.username || 'Not found'}`);
    addLog(`Client FID: ${context?.client?.clientFid || 'Not found'}`);
    addLog(`Location: ${context?.location?.type || 'Not found'}`);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm shadow-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <span>Farcaster Test</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-xl max-w-md">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-sm">Farcaster SDK Tester</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-zinc-500 hover:text-zinc-700 text-xs"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded">
            <div className="text-xs text-zinc-500">SDK Status</div>
            <div className={`text-sm font-medium ${isReady ? 'text-green-600' : 'text-red-600'}`}>
              {isReady ? '✅ Ready' : '❌ Not Ready'}
            </div>
          </div>
          
          <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded">
            <div className="text-xs text-zinc-500">Environment</div>
            <div className="text-sm font-medium">
              {isInMiniApp ? '🟣 Farcaster' : '🌐 Browser'}
            </div>
          </div>
        </div>

        <button
          onClick={testSDK}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium"
        >
          Run SDK Test
        </button>

        {logs.length > 0 && (
          <div className="bg-black text-green-400 p-3 rounded font-mono text-xs max-h-48 overflow-auto">
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
