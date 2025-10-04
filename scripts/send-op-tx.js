// Monad RPC API kullanarak bir transaction gönderir
// Monad testnet RPC: https://rpc.ankr.com/monad_testnet

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Monad testnet RPC
const MONAD_RPC_URL = 'https://rpc.ankr.com/monad_testnet';

// Örnek bir private key (gerçek bir key kullanmayın, sadece test amaçlıdır)
// SADECE TEST İÇİN, GERÇEK PROJELERİNİZDE ASLA HARDCODED PRIVATE KEY KULLANMAYIN
const PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Test private key

// StakeHub kontrat adresi (deploy edildikten sonra buraya eklenecek)
const STAKE_HUB_ADDRESS = '0x1234567890123456789012345678901234567890'; // Örnek adres

// StakeHub kontrat ABI'sini yükle
const contractAbiPath = path.join(__dirname, '../contracts/artifacts/contracts/StakeHub.sol/StakeHub.json');
const contractAbi = JSON.parse(fs.readFileSync(contractAbiPath)).abi;

// Provider ve wallet oluştur
const provider = new ethers.JsonRpcProvider(MONAD_RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Kontrat instance'ı oluştur
const contract = new ethers.Contract(STAKE_HUB_ADDRESS, contractAbi, wallet);

// Validator örnek verileri
const validatorData = {
  name: "Monad Validator Alpha",
  description: "Professional validator with %99.9 uptime guarantee",
  socialLinks: JSON.stringify({
    twitter: '@monadvalidator',
    website: 'https://monad-validator.com',
    telegram: '@monadvalidator',
  }),
  commissionRate: 1000 // %10
};

// Validator kaydı oluştur
async function registerValidator() {
  try {
    console.log('Validator kaydı oluşturuluyor...');
    
    const tx = await contract.registerValidator(
      validatorData.name,
      validatorData.description,
      validatorData.socialLinks,
      validatorData.commissionRate
    );
    
    console.log(`Transaction gönderildi: ${tx.hash}`);
    console.log('Transaction onayı bekleniyor...');
    
    const receipt = await tx.wait();
    
    console.log(`Transaction başarıyla onaylandı. Block: ${receipt.blockNumber}`);
    console.log(`Validator başarıyla kaydedildi: ${wallet.address}`);
    
    return receipt;
  } catch (err) {
    console.error('Validator kaydı sırasında hata:', err.message);
  }
}

// Stake işlemi
async function stakeToValidator(validatorAddress, stakeAmount) {
  try {
    console.log(`${ethers.formatEther(stakeAmount)} MONAD stake ediliyor...`);
    
    const tx = await contract.stake(validatorAddress, {
      value: stakeAmount
    });
    
    console.log(`Transaction gönderildi: ${tx.hash}`);
    console.log('Transaction onayı bekleniyor...');
    
    const receipt = await tx.wait();
    
    console.log(`Transaction başarıyla onaylandı. Block: ${receipt.blockNumber}`);
    console.log(`${ethers.formatEther(stakeAmount)} MONAD başarıyla stake edildi`);
    
    return receipt;
  } catch (err) {
    console.error('Stake işlemi sırasında hata:', err.message);
  }
}

// Ana fonksiyon
async function main() {
  // Komut satırı argümanlarını kontrol et
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Lütfen bir işlem belirtin: "register" veya "stake"');
    return;
  }
  
  const action = args[0];
  
  // Network bilgilerini göster
  const network = await provider.getNetwork();
  console.log(`Bağlanılan ağ: ${network.name} (Chain ID: ${network.chainId})`);
  
  const balance = await provider.getBalance(wallet.address);
  console.log(`Cüzdan adresi: ${wallet.address}`);
  console.log(`Bakiye: ${ethers.formatEther(balance)} MONAD`);
  
  if (action === 'register') {
    await registerValidator();
  } 
  else if (action === 'stake') {
    if (args.length < 3) {
      console.log('Validator adresi ve stake miktarı belirtilmeli: node send-op-tx.js stake <validator_address> <amount_in_ether>');
      return;
    }
    
    const validatorAddress = args[1];
    const stakeAmount = ethers.parseEther(args[2]);
    
    await stakeToValidator(validatorAddress, stakeAmount);
  }
  else {
    console.log('Geçersiz işlem. "register" veya "stake" kullanın.');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });