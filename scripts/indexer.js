// Monad RPC bağlantısı ve validator verilerini indexleyen script

const { ethers } = require('ethers');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Monad testnet RPC
const MONAD_RPC_URL = 'https://rpc.ankr.com/monad_testnet';

// StakeHub kontrat adresi (deploy edildikten sonra buraya eklenecek)
const STAKE_HUB_ADDRESS = '0x1234567890123456789012345678901234567890'; // Örnek adres

// StakeHub kontrat ABI'sini yükle
const contractAbiPath = path.join(__dirname, '../contracts/artifacts/contracts/StakeHub.sol/StakeHub.json');
const contractAbi = JSON.parse(fs.readFileSync(contractAbiPath)).abi;

// PostgreSQL bağlantısı
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'stakehub',
  user: 'postgres',
  password: 'postgres'
});

// Provider ve kontrat instance'ı oluştur
const provider = new ethers.JsonRpcProvider(MONAD_RPC_URL);
const contract = new ethers.Contract(STAKE_HUB_ADDRESS, contractAbi, provider);

// Validator kayıt olaylarını dinle
async function listenToValidatorEvents() {
  console.log("Validator olayları dinleniyor...");
  
  // ValidatorRegistered olayını dinle
  contract.on("ValidatorRegistered", async (validatorAddr, name, event) => {
    console.log(`Yeni validator kaydı: ${validatorAddr}, ${name}`);
    
    try {
      // Validator detaylarını kontrat üzerinden al
      const validator = await contract.validators(validatorAddr);
      
      // Veritabanına validator bilgilerini ekle
      await client.query(`
        INSERT INTO validators 
        (address, name, description, social_links, commission_rate, total_staked, uptime, user_count, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (address) DO UPDATE SET
          name = $2,
          description = $3,
          social_links = $4,
          commission_rate = $5,
          total_staked = $6,
          uptime = $7,
          user_count = $8,
          is_active = $9
      `, [
        validatorAddr,
        validator.name,
        validator.description,
        validator.socialLinks,
        validator.commissionRate.toString(),
        validator.totalStaked.toString(),
        validator.uptime.toString(),
        validator.userCount.toString(),
        validator.isActive
      ]);
      
      console.log(`${validatorAddr} adresiyle validator veritabanına eklendi/güncellendi`);
    } catch (err) {
      console.error(`Validator verisi işlenirken hata: ${err.message}`);
    }
  });
  
  // ValidatorUpdated olayını dinle
  contract.on("ValidatorUpdated", async (validatorAddr, event) => {
    console.log(`Validator güncellendi: ${validatorAddr}`);
    
    try {
      // Validator detaylarını kontrat üzerinden al
      const validator = await contract.validators(validatorAddr);
      
      // Veritabanındaki validator bilgilerini güncelle
      await client.query(`
        UPDATE validators
        SET name = $2,
            description = $3,
            social_links = $4,
            commission_rate = $5,
            is_active = $6
        WHERE address = $1
      `, [
        validatorAddr,
        validator.name,
        validator.description,
        validator.socialLinks,
        validator.commissionRate.toString(),
        validator.isActive
      ]);
      
      console.log(`${validatorAddr} adresiyle validator veritabanında güncellendi`);
    } catch (err) {
      console.error(`Validator güncellenirken hata: ${err.message}`);
    }
  });
  
  // StakePlaced olayını dinle
  contract.on("StakePlaced", async (userAddr, validatorAddr, amount, event) => {
    console.log(`Yeni stake: ${userAddr} -> ${validatorAddr}, ${ethers.formatEther(amount)} MONAD`);
    
    try {
      // Stake bilgilerini kontrat üzerinden al
      const stakeInfo = await contract.getUserStake(userAddr, validatorAddr);
      
      // Veritabanına stake bilgilerini ekle/güncelle
      await client.query(`
        INSERT INTO stakes 
        (user_address, validator_address, amount, since, auto_compound, rewards, last_claim)
        VALUES ($1, $2, $3, to_timestamp($4), $5, $6, to_timestamp($7))
        ON CONFLICT (user_address, validator_address) DO UPDATE SET
          amount = $3,
          auto_compound = $5,
          rewards = $6,
          last_claim = to_timestamp($7)
      `, [
        userAddr,
        validatorAddr,
        stakeInfo.amount.toString(),
        stakeInfo.since.toString() / 1000, // Unix timestamp to PostgreSQL timestamp
        stakeInfo.autoCompound,
        stakeInfo.rewards.toString(),
        stakeInfo.lastClaim.toString() / 1000
      ]);
      
      console.log(`${userAddr} kullanıcısının ${validatorAddr} validatoründeki stake verileri güncellendi`);
      
      // Validator bilgilerini güncelle
      const validator = await contract.validators(validatorAddr);
      await client.query(`
        UPDATE validators
        SET total_staked = $2,
            user_count = $3
        WHERE address = $1
      `, [
        validatorAddr,
        validator.totalStaked.toString(),
        validator.userCount.toString()
      ]);
    } catch (err) {
      console.error(`Stake verisi işlenirken hata: ${err.message}`);
    }
  });
  
  // RewardClaimed olayını dinle
  contract.on("RewardClaimed", async (userAddr, validatorAddr, amount, event) => {
    console.log(`Ödül talep edildi: ${userAddr} -> ${validatorAddr}, ${ethers.formatEther(amount)} MONAD`);
    
    try {
      // Stake bilgilerini kontrat üzerinden al
      const stakeInfo = await contract.getUserStake(userAddr, validatorAddr);
      
      // Veritabanındaki stake bilgilerini güncelle
      await client.query(`
        UPDATE stakes
        SET rewards = $3,
            last_claim = to_timestamp($4)
        WHERE user_address = $1 AND validator_address = $2
      `, [
        userAddr,
        validatorAddr,
        stakeInfo.rewards.toString(),
        stakeInfo.lastClaim.toString() / 1000
      ]);
      
      console.log(`${userAddr} kullanıcısının ${validatorAddr} validatoründeki ödül talep bilgileri güncellendi`);
    } catch (err) {
      console.error(`Ödül talep verisi işlenirken hata: ${err.message}`);
    }
  });
  
  // BadgeEarned olayını dinle
  contract.on("BadgeEarned", async (userAddr, badgeName, level, event) => {
    console.log(`Rozet kazanıldı: ${userAddr}, ${badgeName} (Seviye ${level})`);
    
    try {
      // Rozet ID'sini bul veya yeni rozet oluştur
      const badgeResult = await client.query(`
        SELECT id FROM badges WHERE name = $1 AND level = $2
      `, [badgeName, level]);
      
      let badgeId;
      
      if (badgeResult.rows.length === 0) {
        const newBadge = await client.query(`
          INSERT INTO badges (name, description, level)
          VALUES ($1, $1, $2)
          RETURNING id
        `, [badgeName, level]);
        
        badgeId = newBadge.rows[0].id;
      } else {
        badgeId = badgeResult.rows[0].id;
      }
      
      // Kullanıcıya rozet ekle
      await client.query(`
        INSERT INTO user_badges (user_address, badge_id)
        VALUES ($1, $2)
        ON CONFLICT (user_address, badge_id) DO NOTHING
      `, [userAddr, badgeId]);
      
      console.log(`${userAddr} kullanıcısına ${badgeName} rozeti eklendi`);
    } catch (err) {
      console.error(`Rozet verisi işlenirken hata: ${err.message}`);
    }
  });
}

// Ana fonksiyon
async function main() {
  try {
    await client.connect();
    console.log("PostgreSQL veritabanına bağlandı");
    
    await listenToValidatorEvents();
    
    console.log("Indexer başarıyla başlatıldı");
  } catch (err) {
    console.error("Indexer başlatma hatası:", err);
  }
}

main();