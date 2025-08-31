import React, { useState } from 'react';
import { ChevronDown, Globe, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useNetwork, NETWORK_CONFIGS } from '@/contexts/NetworkContext';
import type { NetworkType } from '@/contexts/NetworkContext';

export const NetworkSelector: React.FC = () => {
  const { currentNetwork, setNetwork } = useNetwork();
  const [isOpen, setIsOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleNetworkSelect = (networkType: NetworkType) => {
    if (networkType === 'custom') {
      setShowCustomInput(true);
      return;
    }
    
    setNetwork(networkType);
    setIsOpen(false);
    setShowCustomInput(false);
  };

  const handleCustomUrlSubmit = () => {
    if (customUrl.trim()) {
      setNetwork('custom', customUrl.trim());
      setIsOpen(false);
      setShowCustomInput(false);
      setCustomUrl('');
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-green-500/30 hover:bg-gray-100 dark:hover:bg-black text-gray-900 dark:text-green-300 transition-colors duration-300"
      >
        <div className={`w-2 h-2 rounded-full ${
          currentNetwork.type === 'mainnet-beta' ? 'bg-green-500' :
          currentNetwork.type === 'devnet' ? 'bg-green-400' :
          currentNetwork.type === 'testnet' ? 'bg-green-300' :
          currentNetwork.type === 'localnet' ? 'bg-green-600' : 'bg-green-500'
        }`}></div>
        <span className="text-sm font-medium">
          {currentNetwork.name}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-green-400" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-green-500/30 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Globe className="w-4 h-4 text-gray-500 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-green-300">Select Network</span>
            </div>
            
            <div className="space-y-2">
              {Object.values(NETWORK_CONFIGS).filter(config => config.type !== 'custom').map((network) => (
                <button
                  key={network.type}
                  onClick={() => handleNetworkSelect(network.type)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-black transition-colors ${
                    currentNetwork.type === network.type 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500' 
                      : 'border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      network.type === 'mainnet-beta' ? 'bg-green-500' :
                      network.type === 'devnet' ? 'bg-green-400' :
                      network.type === 'testnet' ? 'bg-green-300' : 'bg-green-600'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-green-300">
                      {network.name}
                    </span>
                  </div>
                  {currentNetwork.type === network.type && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                      Active
                    </Badge>
                  )}
                </button>
              ))}
              
              {/* Custom RPC Option */}
              <div className="border-t border-gray-200 dark:border-green-500/30 pt-2 mt-2">
                {!showCustomInput ? (
                  <button
                    onClick={() => setShowCustomInput(true)}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-black transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-500 dark:text-green-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-green-300">
                      Custom RPC URL
                    </span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Settings className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Custom RPC URL
                      </span>
                    </div>
                    <Input
                      placeholder="https://your-rpc-url.com"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      className="text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && handleCustomUrlSubmit()}
                    />
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={handleCustomUrlSubmit}
                        disabled={!customUrl.trim()}
                        className="flex-1"
                      >
                        Connect
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowCustomInput(false);
                          setCustomUrl('');
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setIsOpen(false);
            setShowCustomInput(false);
            setCustomUrl('');
          }}
        />
      )}
    </div>
  );
};
