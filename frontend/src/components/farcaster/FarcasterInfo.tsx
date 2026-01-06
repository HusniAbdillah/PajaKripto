'use client';

import { useFarcaster } from '@/providers/FarcasterProvider';
import { useLanguage } from '@/hooks/useLanguage';

export function FarcasterInfo() {
  const { isReady, isInMiniApp, context } = useFarcaster();
  const { t } = useLanguage();

  if (!isReady) {
    return (
      <div className="text-sm text-zinc-500">
        {t.farcaster_loading}
      </div>
    );
  }

  if (!isInMiniApp) {
    return (
      <div className="text-sm text-zinc-500">
        {t.farcaster_not_running}
      </div>
    );
  }

  return (
    <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
          {t.farcaster_running}
        </span>
      </div>
      <div className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
        <p>User FID: {context?.user?.fid}</p>
        <p>Username: @{context?.user?.username}</p>
        {context?.user?.pfpUrl && (
          <img 
            src={context.user.pfpUrl} 
            alt="Profile" 
            className="w-8 h-8 rounded-full mt-2"
          />
        )}
      </div>
    </div>
  );
}
