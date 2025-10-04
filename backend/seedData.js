/**
 * Monad StakeHub - Örnek Veri Yükleme Scripti
 * 
 * Bu script veritabanına örnek validatorler ve stake işlemleri ekler.
 * Geliştirme ortamında kullanmak için tasarlanmıştır.
 */
require('dotenv').config({ path: '../.env' });
const { Client } = require('pg');

// PostgreSQL bağlantısı
const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'stakehub',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Örnek validatorler
const sampleValidators = [
  {
    address: '0x3cd9f729c8d882b851f8c70fb36d22b391a288cd',
    name: 'Monad Validators',
    description: 'Profesyonel validator ekibi, 7/24 kesintisiz hizmet',
    social_links: JSON.stringify({
      twitter: 'https://twitter.com/monadvalidators',
      website: 'https://monadvalidators.com',
      discord: 'https://discord.gg/monadvalidators'
    }),
    commission_rate: 500, // %5
    total_staked: 500000,
    uptime: 9995, // %99.95
    user_count: 125
  },
  {
    address: '0x7f67f2345f2c10b945c7ae328cd80648b9c6c831',
    name: 'Ankara Node',
    description: 'Türkiye merkezli validator hizmeti',
    social_links: JSON.stringify({
      twitter: 'https://twitter.com/ankaranode',
      website: 'https://ankaranode.com',
      telegram: 'https://t.me/ankaranode'
    }),
    commission_rate: 300, // %3
    total_staked: 320000,
    uptime: 9978, // %99.78
    user_count: 87
  },
  {
    address: '0x25a4dd4cd97ed4c2ef71e015d20f9e46a35a538a',
    name: 'StakeMaster',
    description: 'Yüksek performanslı staking altyapısı',
    social_links: JSON.stringify({
      twitter: 'https://twitter.com/stakemaster',
      website: 'https://stakemaster.io',
      discord: 'https://discord.gg/stakemaster'
    }),
    commission_rate: 400, // %4
    total_staked: 780000,
    uptime: 9985, // %99.85
    user_count: 210
  },
  {
    address: '0x9e673399f8d5fca9b3d533799f643ce843ae7dea',
    name: 'Chain Guardians',
    description: 'Güvenlik odaklı validator hizmeti',
    social_links: JSON.stringify({
      twitter: 'https://twitter.com/chainguardians',
      website: 'https://chainguardians.io',
      telegram: 'https://t.me/chainguardians'
    }),
    commission_rate: 650, // %6.5
    total_staked: 620000,
    uptime: 9990, // %99.90
    user_count: 154
  },
  {
    address: '0x123f76e02b4c2d6e644e68926303d98209579512',
    name: 'Istanbul Staking',
    description: 'Türkiye\'nin ilk kurumsal validator ekibi',
    social_links: JSON.stringify({
      twitter: 'https://twitter.com/istanbulstaking',
      website: 'https://istanbulstaking.com',
      discord: 'https://discord.gg/istanbulstaking'
    }),
    commission_rate: 250, // %2.5
    total_staked: 420000,
    uptime: 9950, // %99.50
    user_count: 97
  },
  {
    address: '0x87d22fe35c7e0440a42af31b8fdc5cc2a249e3dc',
    name: 'NodeForge',
    description: 'Dağıtık altyapı ile yüksek dayanıklılık',
    social_links: JSON.stringify({
      twitter: 'https://twitter.com/nodeforge',
      website: 'https://nodeforge.tech',
      discord: 'https://discord.gg/nodeforge'
    }),
    commission_rate: 450, // %4.5
    total_staked: 580000,
    uptime: 9975, // %99.75
    user_count: 142
  }
];

// Örnek kullanıcı adresleri
const sampleUsers = [
  '0x1234567890123456789012345678901234567890',
  '0x2345678901234567890123456789012345678901',
  '0x3456789012345678901234567890123456789012',
  '0x4567890123456789012345678901234567890123',
  '0x5678901234567890123456789012345678901234',
  '0x6789012345678901234567890123456789012345',
  '0x7890123456789012345678901234567890123456',
  '0x8901234567890123456789012345678901234567',
  '0x9012345678901234567890123456789012345678',
  '0xa123456789012345678901234567890123456789'
];

// Örnek community pools
const samplePools = [
  {
    name: 'Türkiye Validator Topluluğu',
    total_amount: 320000,
    member_count: 75,
    validator_address: '0x123f76e02b4c2d6e644e68926303d98209579512' // Istanbul Staking
  },
  {
    name: 'Monad Developers',
    total_amount: 450000,
    member_count: 120,
    validator_address: '0x3cd9f729c8d882b851f8c70fb36d22b391a288cd' // Monad Validators
  },
  {
    name: 'Blockchain Academy',
    total_amount: 210000,
    member_count: 50,
    validator_address: '0x7f67f2345f2c10b945c7ae328cd80648b9c6c831' // Ankara Node
  }
];

