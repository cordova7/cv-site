/**
 * PNP Wallet Context - React Context for wallet state management
 */

import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';

// Create the context
const PNPWalletContext = createContext(null);

// Context value shape for prop validation
const contextValueShape = {
  // Connection State
  isConnected: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  currentWallet: PropTypes.string,
  availableWallets: PropTypes.array.isRequired,
  account: PropTypes.object,
  error: PropTypes.string,

  // Token State
  tokens: PropTypes.array.isRequired,
  balances: PropTypes.object.isRequired,
  selectedToken: PropTypes.string,

  // Wallet Actions
  connectWallet: PropTypes.func.isRequired,
  disconnect: PropTypes.func.isRequired,
  
  // Token Actions
  addToken: PropTypes.func.isRequired,
  removeToken: PropTypes.func.isRequired,
  switchToken: PropTypes.func.isRequired,
  refreshBalance: PropTypes.func.isRequired,
  refreshAllBalances: PropTypes.func.isRequired,
  
  // Transfer Actions
  transferTokens: PropTypes.func.isRequired,
  
  // Utility Actions
  clearError: PropTypes.func.isRequired,
  resetState: PropTypes.func.isRequired
};

/**
 * Hook to use PNP Wallet Context
 * @returns {object} Context value
 */
export const usePNPWalletContext = () => {
  const context = useContext(PNPWalletContext);
  
  if (!context) {
    throw new Error('usePNPWalletContext must be used within a PNPWalletProvider');
  }

  // Validate context shape in development
  if (process.env.NODE_ENV === 'development') {
    const validateProp = (key, value, expectedType) => {
      if (expectedType === PropTypes.func && typeof value !== 'function') {
        console.warn(`PNPWalletContext.${key} should be a function, got ${typeof value}`);
      } else if (expectedType === PropTypes.bool && typeof value !== 'boolean') {
        console.warn(`PNPWalletContext.${key} should be a boolean, got ${typeof value}`);
      } else if (expectedType === PropTypes.string && value !== null && typeof value !== 'string') {
        console.warn(`PNPWalletContext.${key} should be a string or null, got ${typeof value}`);
      } else if (expectedType === PropTypes.array && !Array.isArray(value)) {
        console.warn(`PNPWalletContext.${key} should be an array, got ${typeof value}`);
      } else if (expectedType === PropTypes.object && value !== null && typeof value !== 'object') {
        console.warn(`PNPWalletContext.${key} should be an object or null, got ${typeof value}`);
      }
    };

    // Validate key properties
    validateProp('isConnected', context.isConnected, PropTypes.bool);
    validateProp('isLoading', context.isLoading, PropTypes.bool);
    validateProp('availableWallets', context.availableWallets, PropTypes.array);
    validateProp('tokens', context.tokens, PropTypes.array);
    validateProp('balances', context.balances, PropTypes.object);
    validateProp('connectWallet', context.connectWallet, PropTypes.func);
    validateProp('disconnect', context.disconnect, PropTypes.func);
    validateProp('addToken', context.addToken, PropTypes.func);
    validateProp('transferTokens', context.transferTokens, PropTypes.func);
  }

  return context;
};

/**
 * PNP Wallet Context Provider Component
 */
export const PNPWalletContextProvider = ({ children, value }) => {
  return (
    <PNPWalletContext.Provider value={value}>
      {children}
    </PNPWalletContext.Provider>
  );
};

PNPWalletContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.shape(contextValueShape).isRequired
};

export default PNPWalletContext;