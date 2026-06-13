/**
 * Core PNP (Plug-n-Play) Wallet Manager
 * Using official @windoge98/plug-n-play library
 */

import { createPNP, walletsList } from '@windoge98/plug-n-play';
import { Principal } from '@dfinity/principal';
import { 
  NETWORKS, 
  DEFAULT_HOSTS, 
  PNP_DEFAULTS, 
  ERROR_MESSAGES,
  STORAGE_KEYS 
} from '../utils/constants.js';
import { validateWalletId, validateNetwork } from '../utils/validators.js';

class PNPManager {
  constructor(config = {}) {
    this.pnp = null;
    this.config = {
      network: config.network || NETWORKS.IC,
      host: config.host || DEFAULT_HOSTS[config.network || NETWORKS.IC],
      derivationOrigin: config.derivationOrigin || (typeof window !== 'undefined' ? window.location.origin : ''),
      delegationTimeout: config.delegationTimeout || PNP_DEFAULTS.delegationTimeout,
      storageKey: config.storageKey || PNP_DEFAULTS.storageKey,
      debug: config.debug || PNP_DEFAULTS.debug,
      delegationTargets: config.delegationTargets || []
    };

    this.isInitialized = false;
    this.currentWallet = null;
    this.account = null;
    this.availableWallets = [];
  }

  /**
   * Initialize PNP instance
   */
  async initialize() {
    try {
      console.log('Initializing PNP with config:', this.config);

      // Get available wallets from the official library
      this.availableWallets = walletsList || [];
      console.log('Available wallets:', this.availableWallets);

      // Create PNP instance using official API
      this.pnp = createPNP({
        host: this.config.host,
        derivationOrigin: this.config.derivationOrigin,
        network: this.config.network === NETWORKS.LOCAL ? 'local' : 'mainnet',
        fetchRootKeys: this.config.network === NETWORKS.LOCAL,
        debug: this.config.debug,
        delegationTargets: this.config.delegationTargets,
        delegationTimeout: this.config.delegationTimeout,
        storageKey: this.config.storageKey
      });

      this.isInitialized = true;
      console.log('PNP initialized successfully');

      // Check for existing session
      await this.checkExistingSession();

      return true;
    } catch (error) {
      console.error('Failed to initialize PNP:', error);
      throw new Error(`PNP initialization failed: ${error.message}`);
    }
  }

  /**
   * Check for existing wallet session
   */
  async checkExistingSession() {
    if (!this.pnp) return false;

    try {
      // Check if wallet is already connected
      const isConnected = await this.pnp.isWalletConnected();
      if (isConnected) {
        console.log('Existing wallet session found');
        
        // Try to restore the connection
        const account = await this.pnp.getAccount();
        if (account && account.owner) {
          this.account = account;
          this.currentWallet = this.getStoredWalletId();
          console.log('Session restored for wallet:', this.currentWallet);
          return true;
        }
      }
    } catch (error) {
      console.log('No existing session or session invalid:', error.message);
    }

    return false;
  }

  /**
   * Connect to a specific wallet
   * @param {string} walletId - Wallet identifier (e.g., 'nns', 'plug', 'stoic')
   * @param {object} options - Additional connection options
   */
  async connectWallet(walletId, options = {}) {
    if (!this.isInitialized) {
      throw new Error(ERROR_MESSAGES.PNP_NOT_INITIALIZED);
    }

    // Validate wallet ID
    const walletValidation = validateWalletId(walletId, this.availableWallets);
    if (!walletValidation.valid) {
      throw new Error(walletValidation.error);
    }

    try {
      console.log(`Connecting to ${walletId} wallet...`);

      // Prepare connection options
      const connectOptions = {
        derivationOrigin: this.config.derivationOrigin,
        timeout: options.timeout || 120000, // 2 minutes
        storageKey: this.config.storageKey,
        delegationTargets: this.config.delegationTargets,
        whitelist: this.config.delegationTargets,
        ...options
      };

      // Add development settings for local network
      if (this.config.network === NETWORKS.LOCAL) {
        connectOptions.host = this.config.host;
        connectOptions.dev = true;
      }

      // Connect using official PNP API
      const account = await this.pnp.connect(walletId, connectOptions);

      if (!account || !account.owner || typeof account.owner.toText !== 'function') {
        throw new Error('Invalid account returned from wallet connection');
      }

      // Store connection info
      this.account = account;
      this.currentWallet = walletId;
      
      // Store preferred wallet for future sessions
      this.storeWalletId(walletId);

      const principalText = account.owner.toText();
      console.log(`Successfully connected to ${walletId} wallet:`, principalText);

      return {
        walletId,
        account,
        principal: principalText,
        owner: account.owner
      };

    } catch (error) {
      console.error(`Failed to connect to ${walletId} wallet:`, error);
      this.currentWallet = null;
      this.account = null;
      throw new Error(`${ERROR_MESSAGES.CONNECTION_FAILED}: ${error.message}`);
    }
  }

  /**
   * Disconnect from current wallet
   */
  async disconnect() {
    try {
      if (this.pnp && this.currentWallet) {
        console.log(`Disconnecting from ${this.currentWallet} wallet...`);
        await this.pnp.disconnect();
      }

      // Clear connection state
      this.currentWallet = null;
      this.account = null;
      
      // Clear stored wallet preference
      this.clearStoredWalletId();

      console.log('Wallet disconnected successfully');
      return true;
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw new Error(`Disconnect failed: ${error.message}`);
    }
  }

  /**
   * Get current account information
   */
  getAccount() {
    return this.account;
  }

  /**
   * Get current wallet identifier
   */
  getCurrentWallet() {
    return this.currentWallet;
  }

  /**
   * Get available wallets
   */
  getAvailableWallets() {
    return this.availableWallets;
  }

  /**
   * Check if wallet is connected
   */
  isConnected() {
    return !!(this.currentWallet && this.account);
  }

  /**
   * Get the PNP instance for direct access
   */
  getPNPInstance() {
    return this.pnp;
  }

  /**
   * Get wallet connection status
   */
  async getConnectionStatus() {
    if (!this.pnp) return false;

    try {
      return await this.pnp.isWalletConnected();
    } catch (error) {
      console.error('Error checking connection status:', error);
      return false;
    }
  }

  /**
   * Store preferred wallet ID in localStorage
   * @param {string} walletId - Wallet identifier
   */
  storeWalletId(walletId) {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEYS.PREFERRED_WALLET, walletId);
      } catch (error) {
        console.warn('Failed to store wallet preference:', error);
      }
    }
  }

  /**
   * Get stored preferred wallet ID
   * @returns {string|null} Stored wallet ID
   */
  getStoredWalletId() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return window.localStorage.getItem(STORAGE_KEYS.PREFERRED_WALLET);
      } catch (error) {
        console.warn('Failed to retrieve wallet preference:', error);
      }
    }
    return null;
  }

  /**
   * Clear stored wallet preference
   */
  clearStoredWalletId() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(STORAGE_KEYS.PREFERRED_WALLET);
      } catch (error) {
        console.warn('Failed to clear wallet preference:', error);
      }
    }
  }

  /**
   * Update configuration
   * @param {object} newConfig - New configuration options
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    // If network or host changed and we're initialized, we need to reinitialize
    if (this.isInitialized && (newConfig.network || newConfig.host)) {
      console.log('Configuration updated, reinitialization required');
      this.isInitialized = false;
    }
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.config };
  }
}

export default PNPManager;