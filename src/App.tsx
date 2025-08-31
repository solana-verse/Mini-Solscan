import { useState } from 'react';
import { Search, Loader2, Copy, ExternalLink, Clock, User, Hash, DollarSign, Activity, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { NetworkSelector } from '@/components/NetworkSelector';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SolanaService } from '@/services/solana';
import { useNetwork } from '@/contexts/NetworkContext';
import type { TransactionState } from '@/types/transaction';

function App() {
  const [signature, setSignature] = useState('');
  const [state, setState] = useState<TransactionState>({
    transaction: null,
    loading: false,
    error: null,
  });
  const { currentNetwork } = useNetwork();

  // Validate signature format (base58, typically 88 characters)
  const isValidSignatureFormat = (sig: string) => {
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
    return sig.length >= 80 && sig.length <= 90 && base58Regex.test(sig);
  };

  const signatureStatus = signature.trim() ? 
    (isValidSignatureFormat(signature.trim()) ? 'valid' : 'invalid') : 'empty';

  const handleSearch = async () => {
    if (!signature.trim()) {
      setState(prev => ({ ...prev, error: 'Please enter a transaction signature' }));
      return;
    }

    if (!isValidSignatureFormat(signature.trim())) {
      setState(prev => ({ ...prev, error: 'Invalid signature format. Please enter a valid base58 transaction signature.' }));
      return;
    }

    setState({ transaction: null, loading: true, error: null });

    try {
      const transaction = await SolanaService.getTransaction(signature.trim(), currentNetwork);
      setState({ transaction, loading: false, error: null });
    } catch (error) {
      setState({
        transaction: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const LoadingSkeleton = () => (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-green-500/30 p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32 bg-gray-200 dark:bg-green-900/50" />
          <Skeleton className="h-4 w-48 bg-gray-200 dark:bg-green-900/50" />
        </div>
        <div className="mt-6 space-y-4">
          <Skeleton className="h-16 bg-gray-100 dark:bg-black rounded-lg" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-16 bg-gray-200 dark:bg-green-900/50" />
                <Skeleton className="h-6 bg-gray-200 dark:bg-green-900/50" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-green-500/30 p-6">
        <Skeleton className="h-6 w-40 bg-gray-200 dark:bg-green-900/50 mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 bg-gray-100 dark:bg-black rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );

  return (
      <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
        {/* Header */}
        <header className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-green-500/20 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  Mini Solscan
                </div>
                <NetworkSelector />
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Hero */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-green-400 mb-4 transition-colors duration-300">
            Explore Solana Transactions
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8 transition-colors duration-300">
            Enter a transaction signature to view detailed information about {currentNetwork.name} transactions
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <div className={`bg-white dark:bg-gray-800 rounded-2xl border-2 shadow-lg dark:shadow-green-500/10 focus-within:ring-4 transition-all duration-300 hover:shadow-xl dark:hover:shadow-green-500/20 ${
                signatureStatus === 'valid' 
                  ? 'border-green-500 dark:border-green-400 focus-within:border-green-500 dark:focus-within:border-green-400 focus-within:ring-green-500/20 dark:focus-within:ring-green-400/20' 
                  : signatureStatus === 'invalid'
                  ? 'border-red-400 dark:border-red-500 focus-within:border-red-400 dark:focus-within:border-red-500 focus-within:ring-red-400/20 dark:focus-within:ring-red-500/20'
                  : 'border-gray-200 dark:border-gray-700 focus-within:border-green-500 dark:focus-within:border-green-400 focus-within:ring-green-500/20 dark:focus-within:ring-green-400/20'
              }`}>
                <div className="flex items-center">
                  <div className="flex-1 relative">
                    <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                      signatureStatus === 'valid' ? 'text-green-500 dark:text-green-400' :
                      signatureStatus === 'invalid' ? 'text-red-400 dark:text-red-500' :
                      'text-gray-400 dark:text-gray-500'
                    }`} />
                    <Input
                      placeholder="Enter transaction signature (88 characters)"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="h-16 pl-12 pr-4 text-base border-0 focus:ring-0 focus:border-0 rounded-l-2xl bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-mono transition-colors duration-300"
                      disabled={state.loading}
                    />
                    
                    
                  </div>
                  <div className="px-2">
                    <Button
                      onClick={handleSearch}
                      disabled={state.loading || !signature.trim() || signatureStatus === 'invalid'}
                      className={`h-12 px-8 text-white rounded-xl border-0 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                        signatureStatus === 'valid' 
                          ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 dark:from-green-500 dark:to-green-600 dark:hover:from-green-400 dark:hover:to-green-500'
                          : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
                      }`}
                    >
                      {state.loading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Searching...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Search className="w-5 h-5" />
                          <span>Search</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Floating label effect */}
              {signature && (
                <div className={`absolute -top-2 left-4 px-2 bg-white dark:bg-gray-800 text-xs font-medium transition-all duration-300 ${
                  signatureStatus === 'valid' ? 'text-green-600 dark:text-green-400' :
                  signatureStatus === 'invalid' ? 'text-red-500 dark:text-red-400' :
                  'text-gray-600 dark:text-gray-400'
                }`}>
                  Transaction Signature {signatureStatus === 'valid' && '✓'} {signatureStatus === 'invalid' && '✗'}
                </div>
              )}
              
              {/* Character count */}
              {signature && (
                <div className="mt-2 text-center">
                  <span className={`text-xs font-mono transition-colors duration-300 ${
                    signatureStatus === 'valid' ? 'text-green-600 dark:text-green-400' :
                    signatureStatus === 'invalid' ? 'text-red-500 dark:text-red-400' :
                    'text-gray-500 dark:text-gray-400'
                  }`}>
                    {signature.length} characters {signatureStatus === 'valid' ? '(Valid format)' : signatureStatus === 'invalid' ? '(Invalid format)' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {state.error && (
          <div className="max-w-2xl mx-auto mb-8">
            <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 transition-colors duration-300">
              <XCircle className="w-4 h-4" />
              <AlertDescription className="font-medium">
                {state.error}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Loading State */}
        {state.loading && <LoadingSkeleton />}

        {/* Transaction Results */}
        {state.transaction && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Main Transaction Info */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-green-500/30 overflow-hidden transition-colors duration-300">
              <div className="bg-gray-100 dark:bg-black px-6 py-4 border-b border-gray-200 dark:border-green-500/30 transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-green-400 transition-colors duration-300">Transaction Details</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                      Block #{state.transaction.slot.toLocaleString()} • {state.transaction.timestamp}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {state.transaction.status === 'Success' ? (
                      <Badge className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-500 transition-colors duration-300">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Success
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-500 transition-colors duration-300">
                        <XCircle className="w-3 h-3 mr-1" />
                        Failed
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Signature */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-green-300 mb-2 transition-colors duration-300">
                    Transaction Signature
                  </label>
                  <div className="flex items-center bg-gray-100 dark:bg-black rounded-lg p-3 border border-gray-200 dark:border-green-500/30 transition-colors duration-300">
                    <code className="flex-1 text-sm font-mono text-gray-900 dark:text-green-300 break-all mr-3 transition-colors duration-300">
                      {state.transaction.signature}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(state.transaction!.signature)}
                      className="text-gray-500 hover:text-gray-700 dark:text-green-400 dark:hover:text-green-300 shrink-0 transition-colors duration-300"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Transaction Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-gray-100 dark:bg-black rounded-lg p-4 border border-gray-200 dark:border-green-500/30 transition-colors duration-300">
                    <div className="flex items-center mb-2">
                      <Clock className="w-4 h-4 text-gray-500 dark:text-green-400 mr-2 transition-colors duration-300" />
                      <span className="text-sm font-medium text-gray-700 dark:text-green-300 transition-colors duration-300">Timestamp</span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-green-300 font-mono transition-colors duration-300">{state.transaction.timestamp}</p>
                  </div>

                  <div className="bg-gray-100 dark:bg-black rounded-lg p-4 border border-gray-200 dark:border-green-500/30 transition-colors duration-300">
                    <div className="flex items-center mb-2">
                      <User className="w-4 h-4 text-gray-500 dark:text-green-400 mr-2 transition-colors duration-300" />
                      <span className="text-sm font-medium text-gray-700 dark:text-green-300 transition-colors duration-300">Fee Payer</span>
                    </div>
                    <div className="flex items-center">
                      <code className="text-sm font-mono text-gray-900 dark:text-green-300 mr-2 transition-colors duration-300">
                        {SolanaService.truncateAddress(state.transaction.signer)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(state.transaction!.signer)}
                        className="text-gray-400 hover:text-gray-600 dark:text-green-400 dark:hover:text-green-300 p-1 transition-colors duration-300"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gray-100 dark:bg-black rounded-lg p-4 border border-gray-200 dark:border-green-500/30 transition-colors duration-300">
                    <div className="flex items-center mb-2">
                      <Hash className="w-4 h-4 text-gray-500 dark:text-green-400 mr-2 transition-colors duration-300" />
                      <span className="text-sm font-medium text-gray-700 dark:text-green-300 transition-colors duration-300">Slot</span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-green-300 font-mono transition-colors duration-300">{state.transaction.slot.toLocaleString()}</p>
                  </div>

                  <div className="bg-gray-100 dark:bg-black rounded-lg p-4 border border-gray-200 dark:border-green-500/30 transition-colors duration-300">
                    <div className="flex items-center mb-2">
                      <DollarSign className="w-4 h-4 text-gray-500 dark:text-green-400 mr-2 transition-colors duration-300" />
                      <span className="text-sm font-medium text-gray-700 dark:text-green-300 transition-colors duration-300">Transaction Fee</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400 transition-colors duration-300">
                        {SolanaService.formatSol(state.transaction.fee)} SOL
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">{state.transaction.fee.toLocaleString()} lamports</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-green-500/30 overflow-hidden transition-colors duration-300">
              <div className="bg-gray-100 dark:bg-black px-6 py-4 border-b border-gray-200 dark:border-green-500/30 transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-green-400 transition-colors duration-300">Program Instructions</h3>
                  <Badge className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-500 transition-colors duration-300">
                    <Activity className="w-3 h-3 mr-1" />
                    {state.transaction.instructions.length} Instructions
                  </Badge>
                </div>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-green-500/30">
                {state.transaction.instructions.map((instruction, index) => (
                  <div key={index} className="p-6 hover:bg-gray-100 dark:hover:bg-black/50 transition-colors duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-green-600 dark:bg-green-500 text-white rounded-lg flex items-center justify-center text-sm font-semibold shrink-0 transition-colors duration-300">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white transition-colors duration-300">{instruction.programName}</h4>
                            <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 transition-colors duration-300">
                              {instruction.type}
                            </Badge>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 transition-colors duration-300">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">Program ID:</span>
                                <code className="text-xs font-mono text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-600 px-2 py-1 rounded border border-gray-200 dark:border-gray-500 transition-colors duration-300">
                                  {SolanaService.truncateAddress(instruction.programId)}
                                </code>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(instruction.programId)}
                                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1 transition-colors duration-300"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-300">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-green-500/20 mt-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
              <span>Built with React + TypeScript</span>
              <span>•</span>
              <span>Powered by @solana/web3.js</span>
              <span>•</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-green-600 dark:text-green-400 font-medium transition-colors duration-300">{currentNetwork.name}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
