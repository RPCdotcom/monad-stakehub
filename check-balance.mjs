import { createPublicClient, http } from 'viem';
import * as dotenv from 'dotenv';

dotenv.config();

// Monad testnet için doğru chainId kullanıyoruz
const monadChain = {
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad_testnet',
  rpcUrls: {
    default: {
      http: ["https://rpc.ankr.com/monad_testnet"],
    },
    public: {
      http: ["https://rpc.ankr.com/monad_testnet"],
    },
  },
};

async function main() {
  // Private key ve adres
  const privateKey = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  
  // Default Hardhat adresi
  const address = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  
  // Public client
  const publicClient = createPublicClient({
    chain: monadChain,
    transport: http(),
  });
  
  // Bakiyeyi kontrol et
  try {
    const balance = await publicClient.getBalance({ address });
    console.log(`Adres: ${address}`);
    console.log(`Bakiye: ${balance} wei`);
    console.log(`Bakiye: ${balance / 10n ** 18n} ETH`);
  } catch (error) {
    console.error("Bakiye kontrol hatası:", error);
  }
}

// Execute
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Hata:", error);
    process.exit(1);
  });