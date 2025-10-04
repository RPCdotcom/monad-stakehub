#!/usr/bin/env node
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// ES module için __dirname tanımı
const __dirname = dirname(fileURLToPath(import.meta.url));

import * as dotenv from "dotenv";
dotenv.config();

import * as hre from "hardhat";

async function main() {
  console.log("StakeHub akıllı kontratını deploy etmeye başlıyorum...");

  // Dynamic import ile özelliğe erişim
  const { getContractFactory } = await import('hardhat/plugins/builtin/viem');
  
  // StakeHub kontratını deploy et
  const StakeHub = await getContractFactory("StakeHub");
  const stakeHub = await StakeHub.deploy();
  
  const address = await stakeHub.getAddress();
  
  console.log("StakeHub deployed to:", address);
  
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
    await hre.default.run("verify:verify", {
      address,
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