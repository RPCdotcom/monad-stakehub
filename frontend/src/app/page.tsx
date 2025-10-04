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
    <main className="min-h-screen bg-background overflow-x-hidden">
      {/* Header - Premium Gradient Background */}
      <div className="relative">
        <div className="absolute inset-0 bg-[url('/globe.svg')] opacity-5 bg-repeat-space"></div>
        <div className="absolute inset-0 gradient-bg opacity-90"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background"></div>
        
        <header className="relative z-10 container mx-auto px-4 py-6 max-w-7xl">
          <nav className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
                <Image src="/globe.svg" alt="Monad Logo" width={28} height={28} className="filter brightness-0 invert" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">StakeHub</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  <p className="text-xs font-medium text-blue-100">Monad Testnet • Bloklar Senkronize</p>
                </div>
              </div>
            </div>
            <ConnectWallet />
          </nav>
          
          <div className="mt-24 mb-32 text-center">
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6 text-white leading-tight">
              MONAD'a <span className="bg-white bg-opacity-10 px-3 pb-1 rounded-lg">Stake</span> Yapın
            </h2>
            <p className="text-xl max-w-2xl mx-auto text-blue-100 mb-10">
              Profesyonel validatorlar ile ağın güvenliğine katkıda bulunun ve %5+ APY kazanın
            </p>
            
            <a href="#validators" className="primary-button inline-flex items-center gap-2 group">
              Validatorları Keşfet
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:translate-y-1 transition-transform">
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </a>
          </div>
        </header>
      </div>
      
      {/* Stats Section */}
      <section className="container mx-auto px-4 -mt-24 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="dashboard-stat animate-fade-in" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M12 2v20"></path>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <div>
                <div className="stat-label">Toplam Stake Edilen</div>
                <div className="stat-value">{validators.reduce((total, v) => total + parseInt(v.totalStaked), 0) / 1000000}M+</div>
              </div>
            </div>
            <div className="progress-bar mt-2">
              <div className="progress-bar-fill" style={{width: '68%'}}></div>
            </div>
          </div>
          
          <div className="dashboard-stat animate-fade-in" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div>
                <div className="stat-label">Aktif Validatorler</div>
                <div className="stat-value">{validators.length}</div>
              </div>
            </div>
            <div className="progress-bar mt-2">
              <div className="progress-bar-fill" style={{width: '45%'}}></div>
            </div>
          </div>
          
          <div className="dashboard-stat animate-fade-in" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success">
                  <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5l6.74-6.76z"></path>
                  <line x1="16" y1="8" x2="2" y2="22"></line>
                  <line x1="17.5" y1="15" x2="9" y2="15"></line>
                </svg>
              </div>
              <div>
                <div className="stat-label">Ortalama APY</div>
                <div className="stat-value">5.2%</div>
              </div>
            </div>
            <div className="progress-bar mt-2">
              <div className="progress-bar-fill" style={{width: '52%'}}></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Network Status */}
      <section className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
          <div className="lg:w-1/2 max-w-lg">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Ağ Durumu</h2>
            <p className="text-secondary mb-6">
              MONAD Testnet, skalabilite, güvenlik ve merkezi olmayan bir yapı sunarak yeni nesil bir L1 blockchain oluşturuyor. 
              Validatorler, ağın güvenliğini sağlamak için MONAD tokenlerini stake ederek ağ işlemlerini doğrular.
            </p>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">Blok Üretim Hızı</span>
                <span className="text-sm font-medium">2 saniye</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{width: '95%'}}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">Validator Katılım Oranı</span>
                <span className="text-sm font-medium">98.7%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{width: '98.7%'}}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">Ağ Gecikmesi</span>
                <span className="text-sm font-medium">45ms</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{width: '88%'}}></div>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <div className="glass-effect rounded-xl p-6 border border-opacity-10 border-white">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Son Bloklar</h3>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-success text-xs font-medium rounded-full">
                  Senkronize
                </span>
              </div>
              
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-light bg-opacity-10 flex items-center justify-center text-primary font-medium">
                        #{Math.floor(Math.random() * 10000)}
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {Math.floor(Math.random() * 30) + 10} İşlem
                        </div>
                        <div className="text-xs text-secondary">
                          {Math.floor(Math.random() * 20) + 1} saniye önce
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-medium">
                      {validators[Math.floor(Math.random() * validators.length)]?.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Validators Section */}
      <section id="validators" className="bg-background-secondary dark:bg-background-secondary/50 py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Validator Ağı</h2>
              <p className="text-secondary">En güvenilir validatorler arasından seçim yapın</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card-bg hover:bg-opacity-80 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                Filtrele
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card-bg hover:bg-opacity-80 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="21" y1="10" x2="3" y2="10"></line>
                  <line x1="21" y1="6" x2="3" y2="6"></line>
                  <line x1="21" y1="14" x2="3" y2="14"></line>
                  <line x1="21" y1="18" x2="3" y2="18"></line>
                </svg>
                Sırala
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {validators.map((validator) => (
              <div 
                key={validator.id}
                className={`premium-card cursor-pointer ${
                  selectedValidator === validator.id 
                    ? 'ring-2 ring-primary ring-opacity-50' 
                    : ''
                }`}
                onClick={() => handleValidatorSelect(validator.id)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-3 items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl">
                        {validator.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{validator.name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs font-medium px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-success rounded-md">
                            {validator.uptime}% Uptime
                          </span>
                          <span className="text-xs text-secondary">•</span>
                          <span className="text-xs text-secondary">ID: {validator.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-secondary mb-6">{validator.description}</p>
                  
                  <div className="bg-background-secondary dark:bg-background/60 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-secondary text-xs mb-1">Komisyon</div>
                        <div className="font-bold text-lg">{validator.commission}%</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-secondary text-xs mb-1">Stake</div>
                        <div className="font-bold text-lg">{parseInt(validator.totalStaked)/1000}K</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-secondary text-xs mb-1">Kullanıcı</div>
                        <div className="font-bold text-lg">{validator.userCount}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div>
                      <div className="text-sm mb-1 flex justify-between">
                        <span className="text-secondary">Performans</span>
                        <span className="font-medium">{Math.floor(Math.random() * 10) + 90}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-bar-fill" style={{width: `${validator.uptime}%`}}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm mb-1 flex justify-between">
                        <span className="text-secondary">Kapasite</span>
                        <span className="font-medium">{Math.floor(Math.random() * 30) + 50}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-bar-fill" style={{width: `${Math.floor(Math.random() * 30) + 50}%`}}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {validator.socialLinks.twitter && (
                        <a 
                          href={`https://twitter.com/${validator.socialLinks.twitter.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                          </svg>
                        </a>
                      )}
                      
                      {validator.socialLinks.website && (
                        <a 
                          href={validator.socialLinks.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 0 0-.656 2.5h2.49zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 0 0-.337-2.5H8.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5H4.51zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.182 2.472a6.696 6.696 0 0 1-.597-.933A9.268 9.268 0 0 1 4.09 12H2.255a7.024 7.024 0 0 0 3.072 2.472zM3.82 11a13.652 13.652 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5H3.82zm6.853 3.472A7.024 7.024 0 0 0 13.745 12H11.91a9.27 9.27 0 0 1-.64 1.539 6.688 6.688 0 0 1-.597.933zM8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855.173-.324.33-.682.468-1.068H8.5zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.65 13.65 0 0 1-.312 2.5zm2.802-3.5a6.959 6.959 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5h2.49zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7.024 7.024 0 0 0-3.072-2.472c.218.284.418.598.597.933zM10.855 4a7.966 7.966 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4h2.355z"/>
                          </svg>
                        </a>
                      )}
                      
                      {validator.socialLinks.telegram && (
                        <a 
                          href={`https://t.me/${validator.socialLinks.telegram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                    
                    <button
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedValidator === validator.id
                          ? 'primary-button'
                          : 'border border-primary text-primary hover:bg-primary hover:text-white'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleValidatorSelect(validator.id);
                        setTimeout(() => {
                          const element = document.getElementById('stake-section');
                          element?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }}
                    >
                      {selectedValidator === validator.id ? 'Seçildi' : 'Seç'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stake Section */}
      {selectedValidator && (
        <section id="stake-section" className="py-20 bg-gradient-to-b from-background to-background-secondary">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="premium-card p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-3xl">
                  {validators.find(v => v.id === selectedValidator)?.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">Stake İşlemi</h2>
                  <p className="text-secondary">
                    <span className="font-medium text-foreground">{validators.find(v => v.id === selectedValidator)?.name}</span> validatörüne stake yapıyorsunuz
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div>
                  <label htmlFor="stakeAmount" className="block text-sm font-medium mb-2">
                    MONAD Miktarı
                  </label>
                  <div className="relative rounded-xl">
                    <input
                      type="number"
                      id="stakeAmount"
                      value={stakeAmount}
                      onChange={handleStakeAmountChange}
                      className="premium-input pr-24 text-lg"
                      placeholder="0.0"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 rounded-r-xl bg-primary bg-opacity-5 text-primary font-medium">
                      MONAD
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-secondary">
                    <span>Minimum: 1 MONAD</span>
                    <span>Bakiye: 1,000 MONAD</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Getiri Tahmini
                  </label>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-background-secondary rounded-lg">
                      <span className="text-secondary">Günlük:</span>
                      <span className="font-medium">{stakeAmount ? (parseFloat(stakeAmount) * 0.052 / 365).toFixed(4) : '0.0000'} MONAD</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-background-secondary rounded-lg">
                      <span className="text-secondary">Haftalık:</span>
                      <span className="font-medium">{stakeAmount ? (parseFloat(stakeAmount) * 0.052 / 52).toFixed(4) : '0.0000'} MONAD</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-background-secondary rounded-lg">
                      <span className="text-secondary">Yıllık (APY):</span>
                      <span className="font-medium">{stakeAmount ? (parseFloat(stakeAmount) * 0.052).toFixed(4) : '0.0000'} MONAD</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-primary bg-opacity-5 p-6 rounded-xl mb-10">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16v-4"></path>
                      <path d="M12 8h.01"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Validator Komisyonu</h3>
                    <p className="text-secondary text-sm">
                      Validator {validators.find(v => v.id === selectedValidator)?.commission}% komisyon uyguluyor
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <a href="#" className="text-primary font-medium">Detaylar</a>
                </div>
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={handleStake}
                  disabled={!isConnected || !stakeAmount}
                  className="primary-button flex gap-2 items-center px-10 py-3 text-lg"
                >
                  {!isConnected ? (
                    <span>Cüzdan Bağla</span>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16"></path>
                        <path d="M12 16V9"></path>
                        <path d="M9 12l3-3 3 3"></path>
                      </svg>
                      <span>Stake Et</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">MONAD Staking Avantajları</h2>
            <p className="text-secondary max-w-2xl mx-auto">
              Monad ağının güvenliğine katkıda bulunun ve kazançlı ödüller elde edin
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="premium-card p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-lg bg-primary-light bg-opacity-10 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path>
                  <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path>
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Pasif Gelir</h3>
              <p className="text-secondary mb-6">
                MONAD tokenlerinizi stake ederek yıllık %5+ getiri ile pasif gelir elde edin.
              </p>
              <a href="#" className="text-primary font-medium mt-auto inline-flex items-center gap-2">
                Daha fazla bilgi
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </a>
            </div>
            
            <div className="premium-card p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-lg bg-accent bg-opacity-10 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                  <path d="m2 4 3 12h14l3-12-6 4-4-8-4 8-6-4Z"></path>
                  <path d="m5 16 3 6"></path>
                  <path d="m19 16-3 6"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Network Güvenliği</h3>
              <p className="text-secondary mb-6">
                Stake işleminiz, Monad ağının güvenliğini sağlama ve koruma sürecine doğrudan katkıda bulunur.
              </p>
              <a href="#" className="text-accent font-medium mt-auto inline-flex items-center gap-2">
                Nasıl çalışır
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </a>
            </div>
            
            <div className="premium-card p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-lg bg-success bg-opacity-10 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Özel Erişim</h3>
              <p className="text-secondary mb-6">
                Stake eden kullanıcılara özel ağ yönetişimi, özel etkinlikler ve airdrop fırsatları.
              </p>
              <a href="#" className="text-success font-medium mt-auto inline-flex items-center gap-2">
                Avantajları keşfet
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
