# Monad StakeHub

Bu proje, Monad ağı üzerinde validator–kullanıcı etkileşimini ve staking işlemlerini kolaylaştıran bir sosyal staking dApp örneğidir.

## 🌐 Live Demo
* Vercel: https://monad-stakehub.vercel.app
* IPFS: https://ipfs.io/ipfs/Qm... (Deploy edildiğinde güncellenecek)

## Klasörler
- `frontend/` : Next.js tabanlı kullanıcı arayüzü
- `contracts/` : Solidity ile yazılmış akıllı kontratlar
- `backend/` : Node.js + Postgres API ve indexer
- `scripts/` : Validator ve stake verisi için yardımcı scriptler

## RPC
Monad testnet RPC: https://rpc.ankr.com/monad_testnet

## Başlangıç
1. Frontend: `cd frontend && npm run dev`
2. Contracts: `cd contracts && npx hardhat test`
3. Backend: `cd backend && node index.js`

## Deployment
Deployment talimatları için [DEPLOYMENT.md](DEPLOYMENT.md) dosyasına bakın.

## Özellikler
- Validator keşfi ve profilleri
- Tek tıkla stake etme
- Ödül ve rozet sistemi
- Validator–kullanıcı etkileşimi
- Referral ve community pool desteği
