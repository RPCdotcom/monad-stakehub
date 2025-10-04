'use client';
import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import dynamic from 'next/dynamic';
import { useAccount } from 'wagmi';
import { useStakeHub } from '@/lib/useStakeHub';
import { Navigation } from '@/components/Navigation';

// ConnectWallet bileşenini yalnızca istemci tarafında çalıştırılacak şekilde import edelim
const ConnectWallet = dynamic(
  () => import('@/components/ConnectWallet').then((mod) => mod.ConnectWallet),
  { ssr: false }
);

export default function Home() {
  const { address, isConnected } = useAccount();
  const { validators, totalStaked, isLoading, error, stake, claimRewards, getUserStake, calculateRewards } = useStakeHub();
  
  const [selectedValidator, setSelectedValidator] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [userStakeInfo, setUserStakeInfo] = useState<{ amount: string; lastStakeTime: number } | null>(null);
  const [userRewards, setUserRewards] = useState<string>('0');
  const [isStaking, setIsStaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  // Validator seçildiğinde kullanıcının stake ve ödül bilgilerini yükle
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!selectedValidator || !isConnected) {
        setUserStakeInfo(null);
        setUserRewards('0');
        return;
      }

      try {
        // Kullanıcının stake bilgisini al
        const stakeInfo = await getUserStake(selectedValidator);
        setUserStakeInfo(stakeInfo);
        
        // Kullanıcının ödül bilgisini al
        const rewards = await calculateRewards(selectedValidator);
        setUserRewards(rewards);
      } catch (err) {
        console.error('Kullanıcı bilgileri yüklenirken hata:', err);
      }
    };

    fetchUserInfo();
  }, [selectedValidator, isConnected, address]);

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

    try {
      setIsStaking(true);
      // Kontrat üzerinden stake işlemi
      const selectedValidatorObj = validators.find(v => v.id === selectedValidator);
      if (!selectedValidatorObj) {
        throw new Error("Validator bulunamadı");
      }
      
      const tx = await stake(selectedValidatorObj.address, stakeAmount);
      console.log('Stake işlemi başarılı:', tx);
      
      // Başarılı bildirim
      alert(`${stakeAmount} MONAD başarıyla stake edildi!`);
      setStakeAmount('');
      
      // Kullanıcı bilgilerini güncelle
      const stakeInfo = await getUserStake(selectedValidatorObj.address);
      setUserStakeInfo(stakeInfo);
    } catch (err) {
      console.error('Stake işlemi başarısız:', err);
      alert('Stake işlemi başarısız oldu. Lütfen tekrar deneyin.');
    } finally {
      setIsStaking(false);
    }
  };

  // Ödülleri talep etme
  const handleClaimRewards = async () => {
    if (!selectedValidator || !isConnected) return;

    try {
      setIsClaiming(true);
      const selectedValidatorObj = validators.find(v => v.id === selectedValidator);
      if (!selectedValidatorObj) {
        throw new Error("Validator bulunamadı");
      }
      
      const tx = await claimRewards(selectedValidatorObj.address);
      console.log('Ödül talebi başarılı:', tx);
      
      // Başarılı bildirim
      alert(`Ödülleriniz başarıyla talep edildi!`);
      
      // Kullanıcı bilgilerini güncelle
      const rewards = await calculateRewards(selectedValidatorObj.address);
      setUserRewards(rewards);
    } catch (err) {
      console.error('Ödül talebi başarısız:', err);
      alert('Ödül talep işlemi başarısız oldu. Lütfen tekrar deneyin.');
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      {/* Header - Metaverse Style Premium Gradient Background */}
      <div className="relative">
        {/* 3D Background Elements */}
        <div className="absolute inset-0 bg-[url('/globe.svg')] opacity-5 bg-repeat-space"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-800 to-violet-900 opacity-95"></div>
        <div className="absolute inset-0 bg-[url('/globe.svg')] opacity-10 bg-repeat-space mix-blend-overlay"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-1/4 left-1/5 w-40 h-40 bg-blue-400/20 rounded-full mix-blend-overlay filter blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-purple-400/20 rounded-full mix-blend-overlay filter blur-3xl animate-float"></div>
        
        {/* Gradient Fade to Background */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
        
        <header className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
          <nav className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/15 p-3 rounded-full backdrop-blur-md shadow-xl border border-white/10">
                <Image src="/globe.svg" alt="Monad Logo" width={30} height={30} className="filter brightness-0 invert" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">StakeHub</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <p className="text-xs font-medium text-blue-100">
                    <span className="hidden sm:inline">Monad Testnet</span> • <span className="inline-flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Canlı
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-4 sm:mb-0">
              <Navigation />
            </div>
            
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
              <a href="#validators" className="text-white hover:text-blue-200 transition-colors text-sm">
                Validatörler
              </a>
              <a href="#stake" className="text-white hover:text-blue-200 transition-colors text-sm">
                Stake Et
              </a>
              <Link href="/portfolio" className="text-white hover:text-blue-200 transition-colors text-sm flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                Portfolyo
              </Link>
              <div className="h-4 border-r border-white/30 mx-1"></div>
              <ConnectWallet />
            </div>
          </nav>
          
          <div className="mt-24 mb-32 text-center">
            <div className="inline-block mb-6 px-6 py-2 bg-white/10 backdrop-blur-lg rounded-full border border-white/10 shadow-lg">
              <p className="text-sm text-blue-100 font-medium flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                Monad Metaverse'te Stake Yapın
              </p>
            </div>
            <h2 className="text-5xl md:text-7xl font-extrabold mb-6 text-white leading-tight tracking-tight">
              Geleceğin <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Metaverse</span> <br/>Ağına Güç Katın
            </h2>
            <p className="text-xl max-w-2xl mx-auto text-blue-100/90 mb-12">
              Validatörler aracılığıyla Monad ağının güvenliğine katkı sağlayın ve yıllık %5+ getiri elde edin
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#validators" className="primary-button inline-flex items-center gap-2 group px-6 py-3 bg-white text-blue-900 rounded-full hover:shadow-lg hover:scale-105 transition-all font-medium">
                Validatörleri Keşfet
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </a>
              <a href="#" className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white rounded-full hover:bg-white/10 transition-all backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polygon points="21 15 16 10 5 21"></polygon>
                </svg>
                Demo İzle
              </a>
            </div>
            
            <div className="mt-16 flex justify-center items-center gap-8 opacity-75">
              <div className="flex flex-col items-center">
                <p className="text-white/80 text-xs uppercase tracking-wider font-semibold">Desteklenen</p>
                <Image src="/window.svg" alt="Monad" width={100} height={25} className="filter brightness-0 invert mt-2" />
              </div>
              <div className="flex flex-col items-center">
                <p className="text-white/80 text-xs uppercase tracking-wider font-semibold">Güvenli</p>
                <div className="mt-2 text-white font-mono font-bold">MONAD</div>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-white/80 text-xs uppercase tracking-wider font-semibold">Web3</p>
                <div className="mt-2 text-white text-2xl font-bold">WEB3</div>
              </div>
            </div>
          </div>
        </header>
      </div>
      
      {/* Stats Section */}
      <section className="container mx-auto px-4 -mt-24 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="dashboard-stat-new animate-fade-in backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 transform transition-all hover:scale-[1.02] hover:shadow-xl" style={{animationDelay: '0.1s'}}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-blue-200 mb-1">Toplam Stake Edilen</div>
                <div className="text-2xl font-bold text-white">
                  {isLoading ? (
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></span>
                      <span className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                  ) : (
                    `${Number(totalStaked).toLocaleString('en-US', {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 0
                    })} MONAD`
                  )}
                </div>
                <div className="text-xs text-blue-300 mt-1">Toplam token değeri: $25.3M</div>
              </div>
              <div className="bg-gradient-to-tr from-blue-600 to-blue-400 p-3 rounded-xl shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20"></path>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-blue-200 mb-1">
                <span>Hedef</span>
                <span>100M MONAD</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" style={{width: isLoading ? '0%' : '68%'}}></div>
              </div>
            </div>
          </div>
          
          <div className="dashboard-stat-new animate-fade-in backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 transform transition-all hover:scale-[1.02] hover:shadow-xl" style={{animationDelay: '0.2s'}}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-purple-200 mb-1">Aktif Validatörler</div>
                <div className="text-2xl font-bold text-white">
                  {isLoading ? (
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-purple-400 animate-pulse"></span>
                      <span className="w-3 h-3 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-3 h-3 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                  ) : validators.length}
                </div>
                <div className="text-xs text-purple-300 mt-1">Son 30 günde %15 artış</div>
              </div>
              <div className="bg-gradient-to-tr from-purple-600 to-purple-400 p-3 rounded-xl shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-purple-200 mb-1">
                <span>Ağ Güvenliği</span>
                <span>{isLoading ? '...' : validators.length > 5 ? 'Mükemmel' : 'İyi'}</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full" style={{width: isLoading ? '0%' : '45%'}}></div>
              </div>
            </div>
          </div>
          
          <div className="dashboard-stat-new animate-fade-in backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 transform transition-all hover:scale-[1.02] hover:shadow-xl" style={{animationDelay: '0.3s'}}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-emerald-200 mb-1">Ortalama APY</div>
                <div className="text-2xl font-bold text-white">
                  {isLoading ? (
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                  ) : (
                    `${validators.length > 0 
                      ? (validators.reduce((total, v) => total + v.commission, 0) / validators.length).toFixed(1) 
                      : '5.2'}%`
                  )}
                </div>
                <div className="text-xs text-emerald-300 mt-1">Yıllık getiri potansiyeli</div>
              </div>
              <div className="bg-gradient-to-tr from-emerald-600 to-emerald-400 p-3 rounded-xl shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 20h.01"></path>
                  <path d="M7 20v-4"></path>
                  <path d="M12 20v-8"></path>
                  <path d="M17 20v-6"></path>
                  <path d="M22 20V8"></path>
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-emerald-200 mb-1">
                <span>Risk seviyesi</span>
                <span>Düşük</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full" style={{width: isLoading ? '0%' : '82%'}}></div>
              </div>
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
      
      {/* Validators Section - Modern 3D Interactive Cards */}
      <section id="validators" className="bg-background-secondary dark:bg-background-secondary/50 py-16 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-50"></div>
        <div className="absolute top-20 -left-24 w-64 h-64 bg-primary/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 -right-24 w-64 h-64 bg-accent/20 rounded-full filter blur-3xl"></div>
        
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-xs font-medium mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m8 3 4 8 5-5 5 15H2L8 3z"></path>
                </svg>
                Yeni Özellikler
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-2 relative">
                <span className="bg-gradient-to-r from-primary via-accent to-primary text-transparent bg-clip-text">Validator Ekosistemi</span>
              </h2>
              <p className="text-secondary text-lg max-w-xl">En güvenilir validatorler arasından seçim yapın ve Monad ağına katkıda bulunun</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Validator ara..." 
                  className="bg-background/60 border border-border rounded-lg pl-10 pr-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-sm"
                />
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              
              <div className="flex items-center gap-2 bg-background/60 backdrop-blur-sm rounded-lg p-1 border border-border">
                <button className="px-3 py-1.5 rounded-md bg-primary text-white text-sm font-medium">
                  Tümü
                </button>
                <button className="px-3 py-1.5 rounded-md text-secondary hover:text-foreground text-sm font-medium transition-colors">
                  Aktif
                </button>
                <button className="px-3 py-1.5 rounded-md text-secondary hover:text-foreground text-sm font-medium transition-colors">
                  Yüksek APY
                </button>
                <button className="px-3 py-1.5 rounded-md text-secondary hover:text-foreground text-sm font-medium transition-colors">
                  Yeni
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background/60 backdrop-blur-sm hover:bg-opacity-80 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                  Filtrele
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background/60 backdrop-blur-sm hover:bg-opacity-80 transition-colors">
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
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {validators.map((validator) => (
              <div 
                key={validator.id}
                className={`validator-card-3d relative bg-gradient-to-br from-background to-background-secondary/80 backdrop-blur-sm border border-white/10 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] cursor-pointer overflow-hidden ${
                  selectedValidator === validator.id 
                    ? 'ring-2 ring-primary ring-opacity-70' 
                    : ''
                }`}
                onClick={() => handleValidatorSelect(validator.id)}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:12px_12px] opacity-40"></div>
                
                {/* Glow Effect */}
                <div className={`absolute -inset-px bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-0 transition-opacity duration-300 blur rounded-2xl ${
                  selectedValidator === validator.id ? 'opacity-100' : 'group-hover:opacity-100'
                }`}></div>
                
                <div className="p-6 relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex gap-3 items-center">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-white font-bold text-xl">
                          {validator.name.charAt(0)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-success text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                          </svg>
                        </div>
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
                    <button className="text-secondary hover:text-primary transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-secondary">Performans Puanı</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill={i < Math.floor(Number(validator.uptime) / 20) ? "currentColor" : "none"} 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className={i < Math.floor(Number(validator.uptime) / 20) ? "text-primary" : "text-white/20"}
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                          </svg>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-secondary">Toplam Stake</span>
                      <p className="font-semibold">{validator.totalStaked}</p>
                    </div>
                  </div>
                  
                  <p className="text-secondary text-sm mb-6">{validator.description.length > 80 ? validator.description.substring(0, 80) + '...' : validator.description}</p>
                  
                  <div className="bg-background-secondary/60 backdrop-blur-sm rounded-xl p-4 mb-6">
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
