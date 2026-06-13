/**
 * Token Importer Component
 * UI for adding new tokens to the wallet
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTokenImporter, useTokenVerification } from '../hooks/useTokenImporter.js';

const TokenImporter = ({ 
  onTokenAdded,
  onError,
  className = '',
  showSuggestions = true,
  autoFocus = false
}) => {
  const {
    isImporting,
    importError,
    importSuccess,
    importTokenByCanisterId,
    importSuggested,
    validateTokenInput,
    clearMessages,
    suggestedTokens
  } = useTokenImporter();

  const { getVerificationStatus } = useTokenVerification();

  const [formData, setFormData] = useState({
    canisterId: '',
    symbol: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  /**
   * Handle input changes
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation errors for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }

    // Clear import messages
    clearMessages();
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    const validation = validateTokenInput(formData.canisterId, formData.symbol);
    
    if (!validation.valid) {
      setValidationErrors({
        canisterId: validation.error
      });
      return false;
    }

    setValidationErrors({});
    return true;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const newToken = await importTokenByCanisterId(
        formData.canisterId, 
        formData.symbol
      );

      if (onTokenAdded) {
        onTokenAdded(newToken);
      }

      // Reset form
      setFormData({ canisterId: '', symbol: '' });
    } catch (error) {
      if (onError) {
        onError(error);
      }
    }
  };

  /**
   * Handle suggested token import
   */
  const handleSuggestedImport = async (suggestion) => {
    try {
      const newToken = await importSuggested(suggestion);
      
      if (onTokenAdded) {
        onTokenAdded(newToken);
      }
    } catch (error) {
      if (onError) {
        onError(error);
      }
    }
  };

  /**
   * Get verification warning
   */
  const getVerificationWarning = () => {
    if (!formData.canisterId) return null;
    
    try {
      const status = getVerificationStatus({ canisterId: formData.canisterId });
      return status.warning;
    } catch {
      return null;
    }
  };

  const verificationWarning = getVerificationWarning();

  return (
    <div className={`token-importer ${className}`}>
      <div className="importer-header">
        <h3>Add Token</h3>
        <p>Import custom tokens by entering their canister ID</p>
      </div>

      {/* Status Messages */}
      {importError && (
        <div className="status-message error">
          <span className="status-icon">⚠️</span>
          <span className="status-text">{importError}</span>
          <button onClick={clearMessages} className="status-close">×</button>
        </div>
      )}

      {importSuccess && (
        <div className="status-message success">
          <span className="status-icon">✅</span>
          <span className="status-text">{importSuccess}</span>
          <button onClick={clearMessages} className="status-close">×</button>
        </div>
      )}

      {/* Import Form */}
      <form onSubmit={handleSubmit} className="import-form">
        <div className="form-group">
          <label htmlFor="canisterId" className="form-label">
            Canister ID *
          </label>
          <input
            id="canisterId"
            type="text"
            value={formData.canisterId}
            onChange={(e) => handleInputChange('canisterId', e.target.value)}
            placeholder="Enter token canister ID"
            className={`form-input ${validationErrors.canisterId ? 'error' : ''}`}
            disabled={isImporting}
            autoFocus={autoFocus}
          />
          {validationErrors.canisterId && (
            <span className="form-error">{validationErrors.canisterId}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="symbol" className="form-label">
            Symbol (Optional)
          </label>
          <input
            id="symbol"
            type="text"
            value={formData.symbol}
            onChange={(e) => handleInputChange('symbol', e.target.value)}
            placeholder="Token symbol (auto-detected if empty)"
            className="form-input"
            disabled={isImporting}
            maxLength={10}
          />
          <small className="form-help">
            Symbol will be auto-fetched from canister if not provided
          </small>
        </div>

        {/* Verification Warning */}
        {verificationWarning && (
          <div className="verification-warning">
            <span className="warning-icon">⚠️</span>
            <span className="warning-text">{verificationWarning}</span>
          </div>
        )}

        {/* Advanced Options */}
        <div className="advanced-toggle">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="toggle-button"
          >
            Advanced Options {showAdvanced ? '▲' : '▼'}
          </button>
        </div>

        {showAdvanced && (
          <div className="advanced-options">
            <p className="advanced-note">
              Token metadata (name, decimals, fees) will be automatically fetched from the canister.
              Manual configuration is not currently supported in this version.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isImporting || !formData.canisterId}
          className="import-button"
        >
          {isImporting ? (
            <>
              <span className="button-spinner"></span>
              Importing...
            </>
          ) : (
            'Import Token'
          )}
        </button>
      </form>

      {/* Suggested Tokens */}
      {showSuggestions && suggestedTokens.length > 0 && (
        <div className="suggested-tokens">
          <h4>Popular Tokens</h4>
          <div className="suggestions-grid">
            {suggestedTokens.map((suggestion, index) => (
              <button
                key={suggestion.canisterId || index}
                onClick={() => handleSuggestedImport(suggestion)}
                disabled={isImporting}
                className="suggestion-button"
                title={suggestion.description}
              >
                <div className="suggestion-header">
                  <span className="suggestion-symbol">{suggestion.symbol}</span>
                  <span className="verification-badge">✓</span>
                </div>
                <div className="suggestion-name">{suggestion.name}</div>
                <div className="suggestion-id">
                  {suggestion.canisterId.slice(0, 8)}...
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .token-importer {
          padding: 1.5rem;
          border-radius: 8px;
          background: #f9f9f9;
          border: 1px solid #e0e0e0;
          max-width: 500px;
        }

        .importer-header h3 {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 1.3rem;
        }

        .importer-header p {
          margin: 0 0 1.5rem 0;
          color: #666;
          font-size: 0.9rem;
        }

        .status-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1rem;
        }

        .status-message.error {
          background: #ffebee;
          border: 1px solid #f44336;
          color: #d32f2f;
        }

        .status-message.success {
          background: #e8f5e8;
          border: 1px solid #4caf50;
          color: #2e7d32;
        }

        .status-text {
          flex: 1;
          font-size: 0.9rem;
        }

        .status-close {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: inherit;
          padding: 0;
          width: 20px;
          height: 20px;
        }

        .import-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-weight: 500;
          color: #333;
          font-size: 0.9rem;
        }

        .form-input {
          padding: 0.75rem;
          border: 2px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }

        .form-input:focus {
          border-color: #2196f3;
          outline: none;
        }

        .form-input.error {
          border-color: #f44336;
        }

        .form-input:disabled {
          background: #f5f5f5;
          color: #999;
        }

        .form-error {
          color: #f44336;
          font-size: 0.8rem;
        }

        .form-help {
          color: #666;
          font-size: 0.8rem;
        }

        .verification-warning {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.75rem;
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 6px;
          color: #856404;
        }

        .warning-text {
          font-size: 0.85rem;
          line-height: 1.4;
        }

        .advanced-toggle {
          margin: 0.5rem 0;
        }

        .toggle-button {
          background: none;
          border: none;
          color: #2196f3;
          cursor: pointer;
          font-size: 0.9rem;
          padding: 0.5rem 0;
        }

        .toggle-button:hover {
          text-decoration: underline;
        }

        .advanced-options {
          padding: 1rem;
          background: #f0f0f0;
          border-radius: 6px;
          margin-bottom: 1rem;
        }

        .advanced-note {
          margin: 0;
          font-size: 0.85rem;
          color: #666;
          line-height: 1.4;
        }

        .import-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem;
          background: #2196f3;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .import-button:hover:not(:disabled) {
          background: #1976d2;
        }

        .import-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .button-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #ffffff40;
          border-top: 2px solid #ffffff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .suggested-tokens {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e0e0e0;
        }

        .suggested-tokens h4 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.1rem;
        }

        .suggestions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.75rem;
        }

        .suggestion-button {
          padding: 0.75rem;
          background: white;
          border: 2px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }

        .suggestion-button:hover:not(:disabled) {
          border-color: #2196f3;
          transform: translateY(-1px);
        }

        .suggestion-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .suggestion-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .suggestion-symbol {
          font-weight: 600;
          color: #333;
        }

        .verification-badge {
          color: #4caf50;
          font-size: 0.8rem;
        }

        .suggestion-name {
          font-size: 0.8rem;
          color: #666;
          margin-bottom: 0.25rem;
        }

        .suggestion-id {
          font-size: 0.7rem;
          color: #999;
          font-family: monospace;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .token-importer {
            background: #2d2d2d;
            border-color: #555;
            color: #fff;
          }

          .importer-header h3 {
            color: #fff;
          }

          .importer-header p {
            color: #ccc;
          }

          .form-label {
            color: #fff;
          }

          .form-input {
            background: #3d3d3d;
            border-color: #555;
            color: #fff;
          }

          .form-input:disabled {
            background: #444;
          }

          .form-help {
            color: #ccc;
          }

          .advanced-options {
            background: #3d3d3d;
          }

          .suggestion-button {
            background: #3d3d3d;
            border-color: #555;
            color: #fff;
          }

          .suggestion-symbol {
            color: #fff;
          }
        }
      `}</style>
    </div>
  );
};

TokenImporter.propTypes = {
  onTokenAdded: PropTypes.func,
  onError: PropTypes.func,
  className: PropTypes.string,
  showSuggestions: PropTypes.bool,
  autoFocus: PropTypes.bool
};

export default TokenImporter;