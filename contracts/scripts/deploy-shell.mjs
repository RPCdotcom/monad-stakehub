#!/usr/bin/env node
import * as hre from "hardhat";
import { execSync } from 'child_process';
import { join } from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';

// ES module için __dirname tanımı
const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log("StakeHub akıllı kontratını deploy etmeye başlıyorum...");
  
  try {
    // Shell script oluştur ve çalıştır (CommonJS için)
    const tmpScriptPath = join(__dirname, 'tmp-deploy.cjs');
    
    const scriptContent = `
    const hre = require('hardhat');
    
    async function deploy() {
      const StakeHub = await hre.ethers.getContractFactory("StakeHub");
      const stakeHub = await StakeHub.deploy();
      await stakeHub.deployed();
      
      return {
        address: stakeHub.address,
        txHash: stakeHub.deployTransaction.hash
      };
    }
    
    deploy()
      .then(result => {
        console.log(JSON.stringify(result));
        process.exit(0);
      })
      .catch(err => {
        console.error(err);
        process.exit(1);
      });
    `;
    
    writeFileSync(tmpScriptPath, scriptContent);
    
    console.log("Geçici deploy scripti oluşturuldu, çalıştırılıyor...");
    
    // package.json içinde geçici olarak "type": "commonjs" olarak ayarla
    const packageJsonPath = join(__dirname, '..', '..', 'package.json');
    const tmpPackageJsonPath = join(__dirname, '..', 'tmp-package.json');
    
    execSync(`cat ${packageJsonPath} | sed 's/"type": "module",//' > ${tmpPackageJsonPath}`);
    execSync(`mv ${tmpPackageJsonPath} ${packageJsonPath}`);
    
    // Deploy scripti çalıştır
    const result = execSync(`cd ${join(__dirname, '..')} && npx hardhat run ${tmpScriptPath} --network monad_testnet`).toString();
    
    // package.json'ı geri yükle
    execSync(`cat ${packageJsonPath} | sed 's/"version": "1.0.0",/"version": "1.0.0","type": "module",/' > ${tmpPackageJsonPath}`);
    execSync(`mv ${tmpPackageJsonPath} ${packageJsonPath}`);
    
    // JSON sonucu parse et
    const deployResult = JSON.parse(result);
    const address = deployResult.address;
    const txHash = deployResult.txHash;
    
    console.log("StakeHub deployed to:", address);
    console.log("Deployment transaction:", txHash);
    
    // Frontend ve backend için kontrat adresini güncelle
    console.log("\nKontrat adresi ile şunları yapın:");
    console.log("1. frontend/.env dosyasına ekleyin: NEXT_PUBLIC_STAKEHUB_CONTRACT=" + address);
    console.log("2. vercel.json dosyasını güncelleyin");
    console.log("3. scripts/indexer.js dosyasındaki STAKE_HUB_ADDRESS değişkenini güncelleyin");
    console.log("4. scripts/send-op-tx.js dosyasındaki STAKE_HUB_ADDRESS değişkenini güncelleyin");
    
    // Verify kontrat
    console.log("\nKontrat verification yapılıyor...");
    
    try {
      execSync(`cd ${join(__dirname, '..')} && npx hardhat verify --network monad_testnet ${address}`);
      console.log("Kontrat başarıyla verify edildi!");
    } catch (e) {
      console.log("Kontrat verification hatası (Muhtemelen explorer desteklemiyor):", e.message || String(e));
    }
    
    return { address, txHash };
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