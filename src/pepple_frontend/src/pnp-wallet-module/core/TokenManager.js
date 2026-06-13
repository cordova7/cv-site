/**
 * Token Manager for ICRC token operations
 * Using official @dfinity/agent and Actor for ICRC interactions
 */

import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { DEFAULT_TOKENS, STORAGE_KEYS, ERROR_MESSAGES, TOKEN_STANDARDS } from '../utils/constants.js';
import { validateTokenConfig, validateCanisterId } from '../utils/validators.js';

// ICRC-1 IDL factory (simplified version based on standard)
const createIcrcIdlFactory = () => {
  return ({ IDL }) => {
    return IDL.Service({
      'icrc1_name': IDL.Func([], [IDL.Text], ['query']),
      'icrc1_symbol': IDL.Func([], [IDL.Text], ['query']),
      'icrc1_decimals': IDL.Func([], [IDL.Nat8], ['query']),
      'icrc1_fee': IDL.Func([], [IDL.Nat], ['query']),
      'icrc1_metadata': IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Variant({
        'Nat': IDL.Nat,
        'Int': IDL.Int,
        'Text': IDL.Text,
        'Blob': IDL.Vec(IDL.Nat8)
      })))], ['query']),
      'icrc1_balance_of': IDL.Func([IDL.Record({
        'owner': IDL.Principal,
        'subaccount': IDL.Opt(IDL.Vec(IDL.Nat8))
      })], [IDL.Nat], ['query']),
      'icrc1_transfer': IDL.Func([IDL.Record({
        'to': IDL.Record({
          'owner': IDL.Principal,
          'subaccount': IDL.Opt(IDL.Vec(IDL.Nat8))
        }),
        'amount': IDL.Nat,
        'from_subaccount': IDL.Opt(IDL.Vec(IDL.Nat8)),
        'memo': IDL.Opt(IDL.Vec(IDL.Nat8)),
        'fee': IDL.Opt(IDL.Nat),
        'created_at_time': IDL.Opt(IDL.Nat64)
      })], [IDL.Variant({
        'Ok': IDL.Nat,
        'Err': IDL.Variant({
          'BadFee': IDL.Record({ 'expected_fee': IDL.Nat }),
          'BadBurn': IDL.Record({ 'min_burn_amount': IDL.Nat }),
          'InsufficientFunds': IDL.Record({ 'balance': IDL.Nat }),
          'TooOld': IDL.Null,
          'CreatedInFuture': IDL.Record({ 'ledger_time': IDL.Nat64 }),
          'TemporarilyUnavailable': IDL.Null,
          'Duplicate': IDL.Record({ 'duplicate_of': IDL.Nat }),
          'GenericError': IDL.Record({ 'error_code': IDL.Nat, 'message': IDL.Text })
        })
      })], [])
    });
  };
};

class TokenManager {
  constructor(network = 'ic', host = 'https://icp0.io') {
    this.network = network;
    this.host = host;
    this.tokens = new Map();
    this.balances = new Map();
    this.actors = new Map(); // Cache actors for performance

    // Initialize with default tokens
    this.initializeDefaultTokens();
    
    // Load custom tokens from storage
    this.loadCustomTokens();
  }

  /**
   * Initialize default tokens (ICP, etc.)
   */
  initializeDefaultTokens() {
    DEFAULT_TOKENS.forEach(token => {
      this.tokens.set(token.canisterId, token);
    });
  }

