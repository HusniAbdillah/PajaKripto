import { http, createConfig } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { coinbaseWallet } from '@wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: 'PajaKripto',
      preference: 'all',
    }),
  ],
  ssr: true,
  transports: {
    [baseSepolia.id]: http(),
  },
});
