import React from 'react';
import type { Mode, Provider, AppState, WalletData } from '../types.js';
import { truncateAddress, PROVIDER_DISPLAY_NAMES } from '../utils.js';

interface KeyDerivationInspectorProps {
  mode: Mode;
  registeredWallet?: WalletData;
  latestRecoveryAttempt?: AppState['latestRecoveryAttempt'];
}

export const KeyDerivationInspector: React.FC<KeyDerivationInspectorProps> = ({
  mode,
  registeredWallet,
  latestRecoveryAttempt
}) => {
  // Handle no wallet case
  if (!registeredWallet) {
    return (
      <div className="key-inspector-container">
        <div className="key-inspector-empty">
          No wallet exists in {mode === 'demo' ? 'Demo' : 'Live'} mode
        </div>
      </div>
    );
  }

  // Helper to get current identities used for registration
  const getRegistrationProviders = (): Provider[] => {
    return registeredWallet.commitments.map(c => c.claim.provider as Provider);
  };

  // Helper for address verification status
  const getVerificationStatus = () => {
    if (!latestRecoveryAttempt) {
      return { icon: '⏳', text: 'No recovery attempt yet', className: 'pending' };
    }
    
    if (!latestRecoveryAttempt.success) {
      return { icon: '❌', text: 'Recovery failed', className: 'error' };
    }
    
    const matches = latestRecoveryAttempt.recoveredAddress === registeredWallet.address;
    return {
      icon: matches ? '✅' : '❌',
      text: matches ? 'Derived address matches wallet' : 'Address mismatch',
      className: matches ? 'success' : 'error'
    };
  };

  // Helper for private key comparison (Demo mode only)
  const getPrivateKeyComparison = () => {
    if (mode !== 'demo') return null;
    
    const regKey = registeredWallet.privateKey;
    const recoveryKey = latestRecoveryAttempt?.privateKey;
    
    if (!regKey && !recoveryKey) return null;
    
    return {
      registration: regKey,
      recovery: recoveryKey,
      match: regKey && recoveryKey ? regKey === recoveryKey : null
    };
  };

  const registrationProviders = getRegistrationProviders();
  const verificationStatus = getVerificationStatus();
  const privateKeyComparison = getPrivateKeyComparison();

  return (
    <div className="key-inspector-container">
      
      {/* Section 1: Identities Used */}
      <div className="inspector-section">
        <div className="inspector-section-title">1. IDENTITIES USED</div>
        
        <div className="inspector-subsection">
          <div className="inspector-label">Registration:</div>
          <div className="inspector-list">
            {registrationProviders.map(provider => (
              <div key={provider} className="inspector-row">
                <span className="provider-name">{PROVIDER_DISPLAY_NAMES[provider]}:</span>
                <code 
                  className="stable-id" 
                  title={registeredWallet.commitments.find(c => c.claim.provider === provider)?.claim.stableId}
                >
                  {truncateAddress(
                    registeredWallet.commitments.find(c => c.claim.provider === provider)?.claim.stableId || '', 
                    12
                  )}
                </code>
              </div>
            ))}
          </div>
        </div>

        {latestRecoveryAttempt && (
          <div className="inspector-subsection">
            <div className="inspector-label">Latest Recovery:</div>
            <div className="inspector-list">
              {latestRecoveryAttempt.usedProviders.map(provider => (
                <div key={provider} className="inspector-row">
                  <span className="provider-name">{PROVIDER_DISPLAY_NAMES[provider]}</span>
                  {latestRecoveryAttempt.success ? 
                    <span className="success-indicator">✓</span> : 
                    <span className="error-indicator">✗</span>
                  }
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Commitments */}
      <div className="inspector-section">
        <div className="inspector-section-title">2. COMMITMENTS</div>
        <div className="inspector-list">
          {registeredWallet.commitments.map((commitment, idx) => (
            <div key={idx} className="inspector-row">
              <span className="provider-name">
                {PROVIDER_DISPLAY_NAMES[commitment.claim.provider as Provider]}:
              </span>
              <code 
                className="commitment-hash" 
                title={commitment.commitment}
              >
                {truncateAddress(commitment.commitment, 12)}
              </code>
            </div>
          ))}
        </div>
        <div className="inspector-summary">
          {registeredWallet.commitments.length} commitments
        </div>
      </div>

      {/* Section 3: Threshold */}
      <div className="inspector-section">
        <div className="inspector-section-title">3. THRESHOLD</div>
        <div className="inspector-row">
          <span className="threshold-display">
            K = {registeredWallet.threshold} of 4 providers required
          </span>
        </div>
      </div>

      {/* Section 4: ZK Public Inputs */}
      <div className="inspector-section">
        <div className="inspector-section-title">4. ZK PUBLIC INPUTS</div>
        <div className="inspector-list">
          <div className="inspector-row">
            <span className="input-label">Commitments[]:</span>
            <span className="input-value">→ See section 2 ({registeredWallet.commitments.length} items)</span>
          </div>
          <div className="inspector-row">
            <span className="input-label">Threshold:</span>
            <span className="input-value">{registeredWallet.threshold}</span>
          </div>
          <div className="inspector-row">
            <span className="input-label">Salt:</span>
            <code 
              className="salt-value" 
              title={registeredWallet.salt}
            >
              {truncateAddress(registeredWallet.salt, 16)}
            </code>
          </div>
        </div>
      </div>

      {/* Section 5: zkOutput */}
      <div className="inspector-section">
        <div className="inspector-section-title">5. ZKOUTPUT</div>
        <div className="inspector-placeholder">
          Not exposed by SDK (internal ZK-derived seed)
        </div>
      </div>

      {/* Section 6: Key Derivation */}
      <div className="inspector-section">
        <div className="inspector-section-title">6. KEY DERIVATION</div>
        <div className="inspector-list">
          <div className="inspector-row">
            <span className="derivation-label">HKDF Input:</span>
            <span className="inspector-placeholder">Internal SDK derivation (not exposed)</span>
          </div>
          
          {privateKeyComparison && (
            <>
              {privateKeyComparison.registration && (
                <div className="inspector-row">
                  <span className="derivation-label">Private Key (Registration):</span>
                  <code 
                    className="private-key" 
                    title={privateKeyComparison.registration}
                  >
                    {truncateAddress(privateKeyComparison.registration, 16)}
                  </code>
                </div>
              )}
              
              {privateKeyComparison.recovery && (
                <div className="inspector-row">
                  <span className="derivation-label">Private Key (Recovery):</span>
                  <code 
                    className="private-key" 
                    title={privateKeyComparison.recovery}
                  >
                    {truncateAddress(privateKeyComparison.recovery, 16)}
                  </code>
                </div>
              )}
              
              {privateKeyComparison.match !== null && (
                <div className="inspector-row">
                  <span className="derivation-label">Key Match:</span>
                  <span className={`key-match ${privateKeyComparison.match ? 'success' : 'error'}`}>
                    {privateKeyComparison.match ? '✅ Keys match' : '❌ Keys differ'}
                  </span>
                </div>
              )}
            </>
          )}
          
          <div className="inspector-row">
            <span className="derivation-label">Derived Address:</span>
            <code 
              className="derived-address" 
              title={registeredWallet.address}
            >
              {truncateAddress(registeredWallet.address)}
            </code>
          </div>
        </div>
      </div>

      {/* Section 7: Verification */}
      <div className="inspector-section">
        <div className="inspector-section-title">7. VERIFICATION</div>
        <div className="inspector-row">
          <span className="verification-label">Address Match:</span>
          <span className={`verification-status ${verificationStatus.className}`}>
            {verificationStatus.icon} {verificationStatus.text}
          </span>
        </div>
        
        {latestRecoveryAttempt && !latestRecoveryAttempt.success && (
          <div className="inspector-row">
            <span className="verification-label">Recovery Error:</span>
            <span className="error-message">{latestRecoveryAttempt.error}</span>
          </div>
        )}
      </div>

    </div>
  );
};