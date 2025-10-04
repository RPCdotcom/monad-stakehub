import { createConfig } from 'wagmi';
import { Chain } from '@wagmi/core';
import { publicProvider } from 'wagmi/providers/public';
import { mainnet } from 'wagmi/chains';

// Monad Testnet konfigürasyonu
export const monadTestnet: Chain = {
  id: 2525,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_MONAD_RPC_URL || 'https://rpc.ankr.com/monad_testnet'],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_MONAD_RPC_URL || 'https://rpc.ankr.com/monad_testnet'],
    },
  },
  nativeCurrency: {
    name: 'MONAD',
    symbol: 'MONAD',
    decimals: 18,
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://testnet-explorer.monad.xyz',
    },
  },
};

// Zincir yapılandırması
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [monadTestnet, mainnet],
  [publicProvider()]
);

// wagmi client konfigürasyonu
export const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
});

export { chains };