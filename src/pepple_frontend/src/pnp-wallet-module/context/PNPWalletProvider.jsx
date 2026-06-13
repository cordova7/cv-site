/**
 * PNP Wallet Provider - Main provider component with state management
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { PNPWalletContextProvider } from './PNPWalletContext.jsx';
import PNPManager from '../core/PNPManager.js';
import TokenManager from '../core/TokenManager.js';
import { NETWORKS, DEFAULT_HOSTS, CANISTER_IDS } from '../utils/constants.js';
import { validateTransferParams } from '../utils/validators.js';

/**
 * PNP Wallet Provider Component
 */
export const PNPWalletProvider = ({ 
  children, 
  network = NETWORKS.IC, 
  host, 
  derivationOrigin,
  delegationTargets = [CANISTER_IDS.ICP_LEDGER],
  debug = false 
}) => {
  // Core managers
  const pnpManagerRef = useRef(null);
  const tokenManagerRef = useRef(null);
  
  // Connection State
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentWallet, setCurrentWallet] = useState(null);
  const [availableWallets, setAvailableWallets] = useState([]);
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);

  // Token State
  const [tokens, setTokens] = useState([]);
  const [balances, setBalances] = useState({});
  const [selectedToken, setSelectedToken] = useState(CANISTER_IDS.ICP_LEDGER);

  // Initialization flag
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Initialize managers
   */
  const initializeManagers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Initializing PNP Wallet Provider...');

      // Determine host URL
      const hostUrl = host || DEFAULT_HOSTS[network];

      // Initialize PNP Manager
      if (!pnpManagerRef.current) {
        pnpManagerRef.current = new PNPManager({
          network,
          host: hostUrl,
          derivationOrigin: derivationOrigin || (typeof window !== 'undefined' ? window.location.origin : ''),
          delegationTargets,
          debug
        });
      }

      await pnpManagerRef.current.initialize();

      // Initialize Token Manager
      if (!tokenManagerRef.current) {
        tokenManagerRef.current = new TokenManager(network, hostUrl);
      } else {
        tokenManagerRef.current.updateNetwork(network, hostUrl);
      }

      // Get available wallets
      const wallets = pnpManagerRef.current.getAvailableWallets();
      setAvailableWallets(wallets);

      // Get available tokens
      const availableTokens = tokenManagerRef.current.getAllTokens();
      setTokens(availableTokens);

      setIsInitialized(true);
      console.log('PNP Wallet Provider initialized successfully');

    } catch (error) {
      console.error('Failed to initialize PNP Wallet Provider:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [network, host, derivationOrigin, delegationTargets, debug]);

  /**
   * Connect to wallet
   */
  const connectWallet = useCallback(async (walletId, options = {}) => {
    if (!pnpManagerRef.current || !isInitialized) {
      throw new Error('PNP Manager not initialized');
    }

    try {
      setIsLoading(true);
      setError(null);

      const connection = await pnpManagerRef.current.connectWallet(walletId, options);
      
      setCurrentWallet(connection.walletId);
      setAccount(connection.account);
      setIsConnected(true);

      console.log(`Connected to ${connection.walletId} wallet:`, connection.principal);

      // Refresh balances for all tokens
      await refreshAllBalances(connection.account, connection.principal);

      return connection;
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(async () => {
    if (!pnpManagerRef.current) return;

    try {
      setIsLoading(true);
      
      await pnpManagerRef.current.disconnect();
      
      // Reset connection state
      setIsConnected(false);
      setCurrentWallet(null);
      setAccount(null);
      setBalances({});
      setError(null);

      console.log('Wallet disconnected successfully');
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Add new token
   */
  const addToken = useCallback(async (tokenConfig) => {
    if (!tokenManagerRef.current) {
      throw new Error('Token Manager not initialized');
    }

    try {
      setIsLoading(true);
      setError(null);

      const newToken = await tokenManagerRef.current.addToken(tokenConfig);
      
      // Update tokens list
      const updatedTokens = tokenManagerRef.current.getAllTokens();
      setTokens(updatedTokens);

      // Fetch balance if wallet is connected
      if (isConnected && account) {
        await refreshBalance(newToken.canisterId, account, account.owner.toText());
      }

      console.log('Token added successfully:', newToken.symbol);
      return newToken;
    } catch (error) {
      console.error('Failed to add token:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account]);

  /**
   * Remove token
   */
  const removeToken = useCallback(async (canisterId) => {
    if (!tokenManagerRef.current) {
      throw new Error('Token Manager not initialized');
    }

    try {
      await tokenManagerRef.current.removeToken(canisterId);
      
      // Update tokens list
      const updatedTokens = tokenManagerRef.current.getAllTokens();
      setTokens(updatedTokens);

      // Remove balance
      setBalances(prev => {
        const updated = { ...prev };
        delete updated[canisterId];
        return updated;
      });

      // Change selected token if removed token was selected
      if (selectedToken === canisterId) {
        setSelectedToken(CANISTER_IDS.ICP_LEDGER);
      }

      console.log('Token removed successfully');
      return true;
    } catch (error) {
      console.error('Failed to remove token:', error);
      setError(error.message);
      throw error;
    }
  }, [selectedToken]);

  /**
   * Switch selected token
   */
  const switchToken = useCallback((canisterId) => {
    const token = tokenManagerRef.current?.getToken(canisterId);
    if (token) {
      setSelectedToken(canisterId);
      console.log(`Switched to token: ${token.symbol}`);
    } else {
      console.warn('Token not found:', canisterId);
    }
  }, []);

  /**
   * Refresh balance for specific token
   */
  const refreshBalance = useCallback(async (canisterId, userAccount, principalText) => {
    if (!tokenManagerRef.current || !userAccount) return;

    try {
      const balance = await tokenManagerRef.current.getBalance(
        canisterId, 
        principalText, 
        userAccount.identity || userAccount
      );

      setBalances(prev => ({
        ...prev,
        [canisterId]: balance
      }));

      return balance;
    } catch (error) {
      console.error(`Failed to refresh balance for ${canisterId}:`, error);
      // Don't set global error for individual balance failures
    }
  }, []);

  /**
   * Refresh all token balances
   */
  const refreshAllBalances = useCallback(async (userAccount, principalText) => {
    if (!tokenManagerRef.current || !userAccount || !principalText) return;

    try {
      const allTokens = tokenManagerRef.current.getAllTokens();
      
      // Refresh balances in parallel
      const balancePromises = allTokens.map(async (token) => {
        try {
          const balance = await tokenManagerRef.current.getBalance(
            token.canisterId,
            principalText,
            userAccount.identity || userAccount
          );
          return { canisterId: token.canisterId, balance };
        } catch (error) {
          console.warn(`Failed to fetch balance for ${token.symbol}:`, error);
          return { canisterId: token.canisterId, balance: null };
        }
      });

      const results = await Promise.all(balancePromises);
      
      // Update balances state
      const newBalances = {};
      results.forEach(({ canisterId, balance }) => {
        if (balance !== null) {
          newBalances[canisterId] = balance;
        }
      });

      setBalances(prev => ({ ...prev, ...newBalances }));
      console.log('All balances refreshed');
    } catch (error) {
      console.error('Failed to refresh all balances:', error);
    }
  }, []);

  /**
   * Transfer tokens
   */
  const transferTokens = useCallback(async (params) => {
    if (!tokenManagerRef.current || !account) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Validate transfer parameters
      const validation = validateTransferParams(params);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const result = await tokenManagerRef.current.transferTokens({
        ...params,
        identity: account.identity || account
      });

      // Refresh balance after successful transfer
      if ('Ok' in result && account) {
        await refreshBalance(params.canisterId, account, account.owner.toText());
      }

      console.log('Token transfer completed:', result);
      return result;
    } catch (error) {
      console.error('Token transfer failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [account, refreshBalance]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset all state
   */
  const resetState = useCallback(() => {
    setIsConnected(false);
    setCurrentWallet(null);
    setAccount(null);
    setBalances({});
    setSelectedToken(CANISTER_IDS.ICP_LEDGER);
    setError(null);
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeManagers();
  }, [initializeManagers]);

  // Context value
  const contextValue = {
    // Connection State
    isConnected,
    isLoading,
    currentWallet,
    availableWallets,
    account,
    error,

    // Token State
    tokens,
    balances,
    selectedToken,

    // Wallet Actions
    connectWallet,
    disconnect,

    // Token Actions
    addToken,
    removeToken,
    switchToken,
    refreshBalance: (canisterId) => refreshBalance(canisterId, account, account?.owner?.toText()),
    refreshAllBalances: () => refreshAllBalances(account, account?.owner?.toText()),

    // Transfer Actions
    transferTokens,

    // Utility Actions
    clearError,
    resetState
  };

  return (
    <PNPWalletContextProvider value={contextValue}>
      {children}
    </PNPWalletContextProvider>
  );
};

PNPWalletProvider.propTypes = {
  children: PropTypes.node.isRequired,
  network: PropTypes.oneOf([NETWORKS.IC, NETWORKS.LOCAL]),
  host: PropTypes.string,
  derivationOrigin: PropTypes.string,
  delegationTargets: PropTypes.arrayOf(PropTypes.string),
  debug: PropTypes.bool
};

export default PNPWalletProvider;