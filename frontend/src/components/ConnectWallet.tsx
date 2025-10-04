'use client';

import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export const ConnectWallet = () => {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  // MetaMask konektörünü bul
  const metaMaskConnector = connectors.find(c => c.type === 'injected');

  if (isConnected)
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {`${address?.substring(0, 6)}...${address?.substring(
            address.length - 4
          )}`}
        </span>
        <button
          onClick={() => disconnect()}
          className="rounded-full bg-error/20 px-2.5 py-1 text-xs font-medium text-error hover:bg-error/30 transition-colors"
        >
          Çıkış
        </button>
      </div>
    );

  return (
    <button
      onClick={() => metaMaskConnector && connect({ connector: metaMaskConnector })}
      className="button-primary px-3 py-1.5 text-sm flex items-center gap-1.5"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
      Cüzdan Bağla
    </button>
  );
};