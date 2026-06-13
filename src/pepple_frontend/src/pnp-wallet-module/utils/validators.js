/**
 * Validation utilities for wallet operations
 * Using official @dfinity/principal for validation
 */

import { Principal } from '@dfinity/principal';

/**
 * Validate Internet Computer Principal ID
 * @param {string} principalText - Principal ID as string
 * @returns {object} Validation result
 */
export const validatePrincipal = (principalText) => {
  try {
    if (!principalText || typeof principalText !== 'string') {
      return { valid: false, error: 'Principal ID is required' };
    }

    const trimmed = principalText.trim();
    if (!trimmed) {
      return { valid: false, error: 'Principal ID cannot be empty' };
    }

    // Use official @dfinity/principal validation
    const principal = Principal.fromText(trimmed);
    
    // Check if it's anonymous principal (not allowed for transfers)
    if (principal.isAnonymous()) {
      return { valid: false, error: 'Anonymous principal not allowed' };
    }

    return { valid: true, principal };
  } catch (error) {
    return { valid: false, error: 'Invalid principal ID format' };
  }
};

/**
 * Validate canister ID format
 * @param {string} canisterId - Canister ID to validate
 * @returns {object} Validation result
 */
export const validateCanisterId = (canisterId) => {
  try {
    if (!canisterId || typeof canisterId !== 'string') {
      return { valid: false, error: 'Canister ID is required' };
    }

    const trimmed = canisterId.trim();
    if (!trimmed) {
      return { valid: false, error: 'Canister ID cannot be empty' };
    }

    // Use Principal validation for canister IDs
    const principal = Principal.fromText(trimmed);
    
    return { valid: true, principal };
  } catch (error) {
    return { valid: false, error: 'Invalid canister ID format' };
  }
};

/**
 * Validate token symbol format
 * @param {string} symbol - Token symbol
 * @returns {object} Validation result
 */
export const validateTokenSymbol = (symbol) => {
  if (!symbol || typeof symbol !== 'string') {
    return { valid: false, error: 'Token symbol is required' };
  }

  const trimmed = symbol.trim().toUpperCase();
  
  if (!trimmed) {
    return { valid: false, error: 'Token symbol cannot be empty' };
  }

  if (trimmed.length < 2 || trimmed.length > 10) {
    return { valid: false, error: 'Token symbol must be 2-10 characters' };
  }

  // Check for valid characters (letters and numbers only)
  if (!/^[A-Z0-9]+$/.test(trimmed)) {
    return { valid: false, error: 'Token symbol can only contain letters and numbers' };
  }

  return { valid: true, symbol: trimmed };
};

/**
 * Validate decimal places for token
 * @param {number} decimals - Number of decimal places
 * @returns {object} Validation result
 */
export const validateTokenDecimals = (decimals) => {
  if (decimals === null || decimals === undefined) {
    return { valid: false, error: 'Decimals value is required' };
  }

  const numDecimals = Number(decimals);
  
  if (isNaN(numDecimals) || !Number.isInteger(numDecimals)) {
    return { valid: false, error: 'Decimals must be a whole number' };
  }

  if (numDecimals < 0 || numDecimals > 18) {
    return { valid: false, error: 'Decimals must be between 0 and 18' };
  }

  return { valid: true, decimals: numDecimals };
};

/**
 * Validate transfer parameters
 * @param {object} params - Transfer parameters
 * @returns {object} Validation result
 */
export const validateTransferParams = (params) => {
  const errors = [];

  // Validate recipient
  const recipientValidation = validatePrincipal(params.to);
  if (!recipientValidation.valid) {
    errors.push(`Recipient: ${recipientValidation.error}`);
  }

  // Validate amount
  if (!params.amount || params.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }

  // Validate canister ID
  const canisterValidation = validateCanisterId(params.canisterId);
  if (!canisterValidation.valid) {
    errors.push(`Token: ${canisterValidation.error}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    error: errors.join(', ')
  };
};

/**
 * Validate wallet ID from available wallets
 * @param {string} walletId - Wallet identifier
 * @param {array} availableWallets - List of available wallets
 * @returns {object} Validation result
 */
export const validateWalletId = (walletId, availableWallets = []) => {
  if (!walletId || typeof walletId !== 'string') {
    return { valid: false, error: 'Wallet ID is required' };
  }

  const trimmed = walletId.trim();
  if (!trimmed) {
    return { valid: false, error: 'Wallet ID cannot be empty' };
  }

  // Check if wallet is available
  const isAvailable = availableWallets.some(wallet => 
    wallet.id === trimmed || wallet === trimmed
  );

  if (availableWallets.length > 0 && !isAvailable) {
    return { valid: false, error: 'Selected wallet is not available' };
  }

  return { valid: true, walletId: trimmed };
};

/**
 * Validate network configuration
 * @param {string} network - Network identifier
 * @returns {object} Validation result
 */
export const validateNetwork = (network) => {
  const validNetworks = ['ic', 'local'];
  
  if (!network || typeof network !== 'string') {
    return { valid: false, error: 'Network is required' };
  }

  const trimmed = network.trim().toLowerCase();
  
  if (!validNetworks.includes(trimmed)) {
    return { valid: false, error: `Network must be one of: ${validNetworks.join(', ')}` };
  }

  return { valid: true, network: trimmed };
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {object} Validation result
 */
export const validateUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  try {
    const parsedUrl = new URL(url);
    
    // Check for http/https protocol
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return { valid: false, error: 'URL must use HTTP or HTTPS protocol' };
    }

    return { valid: true, url: parsedUrl.toString() };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
};

/**
 * Validate token configuration object
 * @param {object} tokenConfig - Token configuration
 * @returns {object} Validation result
 */
export const validateTokenConfig = (tokenConfig) => {
  const errors = [];

  if (!tokenConfig || typeof tokenConfig !== 'object') {
    return { valid: false, error: 'Token configuration is required' };
  }

  // Required fields
  const canisterValidation = validateCanisterId(tokenConfig.canisterId);
  if (!canisterValidation.valid) {
    errors.push(`Canister ID: ${canisterValidation.error}`);
  }

  const symbolValidation = validateTokenSymbol(tokenConfig.symbol);
  if (!symbolValidation.valid) {
    errors.push(`Symbol: ${symbolValidation.error}`);
  }

  // Optional fields validation
  if (tokenConfig.decimals !== undefined) {
    const decimalsValidation = validateTokenDecimals(tokenConfig.decimals);
    if (!decimalsValidation.valid) {
      errors.push(`Decimals: ${decimalsValidation.error}`);
    }
  }

  if (tokenConfig.logo && typeof tokenConfig.logo === 'string') {
    const logoValidation = validateUrl(tokenConfig.logo);
    if (!logoValidation.valid) {
      errors.push(`Logo URL: ${logoValidation.error}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    error: errors.join(', ')
  };
};