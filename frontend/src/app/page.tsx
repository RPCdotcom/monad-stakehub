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
    <main className="min-h-screen">
      {/* Hero Section with Gradient Background */}
      <div className="gradient-bg text-white">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-full">
                <Image src="/globe.svg" alt="Monad Logo" width={32} height={32} className="filter brightness-0 invert" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">StakeHub</h1>
                <p className="text-xs text-blue-100">Monad Testnet Validator Platform</p>
              </div>
            </div>
            <ConnectWallet />
          </div>
          
          <div className="mt-16 mb-10 text-center">
            <h2 className="text-4xl font-bold mb-4">Monad Ağına Stake Yapın</h2>
            <p className="text-xl max-w-2xl mx-auto text-blue-100">
              Güvenilir validatorlar aracılığıyla MONAD tokenlerinizi stake edin ve ödüller kazanın
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mb-16">
            <div className="stat-card glass-card">
              <div className="text-3xl font-bold">{validators.reduce((total, v) => total + parseInt(v.totalStaked), 0) / 1000000}M+</div>
              <div className="text-sm text-blue-200">Toplam Stake Edilen MONAD</div>
            </div>
            <div className="stat-card glass-card">
              <div className="text-3xl font-bold">{validators.length}</div>
              <div className="text-sm text-blue-200">Aktif Validator</div>
            </div>
            <div className="stat-card glass-card">
              <div className="text-3xl font-bold">{validators.reduce((total, v) => total + v.userCount, 0)}</div>
              <div className="text-sm text-blue-200">Toplam Katılımcı</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Validators Section */}
      <div className="container mx-auto px-4 py-20 max-w-6xl">
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-2">Validator Ağı</h2>
          <p className="text-secondary">Güvenilir validatörler arasından seçim yapın ve ağı destekleyin</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {validators.map((validator) => (
            <div 
              key={validator.id}
              className={`validator-card rounded-xl shadow-sm overflow-hidden ${
                selectedValidator === validator.id 
                  ? 'ring-2 ring-primary' 
                  : 'border border-border'
              }`}
              onClick={() => handleValidatorSelect(validator.id)}
            >
              <div className="h-3 w-full" 
                style={{
                  background: `linear-gradient(90deg, #3b82f6 ${validator.uptime}%, transparent ${validator.uptime}%)`
                }} 
              />
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">{validator.name}</h3>
                  <span className="text-xs rounded-full bg-green-100 dark:bg-green-900 px-2 py-1 text-green-800 dark:text-green-100">
                    {validator.uptime}% uptime
                  </span>
                </div>
                
                <p className="text-secondary text-sm mb-6">{validator.description}</p>
                
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold">{validator.commission}%</div>
                    <div className="text-xs text-secondary">Komisyon</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold">{parseInt(validator.totalStaked)/1000}K</div>
                    <div className="text-xs text-secondary">MONAD</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold">{validator.userCount}</div>
                    <div className="text-xs text-secondary">Kullanıcı</div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-4">
                  {validator.socialLinks.twitter && (
                    <a 
                      href={`https://twitter.com/${validator.socialLinks.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs rounded-md bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/30"
                    >
                      Twitter
                    </a>
                  )}
                  {validator.socialLinks.website && (
                    <a 
                      href={validator.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs rounded-md bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/30"
                    >
                      Website
                    </a>
                  )}
                  {validator.socialLinks.telegram && (
                    <a 
                      href={`https://t.me/${validator.socialLinks.telegram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs rounded-md bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/30"
                    >
                      Telegram
                    </a>
                  )}
                </div>
                
                {selectedValidator === validator.id && (
                  <button
                    className="button-primary w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      const element = document.getElementById('stake-section');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Bu Validator ile Stake Et
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stake Section */}
      {selectedValidator && (
        <div id="stake-section" className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="bg-white dark:bg-card-bg rounded-2xl shadow-lg p-8 border border-border">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
                  S
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Stake İşlemi</h2>
                  <p className="text-secondary text-sm">
                    {validators.find(v => v.id === selectedValidator)?.name} validatörüne stake yapın
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="flex-1">
                  <label htmlFor="stakeAmount" className="block text-sm font-medium mb-2">
                    MONAD Miktarı
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <input
                      type="number"
                      id="stakeAmount"
                      value={stakeAmount}
                      onChange={handleStakeAmountChange}
                      className="block w-full rounded-xl border-border bg-white dark:bg-card-bg pl-4 pr-20 py-3 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-20 text-lg"
                      placeholder="0.0"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 rounded-r-xl bg-blue-50 dark:bg-blue-900/20 text-primary font-medium border-l border-border">
                      MONAD
                    </div>
                  </div>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={handleStake}
                    disabled={!isConnected || !stakeAmount}
                    className="button-primary h-[3.25rem] px-8"
                  >
                    {!isConnected ? 'Cüzdan Bağla' : 'Stake Et'}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4">
                  <div className="text-sm text-secondary mb-1">Tahmini Yıllık Getiri</div>
                  <div className="text-xl font-bold text-primary">~5.2%</div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4">
                  <div className="text-sm text-secondary mb-1">Komisyon</div>
                  <div className="text-xl font-bold text-primary">
                    {validators.find(v => v.id === selectedValidator)?.commission}%
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-card-bg border border-border rounded-xl p-4">
                <h3 className="font-semibold mb-3">Stake İşlemi Hakkında</h3>
                <ul className="space-y-2 text-sm text-secondary">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Stake ettiğiniz MONAD tokenlerini istediğiniz zaman çekebilirsiniz.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Ödüller blok bazında birikir ve her zaman talep edilebilir.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Validator komisyon oranı ödüllerinizden otomatik düşülür.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>İlk stake işleminizde özel bir rozet kazanırsınız!</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
