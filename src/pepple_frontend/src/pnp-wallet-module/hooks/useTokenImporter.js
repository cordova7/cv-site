/**
 * Token Importer Hook
 * Provides functionality for importing new tokens
 */

import { useState, useCallback } from 'react';
import { usePNPWalletContext } from '../context/PNPWalletContext.jsx';
import { validateCanisterId, validateTokenSymbol } from '../utils/validators.js';

/**
 * Hook for importing new tokens
 * @returns {object} Import state and actions
 */
export const useTokenImporter = () => {
  const { addToken, tokens } = usePNPWalletContext();

  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState(null);
  const [importSuccess, setImportSuccess] = useState(null);

  /**
   * Check if token already exists
   */
  const tokenExists = useCallback((canisterId) => {
    return tokens.some(token => token.canisterId === canisterId);
  }, [tokens]);

  /**
   * Import token with just canister ID (auto-fetch metadata)
   */
  const importTokenByCanisterId = useCallback(async (canisterId, symbol = '') => {
    try {
      setIsImporting(true);
      setImportError(null);
      setImportSuccess(null);

      // Validate canister ID
      const canisterValidation = validateCanisterId(canisterId);
      if (!canisterValidation.valid) {
        throw new Error(canisterValidation.error);
      }

      // Check if token already exists
      if (tokenExists(canisterId)) {
        throw new Error('Token already exists in your wallet');
      }

      // Validate symbol if provided
      if (symbol) {
        const symbolValidation = validateTokenSymbol(symbol);
        if (!symbolValidation.valid) {
          throw new Error(symbolValidation.error);
        }
        symbol = symbolValidation.symbol;
      }

      console.log(`Importing token: ${canisterId}${symbol ? ` (${symbol})` : ''}`);

      // Add token - metadata will be auto-fetched
      const newToken = await addToken({
        canisterId: canisterId.trim(),
        symbol: symbol || 'UNKNOWN',
        addedBy: 'user'
      });

      setImportSuccess(`Successfully imported ${newToken.symbol} (${newToken.name})`);
      console.log('Token imported successfully:', newToken);

      return newToken;
    } catch (error) {
      console.error('Token import failed:', error);
      setImportError(error.message);
      throw error;
    } finally {
      setIsImporting(false);
    }
  }, [addToken, tokenExists]);

  /**
   * Import token with full configuration
   */
  const importTokenWithConfig = useCallback(async (tokenConfig) => {
    try {
      setIsImporting(true);
      setImportError(null);
      setImportSuccess(null);

      // Check if token already exists
      if (tokenExists(tokenConfig.canisterId)) {
        throw new Error('Token already exists in your wallet');
      }

      console.log('Importing token with config:', tokenConfig);

      const newToken = await addToken({
        ...tokenConfig,
        addedBy: 'user'
      });

      setImportSuccess(`Successfully imported ${newToken.symbol} (${newToken.name})`);
      console.log('Token imported successfully:', newToken);

      return newToken;
    } catch (error) {
      console.error('Token import failed:', error);
      setImportError(error.message);
      throw error;
    } finally {
      setIsImporting(false);
    }
  }, [addToken, tokenExists]);

  /**
   * Validate token input before import
   */
  const validateTokenInput = useCallback((canisterId, symbol = '') => {
    const errors = [];

    // Validate canister ID
    const canisterValidation = validateCanisterId(canisterId);
    if (!canisterValidation.valid) {
      errors.push(canisterValidation.error);
    }

    // Check if token already exists
    if (canisterValidation.valid && tokenExists(canisterId)) {
      errors.push('Token already exists in your wallet');
    }

    // Validate symbol if provided
    if (symbol) {
      const symbolValidation = validateTokenSymbol(symbol);
      if (!symbolValidation.valid) {
        errors.push(symbolValidation.error);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      error: errors.join(', ')
    };
  }, [tokenExists]);

  /**
   * Get suggested tokens (common IC tokens)
   */
  const getSuggestedTokens = useCallback(() => {
    // Common IC ecosystem tokens (these would be real canister IDs in production)
    const suggestions = [
      {
        canisterId: 'rdmx6-jaaaa-aaaaa-aaadq-cai',
        symbol: 'ckBTC',
        name: 'Chain Key Bitcoin',
        description: 'Bitcoin on Internet Computer'
      },
      {
        canisterId: 'ss2fx-dyaaa-aaaar-qacoq-cai',
        symbol: 'ckETH',
        name: 'Chain Key Ethereum',
        description: 'Ethereum on Internet Computer'
      },
      {
        canisterId: 'xnjd7-iaaaa-aaaar-qabmq-cai',
        symbol: 'ckUSDC',
        name: 'Chain Key USDC',
        description: 'USD Coin on Internet Computer'
      }
    ];

    // Filter out tokens that are already added
    return suggestions.filter(token => !tokenExists(token.canisterId));
  }, [tokenExists]);

  /**
   * Clear messages
   */
  const clearMessages = useCallback(() => {
    setImportError(null);
    setImportSuccess(null);
  }, []);

  /**
   * Quick import from suggestion
   */
  const importSuggested = useCallback(async (suggestion) => {
    return await importTokenWithConfig(suggestion);
  }, [importTokenWithConfig]);

  return {
    // State
    isImporting,
    importError,
    importSuccess,

    // Actions
    importTokenByCanisterId,
    importTokenWithConfig,
    importSuggested,
    validateTokenInput,
    clearMessages,

    // Utilities
    tokenExists,
    getSuggestedTokens,
    suggestedTokens: getSuggestedTokens()
  };
};

/**
 * Hook for token search/discovery
 * @returns {object} Search functionality
 */
export const useTokenSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  /**
   * Search for tokens (placeholder - would integrate with token registry)
   */
  const searchTokens = useCallback(async (query) => {
    try {
      setIsSearching(true);
      setSearchQuery(query);

      // Placeholder search - in production this would query a token registry
      // For now, just return empty results
      const results = [];
      
      setSearchResults(results);
      return results;
    } catch (error) {
      console.error('Token search failed:', error);
      setSearchResults([]);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  /**
   * Clear search
   */
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  return {
    searchQuery,
    searchResults,
    isSearching,
    searchTokens,
    clearSearch
  };
};

/**
 * Hook for token verification
 * @returns {object} Verification functions
 */
export const useTokenVerification = () => {
  /**
   * Check if token is verified (community verified)
   */
  const isTokenVerified = useCallback((canisterId) => {
    // Placeholder - in production this would check against a verified token list
    const verifiedTokens = [
      'ryjl3-tyaaa-aaaaa-aaaba-cai', // ICP
      'rdmx6-jaaaa-aaaaa-aaadq-cai', // ckBTC
      'ss2fx-dyaaa-aaaar-qacoq-cai', // ckETH
    ];

    return verifiedTokens.includes(canisterId);
  }, []);

  /**
   * Get verification status with details
   */
  const getVerificationStatus = useCallback((token) => {
    const isVerified = isTokenVerified(token.canisterId);
    
    return {
      verified: isVerified,
      level: isVerified ? 'community' : 'unverified',
      warning: !isVerified ? 'This token is not community verified. Please verify the canister ID before adding.' : null
    };
  }, [isTokenVerified]);

  return {
    isTokenVerified,
    getVerificationStatus
  };
};

export default useTokenImporter;