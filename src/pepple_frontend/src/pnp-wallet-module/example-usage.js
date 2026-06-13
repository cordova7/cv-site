/**
 * PNP Wallet Module - Core Usage Examples
 * Shows how to use the core functionality without UI
 */

import { PNPManager, TokenManager } from './index.js';
import { formatTokenAmount, parseTokenAmount } from './utils/tokenFormatters.js';
import { validatePrincipal } from './utils/validators.js';

// Example 1: Direct PNP Manager Usage
export const directPNPUsage = async () => {
  try {
    // Initialize PNP Manager
    const pnpManager = new PNPManager({
      network: 'ic',
      host: 'https://icp0.io',
      delegationTargets: ['ryjl3-tyaaa-aaaaa-aaaba-cai'] // ICP ledger
    });

    await pnpManager.initialize();
    console.log('Available wallets:', pnpManager.getAvailableWallets());

    // Connect to NNS wallet
    const connection = await pnpManager.connectWallet('nns');
    console.log('Connected to wallet:', connection.principal);

    // Get principal for receiving tokens
    const receivingPrincipal = connection.principal;
    console.log('Your receiving address (principal):', receivingPrincipal);

    return { pnpManager, connection, receivingPrincipal };
  } catch (error) {
    console.error('PNP connection failed:', error);
    throw error;
  }
};

// Example 2: Token Management
export const tokenManagementUsage = async (connection) => {
  try {
    // Initialize Token Manager
    const tokenManager = new TokenManager('ic', 'https://icp0.io');

    // Add a new token (PEPL example)
    const newToken = await tokenManager.addToken({
      canisterId: 'dtqrr-aaaaa-aaaaj-az7ya-cai',
      symbol: 'PEPL'
      // decimals and fees will be auto-fetched
    });
    console.log('Added token:', newToken);

    // Get token balance
    const balance = await tokenManager.getBalance(
      'ryjl3-tyaaa-aaaaa-aaaba-cai', // ICP canister
      connection.principal,
      connection.account.identity
    );
    console.log('ICP Balance (raw):', balance.toString());
    console.log('ICP Balance (formatted):', formatTokenAmount(balance, 8, 4), 'ICP');

    return { tokenManager, balance };
  } catch (error) {
    console.error('Token management failed:', error);
    throw error;
  }
};

// Example 3: Transfer Tokens
export const transferTokensUsage = async (tokenManager, connection, recipientPrincipal, amount) => {
  try {
    // Validate recipient principal
    const recipientValidation = validatePrincipal(recipientPrincipal);
    if (!recipientValidation.valid) {
      throw new Error(`Invalid recipient: ${recipientValidation.error}`);
    }

    // Parse amount to base units (e8s for ICP)
    const amountE8s = parseTokenAmount(amount, 8);
    console.log(`Transferring ${amount} ICP (${amountE8s.toString()} e8s) to ${recipientPrincipal}`);

    // Execute transfer
    const result = await tokenManager.transferTokens({
      canisterId: 'ryjl3-tyaaa-aaaaa-aaaba-cai', // ICP ledger
      to: recipientPrincipal,
      amount: amountE8s,
      identity: connection.account.identity
    });

    if ('Ok' in result) {
      console.log('Transfer successful! Block index:', result.Ok.toString());
      return { success: true, blockIndex: result.Ok };
    } else {
      const errorKey = Object.keys(result.Err)[0];
      const errorDetails = result.Err[errorKey];
      throw new Error(`Transfer failed: ${errorKey} - ${JSON.stringify(errorDetails)}`);
    }
  } catch (error) {
    console.error('Transfer failed:', error);
    throw error;
  }
};

// Example 4: Complete Workflow
export const completeWorkflowExample = async () => {
  try {
    console.log('=== PNP Wallet Module Complete Workflow ===');

    // Step 1: Connect wallet
    console.log('\n1. Connecting to wallet...');
    const { pnpManager, connection, receivingPrincipal } = await directPNPUsage();

    // Step 2: Setup token management
    console.log('\n2. Setting up token management...');
    const { tokenManager, balance } = await tokenManagementUsage(connection);

    // Step 3: Show receiving address
    console.log('\n3. Your receiving address:');
    console.log('Principal ID:', receivingPrincipal);
    console.log('Current ICP Balance:', formatTokenAmount(balance, 8, 4), 'ICP');

    // Step 4: Add custom token
    console.log('\n4. Adding custom token...');
    const customToken = await tokenManager.addToken({
      canisterId: 'dtqrr-aaaaa-aaaaj-az7ya-cai', // PEPL canister
      symbol: 'PEPL'
    });
    console.log('Custom token added:', customToken.symbol, customToken.name);

    // Step 5: Get all tokens
    console.log('\n5. Available tokens:');
    const allTokens = tokenManager.getAllTokens();
    allTokens.forEach(token => {
      console.log(`- ${token.symbol}: ${token.name} (${token.canisterId})`);
    });

    // Step 6: Example transfer (commented out to avoid accidental execution)
    /*
    console.log('\n6. Example transfer (uncomment to execute):');
    await transferTokensUsage(
      tokenManager,
      connection,
      'recipient-principal-id-here',
      '0.1' // 0.1 ICP
    );
    */

    console.log('\n=== Workflow completed successfully! ===');

    return {
      pnpManager,
      tokenManager,
      connection,
      receivingPrincipal,
      balance,
      allTokens
    };

  } catch (error) {
    console.error('Workflow failed:', error);
    throw error;
  }
};

// Example 5: React Hook Usage (for React components)
export const reactHookUsageExample = `
// Example React component using the PNP wallet hooks

import React from 'react';
import { PNPWalletProvider, usePNPWallet } from './pnp-wallet-module';

// Wrap your app with the provider
function App() {
  return (
    <PNPWalletProvider network="ic">
      <WalletComponent />
    </PNPWalletProvider>
  );
}

// Use the wallet in components
function WalletComponent() {
  const {
    isConnected,
    currentWallet,
    account,
    balances,
    connectWallet,
    addToken,
    transferTokens
  } = usePNPWallet();

  const handleConnect = async () => {
    try {
      await connectWallet('nns'); // or 'plug', 'stoic', etc.
      console.log('Connected!');
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleAddToken = async () => {
    try {
      await addToken({
        canisterId: 'your-token-canister-id',
        symbol: 'TOKEN'
      });
      console.log('Token added!');
    } catch (error) {
      console.error('Add token failed:', error);
    }
  };

  const handleTransfer = async () => {
    try {
      const result = await transferTokens({
        canisterId: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
        to: 'recipient-principal',
        amount: BigInt(100000000) // 1 ICP in e8s
      });
      console.log('Transfer result:', result);
    } catch (error) {
      console.error('Transfer failed:', error);
    }
  };

  if (!isConnected) {
    return <button onClick={handleConnect}>Connect Wallet</button>;
  }

  return (
    <div>
      <h3>Wallet Connected: {currentWallet}</h3>
      <p>Principal: {account?.owner?.toText()}</p>
      <p>ICP Balance: {balances['ryjl3-tyaaa-aaaaa-aaaba-cai'] || '...'}</p>
      
      <button onClick={handleAddToken}>Add Token</button>
      <button onClick={handleTransfer}>Send 1 ICP</button>
    </div>
  );
}
`;

// Export for easy testing
export default {
  directPNPUsage,
  tokenManagementUsage,
  transferTokensUsage,
  completeWorkflowExample
};