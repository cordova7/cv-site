/**
 * Token Balance Hook
 * Provides token balance management and formatting
 */

import { useState, useEffect, useCallback } from 'react';
import { usePNPWalletContext } from '../context/PNPWalletContext.jsx';
import { formatTokenAmount, formatBalance } from '../utils/tokenFormatters.js';

/**
 * Hook for managing token balances
 * @param {string} canisterId - Token canister ID
 * @returns {object} Balance state and actions
 */
export const useTokenBalance = (canisterId) => {
  const { 
    tokens, 
    balances, 
    refreshBalance, 
    isConnected, 
    account 
  } = usePNPWalletContext();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  const token = tokens.find(t => t.canisterId === canisterId);
  const balance = balances[canisterId];

  /**
   * Refresh balance for this token
   */
  const refresh = useCallback(async () => {
    if (!isConnected || !canisterId) return;

    try {
      setIsRefreshing(true);
      await refreshBalance(canisterId);
      setLastRefresh(Date.now());
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isConnected, canisterId, refreshBalance]);

  /**
   * Get formatted balance
   */
  const getFormattedBalance = useCallback((displayDecimals) => {
    if (!token || balance === null || balance === undefined) {
      return '...';
    }

    return formatBalance(balance, token.decimals, displayDecimals);
  }, [token, balance]);

  /**
   * Get balance in human readable format
   */
  const getHumanBalance = useCallback(() => {
    if (!token || balance === null || balance === undefined) {
      return null;
    }

    return parseFloat(formatTokenAmount(balance, token.decimals, token.decimals));
  }, [token, balance]);

  /**
   * Check if balance is sufficient for amount
   */
  const isSufficientBalance = useCallback((amount) => {
    if (!token || balance === null || balance === undefined) {
      return false;
    }

    const amountBigInt = typeof amount === 'string' || typeof amount === 'number' 
      ? BigInt(Math.floor(parseFloat(amount) * (10 ** token.decimals)))
      : BigInt(amount);

    return BigInt(balance) >= amountBigInt;
  }, [token, balance]);

  /**
   * Auto-refresh balance on connection
   */
  useEffect(() => {
    if (isConnected && canisterId && !balance && !isRefreshing) {
      refresh();
    }
  }, [isConnected, canisterId, balance, isRefreshing, refresh]);

  return {
    // State
    balance,
    token,
    isRefreshing,
    lastRefresh,
    isLoaded: balance !== null && balance !== undefined,

    // Formatted values
    formatted: getFormattedBalance(),
    formattedWithSymbol: token ? `${getFormattedBalance()} ${token.symbol}` : '...',
    humanReadable: getHumanBalance(),

    // Actions
    refresh,
    isSufficientBalance,
    getFormattedBalance
  };
};

/**
 * Hook for all token balances
 * @returns {object} All balances state and actions
 */
export const useAllTokenBalances = () => {
  const { 
    tokens, 
    balances, 
    refreshAllBalances, 
    isConnected 
  } = usePNPWalletContext();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  /**
   * Refresh all balances
   */
  const refreshAll = useCallback(async () => {
    if (!isConnected) return;

    try {
      setIsRefreshing(true);
      await refreshAllBalances();
      setLastRefresh(Date.now());
    } catch (error) {
      console.error('Failed to refresh all balances:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isConnected, refreshAllBalances]);

  /**
   * Get formatted balances for all tokens
   */
  const getFormattedBalances = useCallback(() => {
    const formatted = {};
    
    tokens.forEach(token => {
      const balance = balances[token.canisterId];
      if (balance !== null && balance !== undefined) {
        formatted[token.canisterId] = {
          raw: balance,
          formatted: formatBalance(balance, token.decimals),
          withSymbol: `${formatBalance(balance, token.decimals)} ${token.symbol}`,
          humanReadable: parseFloat(formatTokenAmount(balance, token.decimals, token.decimals))
        };
      } else {
        formatted[token.canisterId] = {
          raw: null,
          formatted: '...',
          withSymbol: `... ${token.symbol}`,
          humanReadable: null
        };
      }
    });

    return formatted;
  }, [tokens, balances]);

  /**
   * Get total value across all tokens (requires price data)
   */
  const getTotalValue = useCallback((prices = {}) => {
    let total = 0;
    
    tokens.forEach(token => {
      const balance = balances[token.canisterId];
      const price = prices[token.canisterId] || 0;
      
      if (balance && price) {
        const humanBalance = parseFloat(formatTokenAmount(balance, token.decimals, token.decimals));
        total += humanBalance * price;
      }
    });

    return total;
  }, [tokens, balances]);

  return {
    // State
    balances,
    isRefreshing,
    lastRefresh,
    totalTokens: tokens.length,
    loadedBalances: Object.keys(balances).length,

    // Formatted data
    formattedBalances: getFormattedBalances(),

    // Actions
    refreshAll,
    getTotalValue
  };
};

/**
 * Hook for balance validation
 * @param {string} canisterId - Token canister ID
 * @returns {object} Validation functions
 */
export const useBalanceValidation = (canisterId) => {
  const { balance, token } = useTokenBalance(canisterId);

  /**
   * Validate if amount can be sent
   */
  const validateAmount = useCallback((amount, includeFees = true) => {
    if (!token || balance === null || balance === undefined) {
      return { valid: false, error: 'Balance not loaded' };
    }

    if (!amount || parseFloat(amount) <= 0) {
      return { valid: false, error: 'Amount must be greater than 0' };
    }

    const amountBigInt = BigInt(Math.floor(parseFloat(amount) * (10 ** token.decimals)));
    const fees = includeFees ? (token.fees || BigInt(0)) : BigInt(0);
    const required = amountBigInt + fees;

    if (BigInt(balance) < required) {
      const availableFormatted = formatBalance(balance, token.decimals);
      const requiredFormatted = formatTokenAmount(required, token.decimals, token.decimals);
      
      return { 
        valid: false, 
        error: `Insufficient balance. Available: ${availableFormatted}, Required: ${requiredFormatted} ${token.symbol}` 
      };
    }

    return { valid: true, amountBigInt, fees };
  }, [token, balance]);

  /**
   * Get maximum sendable amount
   */
  const getMaxSendable = useCallback(() => {
    if (!token || balance === null || balance === undefined) {
      return '0';
    }

    const fees = token.fees || BigInt(0);
    const maxBigInt = BigInt(balance) - fees;
    
    if (maxBigInt <= 0) {
      return '0';
    }

    return formatTokenAmount(maxBigInt, token.decimals, token.decimals);
  }, [token, balance]);

  return {
    validateAmount,
    getMaxSendable,
    hasBalance: balance !== null && balance !== undefined && BigInt(balance) > 0,
    canPayFees: balance !== null && balance !== undefined && BigInt(balance) > (token?.fees || BigInt(0))
  };
};

export default useTokenBalance;