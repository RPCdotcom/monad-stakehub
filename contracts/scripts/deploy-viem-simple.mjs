// @ts-check
import hre from "hardhat";
import { createPublicClient, http, createWalletClient, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ES module için __dirname tanımı
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * StakeHub kontratını deploy etmek için ana fonksiyon
 */
async function main() {
  console.log("StakeHub akıllı kontratını deploy etmeye başlıyorum...");

  try {
    // Hardhat ağ bilgilerini al
    const networkConfig = hre.config.networks.monad_testnet;
    const networkName = "monad_testnet";
    const rpcUrl = "https://rpc.ankr.com/monad_testnet";
    console.log(`Ağ: ${networkName} (chainId: ${networkConfig.chainId})`);
    
    // Private key'i al
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("PRIVATE_KEY bulunamadı! .env dosyanızı kontrol edin.");
    }
    
    // Account oluştur - '0x' prefix'i ekle ve tipini düzelt
    const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    // @ts-ignore - TS hatasını görmezden gel
    const account = privateKeyToAccount(formattedPrivateKey);
    console.log(`Hesap: ${account.address}`);
    
    // Monad chain tanımı
    const monadTestnet = defineChain({
      id: 10143, // Monad Testnet Chain ID
      name: networkName,
      nativeCurrency: {
        decimals: 18,
        name: 'Monad',
        symbol: 'MONAD'
      },
      rpcUrls: {
        default: {
          http: [rpcUrl],
        },
        public: {
          http: [rpcUrl],
        }
      }
    });
    
    // Public client oluştur
    const publicClient = createPublicClient({
      transport: http(rpcUrl),
      chain: monadTestnet
    });
    
    // Wallet client oluştur
    const walletClient = createWalletClient({
      transport: http(rpcUrl),
      account,
      chain: monadTestnet
    });
    
    // Kontrat ABI ve bytecode'unu al
    const artifactPath = resolve(__dirname, "../../artifacts/contracts/contracts/StakeHub.sol/StakeHub.json");
    const artifact = JSON.parse(readFileSync(artifactPath, "utf-8"));
    const abi = artifact.abi;
    const bytecode = artifact.bytecode;
    
    console.log("Kontrat deploy ediliyor...");
    
    // Kontratı deploy et
    const hash = await walletClient.deployContract({
      abi,
      bytecode,
      account,
      chain: monadTestnet,
      args: [] // Boş constructor argümanları
    });
    
    console.log(`Deploy transaction hash: ${hash}`);
    console.log("Transaction receipt bekleniyor...");
    
    // Transaction'ı bekle
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    // Kontrat adresini al
    const contractAddress = receipt.contractAddress;
    if (!contractAddress) {
      throw new Error("Kontrat adresi alınamadı!");
    }
    
    console.log(`StakeHub deployed to: ${contractAddress}`);
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    
    // Frontend ve backend için kontrat adresini güncelle
    console.log("\nKontrat adresi ile şunları yapın:");
    console.log(`1. frontend/.env dosyasına ekleyin: NEXT_PUBLIC_STAKEHUB_CONTRACT=${contractAddress}`);
    console.log("2. vercel.json dosyasını güncelleyin");
    console.log(`3. scripts/indexer.js dosyasındaki STAKE_HUB_ADDRESS değişkenini güncelleyin`);
    console.log(`4. scripts/send-op-tx.js dosyasındaki STAKE_HUB_ADDRESS değişkenini güncelleyin`);
    
  } catch (error) {
    console.error("Deploy hatası:", error);
    process.exit(1);
  }
}

// Script'i çalıştır
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });