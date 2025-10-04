'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useStakeHub } from '@/lib/useStakeHub';
import dynamic from 'next/dynamic';
import { Navigation } from '@/components/Navigation';
import { StatCard } from '@/components/StatCard';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import Link from 'next/link';

// ConnectWallet bileşenini yalnızca istemci tarafında çalıştırılacak şekilde import edelim
const ConnectWallet = dynamic(
  () => import('@/components/ConnectWallet').then((mod) => mod.ConnectWallet),
  { ssr: false }
);

export default function ValidatorPage() {
  const { address, isConnected } = useAccount();
  const { validators, totalStaked, isLoading, error } = useStakeHub();
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Filtreli validatorler
  const filteredValidators = selectedFilter === 'all' 
    ? validators 
    : validators.filter(validator => validator.status === selectedFilter);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-800 to-violet-900 opacity-95"></div>
        <div className="absolute inset-0 bg-[url('/globe.svg')] opacity-10 bg-repeat-space mix-blend-overlay"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        
        {/* Gradient Fade to Background */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
        
        <header className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
          <nav className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="glass-effect p-3 rounded-full shadow-xl border border-white/20">
                <img src="/globe.svg" alt="Monad Logo" width={30} height={30} className="filter brightness-0 invert" />
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

            <div className="w-full sm:w-auto mb-4 sm:mb-0 flex justify-center">
              <Navigation />
            </div>
            
            <div className="glass-effect flex items-center gap-4 px-4 py-2 rounded-xl border border-white/20">
              <Link href="/#validators" className="text-white hover:text-blue-200 transition-colors text-sm">
                Validatörler
              </Link>
              <Link href="/#stake" className="text-white hover:text-blue-200 transition-colors text-sm">
                Stake Et
              </Link>
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
          
          <div className="mt-24 mb-20 text-center">
            <div className="inline-block mb-6 px-6 py-2 bg-white/10 backdrop-blur-lg rounded-full border border-white/10 shadow-lg">
              <p className="text-sm text-blue-100 font-medium flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                Monad Ağı Validator Ekosistemi
              </p>
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6 text-white leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Validatörler</span> ile<br/>Ağa Güç Katın
            </h2>
            <p className="text-xl max-w-2xl mx-auto text-blue-100/90 mb-12">
              Güvenilir validatörler aracılığıyla Monad ağının güvenliğine katkı sağlayın
            </p>
          </div>
        </header>
      </div>
      
      {/* Validator List Page Content */}
      <div className="page-container">
        <section className="section">
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatCard 
              title="Aktif Validatörler" 
              value={isLoading ? "..." : (validators ? validators.length : "0")} 
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>} 
            />
            
            <StatCard 
              title="Toplam Stake Edilen" 
              value={isLoading ? "..." : `${totalStaked ? Number(totalStaked).toLocaleString() : "0"} MONAD`}
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>}
            />
            
            <StatCard 
              title="Ortalama APY" 
              value={isLoading ? "..." : "5.2%"} 
              change="+0.3%" 
              isPositive={true}
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>}
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Button 
              variant={selectedFilter === 'all' ? 'primary' : 'outline'} 
              size="sm" 
              onClick={() => setSelectedFilter('all')}
            >
              Tüm Validatörler
            </Button>
            <Button 
              variant={selectedFilter === 'active' ? 'primary' : 'outline'} 
              size="sm" 
              onClick={() => setSelectedFilter('active')}
            >
              Aktif
            </Button>
            <Button 
              variant={selectedFilter === 'waiting' ? 'primary' : 'outline'} 
              size="sm" 
              onClick={() => setSelectedFilter('waiting')}
            >
              Bekleme Sırasında
            </Button>
          </div>
          
          {/* Validator List */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <Card className="p-8 text-center">
              <p className="text-error mb-4">Validatör verileri yüklenirken bir hata oluştu.</p>
              <Button onClick={() => window.location.reload()}>Yeniden Dene</Button>
            </Card>
          ) : validators && validators.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredValidators.map((validator, index) => (
                <Card key={validator.id || index} className="p-6 validator-card">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {validator.name?.charAt(0) || "V"}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{validator.name || `Validator ${index + 1}`}</h3>
                        <p className="text-sm text-secondary">{validator.address?.substring(0, 8)}...{validator.address?.substring(validator.address.length - 6)}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      validator.status === 'active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                    }`}>
                      {validator.status === 'active' ? 'Aktif' : 'Beklemede'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-background-secondary rounded-lg p-3">
                      <p className="text-xs text-secondary mb-1">Komisyon</p>
                      <p className="font-semibold">{validator.commission || "5"}%</p>
                    </div>
                    <div className="bg-background-secondary rounded-lg p-3">
                      <p className="text-xs text-secondary mb-1">APY</p>
                      <p className="font-semibold">{validator.apy || "5.2"}%</p>
                    </div>
                    <div className="bg-background-secondary rounded-lg p-3">
                      <p className="text-xs text-secondary mb-1">Total Stake</p>
                      <p className="font-semibold">{validator.totalStake?.toLocaleString() || "95,000"}</p>
                    </div>
                    <div className="bg-background-secondary rounded-lg p-3">
                      <p className="text-xs text-secondary mb-1">Stakers</p>
                      <p className="font-semibold">{validator.stakers || "120"}</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="primary" 
                    fullWidth 
                    onClick={() => window.location.href = `/#stake?validator=${validator.id}`}
                  >
                    Stake Et
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-secondary mb-4">Hiç validatör bulunamadı.</p>
            </Card>
          )}
        </section>
        
        {/* FAQ Section */}
        <section className="section">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Sık Sorulan Sorular</h2>
            <p className="text-secondary max-w-2xl mx-auto">Monad validatörleri ve staking hakkında merak edilenler</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3">Validator nedir?</h3>
              <p className="text-secondary">Validatörler, Monad ağında işlemleri doğrulayan ve ağın güvenliğini sağlayan düğümlerdir. Bu hizmet karşılığında ödül alırlar ve bu ödüllerin bir kısmını stake eden kullanıcılarla paylaşırlar.</p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3">Nasıl stake yapabilirim?</h3>
              <p className="text-secondary">Stake yapmak için bir validatör seçin, stake etmek istediğiniz MONAD miktarını girin ve onaylayın. MONAD tokenleri cüzdanınızdan stake kontratına aktarılacaktır.</p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3">Stake ödülleri ne kadar?</h3>
              <p className="text-secondary">Stake ödülleri, seçtiğiniz validatöre ve onun komisyon oranına göre değişir. Ortalama olarak yıllık %5 ila %7 arasında bir getiri beklenir.</p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3">Stake edilen tokenlerimi ne zaman çekebilirim?</h3>
              <p className="text-secondary">Stake edilen tokenler belirli bir süre kilitli kalır (genellikle 14-28 gün). Bu süre sonunda tokenlerinizi çekebilirsiniz. Unstaking işlemi başlattığınızda bu süre işlemeye başlar.</p>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}