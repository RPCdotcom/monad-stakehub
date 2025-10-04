import { createConfig, http } from 'wagmi';
import { type Chain } from 'viem';
import { mainnet } from 'wagmi/chains';

// Monad Testnet konfigürasyonu
export const monadTestnet: Chain = {
  id: 10143,
  name: 'Monad Testnet',
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

// wagmi client konfigürasyonu
export const config = createConfig({
  chains: [monadTestnet, mainnet],
  transports: {
    [monadTestnet.id]: http(),
    [mainnet.id]: http(),
  },
});

export const chains = [monadTestnet, mainnet];