'use client';

import { createConfig } from 'wagmi';
import { getDefaultConfig } from 'connectkit';

// Monad Testnet konfigürasyonu
const monadTestnet = {
  id: 2525,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    name: 'MONAD',
    symbol: 'MONAD',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_MONAD_RPC_URL || 'https://rpc.ankr.com/monad_testnet'],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_MONAD_RPC_URL || 'https://rpc.ankr.com/monad_testnet'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://testnet-explorer.monad.xyz',
    },
  },
};

// Daha basit ve IPFS ile uyumlu wagmi config
export const config = createConfig(
  getDefaultConfig({
    // ConnectKit provider configuration
    appName: 'StakeHub',
    // Add Monad chain to default chains
    chains: [monadTestnet],
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  })
);