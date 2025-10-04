'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useStakeHub } from '@/lib/useStakeHub';
import { ConnectWallet } from '@/components/ConnectWallet';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

// Define types for our proposal data
interface ValidatorVote {
  vote: string;
  reason: string;
}

interface Votes {
  yes: number;
  no: number;
  abstain: number;
}

interface Proposal {
  id: number;
  title: string;
  description: string;
  creator: string;
  creatorName: string;
  startTime: number;
  endTime: number;
  status: string;
  votes: Votes;
  validatorVotes: Record<string, ValidatorVote>;
}

export default function GovernancePage() {
  const { isConnected, address } = useAccount();
  const { validators, userStakes, fetchUserStakes } = useStakeHub();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedTab, setSelectedTab] = useState('active');
  const [loading, setLoading] = useState(true);

  // Simulated proposals data
  useEffect(() => {
    if (isConnected) {
      fetchUserStakes();
      // Simulate fetching proposals from blockchain or API
      const mockProposals: Proposal[] = [
        {
          id: 1,
          title: "MONAD Testneti için yeni özellikler",
          description: "Monad testnetinde akıllı kontrat geliştirme araçlarının iyileştirilmesi için yeni özellikler eklensin.",
          creator: "0x3cd9f729c8d882b851f8c70fb36d22b391a288cd",
          creatorName: "Monad Validators",
          startTime: Date.now() - 5 * 24 * 60 * 60 * 1000,
          endTime: Date.now() + 2 * 24 * 60 * 60 * 1000,
          status: "active",
          votes: {
            yes: 62000,
            no: 17500,
            abstain: 5000
          },
          validatorVotes: {
            "0x3cd9f729c8d882b851f8c70fb36d22b391a288cd": {
              vote: "yes",
              reason: "Bu özellikler geliştirici deneyimini önemli ölçüde iyileştirecek."
            },
            "0x12ab3f4e9d882b851f8c70fb36d22b391a244ef5": {
              vote: "no",
              reason: "Mevcut özelliklere odaklanmak daha önemli."
            }
          }
        },
        {
          id: 2,
          title: "Topluluk Hazinesi Tahsisi",
          description: "Topluluk hazinesinden 10,000 MONAD'ın eğitim programlarına tahsis edilmesi.",
          creator: "0x25a4dd4cd97ed4c2ef71e015d20f9e46a35a538a",
          creatorName: "StakeMaster",
          startTime: Date.now() - 10 * 24 * 60 * 60 * 1000,
          endTime: Date.now() - 3 * 24 * 60 * 60 * 1000,
          status: "completed",
          votes: {
            yes: 89000,
            no: 12000,
            abstain: 4000
          },
          validatorVotes: {
            "0x3cd9f729c8d882b851f8c70fb36d22b391a288cd": {
              vote: "yes",
              reason: "Eğitim programları ekosistemin büyümesi için kritiktir."
            },
            "0x25a4dd4cd97ed4c2ef71e015d20f9e46a35a538a": {
              vote: "yes",
              reason: "Bu tahsis, yeni geliştiricileri ekosisteme çekmek için önemlidir."
            }
          }
        },
        {
          id: 3,
          title: "Protokol Güncelleme Önerisi",
          description: "Blok üretim süresi ve ödül mekanizmasında değişiklik önerisi.",
          creator: "0x12ab3f4e9d882b851f8c70fb36d22b391a244ef5",
          creatorName: "TurkValidator",
          startTime: Date.now() - 2 * 24 * 60 * 60 * 1000,
          endTime: Date.now() + 5 * 24 * 60 * 60 * 1000,
          status: "active",
          votes: {
            yes: 45000,
            no: 42000,
            abstain: 8000
          },
          validatorVotes: {
            "0x25a4dd4cd97ed4c2ef71e015d20f9e46a35a538a": {
              vote: "no",
              reason: "Bu değişiklik henüz test edilmemiştir ve risk taşır."
            },
            "0x12ab3f4e9d882b851f8c70fb36d22b391a244ef5": {
              vote: "yes",
              reason: "Önerilen değişiklikler ağ performansını artıracaktır."
            }
          }
        }
      ];

      setProposals(mockProposals);
      setLoading(false);
    }
  }, [isConnected, address, fetchUserStakes]);

  const handleVote = (proposalId: number, vote: string): void => {
    // Simulate voting on a proposal
    alert(`${proposalId} ID'li öneri için ${vote} oyu verildi`);
  };

  const formatDate = (timestamp: number): string => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: tr });
  };

  const filteredProposals = proposals.filter(proposal => 
    selectedTab === 'active' ? proposal.status === 'active' : proposal.status === 'completed'
  );

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <h2 className="text-2xl font-bold mb-6">Governance özelliklerini kullanmak için cüzdanınızı bağlayın</h2>
        <ConnectWallet />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Governance</h1>
        <p className="page-description">Validator'larınızın önerileri hakkında bilgi alın ve oy kullanın</p>
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
          Aktif Öneriler
        </button>
        <button 
          onClick={() => setSelectedTab('completed')}
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            selectedTab === 'completed' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-secondary hover:text-foreground'
          }`}
        >
          Tamamlanan Öneriler
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {filteredProposals.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-secondary">Bu kategoride henüz öneri bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredProposals.map(proposal => (
                <div key={proposal.id} className="premium-card p-6 rounded-xl">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">{proposal.title}</h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      proposal.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {proposal.status === 'active' ? 'Aktif' : 'Tamamlandı'}
                    </div>
                  </div>
                  
                  <p className="text-secondary mb-6">{proposal.description}</p>
                  
                  <div className="flex flex-col md:flex-row justify-between mb-6">
                    <div className="mb-4 md:mb-0">
                      <p className="text-sm text-secondary mb-1">Oluşturan</p>
                      <p className="font-medium">{proposal.creatorName}</p>
                    </div>
                    <div className="mb-4 md:mb-0">
                      <p className="text-sm text-secondary mb-1">Başlangıç</p>
                      <p className="font-medium">{formatDate(proposal.startTime)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary mb-1">Bitiş</p>
                      <p className="font-medium">{formatDate(proposal.endTime)}</p>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Oylama Durumu</span>
                      <span className="text-sm text-secondary">
                        {Math.round((proposal.votes.yes / (proposal.votes.yes + proposal.votes.no + proposal.votes.abstain)) * 100)}% onay
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="flex h-full">
                        <div 
                          className="bg-green-500" 
                          style={{ width: `${(proposal.votes.yes / (proposal.votes.yes + proposal.votes.no + proposal.votes.abstain)) * 100}%` }}
                        ></div>
                        <div 
                          className="bg-red-500" 
                          style={{ width: `${(proposal.votes.no / (proposal.votes.yes + proposal.votes.no + proposal.votes.abstain)) * 100}%` }}
                        ></div>
                        <div 
                          className="bg-gray-400" 
                          style={{ width: `${(proposal.votes.abstain / (proposal.votes.yes + proposal.votes.no + proposal.votes.abstain)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                      <span className="text-green-600 dark:text-green-400">{proposal.votes.yes.toLocaleString()} Evet</span>
                      <span className="text-red-600 dark:text-red-400">{proposal.votes.no.toLocaleString()} Hayır</span>
                      <span className="text-gray-500">{proposal.votes.abstain.toLocaleString()} Çekimser</span>
                    </div>
                  </div>

                  {/* Validator Oyları */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Validator Kararları</h4>
                    <div className="space-y-3">
                      {Object.entries(proposal.validatorVotes).map(([validatorAddr, voteInfo]) => {
                        // Find validator name from validators list
                        const validator = validators.find(v => v.address.toLowerCase() === validatorAddr.toLowerCase());
                        const validatorName = validator ? validator.name : validatorAddr.slice(0, 6) + '...' + validatorAddr.slice(-4);
                        
                        // Check if user is staking with this validator
                        const isStakingWithValidator = userStakes.some(stake => 
                          stake.validator.address.toLowerCase() === validatorAddr.toLowerCase()
                        );
                        
                        return (
                          <div key={validatorAddr} className={`p-4 rounded-lg ${isStakingWithValidator ? 'border-2 border-primary/30 bg-primary/5' : 'bg-background/60'}`}>
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                                  {validatorName.charAt(0)}
                                </div>
                                <span className="font-medium">{validatorName}</span>
                                {isStakingWithValidator && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">Stake Ettiniz</span>
                                )}
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                voteInfo.vote === 'yes' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                  : voteInfo.vote === 'no'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                              }`}>
                                {voteInfo.vote === 'yes' ? 'Evet' : voteInfo.vote === 'no' ? 'Hayır' : 'Çekimser'}
                              </span>
                            </div>
                            <p className="text-sm text-secondary">{voteInfo.reason}</p>
                            
                            {isStakingWithValidator && proposal.status === 'active' && (
                              <div className="mt-3 flex gap-2">
                                <button 
                                  onClick={() => handleVote(proposal.id, 'yes')}
                                  className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded text-sm hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                >
                                  Validator ile Evet
                                </button>
                                <button 
                                  onClick={() => handleVote(proposal.id, 'different')}
                                  className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                  Farklı Oy Ver
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Voting Actions */}
                  {proposal.status === 'active' && (
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleVote(proposal.id, 'yes')}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        Evet
                      </button>
                      <button 
                        onClick={() => handleVote(proposal.id, 'no')}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        Hayır
                      </button>
                      <button 
                        onClick={() => handleVote(proposal.id, 'abstain')}
                        className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      >
                        Çekimser
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}