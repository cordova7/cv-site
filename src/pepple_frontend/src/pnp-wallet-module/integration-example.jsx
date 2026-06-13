/**
 * Integration Example - How to replace SteezChain with PNP Wallet Module
 * Shows how to integrate the isolated PNP wallet system into your existing code
 */

import React, { useState, useEffect } from 'react';
import { PNPWalletProvider, usePNPWallet } from './index.js';
import { formatTokenAmount, parseTokenAmount } from './utils/tokenFormatters.js';

// Example: Replacing your SteezChain wallet component
const ModularSteezChainWallet = () => {
  const {
    isConnected,
    isLoading,
    currentWallet,
    availableWallets,
    account,
    tokens,
    balances,
    selectedToken,
    error,
    connectWallet,
    disconnect,
    addToken,
    transferTokens,
    switchToken,
    refreshBalance,
    clearError
  } = usePNPWallet();

  const [transferAmount, setTransferAmount] = useState('');
  const [recipientPrincipal, setRecipientPrincipal] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  // Get current token info
  const currentToken = tokens.find(t => t.canisterId === selectedToken);
  const currentBalance = balances[selectedToken];

  /**
   * Handle wallet connection with multi-wallet support
   */
  const handleConnect = async (walletId = 'nns') => {
    try {
      await connectWallet(walletId);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  /**
   * Handle token transfer
   */
  const handleTransfer = async () => {
    if (!transferAmount || !recipientPrincipal || !currentToken) return;

    try {
      setIsTransferring(true);
      clearError();

      // Parse amount to base units using token's decimals
      const amountBaseUnits = parseTokenAmount(transferAmount, currentToken.decimals);

      const result = await transferTokens({
        canisterId: selectedToken,
        to: recipientPrincipal,
        amount: amountBaseUnits
      });

      if ('Ok' in result) {
        console.log('Transfer successful! Block:', result.Ok.toString());
        setTransferAmount('');
        setRecipientPrincipal('');
        // Balance will be auto-refreshed by the hook
      }
    } catch (error) {
      console.error('Transfer failed:', error);
    } finally {
      setIsTransferring(false);
    }
  };

  /**
   * Add custom token (like PEPL)
   */
  const handleAddPepl = async () => {
    try {
      await addToken({
        canisterId: 'dtqrr-aaaaa-aaaaj-az7ya-cai',
        symbol: 'PEPL'
        // decimals and fees will be auto-fetched
      });
    } catch (error) {
      console.error('Failed to add PEPL:', error);
    }
  };

  return (
    <div className="steez-chain-wallet">
      <h2>SteezChain (PNP Multi-Wallet)</h2>
      
      {error && (
        <div className="error-message">
          Error: {error}
          <button onClick={clearError}>×</button>
        </div>
      )}

      {!isConnected ? (
        <div className="wallet-connection">
          <h3>Connect Wallet</h3>
          <div className="wallet-options">
            {availableWallets.map((wallet, index) => {
              const walletId = typeof wallet === 'string' ? wallet : wallet.id;
              const walletName = typeof wallet === 'string' ? wallet.toUpperCase() : wallet.name;
              
              return (
                <button
                  key={walletId || index}
                  onClick={() => handleConnect(walletId)}
                  disabled={isLoading}
                  className="wallet-button"
                >
                  {walletName}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="wallet-connected">
          {/* Wallet Info */}
          <div className="wallet-info">
            <div className="principal-display">
              <strong>Principal:</strong>
              <span title={account?.owner?.toText()}>
                {account?.owner?.toText()?.slice(0, 8)}...{account?.owner?.toText()?.slice(-5)}
              </span>
            </div>
            <div className="wallet-type">
              Connected via: {currentWallet?.toUpperCase()}
            </div>
          </div>

          {/* Token Balances */}
          <div className="token-balances">
            <h3>Token Balances</h3>
            {tokens.map(token => {
              const balance = balances[token.canisterId];
              const formattedBalance = balance 
                ? formatTokenAmount(balance, token.decimals, 4)
                : '...';

              return (
                <div key={token.canisterId} className="token-row">
                  <span className="token-symbol">{token.symbol}:</span>
                  <span className="token-balance">{formattedBalance}</span>
                  <button 
                    onClick={() => refreshBalance(token.canisterId)}
                    className="refresh-button"
                  >
                    ↻
                  </button>
                </div>
              );
            })}
          </div>

          {/* Token Selection */}
          <div className="token-selection">
            <label>Selected Token:</label>
            <select 
              value={selectedToken} 
              onChange={(e) => switchToken(e.target.value)}
            >
              {tokens.map(token => (
                <option key={token.canisterId} value={token.canisterId}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
          </div>

          {/* Transfer Section */}
          <div className="transfer-section">
            <h3>Send {currentToken?.symbol}</h3>
            <div className="transfer-form">
              <input
                type="text"
                placeholder="Recipient Principal ID"
                value={recipientPrincipal}
                onChange={(e) => setRecipientPrincipal(e.target.value)}
                disabled={isTransferring}
              />
              <input
                type="number"
                placeholder={`Amount (${currentToken?.symbol})`}
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                disabled={isTransferring}
                step="0.00000001"
              />
              <button
                onClick={handleTransfer}
                disabled={isTransferring || !transferAmount || !recipientPrincipal}
                className="transfer-button"
              >
                {isTransferring ? 'Sending...' : `Send ${currentToken?.symbol}`}
              </button>
            </div>
            
            {currentBalance && (
              <div className="balance-info">
                Available: {formatTokenAmount(currentBalance, currentToken.decimals, 4)} {currentToken?.symbol}
              </div>
            )}
          </div>

          {/* Add Token Section */}
          <div className="add-token-section">
            <h3>Add Tokens</h3>
            <button onClick={handleAddPepl} className="add-token-button">
              Add PEPL Token
            </button>
            <div className="custom-token-input">
              <input
                type="text"
                placeholder="Enter canister ID to add custom token"
                onKeyPress={async (e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    try {
                      await addToken({
                        canisterId: e.target.value,
                        symbol: 'CUSTOM'
                      });
                      e.target.value = '';
                    } catch (error) {
                      console.error('Failed to add token:', error);
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Wallet Actions */}
          <div className="wallet-actions">
            <button onClick={disconnect} className="disconnect-button">
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Main App component showing integration
const IntegratedApp = () => {
  return (
    <PNPWalletProvider 
      network="ic"
      host="https://icp0.io"
      delegationTargets={[
        'ryjl3-tyaaa-aaaaa-aaaba-cai', // ICP
        'dtqrr-aaaaa-aaaaj-az7ya-cai'  // PEPL
      ]}
    >
      <div className="app">
        <h1>Pepple App with Modular PNP Wallet</h1>
        <ModularSteezChainWallet />
      </div>
    </PNPWalletProvider>
  );
};

// Migration guide as comments
const MigrationGuide = `
MIGRATION FROM EXISTING STEEZCHAIN TO PNP MODULE:

1. REPLACE IMPORTS:
   OLD: import { createPNP } from '@windoge98/plug-n-play';
   NEW: import { PNPWalletProvider, usePNPWallet } from './pnp-wallet-module';

2. REPLACE PNP INITIALIZATION:
   OLD: Manual PNP setup in component
   NEW: Wrap app in <PNPWalletProvider>

3. REPLACE STATE MANAGEMENT:
   OLD: useState for wallet state, balances, etc.
   NEW: const { isConnected, balances, connectWallet } = usePNPWallet();

4. REPLACE CONNECTION LOGIC:
   OLD: pnp.connect("nns", connectOptions)
   NEW: await connectWallet('nns') // or 'plug', 'stoic', etc.

5. REPLACE BALANCE FETCHING:
   OLD: Manual actor creation and balance calls
   NEW: Automatic balance management via hooks

6. REPLACE TOKEN MANAGEMENT:
   OLD: Hardcoded ICP_LEDGER_CANISTER_ID, PEPL_LEDGER_CANISTER_ID
   NEW: await addToken({ canisterId: 'xxx', symbol: 'TOKEN' })

7. REPLACE TRANSFER LOGIC:
   OLD: Manual ledger actor and transferIcrcTokens
   NEW: await transferTokens({ canisterId, to, amount })

8. BENEFITS OF MIGRATION:
   ✅ Multi-wallet support (not just NNS)
   ✅ Automatic token metadata fetching
   ✅ Centralized state management
   ✅ Easy token addition
   ✅ Portable to other projects
   ✅ Built with official libraries only
`;

export { ModularSteezChainWallet, IntegratedApp, MigrationGuide };
export default IntegratedApp;