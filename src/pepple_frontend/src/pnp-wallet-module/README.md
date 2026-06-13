# PNP Wallet Module

A modular, isolated wallet system for Internet Computer (IC) supporting multiple wallet types and dynamic token import. Built with official libraries only.

## Core Features

- 🔌 **Multi-wallet Support**: NNS, Plug, Stoic, Bitfinity via `@windoge98/plug-n-play`
- 🪙 **Dynamic Token Import**: Add any ICRC token with canister-id, auto-fetch decimals/fees
- ⚛️ **React Context**: Optional centralized state management
- 🔒 **Official Libraries**: Uses `@dfinity/principal`, `@dfinity/agent`, `@dfinity/auth-client`
- 📦 **Portable**: Completely isolated module for any React project
- 🛡️ **Core Focus**: Principal management, token transfers, balance checking

## Installation

Copy the `pnp-wallet-module` folder to your React project and install dependencies:

```bash
npm install @windoge98/plug-n-play @dfinity/principal @dfinity/agent @dfinity/auth-client prop-types
```

## Core Usage (No UI Dependencies)

### 1. Direct Core Usage:

```javascript
import { PNPManager, TokenManager } from './pnp-wallet-module';

// Initialize PNP Manager
const pnpManager = new PNPManager({
  network: 'ic',
  host: 'https://icp0.io',
  delegationTargets: ['ryjl3-tyaaa-aaaaa-aaaba-cai'] // ICP ledger
});

await pnpManager.initialize();

// Connect to wallet (user interaction required)
const connection = await pnpManager.connectWallet('nns'); // or 'plug', 'stoic'

// Get receiving principal
console.log('Your receiving address:', connection.principal);
```

### 2. Token Management:

```javascript
// Initialize Token Manager
const tokenManager = new TokenManager('ic', 'https://icp0.io');

// Add new token (auto-fetches metadata)
const newToken = await tokenManager.addToken({
  canisterId: 'your-token-canister-id',
  symbol: 'TOKEN' // optional, will be auto-fetched
});

// Get balance
const balance = await tokenManager.getBalance(
  'ryjl3-tyaaa-aaaaa-aaaba-cai', // ICP canister
  connection.principal,
  connection.account.identity
);
```

### 3. Transfer Tokens:

```javascript
import { parseTokenAmount } from './pnp-wallet-module';

// Parse human amount to base units
const amountE8s = parseTokenAmount('1.5', 8); // 1.5 ICP to e8s

// Transfer tokens
const result = await tokenManager.transferTokens({
  canisterId: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
  to: 'recipient-principal-id',
  amount: amountE8s,
  identity: connection.account.identity
});

if ('Ok' in result) {
  console.log('Transfer successful! Block:', result.Ok.toString());
}
```

### 4. React Integration (Optional):

```jsx
import { PNPWalletProvider, usePNPWallet } from './pnp-wallet-module';

// Wrap your app
function App() {
  return (
    <PNPWalletProvider network="ic">
      <WalletComponent />
    </PNPWalletProvider>
  );
}

// Use in components
function WalletComponent() {
  const { connectWallet, account, transferTokens } = usePNPWallet();
  
  const handleConnect = () => connectWallet('nns');
  const receivingPrincipal = account?.owner?.toText();
  
  return (
    <div>
      <button onClick={handleConnect}>Connect</button>
      {receivingPrincipal && <p>Address: {receivingPrincipal}</p>}
    </div>
  );
}
```

## API Reference

### PNPWalletProvider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | Your app components |
| `network` | string | 'ic' | Network: 'ic' or 'local' |
| `host` | string | 'https://icp0.io' | IC host URL |

### usePNPWallet Hook

Returns an object with:

#### State
- `isConnected: boolean` - Connection status
- `currentWallet: string` - Current wallet ID ('nns', 'plug', etc.)
- `availableWallets: array` - Available wallet options
- `account: object` - Current account info
- `tokens: array` - Available tokens
- `balances: object` - Token balances by canister ID
- `selectedToken: string` - Currently selected token
- `isLoading: boolean` - Loading state
- `error: string` - Error message

#### Actions
- `connectWallet(walletId): Promise` - Connect to specific wallet
- `disconnect(): Promise` - Disconnect current wallet
- `addToken(config): Promise` - Add new token
- `transferTokens(params): Promise` - Send tokens
- `refreshBalance(tokenId): Promise` - Refresh token balance
- `switchToken(tokenId): void` - Switch selected token

## Token Configuration

When adding tokens, provide:

```javascript
{
  canisterId: string,        // Required: Token canister ID
  symbol: string,            // Required: Token symbol
  name?: string,             // Optional: Full name (auto-fetched)
  decimals?: number,         // Optional: Decimals (auto-fetched)
  fees?: bigint,            // Optional: Fees (auto-fetched)
  logo?: string,            // Optional: Logo URL
  verified?: boolean        // Optional: Verified status
}
```

## Components

### WalletSelector
Multi-wallet selection interface with icons and status.

### TokenImporter  
UI for adding new tokens with validation.

### WalletDisplay
Shows current wallet info, balances, and actions.

## Supported Wallets

- **NNS (Internet Identity)** - Default IC wallet
- **Plug** - Browser extension wallet
- **Stoic** - Web-based wallet  
- **Bitfinity** - Multi-chain wallet
- **InfinityWallet** - Mobile and web wallet
- And more via plug-n-play library

## Network Configuration

### Mainnet (default):
```jsx
<PNPWalletProvider network="ic" host="https://icp0.io">
```

### Local development:
```jsx
<PNPWalletProvider network="local" host="http://localhost:4943">
```

## Error Handling

The module provides comprehensive error handling:

```jsx
const { error, clearError } = usePNPWallet();

if (error) {
  return (
    <div>
      Error: {error}
      <button onClick={clearError}>Clear</button>
    </div>
  );
}
```

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
- GitHub Issues: [Report bugs](https://github.com/pepple-team/pnp-wallet-module/issues)
- Documentation: [Full docs](https://github.com/pepple-team/pnp-wallet-module/wiki)