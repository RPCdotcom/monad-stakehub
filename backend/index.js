const express = require('express');
const { Client } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL bağlantısı
const client = new Client({
  // Bu örnek config'dir, gerçek bir deployment için çevre değişkenleri kullanılmalı
  host: 'localhost',
  port: 5432,
  database: 'stakehub',
  user: 'postgres',
  password: 'postgres'
});

// Veritabanı şeması oluştur
async function setupDatabase() {
  try {
    // Validator tablosu
    await client.query(`
      CREATE TABLE IF NOT EXISTS validators (
        address VARCHAR(42) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        social_links JSONB,
        commission_rate INTEGER NOT NULL,
        total_staked NUMERIC DEFAULT 0,
        uptime INTEGER DEFAULT 9800,
        user_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Stake tablosu
    await client.query(`
      CREATE TABLE IF NOT EXISTS stakes (
        id SERIAL PRIMARY KEY,
        user_address VARCHAR(42) NOT NULL,
        validator_address VARCHAR(42) NOT NULL,
        amount NUMERIC NOT NULL,
        since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        auto_compound BOOLEAN DEFAULT false,
        rewards NUMERIC DEFAULT 0,
        last_claim TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_address, validator_address),
        FOREIGN KEY (validator_address) REFERENCES validators(address)
      );
    `);

    // Rozet tablosu
    await client.query(`
      CREATE TABLE IF NOT EXISTS badges (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        level INTEGER DEFAULT 1
      );
    `);

    // Kullanıcı rozetleri tablosu
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_badges (
        id SERIAL PRIMARY KEY,
        user_address VARCHAR(42) NOT NULL,
        badge_id INTEGER NOT NULL,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_address, badge_id),
        FOREIGN KEY (badge_id) REFERENCES badges(id)
      );
    `);

    // Mesajlar tablosu
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        from_address VARCHAR(42) NOT NULL,
        to_address VARCHAR(42) NOT NULL,
        content TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Referral tablosu
    await client.query(`
      CREATE TABLE IF NOT EXISTS referrals (
        id SERIAL PRIMARY KEY,
        referrer_address VARCHAR(42) NOT NULL,
        referee_address VARCHAR(42) NOT NULL,
        amount NUMERIC DEFAULT 0,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        rewarded BOOLEAN DEFAULT false,
        UNIQUE (referrer_address, referee_address)
      );
    `);

    // Community Pool tablosu
    await client.query(`
      CREATE TABLE IF NOT EXISTS community_pools (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        total_amount NUMERIC DEFAULT 0,
        member_count INTEGER DEFAULT 0,
        validator_address VARCHAR(42),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (validator_address) REFERENCES validators(address)
      );
    `);

    // Pool Contributions tablosu
    await client.query(`
      CREATE TABLE IF NOT EXISTS pool_contributions (
        id SERIAL PRIMARY KEY,
        pool_id INTEGER NOT NULL,
        user_address VARCHAR(42) NOT NULL,
        amount NUMERIC NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (pool_id, user_address),
        FOREIGN KEY (pool_id) REFERENCES community_pools(id)
      );
    `);

    console.log("Veritabanı şeması başarıyla oluşturuldu");
    
    // Örnek rozet kayıtları
    await client.query(`
      INSERT INTO badges (name, description, level) VALUES
      ('İlk Stake', 'İlk kez stake yapıldı', 1),
      ('Sadık Staker', 'En az 30 gün kesintisiz stake tutuldu', 2),
      ('Toplu Staker', 'Toplam 1000 MONAD stake edildi', 3),
      ('Topluluk Üyesi', 'Community pool\'a katılım sağlandı', 1),
      ('Referans Lideri', 'En az 5 kişiyi davet edildi', 2)
      ON CONFLICT DO NOTHING;
    `);

    console.log("Örnek rozetler eklendi");
    
  } catch (err) {
    console.error("Veritabanı kurulumunda hata:", err);
  }
}

// API Routes

// Tüm validatorleri getir
app.get('/api/validators', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM validators ORDER BY total_staked DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Validator detayını getir
app.get('/api/validators/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const result = await client.query('SELECT * FROM validators WHERE address = $1', [address]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Validator bulunamadı' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Validator'e ait tüm staker'ları getir
app.get('/api/validators/:address/stakers', async (req, res) => {
  try {
    const { address } = req.params;
    const result = await client.query(
      'SELECT user_address, amount, since, auto_compound FROM stakes WHERE validator_address = $1',
      [address]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kullanıcı rozetlerini getir
app.get('/api/users/:address/badges', async (req, res) => {
  try {
    const { address } = req.params;
    const result = await client.query(
      `SELECT b.name, b.description, b.level, ub.earned_at
       FROM user_badges ub
       JOIN badges b ON ub.badge_id = b.id
       WHERE ub.user_address = $1
       ORDER BY ub.earned_at DESC`,
      [address]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kullanıcının stake bilgilerini getir
app.get('/api/users/:address/stakes', async (req, res) => {
  try {
    const { address } = req.params;
    const result = await client.query(
      `SELECT s.*, v.name as validator_name, v.uptime, v.commission_rate
       FROM stakes s
       JOIN validators v ON s.validator_address = v.address
       WHERE s.user_address = $1`,
      [address]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Validator için mesaj gönder
app.post('/api/messages', async (req, res) => {
  try {
    const { fromAddress, toAddress, content } = req.body;
    
    if (!fromAddress || !toAddress || !content) {
      return res.status(400).json({ error: 'Eksik bilgi' });
    }
    
    // Validator'ün var olup olmadığını kontrol et
    const validatorCheck = await client.query('SELECT * FROM validators WHERE address = $1', [toAddress]);
    
    if (validatorCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Validator bulunamadı' });
    }
    
    await client.query(
      'INSERT INTO messages (from_address, to_address, content) VALUES ($1, $2, $3) RETURNING id',
      [fromAddress, toAddress, content]
    );
    
    res.status(201).json({ success: true, message: 'Mesaj gönderildi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Community Pool'ları listele
app.get('/api/community-pools', async (req, res) => {
  try {
    const result = await client.query(`
      SELECT cp.*, v.name as validator_name
      FROM community_pools cp
      LEFT JOIN validators v ON cp.validator_address = v.address
      WHERE cp.active = true
      ORDER BY cp.total_amount DESC
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Sunucuyu başlat
async function startServer() {
  try {
    await client.connect();
    console.log('PostgreSQL veritabanına bağlandı');
    
    await setupDatabase();
    
    app.listen(port, () => {
      console.log(`API sunucusu port ${port} üzerinde çalışıyor`);
    });
  } catch (err) {
    console.error('Sunucu başlatma hatası:', err);
  }
}

startServer();