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

export function useStakeHub() {
  // Kontrat adresini .env dosyasından al
  const contractAddress = process.env.NEXT_PUBLIC_STAKEHUB_CONTRACT as `0x${string}` | undefined;
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [validators, setValidators] = useState<ValidatorInfo[]>([]);
  const [totalStaked, setTotalStaked] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Validatörleri yükle
  useEffect(() => {
    const loadValidators = async () => {
      if (!validatorCount || !isConnected || !contractAddress) {
        return;
      }

      try {
        setIsLoading(true);
        const loadedValidators = [];
        
        for (let i = 0; i < Number(validatorCount); i++) {
          const validatorInfo = await readValidatorInfo(i);
          if (validatorInfo) {
            loadedValidators.push(validatorInfo);
          }
        }
        
        setValidators(loadedValidators);
        setIsLoading(false);
      } catch (err) {
        console.error('Validator yükleme hatası:', err);
        setError('Validator bilgileri yüklenemedi');
        setIsLoading(false);
      }
    };

    loadValidators();
  }, [validatorCount, isConnected, contractAddress]);

  // Toplam stake edileni güncelle
  useEffect(() => {
    if (totalStakedData) {
      setTotalStaked(formatEther(totalStakedData as bigint));
    }
  }, [totalStakedData]);

  // Validator bilgisini oku
  const readValidatorInfo = async (index: number): Promise<ValidatorInfo | null> => {
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
  const getSocialLinks = (description: string) => {
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

  return {
    validators,
    totalStaked,
    isLoading,
    error,
    stake,
    claimRewards,
    getUserStake,
    calculateRewards
  };
}

// Bu satırı yoruma alın eğer zaten harici olarak tanımlanmışsa
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