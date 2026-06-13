/**
 * Main PNP Wallet Hook
 * Provides easy access to wallet functionality
 */

import { usePNPWalletContext } from '../context/PNPWalletContext.jsx';

/**
 * Main hook for PNP Wallet functionality
 * @returns {object} Wallet state and actions
 */
export const usePNPWallet = () => {
  const context = usePNPWalletContext();

  // Return the complete context
  return context;
};

/**
 * Hook for wallet connection status
 * @returns {object} Connection state only
 */
export const useWalletConnection = () => {
  const { 
    isConnected, 
    isLoading, 
    currentWallet, 
    availableWallets, 
    account, 
    error,
    connectWallet,
    disconnect,
    clearError 
  } = usePNPWalletContext();

  return {
    isConnected,
    isLoading,
    currentWallet,
    availableWallets,
    account,
    error,
    connectWallet,
    disconnect,
    clearError
  };
};

/**
 * Hook for token operations
 * @returns {object} Token state and actions
 */
export const useTokenOperations = () => {
  const {
    tokens,
    balances,
    selectedToken,
    addToken,
    removeToken,
    switchToken,
    refreshBalance,
    refreshAllBalances,
    transferTokens,
    isLoading,
    error,
    clearError
  } = usePNPWalletContext();

  return {
    tokens,
    balances,
    selectedToken,
    addToken,
    removeToken,
    switchToken,
    refreshBalance,
    refreshAllBalances,
    transferTokens,
    isLoading,
    error,
    clearError
  };
};

/**
 * Hook for current wallet info
 * @returns {object} Current wallet information
 */
export const useCurrentWallet = () => {
  const { 
    isConnected, 
    currentWallet, 
    account,
    availableWallets 
  } = usePNPWalletContext();

  // Get current wallet details
  const walletDetails = availableWallets.find(w => w.id === currentWallet);

  return {
    isConnected,
    walletId: currentWallet,
    walletName: walletDetails?.name || currentWallet,
    walletIcon: walletDetails?.icon,
    account,
    principal: account?.owner?.toText(),
    principalShort: account?.owner?.toText()?.slice(0, 5) + '...' + account?.owner?.toText()?.slice(-3)
  };
};

/**
 * Hook for selected token info
 * @returns {object} Selected token information
 */
export const useSelectedToken = () => {
  const { 
    tokens, 
    balances, 
    selectedToken, 
    switchToken 
  } = usePNPWalletContext();

  const token = tokens.find(t => t.canisterId === selectedToken);
  const balance = balances[selectedToken];

  return {
    token,
    balance,
    canisterId: selectedToken,
    symbol: token?.symbol,
    name: token?.name,
    decimals: token?.decimals,
    logo: token?.logo,
    switchToken
  };
};

export default usePNPWallet;