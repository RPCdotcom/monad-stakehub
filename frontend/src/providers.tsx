'use client';

import { WagmiConfig } from 'wagmi';
import { config } from '@/lib/wagmi-config'; // IPFS uyumlu config

export function Providers({ children }: { children: React.ReactNode }) {
  return <WagmiConfig config={config}>{children}</WagmiConfig>;
}