  /**
   * Load custom tokens from localStorage
   */
  loadCustomTokens() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEYS.CUSTOM_TOKENS);
        if (stored) {
          const customTokens = JSON.parse(stored);
          customTokens.forEach(token => {
            // Convert fees back to BigInt
            if (token.fees && typeof token.fees === 'string') {
              token.fees = BigInt(token.fees);
            }
            this.tokens.set(token.canisterId, token);
          });
        }
      } catch (error) {
        console.warn('Failed to load custom tokens:', error);
      }
    }
  }

  /**
   * Save custom tokens to localStorage
   */
  saveCustomTokens() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const customTokens = Array.from(this.tokens.values())
          .filter(token => token.addedBy === 'user')
          .map(token => ({
            ...token,
            // Convert BigInt to string for JSON storage
            fees: token.fees ? token.fees.toString() : null
          }));
        
        window.localStorage.setItem(STORAGE_KEYS.CUSTOM_TOKENS, JSON.stringify(customTokens));
      } catch (error) {
        console.warn('Failed to save custom tokens:', error);
      }
    }
  }

  /**
   * Create ICRC ledger actor
   * @param {string} canisterId - Token canister ID
   * @param {object} identity - User identity for authenticated calls
   */
  async createLedgerActor(canisterId, identity = null) {
    try {
      // Check if actor already exists in cache
      const cacheKey = `${canisterId}-${identity ? 'auth' : 'anon'}`;
      if (this.actors.has(cacheKey)) {
        return this.actors.get(cacheKey);
      }

      // Create HTTP agent
      const agent = new HttpAgent({
        identity,
        host: this.host
      });

      // Fetch root key for local development
      if (this.network === 'local') {
        await agent.fetchRootKey().catch(err => {
          console.warn('Unable to fetch root key:', err);
        });
      }

      // Create actor with ICRC IDL
      const actor = Actor.createActor(createIcrcIdlFactory(), {
        agent,
        canisterId
      });

      // Cache the actor
      this.actors.set(cacheKey, actor);

      return actor;
    } catch (error) {
      console.error('Failed to create ledger actor:', error);
      throw new Error(`Failed to create ledger actor: ${error.message}`);
    }
  }

  /**
   * Fetch token metadata from canister
   * @param {string} canisterId - Token canister ID
   */
  async fetchTokenMetadata(canisterId) {
    try {
      const canisterValidation = validateCanisterId(canisterId);
      if (!canisterValidation.valid) {
        throw new Error(canisterValidation.error);
      }

      console.log(`Fetching metadata for token: ${canisterId}`);
      
      // Create anonymous actor for metadata queries
      const actor = await this.createLedgerActor(canisterId);

      // Fetch basic token info using official ICRC-1 methods
      const [name, symbol, decimals, fee] = await Promise.all([
        actor.icrc1_name(),
        actor.icrc1_symbol(),
        actor.icrc1_decimals(),
        actor.icrc1_fee()
      ]);

      return {
        name,
        symbol,
        decimals: Number(decimals),
        fees: BigInt(fee.toString()),
        standard: TOKEN_STANDARDS.ICRC1
      };
    } catch (error) {
      console.error(`Failed to fetch token metadata for ${canisterId}:`, error);
      throw new Error(`${ERROR_MESSAGES.TOKEN_FETCH_FAILED}: ${error.message}`);
    }
  }

  /**
   * Add a new token
   * @param {object} tokenConfig - Token configuration
   */
  async addToken(tokenConfig) {
    try {
      // Validate token configuration
      const validation = validateTokenConfig(tokenConfig);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const { canisterId, symbol } = tokenConfig;

      // Check if token already exists
      if (this.tokens.has(canisterId)) {
        throw new Error('Token already exists');
      }

      console.log(`Adding token: ${symbol} (${canisterId})`);

      // Fetch metadata if not provided
      let metadata = {};
      if (!tokenConfig.decimals || !tokenConfig.fees || !tokenConfig.name) {
        try {
          metadata = await this.fetchTokenMetadata(canisterId);
        } catch (error) {
          console.warn('Failed to fetch metadata, using defaults:', error);
        }
      }

      // Create complete token configuration
      const completeToken = {
        canisterId,
        symbol: symbol.toUpperCase(),
        name: tokenConfig.name || metadata.name || symbol,
        decimals: tokenConfig.decimals || metadata.decimals || 8,
        fees: tokenConfig.fees || metadata.fees || BigInt(10000),
        logo: tokenConfig.logo || null,
        verified: tokenConfig.verified || false,
        addedBy: tokenConfig.addedBy || 'user',
        standard: metadata.standard || TOKEN_STANDARDS.ICRC1,
        addedAt: Date.now()
      };

      // Add to tokens map
      this.tokens.set(canisterId, completeToken);

      // Save custom tokens to storage
      if (completeToken.addedBy === 'user') {
        this.saveCustomTokens();
      }

      console.log(`Token added successfully: ${completeToken.symbol}`);
      return completeToken;
    } catch (error) {
      console.error('Failed to add token:', error);
      throw error;
    }
  }

  /**
   * Remove a token
   * @param {string} canisterId - Token canister ID
   */
  removeToken(canisterId) {
    const token = this.tokens.get(canisterId);
    if (!token) {
      throw new Error('Token not found');
    }

    if (token.addedBy === 'default') {
      throw new Error('Cannot remove default tokens');
    }

    this.tokens.delete(canisterId);
    this.balances.delete(canisterId);
    this.actors.delete(`${canisterId}-auth`);
    this.actors.delete(`${canisterId}-anon`);

    // Save updated custom tokens
    this.saveCustomTokens();

    console.log(`Token removed: ${token.symbol}`);
    return true;
  }

  /**
   * Get token by canister ID
   * @param {string} canisterId - Token canister ID
   */
  getToken(canisterId) {
    return this.tokens.get(canisterId);
  }

  /**
   * Get all tokens
   */
  getAllTokens() {
    return Array.from(this.tokens.values());
  }

  /**
   * Get token balance
   * @param {string} canisterId - Token canister ID
   * @param {string} principalText - Owner principal
   * @param {object} identity - User identity
   */
  async getBalance(canisterId, principalText, identity) {
    try {
      const token = this.tokens.get(canisterId);
      if (!token) {
        throw new Error('Token not found');
      }

      const actor = await this.createLedgerActor(canisterId, identity);
      
      const account = {
        owner: Principal.fromText(principalText),
        subaccount: []
      };

      const balance = await actor.icrc1_balance_of(account);
      
      // Cache the balance
      const balanceKey = `${canisterId}-${principalText}`;
      this.balances.set(balanceKey, balance);

      return balance;
    } catch (error) {
      console.error(`Failed to get balance for ${canisterId}:`, error);
      throw error;
    }
  }

  /**
   * Transfer tokens
   * @param {object} params - Transfer parameters
   */
  async transferTokens(params) {
    try {
      const { canisterId, to, amount, identity, fromSubaccount, memo } = params;

      const token = this.tokens.get(canisterId);
      if (!token) {
        throw new Error('Token not found');
      }

      const actor = await this.createLedgerActor(canisterId, identity);

      const transferArgs = {
        to: {
          owner: typeof to === 'string' ? Principal.fromText(to) : to,
          subaccount: []
        },
        amount: BigInt(amount.toString()),
        from_subaccount: fromSubaccount ? [fromSubaccount] : [],
        memo: memo ? [memo] : [],
        fee: [],
        created_at_time: []
      };

      const result = await actor.icrc1_transfer(transferArgs);
      return result;
    } catch (error) {
      console.error('Token transfer failed:', error);
      throw error;
    }
  }

  /**
   * Get cached balance
   * @param {string} canisterId - Token canister ID
   * @param {string} principalText - Owner principal
   */
  getCachedBalance(canisterId, principalText) {
    const balanceKey = `${canisterId}-${principalText}`;
    return this.balances.get(balanceKey);
  }

  /**
   * Clear cached balances
   */
  clearBalanceCache() {
    this.balances.clear();
  }

  /**
   * Update network configuration
   * @param {string} network - Network identifier
   * @param {string} host - Host URL
   */
  updateNetwork(network, host) {
    this.network = network;
    this.host = host;
    
    // Clear actor cache when network changes
    this.actors.clear();
  }
}

export default TokenManager;