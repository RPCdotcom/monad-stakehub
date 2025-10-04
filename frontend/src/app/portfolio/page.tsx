'use client';

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { ConnectWallet } from '@/components/ConnectWallet';
import { useStakeHub } from '@/lib/useStakeHub';

// Portfolio page with detailed stake information
export default function Portfolio() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { totalStaked, validators, userStakes, fetchUserStakes, isLoading, claimRewards } = useStakeHub();
  const [totalRewards, setTotalRewards] = useState(0);
  const [selectedTab, setSelectedTab] = useState('overview');
  
  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    } else {
      fetchUserData();
    }
  }, [isConnected, address]);
  
  const fetchUserData = async () => {
    if (!address) return;
    
    try {
      // Fetch user stakes
      await fetchUserStakes();
      
      // Calculate total rewards (simulation for demo)
      const totalUserStake = userStakes.reduce((sum: number, stake: any) => sum + parseFloat(stake.amount), 0);
      // Use apy if available, otherwise use commission or default to 5% 
      const avgApy = validators.length > 0 
        ? validators.reduce((sum: number, val: any) => sum + (val.apy || val.commission || 5), 0) / validators.length 
        : 5.2;
      
      // Simulate rewards based on stake amount and time
      const simulatedRewards = totalUserStake * (avgApy / 100) * (Math.random() * 0.4 + 0.1);
      setTotalRewards(simulatedRewards);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  
    const handleClaimRewards = async (validatorAddress: string) => {
    try {
      await claimRewards(validatorAddress);
      alert("Rewards claimed successfully!");
      fetchUserData();
    } catch (error) {
      console.error("Error claiming rewards:", error);
      alert("Error claiming rewards");
    }
  };
  
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <h2 className="text-2xl font-bold mb-6">Portfolyonuzu görüntülemek için cüzdanınızı bağlayın</h2>
        <ConnectWallet />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Portfolio Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Portfolyom</h1>
          <p className="text-secondary">Stake işlemlerinizi ve ödüllerinizi buradan takip edebilirsiniz</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => userStakes.length > 0 && handleClaimRewards(userStakes[0].validator.address)}
            disabled={totalRewards <= 0 || userStakes.length === 0}
            className={`primary-button flex items-center gap-2 ${(totalRewards <= 0 || userStakes.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Ödülleri Topla
          </button>
          
          <Link href="/" className="secondary-button">
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
      
      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="dashboard-stat-new backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6">
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
                  `${userStakes.reduce((sum, stake) => sum + parseFloat(stake.amount), 0).toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 0
                  })} MONAD`
                )}
              </div>
            </div>
            <div className="bg-gradient-to-tr from-blue-600 to-blue-400 p-3 rounded-xl shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20"></path>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="dashboard-stat-new backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium text-purple-200 mb-1">Aktif Pozisyonlar</div>
              <div className="text-2xl font-bold text-white">
                {isLoading ? (
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-purple-400 animate-pulse"></span>
                    <span className="w-3 h-3 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-3 h-3 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                ) : userStakes.length}
              </div>
            </div>
            <div className="bg-gradient-to-tr from-purple-600 to-purple-400 p-3 rounded-xl shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="dashboard-stat-new backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium text-emerald-200 mb-1">Toplam Ödül</div>
              <div className="text-2xl font-bold text-white">
                {isLoading ? (
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                ) : (
                  `${totalRewards.toLocaleString('en-US', {
                    maximumFractionDigits: 4,
                    minimumFractionDigits: 4
                  })} MONAD`
                )}
              </div>
            </div>
            <div className="bg-gradient-to-tr from-emerald-600 to-emerald-400 p-3 rounded-xl shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Portfolio Navigation */}
      <div className="flex border-b border-border mb-6 overflow-x-auto">
        <button 
          onClick={() => setSelectedTab('overview')}
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            selectedTab === 'overview' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-secondary hover:text-foreground'
          }`}
        >
          Genel Bakış
        </button>
        <button 
          onClick={() => setSelectedTab('positions')}
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            selectedTab === 'positions' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-secondary hover:text-foreground'
          }`}
        >
          Aktif Pozisyonlar
        </button>
        <button 
          onClick={() => setSelectedTab('history')}
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            selectedTab === 'history' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-secondary hover:text-foreground'
          }`}
        >
          İşlem Geçmişi
        </button>
        <button 
          onClick={() => setSelectedTab('analytics')}
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            selectedTab === 'analytics' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-secondary hover:text-foreground'
          }`}
        >
          Analitik
        </button>
      </div>
      
      {/* Portfolio Content */}
      {selectedTab === 'overview' && (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="premium-card p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Portfolyo Dağılımı</h3>
                <div className="h-64 flex items-center justify-center bg-background/50 rounded-lg mb-4">
                  {/* Placeholder for chart */}
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">%100</div>
                    <div className="text-secondary">MONAD</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'MONAD', color: 'bg-blue-500', percentage: '100%' },
                  ].map((token, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${token.color}`}></div>
                      <div className="text-sm">{token.name} <span className="text-secondary">({token.percentage})</span></div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="premium-card p-6">
                <h3 className="text-lg font-semibold mb-4">Son İşlemler</h3>
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center justify-between p-3 rounded-lg bg-background/50">
                        <div className="flex items-center gap-3">
                          <div className="bg-border h-10 w-10 rounded-full"></div>
                          <div>
                            <div className="h-4 w-32 bg-border rounded"></div>
                            <div className="h-3 w-24 bg-border rounded mt-2"></div>
                          </div>
                        </div>
                        <div className="h-4 w-24 bg-border rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-success">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">Stake Edildi</div>
                          <div className="text-xs text-secondary">2 gün önce</div>
                        </div>
                      </div>
                      <div className="text-success font-medium">+100 MONAD</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-primary">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">Ödül Alındı</div>
                          <div className="text-xs text-secondary">1 hafta önce</div>
                        </div>
                      </div>
                      <div className="text-primary font-medium">+0.0521 MONAD</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-success">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">Stake Edildi</div>
                          <div className="text-xs text-secondary">2 hafta önce</div>
                        </div>
                      </div>
                      <div className="text-success font-medium">+250 MONAD</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <div className="premium-card p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">APY Analizi</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Ortalama APY</span>
                      <span className="font-medium">{isLoading ? '...' : '5.2%'}</span>
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{width: '52%'}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>En Yüksek APY</span>
                      <span className="font-medium">{isLoading ? '...' : '7.8%'}</span>
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-success rounded-full" style={{width: '78%'}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>En Düşük APY</span>
                      <span className="font-medium">{isLoading ? '...' : '3.1%'}</span>
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-warning rounded-full" style={{width: '31%'}}></div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-border mt-4 pt-4">
                  <div className="text-sm text-secondary mb-2">Yıllık Tahmini Getiri</div>
                  <div className="text-xl font-bold">
                    {isLoading ? '...' : (
                      `~${(
                        userStakes.reduce((sum, stake) => sum + parseFloat(stake.amount), 0) * 0.052
                      ).toLocaleString('en-US', {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 0
                      })} MONAD`
                    )}
                  </div>
                </div>
              </div>
              
              <div className="premium-card p-6">
                <h3 className="text-lg font-semibold mb-4">Validator Dağılımı</h3>
                <div className="space-y-3">
                  {isLoading ? (
                    [...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="bg-border h-6 w-6 rounded-full"></div>
                          <div className="h-4 w-24 bg-border rounded"></div>
                        </div>
                        <div className="h-4 w-16 bg-border rounded"></div>
                      </div>
                    ))
                  ) : userStakes.length > 0 ? (
                    validators.slice(0, 3).map((validator, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            i === 0 ? 'bg-primary' : i === 1 ? 'bg-purple-500' : 'bg-accent'
                          }`}></div>
                          <div>{validator.name}</div>
                        </div>
                        <div className="font-medium">
                          {(100 / validators.length).toFixed(0)}%
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-secondary">Henüz stake pozisyonunuz bulunmuyor.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {selectedTab === 'positions' && (
        <div>
          <div className="premium-card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Stake Pozisyonlarım</h3>
              <Link href="/#stake" className="secondary-button py-2 px-4 text-sm">
                Yeni Stake
              </Link>
            </div>
            
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse p-4 rounded-lg bg-background/50">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="bg-border h-12 w-12 rounded-full"></div>
                        <div>
                          <div className="h-5 w-40 bg-border rounded"></div>
                          <div className="h-4 w-32 bg-border rounded mt-2"></div>
                        </div>
                      </div>
                      <div className="h-8 w-24 bg-border rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : userStakes.length > 0 ? (
              <div className="space-y-4">
                {validators.slice(0, 3).map((validator, index) => (
                  <div key={index} className="p-4 rounded-lg bg-background/50 hover:bg-background/70 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-background-secondary rounded-full flex items-center justify-center overflow-hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                            </svg>
                          </div>
                          <div className="absolute -bottom-1 -right-1 bg-success text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {index + 1}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold">{validator.name}</div>
                          <div className="text-xs text-secondary flex items-center gap-2">
                            <span>Fee: {validator.commission}%</span>
                            <span className="inline-block w-1 h-1 rounded-full bg-border"></span>
                            <span>Commission: {validator.commission}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-3">
                        <div className="text-right md:border-r border-border pr-4">
                          <div className="text-xs text-secondary">Stake Edilen</div>
                          <div className="font-medium">{(350 / (index + 1)).toFixed(2)} MONAD</div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-xs text-secondary">Kazanılan</div>
                          <div className="font-medium text-success">+{(0.0521 / (index + 1)).toFixed(4)} MONAD</div>
                        </div>
                      </div>
                      
                      <button className="secondary-button py-2 px-4 text-sm w-full md:w-auto">
                        Yönet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-secondary">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                    <path d="M3 9h18"></path>
                    <path d="M9 21V9"></path>
                  </svg>
                </div>
                <h4 className="text-xl font-medium mb-2">Henüz stake etmediniz</h4>
                <p className="text-secondary mb-4">MONAD token'larınızı stake edin ve pasif gelir kazanmaya başlayın.</p>
                <Link href="/#stake" className="primary-button inline-block">
                  Stake Et
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      
      {selectedTab === 'history' && (
        <div className="premium-card p-6">
          <h3 className="text-lg font-semibold mb-4">İşlem Geçmişi</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Tip</th>
                  <th className="text-left py-3 px-4 font-medium">Miktar</th>
                  <th className="text-left py-3 px-4 font-medium">Validator</th>
                  <th className="text-left py-3 px-4 font-medium">Tarih</th>
                  <th className="text-right py-3 px-4 font-medium">İşlem</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border hover:bg-background/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-success">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                        </svg>
                      </div>
                      <span>Stake</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">100 MONAD</td>
                  <td className="py-3 px-4">AnkaraValidators</td>
                  <td className="py-3 px-4 text-secondary">2 gün önce</td>
                  <td className="py-3 px-4 text-right">
                    <a href="#" className="text-primary text-sm">Görüntüle</a>
                  </td>
                </tr>
                
                <tr className="border-b border-border hover:bg-background/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-primary">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <span>Ödül</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">0.0521 MONAD</td>
                  <td className="py-3 px-4">AnkaraValidators</td>
                  <td className="py-3 px-4 text-secondary">1 hafta önce</td>
                  <td className="py-3 px-4 text-right">
                    <a href="#" className="text-primary text-sm">Görüntüle</a>
                  </td>
                </tr>
                
                <tr className="border-b border-border hover:bg-background/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-success">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                        </svg>
                      </div>
                      <span>Stake</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">250 MONAD</td>
                  <td className="py-3 px-4">MonadTurkey</td>
                  <td className="py-3 px-4 text-secondary">2 hafta önce</td>
                  <td className="py-3 px-4 text-right">
                    <a href="#" className="text-primary text-sm">Görüntüle</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {selectedTab === 'analytics' && (
        <div className="premium-card p-6">
          <h3 className="text-lg font-semibold mb-6">Portfolyo Analitik</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium mb-4">Stake Performansı</h4>
              <div className="h-64 flex items-center justify-center bg-background/50 rounded-lg">
                {/* Placeholder for chart */}
                <div className="text-center text-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
                    <line x1="12" y1="20" x2="12" y2="10"></line>
                    <line x1="18" y1="20" x2="18" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="16"></line>
                  </svg>
                  Stake performansı grafiği
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Ödül Trendi</h4>
              <div className="h-64 flex items-center justify-center bg-background/50 rounded-lg">
                {/* Placeholder for chart */}
                <div className="text-center text-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                  Ödül trendi grafiği
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h4 className="font-medium mb-4">Karşılaştırmalı Analiz</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Sizin Portfolyonuz</span>
                  <span className="font-medium">350 MONAD / 5.2% APY</span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{width: '52%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Platform Ortalaması</span>
                  <span className="font-medium">750 MONAD / 4.9% APY</span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{width: '49%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>En İyi Performans</span>
                  <span className="font-medium">1,250 MONAD / 7.8% APY</span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-success rounded-full" style={{width: '78%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}