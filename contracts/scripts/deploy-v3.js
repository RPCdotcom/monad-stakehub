#!/usr/bin/env node

import * as dotenv from "dotenv";
dotenv.config();

import { default as hre, ethers } from "hardhat";

async function main() {
  console.log("StakeHub akıllı kontratını deploy etmeye başlıyorum...");

  // StakeHub kontratını deploy et - Hardhat v3 uyumlu API
  const StakeHub = await ethers.getContractFactory("StakeHub");
  const stakeHub = await StakeHub.deploy();
  
  console.log("Kontrat deploying...");
  await stakeHub.waitForDeployment();
  
  const address = await stakeHub.getAddress();
  const deployTx = stakeHub.deploymentTransaction();
  const txHash = deployTx ? deployTx.hash : "unknown";
  
  console.log("StakeHub deployed to:", address);
  console.log("Deployment transaction:", txHash);
  
  // Frontend ve backend için kontrat adresini güncelle
  console.log("\nKontrat adresi ile şunları yapın:");
  console.log("1. frontend/.env dosyasına ekleyin: NEXT_PUBLIC_STAKEHUB_CONTRACT=" + address);
  console.log("2. vercel.json dosyasını güncelleyin");
  console.log("3. scripts/indexer.js dosyasındaki STAKE_HUB_ADDRESS değişkenini güncelleyin");
  console.log("4. scripts/send-op-tx.js dosyasındaki STAKE_HUB_ADDRESS değişkenini güncelleyin");
  
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
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });