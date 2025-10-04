'use client';
import React, { useState, useEffect } from 'react';
import Image from "next/image";
import dynamic from 'next/dynamic';

// ConnectWallet bileşenini yalnızca istemci tarafında çalıştırılacak şekilde import edelim
const ConnectWallet = dynamic(
  () => import('@/components/ConnectWallet').then((mod) => mod.ConnectWallet),
  { ssr: false }
);

// Bu mock veri frontend geliştirme için kullanılıyor
// Gerçek uygulamada bu veriler akıllı kontrat ve indexerdan alınacak
const MOCK_VALIDATORS = [
  {
    id: '1',
    address: '0x1234567890123456789012345678901234567890',
    name: 'Monad Validator Alpha',
    description: 'Professional validator with %99.9 uptime guarantee',
    uptime: 99.9,
    commission: 10, // %10
    totalStaked: '1250000', // wei
    userCount: 45,
    socialLinks: {
      twitter: '@monadvalidator',
      website: 'https://monad-validator.com',
      telegram: '@monadvalidator',
    },
  },
  {
    id: '2',
    address: '0x2345678901234567890123456789012345678901',
    name: 'ValidatorDAO',
    description: 'Community driven validator focused on decentralization',
    uptime: 99.7,
    commission: 5, // %5
    totalStaked: '850000', // wei
    userCount: 92,
    socialLinks: {
      twitter: '@validatorDAO',
      discord: 'https://discord.gg/validatorDAO',
    },
  },
  {
    id: '3',
    address: '0x3456789012345678901234567890123456789012',
    name: 'Antalya Validator',
    description: 'Monad testnet için Türkiye\'nin ilk validatoru',
    uptime: 99.8,
    commission: 7.5, // %7.5
    totalStaked: '750000', // wei
    userCount: 38,
    socialLinks: {
      twitter: '@antalyavalidator',
      telegram: '@antalyavalidator',
    },
  },
];

export default function Home() {
  const [validators, setValidators] = useState(MOCK_VALIDATORS);
  const [selectedValidator, setSelectedValidator] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  // Bağlantı durumunu mock olarak ayarla (gerçek uygulamada wagmi hook'u kullanılır)
  useEffect(() => {
    // Mock wallet connection check
    const checkConnection = () => {
      const connected = localStorage.getItem('walletConnected') === 'true';
      setIsConnected(connected);
    };

    checkConnection();
    // Gerçek uygulamada bağlantı event listener'ları kullanılır
  }, []);

  // Validator seçme
  const handleValidatorSelect = (validatorId: string) => {
    setSelectedValidator(validatorId);
  };

  // Stake miktarı girişi
  const handleStakeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStakeAmount(e.target.value);
  };

  // Stake etme işlemi
  const handleStake = async () => {
    if (!selectedValidator || !stakeAmount || !isConnected) return;

    // Mock stake işlemi - gerçekte akıllı kontrat etkileşimi olur
    console.log(`Staking ${stakeAmount} MONAD to validator ${selectedValidator}`);

    // Stake başarılı bildirimi
    alert(`Successfully staked ${stakeAmount} MONAD!`);
    setStakeAmount('');
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 gap-8">
      <div className="z-10 w-full max-w-5xl flex justify-between items-center font-mono text-sm">
        <div className="flex items-center gap-2">
          <Image src="/globe.svg" alt="Monad Logo" width={32} height={32} />
          <h1 className="text-2xl font-bold">StakeHub</h1>
          <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
            Monad Testnet
          </span>
        </div>
        <ConnectWallet />
      </div>

      <div className="flex w-full max-w-5xl flex-col gap-6">
        <h2 className="text-xl font-semibold">Validator Keşfi</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {validators.map((validator) => (
            <div 
              key={validator.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedValidator === validator.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => handleValidatorSelect(validator.id)}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium">{validator.name}</h3>
                <span className="text-xs rounded-full bg-green-100 px-2 py-1 text-green-800">
                  {validator.uptime}% uptime
                </span>
              </div>
              
              <p className="text-sm text-gray-500 mt-2">{validator.description}</p>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Komisyon:</span>
                  <span className="font-medium">{validator.commission}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Toplam Stake:</span>
                  <span className="font-medium">{parseInt(validator.totalStaked)/1000}K MONAD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Kullanıcı:</span>
                  <span className="font-medium">{validator.userCount}</span>
                </div>
              </div>
              
              <div className="mt-3 flex gap-2">
                {validator.socialLinks.twitter && (
                  <a 
                    href={`https://twitter.com/${validator.socialLinks.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Twitter
                  </a>
                )}
                {validator.socialLinks.website && (
                  <a 
                    href={validator.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Website
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedValidator && (
        <div className="w-full max-w-5xl border rounded-lg p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Stake Et</h2>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="stakeAmount" className="block text-sm font-medium text-gray-700 mb-1">
                MONAD Miktarı
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="number"
                  id="stakeAmount"
                  value={stakeAmount}
                  onChange={handleStakeAmountChange}
                  className="block w-full rounded-md border-gray-300 pl-3 pr-12 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="0.0"
                />
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">MONAD</span>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Seçilen Validator: {validators.find(v => v.id === selectedValidator)?.name}
              </p>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={handleStake}
                disabled={!isConnected || !stakeAmount}
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  isConnected && stakeAmount
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {!isConnected ? 'Connect Wallet to Stake' : 'Stake Et'}
              </button>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Stake İşlemi Hakkında</h3>
            <ul className="text-xs text-gray-500 list-disc pl-5 space-y-1">
              <li>Stake ettiğiniz MONAD tokenleri istediğiniz zaman çekebilirsiniz.</li>
              <li>Ödüller blok bazında birikir ve her zaman talep edilebilir.</li>
              <li>Validator komisyon oranı ödüllerinizden otomatik düşülür.</li>
              <li>İlk stake işleminizde özel bir rozet kazanırsınız!</li>
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
