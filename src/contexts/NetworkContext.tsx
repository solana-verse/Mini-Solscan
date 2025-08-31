import React, { createContext, useContext, useState } from 'react';

export type NetworkType = 'devnet' | 'testnet' | 'mainnet-beta' | 'localnet' | 'custom';

export interface NetworkConfig {
  type: NetworkType;
  name: string;
  url: string;
  color: string;
}

export const NETWORK_CONFIGS: Record<NetworkType, NetworkConfig> = {
  'mainnet-beta': {
    type: 'mainnet-beta',
    name: 'Mainnet Beta',
    url: 'https://api.mainnet-beta.solana.com',
    color: 'text-green-600'
  },
  'devnet': {
    type: 'devnet',
    name: 'Devnet',
    url: 'https://api.devnet.solana.com',
    color: 'text-blue-600'
  },
  'testnet': {
    type: 'testnet',
    name: 'Testnet',
    url: 'https://api.testnet.solana.com',
    color: 'text-purple-600'
  },
  'localnet': {
    type: 'localnet',
    name: 'Localnet',
    url: 'http://127.0.0.1:8899',
    color: 'text-orange-600'
  },
  'custom': {
    type: 'custom',
    name: 'Custom RPC',
    url: '',
    color: 'text-gray-600'
  }
};

interface NetworkContextType {
  currentNetwork: NetworkConfig;
  setNetwork: (network: NetworkType, customUrl?: string) => void;
  isCustomNetwork: boolean;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentNetwork, setCurrentNetwork] = useState<NetworkConfig>(() => {
    const stored = localStorage.getItem('selectedNetwork') as NetworkType;
    const customUrl = localStorage.getItem('customRpcUrl');
    
    if (stored === 'custom' && customUrl) {
      return { ...NETWORK_CONFIGS.custom, url: customUrl };
    }
    
    return NETWORK_CONFIGS[stored] || NETWORK_CONFIGS.devnet;
  });

  const setNetwork = (network: NetworkType, customUrl?: string) => {
    let networkConfig = NETWORK_CONFIGS[network];
    
    if (network === 'custom' && customUrl) {
      networkConfig = { ...networkConfig, url: customUrl };
      localStorage.setItem('customRpcUrl', customUrl);
    }
    
    setCurrentNetwork(networkConfig);
    localStorage.setItem('selectedNetwork', network);
  };

  const isCustomNetwork = currentNetwork.type === 'custom';

  return (
    <NetworkContext.Provider value={{ currentNetwork, setNetwork, isCustomNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