// Örnek stake işlemleri
async function generateStakes() {
  let stakes = [];
  
  // Her kullanıcı için rastgele stake işlemleri oluştur
  for (let user of sampleUsers) {
    const validatorCount = Math.floor(Math.random() * 3) + 1; // 1-3 farklı validator
    let usedValidators = [];
    
    for (let i = 0; i < validatorCount; i++) {
      let validatorIndex;
      do {
        validatorIndex = Math.floor(Math.random() * sampleValidators.length);
      } while (usedValidators.includes(validatorIndex));
      
      usedValidators.push(validatorIndex);
      const validator = sampleValidators[validatorIndex];
      
      // Stake miktarı: 1000-50000 arası
      const amount = Math.floor(Math.random() * 49000) + 1000;
      
      // Son 90 gün içinde rastgele bir tarih
      const daysAgo = Math.floor(Math.random() * 90);
      const since = new Date();
      since.setDate(since.getDate() - daysAgo);
      
      // Rastgele auto-compound değeri
      const autoCompound = Math.random() > 0.5;
      
      // Kazanılan ödül miktarı: Stake * günlük oran * gün sayısı
      // Günlük oran yaklaşık: %0.01 - %0.03
      const dailyRate = (Math.random() * 0.0002) + 0.0001;
      const rewards = amount * dailyRate * daysAgo;
      
      // Son claim tarihi: 0-30 gün önce
      const lastClaimDaysAgo = Math.floor(Math.random() * Math.min(30, daysAgo));
      const lastClaim = new Date();
      lastClaim.setDate(lastClaim.getDate() - lastClaimDaysAgo);
      
      stakes.push({
        user_address: user,
        validator_address: validator.address,
        amount: amount,
        since: since.toISOString(),
        auto_compound: autoCompound,
        rewards: Math.floor(rewards),
        last_claim: lastClaim.toISOString()
      });
    }
  }
  
  return stakes;
}

// Verileri yükle
async function seedData() {
  try {
    await client.connect();
    console.log('PostgreSQL veritabanına bağlandı');
    
    // Transactions başlat
    await client.query('BEGIN');
    
    // Önceki verileri temizle
    await client.query('DELETE FROM stakes');
    await client.query('DELETE FROM pool_contributions');
    await client.query('DELETE FROM community_pools');
    await client.query('DELETE FROM user_badges');
    await client.query('DELETE FROM messages');
    await client.query('DELETE FROM referrals');
    await client.query('DELETE FROM validators');
    
    console.log('Mevcut veriler temizlendi');
    
    // Validatorleri ekle
    for (const validator of sampleValidators) {
      await client.query(`
        INSERT INTO validators (address, name, description, social_links, 
                               commission_rate, total_staked, uptime, user_count)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        validator.address,
        validator.name,
        validator.description,
        validator.social_links,
        validator.commission_rate,
        validator.total_staked,
        validator.uptime,
        validator.user_count
      ]);
    }
    
    console.log('Validator verileri eklendi');
    
    // Community pools ekle
    for (const pool of samplePools) {
      await client.query(`
        INSERT INTO community_pools (name, total_amount, member_count, validator_address)
        VALUES ($1, $2, $3, $4)
      `, [
        pool.name,
        pool.total_amount,
        pool.member_count,
        pool.validator_address
      ]);
    }
    
    console.log('Community pool verileri eklendi');
    
    // Stake işlemlerini oluştur ve ekle
    const stakes = await generateStakes();
    for (const stake of stakes) {
      await client.query(`
        INSERT INTO stakes (user_address, validator_address, amount, since, 
                           auto_compound, rewards, last_claim)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (user_address, validator_address) DO UPDATE
        SET amount = stakes.amount + EXCLUDED.amount,
            rewards = stakes.rewards + EXCLUDED.rewards
      `, [
        stake.user_address,
        stake.validator_address,
        stake.amount,
        stake.since,
        stake.auto_compound,
        stake.rewards,
        stake.last_claim
      ]);
    }
    
    console.log('Stake verileri eklendi');
    
    // Bazı kullanıcılara rozetler ekle
    for (let i = 0; i < sampleUsers.length; i++) {
      // Her kullanıcı için rastgele rozet sayısı (0-5)
      const badgeCount = Math.floor(Math.random() * 6);
      const userBadges = [];
      
      for (let j = 0; j < badgeCount; j++) {
        // 1-5 arası rastgele badge_id
        const badgeId = Math.floor(Math.random() * 5) + 1;
        
        if (!userBadges.includes(badgeId)) {
          userBadges.push(badgeId);
          
          // 1-60 gün önce rastgele bir tarih
          const daysAgo = Math.floor(Math.random() * 60) + 1;
          const earnedAt = new Date();
          earnedAt.setDate(earnedAt.getDate() - daysAgo);
          
          await client.query(`
            INSERT INTO user_badges (user_address, badge_id, earned_at)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_address, badge_id) DO NOTHING
          `, [
            sampleUsers[i],
            badgeId,
            earnedAt.toISOString()
          ]);
        }
      }
    }
    
    console.log('Kullanıcı rozetleri eklendi');
    
    // Transaction'ı commit et
    await client.query('COMMIT');
    
    console.log('Tüm örnek veriler başarıyla yüklendi');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Veri yükleme hatası:', err);
  } finally {
    await client.end();
  }
}

// Scripti çalıştır
seedData();