import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export const ConnectWallet = () => {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: injected({ target: 'metaMask' }), // Sadece MetaMask'ı hedefle
  });
  const { disconnect } = useDisconnect();

  if (isConnected)
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">
          {`${address?.substring(0, 6)}...${address?.substring(
            address.length - 4
          )}`}
        </span>
        <button
          onClick={() => disconnect()}
          className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          Disconnect
        </button>
      </div>
    );

  return (
    <button
      onClick={() => connect()}
      className="rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600"
    >
      Connect Wallet
    </button>
  );
};