/**
 * Token formatting utilities with decimal-aware handling
 * Based on official ICRC standards and existing patterns
 */

/**
 * Format token amount from base units (e8s) to human readable
 * @param {bigint|string|number} amount - Amount in base units
 * @param {number} decimals - Token decimal places (e.g., 8 for ICP)
 * @param {number} displayDecimals - Number of decimal places to show
 * @returns {string} Formatted amount
 */
export const formatTokenAmount = (amount, decimals = 8, displayDecimals = 3) => {
  if (amount === null || amount === undefined || amount === '') {
    return '0';
  }

  try {
    // Convert to bigint if needed
    const bigIntAmount = typeof amount === 'bigint' ? amount : BigInt(amount.toString());
    
    // Convert to decimal value
    const divisor = BigInt(10 ** decimals);
    const wholePart = bigIntAmount / divisor;
    const fractionalPart = bigIntAmount % divisor;
    
    // Handle the fractional part for display
    const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
    const decimalValue = parseFloat(`${wholePart}.${fractionalStr}`);
    
    return decimalValue.toFixed(displayDecimals);
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return '0';
  }
};

/**
 * Parse human readable amount to base units (e8s)
 * @param {string|number} amount - Human readable amount
 * @param {number} decimals - Token decimal places
 * @returns {bigint} Amount in base units
 */
export const parseTokenAmount = (amount, decimals = 8) => {
  if (!amount || amount === '') {
    return BigInt(0);
  }

  try {
    const numAmount = parseFloat(amount.toString());
    if (isNaN(numAmount) || numAmount < 0) {
      throw new Error('Invalid amount');
    }

    // Convert to base units
    const multiplier = BigInt(10 ** decimals);
    const baseUnits = BigInt(Math.floor(numAmount * (10 ** decimals)));
    
    return baseUnits;
  } catch (error) {
    console.error('Error parsing token amount:', error);
    throw new Error('Invalid amount format');
  }
};

/**
 * Format token display with symbol
 * @param {bigint|string|number} amount - Amount in base units
 * @param {string} symbol - Token symbol
 * @param {number} decimals - Token decimal places
 * @param {number} displayDecimals - Decimal places to show
 * @returns {string} Formatted amount with symbol
 */
export const formatTokenDisplay = (amount, symbol, decimals = 8, displayDecimals = 3) => {
  const formattedAmount = formatTokenAmount(amount, decimals, displayDecimals);
  return `${formattedAmount} ${symbol}`;
};

/**
 * Format balance for UI display with proper rounding
 * @param {bigint|string|number} balance - Balance in base units
 * @param {number} decimals - Token decimal places
 * @returns {string} Formatted balance
 */
export const formatBalance = (balance, decimals = 8) => {
  if (balance === null || balance === undefined) {
    return '...';
  }

  const formatted = formatTokenAmount(balance, decimals, decimals >= 8 ? 4 : 2);
  
  // Remove trailing zeros for cleaner display
  return parseFloat(formatted).toString();
};

/**
 * Validate token amount input
 * @param {string} input - User input
 * @param {bigint} balance - Available balance in base units
 * @param {number} decimals - Token decimal places
 * @returns {object} Validation result
 */
export const validateTokenAmount = (input, balance, decimals = 8) => {
  try {
    if (!input || input === '') {
      return { valid: false, error: 'Amount is required' };
    }

    const numInput = parseFloat(input);
    if (isNaN(numInput) || numInput <= 0) {
      return { valid: false, error: 'Amount must be positive' };
    }

    // Check decimal places
    const decimalPlaces = (input.split('.')[1] || '').length;
    if (decimalPlaces > decimals) {
      return { valid: false, error: `Maximum ${decimals} decimal places allowed` };
    }

    // Parse to base units for balance check
    const amountBaseUnits = parseTokenAmount(input, decimals);
    
    if (balance !== null && balance !== undefined && amountBaseUnits > BigInt(balance)) {
      const maxAmount = formatTokenAmount(balance, decimals);
      return { valid: false, error: `Insufficient balance. Max: ${maxAmount}` };
    }

    return { valid: true, amountBaseUnits };
  } catch (error) {
    return { valid: false, error: 'Invalid amount format' };
  }
};

/**
 * Format transaction fee display
 * @param {bigint|string|number} fee - Fee in base units
 * @param {string} symbol - Token symbol
 * @param {number} decimals - Token decimal places
 * @returns {string} Formatted fee display
 */
export const formatFee = (fee, symbol, decimals = 8) => {
  if (!fee) return 'Unknown fee';
  
  const feeAmount = formatTokenAmount(fee, decimals, decimals >= 8 ? 6 : 4);
  return `${feeAmount} ${symbol}`;
};

/**
 * Truncate long addresses/principals for display
 * @param {string} address - Full address
 * @param {number} startChars - Characters to show at start
 * @param {number} endChars - Characters to show at end
 * @returns {string} Truncated address
 */
export const truncateAddress = (address, startChars = 5, endChars = 3) => {
  if (!address || address.length <= startChars + endChars) {
    return address;
  }
  
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
};

/**
 * Format large numbers with appropriate units (K, M, B)
 * @param {bigint|string|number} amount - Amount in base units
 * @param {number} decimals - Token decimal places
 * @returns {string} Formatted amount with units
 */
export const formatLargeAmount = (amount, decimals = 8) => {
  const formatted = parseFloat(formatTokenAmount(amount, decimals, decimals));
  
  if (formatted >= 1_000_000_000) {
    return `${(formatted / 1_000_000_000).toFixed(2)}B`;
  } else if (formatted >= 1_000_000) {
    return `${(formatted / 1_000_000).toFixed(2)}M`;
  } else if (formatted >= 1_000) {
    return `${(formatted / 1_000).toFixed(2)}K`;
  }
  
  return formatted.toString();
};