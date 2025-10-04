// @ts-check
import hre from "hardhat";
import { parseEther } from "viem";
import { waitForTransactionReceipt } from "viem/actions";

async function main() {
  console.log("StakeHub akıllı kontratını deploy etmeye başlıyorum...");

  try {
    // Hardhat viem client'ını al
    const { deployContract } = hre;
    
    // StakeHub ABI ve bytecode'unu al
    const artifactName = "StakeHub";
    console.log(`${artifactName} artifactını alıyorum...`);
    
    // Kontratı deploy et
    console.log("Kontrat deploy ediliyor...");
    const stakeHub = await deployContract(artifactName);
    
    // Adres bilgisini yazdır
    const address = stakeHub.address;
    console.log(`StakeHub deployed to: ${address}`);
    
    // Transaction receipt'i al
    console.log("Transaction receipt alınıyor...");
    const deployTxHash = stakeHub.deploymentTransaction.hash;
    console.log(`Deployment transaction: ${deployTxHash}`);
    
    // Transaction receipt'i bekle
    const publicClient = hre.network.provider;
    const receipt = await waitForTransactionReceipt(publicClient, {
      hash: deployTxHash
    });
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    
    // Frontend ve backend için kontrat adresini güncelle
    console.log("\nKontrat adresi ile şunları yapın:");
    console.log(`1. frontend/.env dosyasına ekleyin: NEXT_PUBLIC_STAKEHUB_CONTRACT=${address}`);
    console.log("2. vercel.json dosyasını güncelleyin");
    console.log(`3. scripts/indexer.js dosyasındaki STAKE_HUB_ADDRESS değişkenini güncelleyin`);
    console.log(`4. scripts/send-op-tx.js dosyasındaki STAKE_HUB_ADDRESS değişkenini güncelleyin`);
    
    // Verify kontrat (eğer bir explorer varsa)
    console.log("\nKontrat verification yapılıyor...");
    console.log("Not: Monad testnet explorer kontrat verifikasyonu desteklemiyorsa bu adım başarısız olabilir.");
    
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("Kontrat başarıyla verify edildi!");
    } catch (e) {
      console.log("Kontrat verification hatası (Muhtemelen explorer desteklemiyor):", e instanceof Error ? e.message : String(e));
    }
    
    return address;
  } catch (error) {
    console.error("Deploy hatası:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });