/**
 * Wallet Selector Component
 * Multi-wallet selection interface
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useWalletConnection } from '../hooks/usePNPWallet.js';

const WalletSelector = ({ 
  onConnect, 
  onError,
  className = '',
  showIcons = true,
  layout = 'grid' // 'grid', 'list', 'dropdown'
}) => {
  const {
    isConnected,
    isLoading,
    currentWallet,
    availableWallets,
    connectWallet,
    disconnect,
    error,
    clearError
  } = useWalletConnection();

  const [selectedWallet, setSelectedWallet] = useState('');

  /**
   * Handle wallet connection
   */
  const handleConnect = async (walletId) => {
    try {
      clearError();
      const connection = await connectWallet(walletId);
      
      if (onConnect) {
        onConnect(connection);
      }
    } catch (error) {
      console.error('Connection failed:', error);
      if (onError) {
        onError(error);
      }
    }
  };

  /**
   * Handle wallet disconnection
   */
  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Disconnection failed:', error);
      if (onError) {
        onError(error);
      }
    }
  };

  /**
   * Get wallet display name
   */
  const getWalletName = (wallet) => {
    if (typeof wallet === 'string') {
      return wallet.toUpperCase();
    }
    return wallet.name || wallet.id || 'Unknown Wallet';
  };

  /**
   * Get wallet icon
   */
  const getWalletIcon = (wallet) => {
    if (typeof wallet === 'string') {
      // Default icons for common wallets
      const iconMap = {
        nns: '🆔',
        plug: '🔌',
        stoic: '🏛️',
        bitfinity: '♾️',
        infinity: '∞'
      };
      return iconMap[wallet.toLowerCase()] || '👤';
    }
    return wallet.icon || '👤';
  };

  /**
   * Render wallet button
   */
  const renderWalletButton = (wallet, index) => {
    const walletId = typeof wallet === 'string' ? wallet : wallet.id;
    const walletName = getWalletName(wallet);
    const walletIcon = getWalletIcon(wallet);
    const isCurrentWallet = currentWallet === walletId;

    return (
      <button
        key={walletId || index}
        onClick={() => handleConnect(walletId)}
        disabled={isLoading}
        className={`wallet-button ${isCurrentWallet ? 'connected' : ''} ${isLoading ? 'loading' : ''}`}
        title={`Connect with ${walletName}`}
      >
        {showIcons && (
          <span className="wallet-icon" role="img" aria-label={walletName}>
            {walletIcon}
          </span>
        )}
        <span className="wallet-name">{walletName}</span>
        {isCurrentWallet && <span className="connected-indicator">✓</span>}
      </button>
    );
  };

  /**
   * Render dropdown selector
   */
  const renderDropdown = () => (
    <div className="wallet-dropdown">
      <select
        value={selectedWallet}
        onChange={(e) => {
          setSelectedWallet(e.target.value);
          if (e.target.value) {
            handleConnect(e.target.value);
          }
        }}
        disabled={isLoading}
        className="wallet-select"
      >
        <option value="">Choose Wallet</option>
        {availableWallets.map((wallet, index) => {
          const walletId = typeof wallet === 'string' ? wallet : wallet.id;
          const walletName = getWalletName(wallet);
          return (
            <option key={walletId || index} value={walletId}>
              {walletName}
            </option>
          );
        })}
      </select>
    </div>
  );

  /**
   * Render connected state
   */
  const renderConnectedState = () => (
    <div className="wallet-connected">
      <div className="connected-wallet-info">
        {showIcons && (
          <span className="wallet-icon" role="img">
            {getWalletIcon(currentWallet)}
          </span>
        )}
        <div className="wallet-details">
          <span className="wallet-name">{getWalletName(currentWallet)}</span>
          <span className="connection-status">Connected</span>
        </div>
      </div>
      <button
        onClick={handleDisconnect}
        disabled={isLoading}
        className="disconnect-button"
        title="Disconnect wallet"
      >
        {isLoading ? 'Disconnecting...' : 'Disconnect'}
      </button>
    </div>
  );

  if (isConnected) {
    return (
      <div className={`wallet-selector connected ${className}`}>
        {renderConnectedState()}
      </div>
    );
  }

  return (
    <div className={`wallet-selector ${layout} ${className}`}>
      {error && (
        <div className="wallet-error">
          <span className="error-message">{error}</span>
          <button onClick={clearError} className="error-close" title="Clear error">
            ×
          </button>
        </div>
      )}

      <div className="wallet-selector-header">
        <h3>Connect Wallet</h3>
        <p>Choose your preferred wallet to continue</p>
      </div>

      <div className={`wallet-options ${layout}`}>
        {availableWallets.length === 0 ? (
          <div className="no-wallets">
            <p>No wallets available</p>
            <small>Please install a supported wallet extension</small>
          </div>
        ) : layout === 'dropdown' ? (
          renderDropdown()
        ) : (
          <div className={`wallet-buttons ${layout}`}>
            {availableWallets.map((wallet, index) => renderWalletButton(wallet, index))}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="wallet-loading">
          <div className="loading-spinner"></div>
          <span>Connecting to wallet...</span>
        </div>
      )}

      <style jsx>{`
        .wallet-selector {
          padding: 1rem;
          border-radius: 8px;
          background: #f9f9f9;
          border: 1px solid #e0e0e0;
        }

        .wallet-selector.connected {
          background: #f0f8f0;
          border-color: #4caf50;
        }

        .wallet-error {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          background: #ffebee;
          border: 1px solid #f44336;
          border-radius: 4px;
          margin-bottom: 1rem;
          color: #d32f2f;
        }

        .error-close {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: #d32f2f;
          padding: 0;
          width: 20px;
          height: 20px;
        }

        .wallet-selector-header h3 {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 1.2rem;
        }

        .wallet-selector-header p {
          margin: 0 0 1rem 0;
          color: #666;
          font-size: 0.9rem;
        }

        .wallet-buttons.grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.75rem;
        }

        .wallet-buttons.list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .wallet-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border: 2px solid #ddd;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
          position: relative;
        }

        .wallet-button:hover {
          border-color: #2196f3;
          background: #f5f5f5;
        }

        .wallet-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .wallet-button.connected {
          border-color: #4caf50;
          background: #f0f8f0;
        }

        .wallet-icon {
          font-size: 1.2rem;
        }

        .wallet-name {
          font-weight: 500;
        }

        .connected-indicator {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #4caf50;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .wallet-dropdown {
          margin: 1rem 0;
        }

        .wallet-select {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #ddd;
          border-radius: 6px;
          background: white;
          font-size: 1rem;
          cursor: pointer;
        }

        .wallet-select:focus {
          border-color: #2196f3;
          outline: none;
        }

        .wallet-connected {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: white;
          border-radius: 6px;
          border: 2px solid #4caf50;
        }

        .connected-wallet-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .wallet-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .wallet-details .wallet-name {
          font-weight: 600;
          color: #333;
        }

        .connection-status {
          font-size: 0.8rem;
          color: #4caf50;
          font-weight: 500;
        }

        .disconnect-button {
          padding: 0.5rem 1rem;
          background: #f44336;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.2s ease;
        }

        .disconnect-button:hover {
          background: #d32f2f;
        }

        .disconnect-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .no-wallets {
          text-align: center;
          padding: 2rem;
          color: #666;
        }

        .no-wallets small {
          display: block;
          margin-top: 0.5rem;
          color: #999;
        }

        .wallet-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem;
          color: #666;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #2196f3;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .wallet-selector {
            background: #2d2d2d;
            border-color: #555;
            color: #fff;
          }

          .wallet-selector-header h3 {
            color: #fff;
          }

          .wallet-selector-header p {
            color: #ccc;
          }

          .wallet-button {
            background: #3d3d3d;
            border-color: #555;
            color: #fff;
          }

          .wallet-button:hover {
            background: #4d4d4d;
          }

          .wallet-select {
            background: #3d3d3d;
            border-color: #555;
            color: #fff;
          }

          .wallet-connected {
            background: #2d3d2d;
          }
        }
      `}</style>
    </div>
  );
};

WalletSelector.propTypes = {
  onConnect: PropTypes.func,
  onError: PropTypes.func,
  className: PropTypes.string,
  showIcons: PropTypes.bool,
  layout: PropTypes.oneOf(['grid', 'list', 'dropdown'])
};

export default WalletSelector;