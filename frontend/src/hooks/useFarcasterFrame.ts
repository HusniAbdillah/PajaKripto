'use client';

import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

type FrameContext = Awaited<typeof sdk.context> | null;

export function useFarcasterFrame() {
  const [isReady, setIsReady] = useState(false);
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [context, setContext] = useState<FrameContext>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Check if running in mini app
        const miniAppStatus = await sdk.isInMiniApp();
        setIsInMiniApp(miniAppStatus);
        
        if (miniAppStatus) {
          // Load context
          const frameContext = await sdk.context;
          setContext(frameContext);
          setIsReady(true);
          
          console.log('Farcaster Mini App initialized:', {
            user: frameContext.user,
            location: frameContext.location,
            client: frameContext.client,
          });
        } else {
          console.log('Not running in Farcaster Mini App');
          setIsReady(true);
        }
      } catch (error) {
        console.error('Failed to initialize Farcaster Mini App:', error);
        setIsReady(true);
      }
    };

    init();
  }, []);

  return {
    isReady,
    isInMiniApp,
    context,
    sdk,
  };
}
