'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useStakeHub } from '@/lib/useStakeHub';
import { ConnectWallet } from '@/components/ConnectWallet';
import { formatDistanceToNow, format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Project {
  id: number;
  title: string;
  description: string;
  validatorAddress: string;
  validatorName: string;
  tokenSymbol: string;
  targetAmount: number;
  raised: number;
  deadline: number;
  status: 'active' | 'completed' | 'failed';
  tiers: Tier[];
}

interface Tier {
  id: number;
  name: string;
  minStake: number;
  maxAllocation: number;
  earlyAccess: number; // hours
}

export default function LaunchpadPage() {
  const { isConnected, address } = useAccount();
  const { validators, userStakes, fetchUserStakes } = useStakeHub();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedTab, setSelectedTab] = useState('active');
  const [loading, setLoading] = useState(true);

  // Simulated projects data
  useEffect(() => {
    if (isConnected) {
      fetchUserStakes();
      // Simulate fetching projects from blockchain or API
      const mockProjects: Project[] = [
        {
          id: 1,
          title: "MONAD DEX",
          description: "Monad blockchain üzerinde hızlı ve düşük komisyonlu merkezi olmayan borsa.",
          validatorAddress: "0x3cd9f729c8d882b851f8c70fb36d22b391a288cd",
          validatorName: "Monad Validators",
          tokenSymbol: "MDEX",
          targetAmount: 500000,
          raised: 320000,
          deadline: Date.now() + 7 * 24 * 60 * 60 * 1000,
          status: 'active',
          tiers: [
            {
              id: 1,
              name: "Bronze",
              minStake: 100,
              maxAllocation: 500,
              earlyAccess: 0
            },
            {
              id: 2,
              name: "Silver",
              minStake: 500,
              maxAllocation: 2000,
              earlyAccess: 24
            },
            {
              id: 3,
              name: "Gold",
              minStake: 2000,
              maxAllocation: 10000,
              earlyAccess: 72
            }
          ]
        },
        {
          id: 2,
          title: "MONAD NFT Marketplace",
          description: "Monad blockchain üzerinde yenilikçi NFT marketplace platformu.",
          validatorAddress: "0x25a4dd4cd97ed4c2ef71e015d20f9e46a35a538a",
          validatorName: "StakeMaster",
          tokenSymbol: "MNFT",
          targetAmount: 300000,
          raised: 300000,
          deadline: Date.now() - 10 * 24 * 60 * 60 * 1000,
          status: 'completed',
          tiers: [
            {
              id: 1,
              name: "Starter",
              minStake: 100,
              maxAllocation: 300,
              earlyAccess: 0
            },
            {
              id: 2,
              name: "Premium",
              minStake: 1000,
              maxAllocation: 3000,
              earlyAccess: 48
            }
          ]
        },
        {
          id: 3,
          title: "MONAD Bridge",
          description: "Monad ve diğer blockchainler arasında köprü hizmeti.",
          validatorAddress: "0x12ab3f4e9d882b851f8c70fb36d22b391a244ef5",
          validatorName: "TurkValidator",
          tokenSymbol: "MBRIDGE",
          targetAmount: 450000,
          raised: 120000,
          deadline: Date.now() - 5 * 24 * 60 * 60 * 1000,
          status: 'failed',
          tiers: [
            {
              id: 1,
              name: "Basic",
              minStake: 50,
              maxAllocation: 200,
              earlyAccess: 0
            },
            {
              id: 2,
              name: "Advanced",
              minStake: 500,
              maxAllocation: 1500,
              earlyAccess: 24
            },
            {
              id: 3,
              name: "Pro",
              minStake: 2500,
              maxAllocation: 7500,
              earlyAccess: 72
            }
          ]
        }
      ];

      setProjects(mockProjects);
      setLoading(false);
    }
  }, [isConnected, address, fetchUserStakes]);

  const handleContribute = (projectId: number, amount: number): void => {
    // Simulate contributing to a project
    alert(`${projectId} ID'li projeye ${amount} MONAD katkıda bulunuldu`);
  };

  const formatDeadline = (timestamp: number): string => {
    const date = new Date(timestamp);
    return `${format(date, 'd MMM yyyy', { locale: tr })} (${formatDistanceToNow(date, { addSuffix: true, locale: tr })})`;
  };

  // Check if user is eligible for tier based on their stake
  const checkTierEligibility = (validatorAddress: string, minStake: number): boolean => {
    const userStake = userStakes.find(stake => 
      stake.validator.address.toLowerCase() === validatorAddress.toLowerCase()
    );
    
    return userStake ? parseFloat(userStake.amount) >= minStake : false;
  };

  const getHighestEligibleTier = (project: Project): Tier | null => {
    let highestTier: Tier | null = null;
    
    for (const tier of project.tiers) {
      if (checkTierEligibility(project.validatorAddress, tier.minStake)) {
        if (!highestTier || tier.id > highestTier.id) {
          highestTier = tier;
        }
      }
    }
    
    return highestTier;
  };

  const filteredProjects = projects.filter(project => 
    selectedTab === 'active' ? project.status === 'active' : project.status !== 'active'
  );

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <h2 className="text-2xl font-bold mb-6">Launchpad özelliklerini kullanmak için cüzdanınızı bağlayın</h2>
        <ConnectWallet />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Validator Launchpad</h1>
        <p className="page-description">Stake ettiğiniz validatorlerin desteklediği projelere erken erişim kazanın</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border mb-6">
        <button 
          onClick={() => setSelectedTab('active')}
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            selectedTab === 'active' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-secondary hover:text-foreground'
          }`}
        >
          Aktif Projeler
        </button>
        <button 
          onClick={() => setSelectedTab('completed')}
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            selectedTab === 'completed' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-secondary hover:text-foreground'
          }`}
        >
          Tamamlanan Projeler
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {filteredProjects.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-secondary">Bu kategoride henüz proje bulunmuyor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => {
                const highestTier = getHighestEligibleTier(project);
                const isStakingWithValidator = userStakes.some(stake => 
                  stake.validator.address.toLowerCase() === project.validatorAddress.toLowerCase()
                );
                
                // Calculate progress percentage
                const progressPercentage = Math.min(Math.round((project.raised / project.targetAmount) * 100), 100);
                
                return (
                  <div key={project.id} className={`premium-card p-6 rounded-xl ${
                    project.status === 'completed' 
                      ? 'border-green-500/20' 
                      : project.status === 'failed' 
                        ? 'border-red-500/20'
                        : ''
                  }`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-sm font-medium text-secondary block mb-1">{project.tokenSymbol}</span>
                        <h3 className="text-xl font-semibold">{project.title}</h3>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        project.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : project.status === 'completed'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {project.status === 'active' 
                          ? 'Aktif' 
                          : project.status === 'completed' 
                            ? 'Tamamlandı' 
                            : 'Başarısız'}
                      </div>
                    </div>
                    
                    <p className="text-secondary mb-6 min-h-[48px]">{project.description}</p>
                    
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                        {project.validatorName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{project.validatorName}</p>
                        <p className="text-sm text-secondary">Validator</p>
                      </div>
                      {isStakingWithValidator && (
                        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                          Stake Ettiniz
                        </span>
                      )}
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">İlerleme</span>
                        <span className="text-sm text-secondary">
                          {progressPercentage}% tamamlandı
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            project.status === 'completed' 
                              ? 'bg-blue-500' 
                              : project.status === 'failed' 
                                ? 'bg-red-500' 
                                : 'bg-green-500'
                          }`} 
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-2 text-sm">
                        <span className="text-secondary">{project.raised.toLocaleString()} MONAD</span>
                        <span className="text-secondary">{project.targetAmount.toLocaleString()} MONAD</span>
                      </div>
                    </div>
                    
                    {project.status === 'active' && (
                      <div className="mb-6">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Son tarih</span>
                          <span className="text-sm text-secondary">{formatDeadline(project.deadline)}</span>
                        </div>
                      </div>
                    )}

                    {/* Tier Information */}
                    <div className="mb-6">
                      <h4 className="font-medium mb-3">Tier Seviyeleri</h4>
                      <div className="space-y-2">
                        {project.tiers.map(tier => {
                          const isEligible = checkTierEligibility(project.validatorAddress, tier.minStake);
                          return (
                            <div 
                              key={tier.id} 
                              className={`p-3 rounded-lg border text-sm ${
                                isEligible 
                                  ? 'border-green-500/30 bg-green-500/5' 
                                  : 'border-gray-300/30 bg-gray-300/5'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{tier.name}</span>
                                {isEligible ? (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    Uygunsunuz
                                  </span>
                                ) : (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                    {tier.minStake} MONAD gerekli
                                  </span>
                                )}
                              </div>
                              <div className="mt-1 text-secondary">
                                <div>Maks. {tier.maxAllocation.toLocaleString()} MONAD</div>
                                {tier.earlyAccess > 0 && (
                                  <div className="text-primary">{tier.earlyAccess}s erken erişim</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Button */}
                    {project.status === 'active' && (
                      <div>
                        {isStakingWithValidator ? (
                          <button 
                            onClick={() => highestTier ? handleContribute(project.id, 100) : null}
                            disabled={!highestTier}
                            className={`w-full py-2 rounded-lg text-white font-medium transition-colors ${
                              highestTier 
                                ? 'bg-primary hover:bg-primary-dark' 
                                : 'bg-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {highestTier 
                              ? `Katkıda Bulun (${highestTier.name} Tier)` 
                              : 'Yeterli Stake Yok'}
                          </button>
                        ) : (
                          <div className="text-center p-3 border border-dashed border-gray-300 rounded-lg bg-gray-100/50 dark:bg-gray-800/50 dark:border-gray-700">
                            <p className="text-secondary text-sm mb-2">
                              Bu projeye katılmak için önce validator ile stake edin
                            </p>
                            <button className="text-sm text-primary font-medium">
                              Validator'a Git
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {project.status === 'completed' && (
                      <div className="text-center p-3 border border-green-300 rounded-lg bg-green-100/50 dark:bg-green-900/20 dark:border-green-700/30">
                        <p className="text-green-800 dark:text-green-400 font-medium">
                          Bu proje başarıyla fonlandı!
                        </p>
                      </div>
                    )}
                    
                    {project.status === 'failed' && (
                      <div className="text-center p-3 border border-red-300 rounded-lg bg-red-100/50 dark:bg-red-900/20 dark:border-red-700/30">
                        <p className="text-red-800 dark:text-red-400 font-medium">
                          Bu proje hedefine ulaşamadı
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}