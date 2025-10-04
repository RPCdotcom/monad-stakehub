const hardhat = require("hardhat");

async function main() {
  console.log("StakeHub akıllı kontratını deploy etmeye başlıyorum...");

  // StakeHub kontratını deploy et
  const StakeHub = await hardhat.ethers.getContractFactory("StakeHub");
  const stakeHub = await StakeHub.deploy();

  await stakeHub.deployed();

  console.log("StakeHub deployed to:", stakeHub.address);
  console.log("Deployment transaction:", stakeHub.deployTransaction.hash);

  // Frontend ve backend için kontrat adresini güncelle
  console.log("\nKontrat adresi ile şunları yapın:");
  console.log("1. frontend/.env dosyasına ekleyin: NEXT_PUBLIC_STAKEHUB_CONTRACT=" + stakeHub.address);
  console.log("2. vercel.json dosyasını güncelleyin");
  console.log("3. scripts/indexer.js dosyasındaki STAKE_HUB_ADDRESS değişkenini güncelleyin");
  console.log("4. scripts/send-op-tx.js dosyasındaki STAKE_HUB_ADDRESS değişkenini güncelleyin");

  // Verify kontrat (eğer bir explorer varsa)
  console.log("\nKontrat verification yapılıyor...");
  console.log("Not: Monad testnet explorer kontrat verifikasyonu desteklemiyorsa bu adım başarısız olabilir.");
  
  try {
    await hardhat.run("verify:verify", {
      address: stakeHub.address,
      constructorArguments: [],
    });
    console.log("Kontrat başarıyla verify edildi!");
  } catch (e) {
    console.log("Kontrat verification hatası (Muhtemelen explorer desteklemiyor):", e.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });