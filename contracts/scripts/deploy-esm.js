// @ts-check
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Hardhat'i doğrudan çalıştırmak
async function main() {
  console.log("StakeHub akıllı kontratını deploy etmeye başlıyorum...");
  
  try {
    // StakeHub kontratını deploy et
    console.log("Kontratı deploy ediyorum...");
    
    // Hardhat yapılandırmasını geçici olarak CommonJS olarak ayarla
    const tempConfigFile = path.join(__dirname, 'temp-hardhat-config.js');
    const configContent = `
      const hre = require('hardhat');
      
      async function deployContract() {
        const StakeHub = await hre.ethers.getContractFactory("StakeHub");
        const stakeHub = await StakeHub.deploy();
        await stakeHub.deployed();
        return {
          address: stakeHub.address,
          txHash: stakeHub.deployTransaction.hash
        };
      }
      
      deployContract()
        .then(result => {
          console.log(JSON.stringify(result));
          process.exit(0);
        })
        .catch(error => {
          console.error(error);
          process.exit(1);
        });
    `;
    
    writeFileSync(tempConfigFile, configContent);
    
    // Geçici script'i çalıştır
    const result = execSync(`cd ${path.join(__dirname, '..')} && NODE_OPTIONS='--require=hardhat/register' node ${tempConfigFile}`).toString();
    
    // JSON çıktısını parse et
    const deployData = JSON.parse(result);
    const address = deployData.address;
    const txHash = deployData.txHash;
    
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
      const verifyResult = execSync(`cd ${path.join(__dirname, '..')} && npx hardhat verify --network monad_testnet ${address}`).toString();
      console.log("Kontrat başarıyla verify edildi!");
      console.log(verifyResult);
    } catch (e) {
      console.log("Kontrat verification hatası (Muhtemelen explorer desteklemiyor):", e.message || e);
    }
    
    return address;
  } catch (error) {
    console.error("Deploy hatası:", error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});