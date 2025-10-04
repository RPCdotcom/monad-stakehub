'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';

// Sözleşme ABI'sini ve adresini tanımla
const StakeHubABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_validatorAddr",
        "type": "address"
      }
    ],
    "name": "calculateRewards",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_validatorAddr",
        "type": "address"
      }
    ],
    "name": "claimRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getValidatorCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_index",
        "type": "uint256"
      }
    ],
    "name": "getValidatorInfo",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalStaked",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_validatorAddr",
        "type": "address"
      }
    ],
    "name": "getUserStake",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_validatorAddr",
        "type": "address"
      }
    ],
    "name": "stake",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

interface ValidatorInfo {
  id: string;
  address: string;
  name: string;
  description: string;
  commission: number;
  totalStaked: string;
  userCount: number;
  uptime: number;
  socialLinks: Record<string, string>;
}

interface UserStake {
  amount: string;
  lastStakeTime: number;
}

interface UserStakeDetails {
  validator: ValidatorInfo;
  amount: string;
  since: Date;
  rewards: string;
  autoCompound: boolean;
  lastClaim: Date;
}

export function useStakeHub() {
  // Kontrat adresini .env dosyasından al
  const contractAddress = process.env.NEXT_PUBLIC_STAKEHUB_CONTRACT as `0x${string}` | undefined;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [validators, setValidators] = useState<ValidatorInfo[]>([]);
  const [totalStaked, setTotalStaked] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userStakes, setUserStakes] = useState<UserStakeDetails[]>([]);

  // Sözleşmeden validator sayısını oku
  const { data: validatorCount } = useReadContract({
    address: contractAddress,
    abi: StakeHubABI,
    functionName: 'getValidatorCount',
  });

  // Toplam stake edilen miktarı oku
  const { data: totalStakedData } = useReadContract({
    address: contractAddress,
    abi: StakeHubABI,
    functionName: 'getTotalStaked',
  });

  // Toplam stake edilen miktarı güncelle
  useEffect(() => {
    if (totalStakedData) {
      setTotalStaked(formatEther(totalStakedData as bigint));
    }
  }, [totalStakedData]);

  // Validator bilgisini zincirden fetch et
  const fetchValidatorInfo = async (index: number): Promise<ValidatorInfo | null> => {
    if (!contractAddress) return null;
    
    try {
      const result = await readContract({
        address: contractAddress,
        abi: StakeHubABI,
        functionName: 'getValidatorInfo',
        args: [index]
      });

      if (result) {
        const [
          validatorAddress,
          name,
          description,
          commission,
          totalStaked,
          userCount,
          uptime
        ] = result as [string, string, string, bigint, bigint, bigint, bigint];

        return {
          id: index.toString(),
          address: validatorAddress,
          name,
          description,
          commission: Number(commission) / 10, // %10 gibi göstermek için 10'a böl
          totalStaked: formatEther(totalStaked),
          userCount: Number(userCount),
          uptime: Number(uptime) / 10, // 999 -> 99.9% gibi göstermek için
          socialLinks: getSocialLinks(description),
        };
      }
      return null;
    } catch (err) {
      console.error(`Validator ${index} bilgisi okunamadı:`, err);
      return null;
    }
  };

  // Kullanıcının stake bilgilerini backend API'den fetch et
  const fetchUserStakes = async (): Promise<void> => {
    if (!address) {
      setUserStakes([]);
      return;
    }
    
    try {
      const response = await fetch(`${apiUrl}/api/users/${address}/stakes`);
      
      if (response.ok) {
        const stakeData = await response.json();
        
        // API verisini frontend formatına dönüştür
        const formattedStakes = stakeData.map((stake: any): UserStakeDetails => {
          return {
            validator: {
              id: stake.validator_address,
              address: stake.validator_address,
              name: stake.validator_name || 'Bilinmeyen Validator',
              description: '',
              commission: stake.commission_rate / 100, // 500 -> %5.00
              totalStaked: '0',
              userCount: 0,
              uptime: stake.uptime / 100, // 9980 -> %99.80
              socialLinks: {}
            },
            amount: stake.amount.toString(),
            since: new Date(stake.since),
            rewards: stake.rewards.toString(),
            autoCompound: stake.auto_compound,
            lastClaim: new Date(stake.last_claim)
          };
        });
        
        setUserStakes(formattedStakes);
      } else {
        // Backend API başarısız olursa blockchain'den stake bilgilerini al
        console.warn('Backend API\'den kullanıcı stake bilgileri alınamadı');
        
        if (validators.length > 0) {
          const userStakesPromises = validators.map(async (validator) => {
            const stake = await getUserStake(validator.address);
            if (parseFloat(stake.amount) > 0) {
              const rewards = await calculateRewards(validator.address);
              
              return {
                validator,
                amount: stake.amount,
                since: new Date(stake.lastStakeTime * 1000),
                rewards,
                autoCompound: false,
                lastClaim: new Date()
              };
            }
            return null;
          });
          
          const fetchedStakes = await Promise.all(userStakesPromises);
          setUserStakes(fetchedStakes.filter(Boolean) as UserStakeDetails[]);
        } else {
          setUserStakes([]);
        }
      }
    } catch (err) {
      console.error('Kullanıcı stake bilgileri alınamadı:', err);
      setUserStakes([]);
    }
  };

  useEffect(() => {
    const fetchValidators = async () => {
      setIsLoading(true);
      try {
        // Önce backend API'sinden veri almayı deneyelim
        const response = await fetch(`${apiUrl}/api/validators`);
        
        if (response.ok) {
          // Backend API'den veriyi başarıyla aldık
          const apiValidators = await response.json();
          
          // API verisini frontend formatına dönüştür
          const formattedValidators = apiValidators.map((v: any, index: number): ValidatorInfo => ({
            id: index.toString(),
            address: v.address,
            name: v.name,
            description: v.description || '',
            commission: v.commission_rate / 100, // 500 -> %5.00
            totalStaked: v.total_staked.toString(),
            userCount: v.user_count,
            uptime: v.uptime / 100, // 9980 -> %99.80
            socialLinks: v.social_links ? 
              (typeof v.social_links === 'string' ? 
                JSON.parse(v.social_links) : v.social_links) : {}
          }));
          
          setValidators(formattedValidators);
          setError(null);
        } else if (validatorCount && contractAddress) {
          // Backend API başarısız olursa smart contract'dan veri çek
          console.warn('Backend API erişilemedi, blockchain verisi kullanılıyor.');
          
          const validatorPromises: Promise<ValidatorInfo | null>[] = [];
          for (let i = 0; i < Number(validatorCount); i++) {
            validatorPromises.push(fetchValidatorInfo(i));
          }
          
          const fetchedValidators = await Promise.all(validatorPromises);
          setValidators(fetchedValidators.filter(Boolean) as ValidatorInfo[]);
          setError(null);
        } else {
          // Ne backend ne de blockchain verisi alınamadı, mock veri kullan
          console.warn('Hem API hem de blockchain verisi alınamadı, mock veri kullanılıyor.');
          
          // Mock validators verileri
          const mockValidators: ValidatorInfo[] = [
            {
              id: "0",
              address: "0x3cd9f729c8d882b851f8c70fb36d22b391a288cd",
              name: "Monad Validators",
              description: "Profesyonel validator ekibi, 7/24 kesintisiz hizmet",
              commission: 5.0,
              totalStaked: "500000",
              userCount: 125,
              uptime: 99.95,
              socialLinks: {
                twitter: "@monadvalidators",
                website: "https://monadvalidators.com"
              }
            },
            {
              id: "1",
              address: "0x7f67f2345f2c10b945c7ae328cd80648b9c6c831",
              name: "Ankara Node",
              description: "Türkiye merkezli validator hizmeti",
              commission: 3.0,
              totalStaked: "320000",
              userCount: 87,
              uptime: 99.78,
              socialLinks: {
                twitter: "@ankaranode",
                website: "https://ankaranode.com"
              }
            },
            {
              id: "2",
              address: "0x25a4dd4cd97ed4c2ef71e015d20f9e46a35a538a",
              name: "StakeMaster",
              description: "Yüksek performanslı staking altyapısı",
              commission: 4.0,
              totalStaked: "780000",
              userCount: 210,
              uptime: 99.85,
              socialLinks: {
                discord: "https://discord.gg/stakemaster"
              }
            }
          ];
          
          setValidators(mockValidators);
          setError(null);
        }
      } catch (err) {
        console.error('Validator bilgileri alınamadı:', err);
        setError('Validator bilgileri yüklenirken bir hata oluştu');
        
        // Hata durumunda mock veriyi göster
        const fallbackValidators: ValidatorInfo[] = [
          {
            id: "0",
            address: "0x3cd9f729c8d882b851f8c70fb36d22b391a288cd",
            name: "Monad Validators",
            description: "Profesyonel validator ekibi, 7/24 kesintisiz hizmet",
            commission: 5.0,
            totalStaked: "500000",
            userCount: 125,
            uptime: 99.95,
            socialLinks: {
              twitter: "@monadvalidators"
            }
          }
        ];
        
        setValidators(fallbackValidators);
      } finally {
        setIsLoading(false);
      }
    };

    fetchValidators();
  }, [validatorCount, contractAddress, apiUrl]);

  // Kullanıcının cüzdanı bağlandığında stake bilgilerini getir
  useEffect(() => {
    if (address && validators.length > 0) {
      fetchUserStakes();
    }
  }, [address, validators]);

  // Stake etme fonksiyonu
  const stake = async (validatorAddress: string, amount: string) => {
    if (!isConnected || !contractAddress) {
      throw new Error("Cüzdan bağlı değil");
    }

    try {
      const tx = await writeContractAsync({
        address: contractAddress,
        abi: StakeHubABI,
        functionName: 'stake',
        args: [validatorAddress as `0x${string}`],
        value: parseEther(amount),
      });
      
      // Stake işlemi başarılı olduktan sonra kullanıcı stake bilgilerini güncelle
      setTimeout(() => fetchUserStakes(), 2000);
      
      return tx;
    } catch (err) {
      console.error('Stake işlemi başarısız:', err);
      throw err;
    }
  };

  // Ödülleri talep etme fonksiyonu
  const claimRewards = async (validatorAddress: string) => {
    if (!isConnected || !contractAddress) {
      throw new Error("Cüzdan bağlı değil");
    }

    try {
      const tx = await writeContractAsync({
        address: contractAddress,
        abi: StakeHubABI,
        functionName: 'claimRewards',
        args: [validatorAddress as `0x${string}`],
      });
      
      // Ödül talebi başarılı olduktan sonra kullanıcı stake bilgilerini güncelle
      setTimeout(() => fetchUserStakes(), 2000);
      
      return tx;
    } catch (err) {
      console.error('Ödül talep işlemi başarısız:', err);
      throw err;
    }
  };

  // Kullanıcının stake miktarını oku
  const getUserStake = async (validatorAddress: string): Promise<UserStake> => {
    if (!isConnected || !address || !contractAddress) {
      return { amount: '0', lastStakeTime: 0 };
    }

    try {
      const result = await readContract({
        address: contractAddress,
        abi: StakeHubABI,
        functionName: 'getUserStake',
        args: [address, validatorAddress as `0x${string}`]
      });

      if (result) {
        const [amount, lastStakeTime] = result as [bigint, bigint];
        return {
          amount: formatEther(amount),
          lastStakeTime: Number(lastStakeTime)
        };
      }
      
      return { amount: '0', lastStakeTime: 0 };
    } catch (err) {
      console.error('Kullanıcı stake bilgisi okunamadı:', err);
      return { amount: '0', lastStakeTime: 0 };
    }
  };

  // Kullanıcının ödüllerini hesapla
  const calculateRewards = async (validatorAddress: string): Promise<string> => {
    if (!isConnected || !address || !contractAddress) {
      return '0';
    }

    try {
      const result = await readContract({
        address: contractAddress,
        abi: StakeHubABI,
        functionName: 'calculateRewards',
        args: [address, validatorAddress as `0x${string}`]
      });

      if (result) {
        return formatEther(result as bigint);
      }
      return '0';
    } catch (err) {
      console.error('Ödül hesaplama başarısız:', err);
      return '0';
    }
  };

  // Toplam stake edilen miktarı fetch et (chain veya API)
  const fetchTotalStaked = async (): Promise<string> => {
    try {
      // API'den toplam stake bilgisini al
      const response = await fetch(`${apiUrl}/api/stats/total-staked`);
      
      if (response.ok) {
        const data = await response.json();
        return data.total_staked.toString();
      } else if (totalStakedData) {
        // API başarısız olursa kontrat verisini kullan
        return formatEther(totalStakedData as bigint);
      } else {
        // Her ikisi de başarısız olursa validators verilerinden topla
        const total = validators.reduce((acc, val) => 
          acc + parseFloat(val.totalStaked), 0);
        return total.toString();
      }
    } catch (err) {
      console.error('Toplam stake bilgisi alınamadı:', err);
      
      // Hata durumunda validators verilerinden hesapla
      const total = validators.reduce((acc, val) => 
        acc + parseFloat(val.totalStaked), 0);
      return total.toString();
    }
  };

  // Yardımcı fonksiyonlar
  const readContract = async ({ 
    address, 
    abi, 
    functionName, 
    args = [] 
  }: { 
    address: `0x${string}`; 
    abi: any; 
    functionName: string; 
    args?: any[] 
  }) => {
    if (!process.env.NEXT_PUBLIC_MONAD_RPC_URL) {
      console.error('RPC URL is not defined');
      return null;
    }
    
    try {
      // Viem client'a özel implementasyon
      const response = await fetch(process.env.NEXT_PUBLIC_MONAD_RPC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_call',
          params: [
            {
              to: address,
              data: encodeAbiParameters(abi, functionName, args),
            },
            'latest',
          ],
        }),
      });
      
      const data = await response.json();
      return decodeAbiResult(abi, functionName, data.result);
    } catch (error) {
      console.error('Contract read error:', error);
      return null;
    }
  };

  // Bu fonksiyon açıklama alanındaki sosyal medya linklerini parse eder
  const getSocialLinks = (description: string): Record<string, string> => {
    const socialLinks: Record<string, string> = {};
    
    // Twitter handle
    const twitterMatch = description.match(/twitter:?\s*@?([a-zA-Z0-9_]+)/i);
    if (twitterMatch) {
      socialLinks.twitter = `@${twitterMatch[1]}`;
    }
    
    // Website URL
    const websiteMatch = description.match(/website:?\s*(https?:\/\/[^\s]+)/i);
    if (websiteMatch) {
      socialLinks.website = websiteMatch[1];
    }
    
    // Telegram handle
    const telegramMatch = description.match(/telegram:?\s*@?([a-zA-Z0-9_]+)/i);
    if (telegramMatch) {
      socialLinks.telegram = `@${telegramMatch[1]}`;
    }
    
    // Discord
    const discordMatch = description.match(/discord:?\s*(https?:\/\/[^\s]+)/i);
    if (discordMatch) {
      socialLinks.discord = discordMatch[1];
    }
    
    return socialLinks;
  };

  // Validator adresinden validator bilgisi bulma
  const getValidatorByAddress = (validatorAddress: string): ValidatorInfo | undefined => {
    return validators.find(v => v.address.toLowerCase() === validatorAddress.toLowerCase());
  };

  return {
    validators,
    totalStaked,
    isLoading,
    error,
    stake,
    claimRewards,
    getUserStake,
    calculateRewards,
    userStakes,
    fetchUserStakes,
    fetchTotalStaked,
    getValidatorByAddress
  };
}

// ABI veri kodlama/kod çözme fonksiyonları (gerçek uygulamada viem/ethers kullanılır)
const encodeAbiParameters = (abi: any, functionName: string, args: any[]) => {
  // Basitleştirilmiş versiyon - gerçek uygulamada viem/ethers kullanılır
  console.warn('ABI encoding not implemented, using placeholder');
  return '0x';
};

const decodeAbiResult = (abi: any, functionName: string, result: string) => {
  // Basitleştirilmiş versiyon - gerçek uygulamada viem/ethers kullanılır
  console.warn('ABI decoding not implemented, using placeholder');
  return null;
};