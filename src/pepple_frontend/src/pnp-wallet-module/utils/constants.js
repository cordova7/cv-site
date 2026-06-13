// Network and Host Configuration
export const NETWORKS = {
  IC: 'ic',
  LOCAL: 'local'
};

export const DEFAULT_HOSTS = {
  [NETWORKS.IC]: 'https://icp0.io',
  [NETWORKS.LOCAL]: 'http://localhost:4943'
};

// Default Canister IDs
export const CANISTER_IDS = {
  ICP_LEDGER: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
  INTERNET_IDENTITY: 'rdmx6-jaaaa-aaaaa-aaadq-cai'
};

// Default tokens that come pre-configured
export const DEFAULT_TOKENS = [
  {
    canisterId: CANISTER_IDS.ICP_LEDGER,
    symbol: 'ICP',
    name: 'Internet Computer',
    decimals: 8,
    fees: BigInt(10000), // 0.0001 ICP
    logo: '/assets/tokens/icp.svg',
    verified: true,
    addedBy: 'default',
    standard: 'ICRC-1'
  }
];

// PNP Configuration defaults
export const PNP_DEFAULTS = {
  delegationTimeout: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days in nanoseconds
  storageKey: 'pnp-wallet-session',
  debug: false
};

// Token standards supported
export const TOKEN_STANDARDS = {
  ICRC1: 'ICRC-1',
  ICRC2: 'ICRC-2',
  DIP20: 'DIP-20'
};

// Error messages
export const ERROR_MESSAGES = {
  WALLET_NOT_AVAILABLE: 'Selected wallet is not available',
  CONNECTION_FAILED: 'Failed to connect to wallet',
  TOKEN_FETCH_FAILED: 'Failed to fetch token metadata',
  INVALID_CANISTER_ID: 'Invalid canister ID format',
  INSUFFICIENT_BALANCE: 'Insufficient token balance',
  TRANSFER_FAILED: 'Token transfer failed',
  PNP_NOT_INITIALIZED: 'PNP instance not initialized'
};

// Local storage keys
export const STORAGE_KEYS = {
  PREFERRED_WALLET: 'pnp-preferred-wallet',
  CUSTOM_TOKENS: 'pnp-custom-tokens',
  WALLET_SESSION: 'pnp-wallet-session'
};