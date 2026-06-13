/**
 * PNP Wallet Module - Main Export
 * Isolated, portable PNP wallet system for Internet Computer
 */

// Core Management
export { default as PNPManager } from './core/PNPManager.js';
export { default as TokenManager } from './core/TokenManager.js';

// React Context
export { PNPWalletProvider } from './context/PNPWalletProvider.jsx';
export { usePNPWalletContext } from './context/PNPWalletContext.jsx';

// Hooks
export { 
  usePNPWallet,
  useWalletConnection,
  useTokenOperations,
  useCurrentWallet,
  useSelectedToken
} from './hooks/usePNPWallet.js';

export { 
  useTokenBalance,
  useAllTokenBalances,
  useBalanceValidation
} from './hooks/useTokenBalance.js';

export { 
  useTokenImporter,
  useTokenSearch,
  useTokenVerification
} from './hooks/useTokenImporter.js';

// UI Components (optional - can be excluded if not needed)
export { default as WalletSelector } from './components/WalletSelector.jsx';
export { default as TokenImporter } from './components/TokenImporter.jsx';

// Utilities
export * from './utils/constants.js';
export * from './utils/tokenFormatters.js';
export * from './utils/validators.js';

// Default export - Main hook for convenience
export { usePNPWallet as default } from './hooks/usePNPWallet.js';