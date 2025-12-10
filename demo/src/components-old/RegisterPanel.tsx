import React from 'react';
import type { Provider, DemoState } from '../types.js';
import { formatThreshold, truncateAddress } from '../utils.js';

interface RegisterPanelProps {
  selectedProviders: Provider[];
  threshold: number;
  registeredWallet?: DemoState['registeredWallet'];
  isRegistering: boolean;
  onThresholdChange: (threshold: number) => void;
  onRegisterClick: () => void;
}

export const RegisterPanel: React.FC<RegisterPanelProps> = ({
  selectedProviders,
  threshold,
  registeredWallet,
  isRegistering,
  onThresholdChange,
  onRegisterClick
}) => {
  const canRegister = selectedProviders.length >= threshold && threshold >= 1;
  const thresholdError = threshold > selectedProviders.length;

  return (
    <div className="panel">
      <h2>2. Register Wallet</h2>
      <p className="panel-description">
        Create a new wallet based on the currently selected identities:
      </p>
      
      <div className="threshold-selector">
        <label htmlFor="threshold">
          <strong>Threshold (K-of-N):</strong>
        </label>
        <select
          id="threshold"
          value={threshold}
          onChange={(e) => onThresholdChange(Number(e.target.value))}
          disabled={isRegistering}
        >
          {[1, 2, 3, 4].map(k => (
            <option key={k} value={k}>
              {k} of 4
            </option>
          ))}
        </select>
        <div className="threshold-description">
          {formatThreshold(threshold)}
        </div>
      </div>

      {thresholdError && (
        <div className="error">
          Threshold cannot be greater than selected identities ({selectedProviders.length}).
        </div>
      )}

      <button
        className="register-button"
        onClick={onRegisterClick}
        disabled={!canRegister || isRegistering}
      >
        {isRegistering ? 'Registering...' : 'Register Wallet with Current Identities'}
      </button>

      {registeredWallet && (
        <div className="result-box success">
          <div className="result-header">✅ Wallet Registered</div>
          
          <div className="result-item">
            <strong>Address:</strong> 
            <code title={registeredWallet.address}>
              {truncateAddress(registeredWallet.address)}
            </code>
          </div>
          
          <div className="result-item">
            <strong>Threshold:</strong> {registeredWallet.threshold} of 4
          </div>
          
          <div className="result-item">
            <strong>Salt:</strong> 
            <code title={registeredWallet.salt}>
              {truncateAddress(registeredWallet.salt, 16)}
            </code>
          </div>
          
          <div className="commitments-list">
            <strong>Commitments:</strong>
            {registeredWallet.commitments.map((commitment, idx) => (
              <div key={idx} className="commitment-item">
                <span className="provider-name">{commitment.claim.provider}:</span>
                <code title={commitment.commitment}>
                  {truncateAddress(commitment.commitment, 12)}
                </code>
              </div>
            ))}
          </div>
          
          <div className="storage-note">
            💾 Saved to localStorage
          </div>
        </div>
      )}
    </div>
  );
};