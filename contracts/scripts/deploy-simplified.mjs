// contracts/scripts/deploy-simplified.mjs
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { monadTestnet } from 'viem/chains';
import { createRequire } from 'module';
import * as dotenv from 'dotenv';

dotenv.config();

const require = createRequire(import.meta.url);
const StakeHubArtifact = require('../../artifacts/contracts/contracts/StakeHub.sol/StakeHub.json');

// Monad testnet için doğru chainId kullanıyoruz
const monadChain = {
  ...monadTestnet,
  id: 10143,
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
  console.log("StakeHub akıllı kontratını deploy etmeye başlıyorum...");
  
  // Get private key from env
  const privateKey = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const account = privateKeyToAccount(privateKey);
  
  // Create clients
  const publicClient = createPublicClient({
    chain: monadChain,
    transport: http(),
  });
  
  const walletClient = createWalletClient({
    account,
    chain: monadChain,
    transport: http(),
  });
  
  console.log("Deployer adresi:", account.address);
  
  // Deploy contract
  console.log("Kontrat deploy ediliyor...");
  try {
    const hash = await walletClient.deployContract({
      abi: StakeHubArtifact.abi,
      bytecode: StakeHubArtifact.bytecode,
      account,
    });
    
    console.log("Deployment işlemi tamamlanana kadar bekleniyor...");
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    // Get contract address
    const contractAddress = receipt.contractAddress;
    
    // Print the deployed address
    console.log("StakeHub başarıyla deploy edildi!");
    console.log("Contract address:", contractAddress);
    console.log("Transaction hash:", hash);
    
    // Print instructions for updating frontend/backend
    console.log("\nKontrat adresi ile şunları yapın:");
    console.log("1. frontend/.env dosyasına ekleyin: NEXT_PUBLIC_STAKEHUB_CONTRACT=" + contractAddress);
    console.log("2. vercel.json dosyasını güncelleyin");
    console.log("3. scripts/indexer.js dosyasındaki STAKE_HUB_ADDRESS değişkenini güncelleyin");
    console.log("4. scripts/send-op-tx.js dosyasındaki STAKE_HUB_ADDRESS değişkenini güncelleyin");
  } catch (error) {
    console.error("Deploy hatası detayı:", error);
    throw error;
  }
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deploy hatası:", error);
    process.exit(1);
  });