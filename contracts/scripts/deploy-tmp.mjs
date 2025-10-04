// Basit ve işlevsel bir çözüm oluşturalım
import { execSync } from 'child_process';

async function main() {
  console.log("StakeHub akıllı kontratını deploy etmeye başlıyorum...");
  
  try {
    // Bu komutun çalışacağına emin olmak için terminalde test edin
    // Doğrudan terminalde çalıştırıyoruz
    const output = execSync(`cd /Users/rfc/Desktop/monad-blitz-ankara && 
      npx hardhat compile && 
      echo "const { viem, network } = await import('hardhat'); 
      const { getContractAt, getContractFactory } = viem;
      
      async function deploy() {
        console.log('Deploying StakeHub...');
        const contractFactory = await getContractFactory('StakeHub');
        const contract = await contractFactory.deploy();
        const address = await contract.getAddress();
        console.log('StakeHub deployed to:', address);
        return { address };
      }
      
      deploy().then(({address}) => {
        console.log(JSON.stringify({address}));
        process.exit(0);
      }).catch(e => {
        console.error(e);
        process.exit(1);
      });" > /tmp/tmp-deploy.mjs &&
      node /tmp/tmp-deploy.mjs
    `);

    console.log(output.toString());
    
    // Çıktıdan adres bilgisini çıkar
    const outputStr = output.toString();
    const lines = outputStr.split("\n");
    let address = null;
    
    for (const line of lines) {
      if (line.includes("StakeHub deployed to:")) {
        address = line.split("StakeHub deployed to:")[1].trim();
        break;
      }
    }
    
    if (!address) {
      throw new Error("Kontrat adresi bulunamadı!");
    }
    
    console.log("StakeHub deployed to:", address);
    
    // Frontend ve backend için kontrat adresini güncelle
    console.log("\nKontrat adresi ile şunları yapın:");
    console.log("1. frontend/.env dosyasına ekleyin: NEXT_PUBLIC_STAKEHUB_CONTRACT=" + address);
    console.log("2. vercel.json dosyasını güncelleyin");
    console.log("3. scripts/indexer.js dosyasındaki STAKE_HUB_ADDRESS değişkenini güncelleyin");
    console.log("4. scripts/send-op-tx.js dosyasındaki STAKE_HUB_ADDRESS değişkenini güncelleyin");
    
    return address;
  } catch (error) {
    console.error("Deploy hatası:", error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });