import React from 'react';
import type { Provider, DemoState } from '../types.js';
import { truncateAddress, PROVIDER_DISPLAY_NAMES } from '../utils.js';

interface RecoverPanelProps {
  selectedProviders: Provider[];
  registeredWallet?: DemoState['registeredWallet'];
  latestLoginAttempt?: DemoState['latestLoginAttempt'];
  isRecovering: boolean;
  onRecoverClick: () => void;
}

export const RecoverPanel: React.FC<RecoverPanelProps> = ({
  selectedProviders,
  registeredWallet,
  latestLoginAttempt,
  isRecovering,
  onRecoverClick
}) => {
  const canRecover = registeredWallet && selectedProviders.length > 0;

  return (
    <div className="panel">
      <h2>3. Login / Recover</h2>
      <p className="panel-description">
        Recover the wallet using a (possibly different) subset of identities:
      </p>
      
      <div className="wallet-info">
        {registeredWallet ? (
          <>
            <div className="info-item">
              <strong>Current wallet address:</strong> 
              <code title={registeredWallet.address}>
                {truncateAddress(registeredWallet.address)}
              </code>
            </div>
            <div className="info-item">
              <strong>Threshold:</strong> {registeredWallet.threshold} of 4
            </div>
          </>
        ) : (
          <div className="no-wallet">
            No wallet registered yet.
          </div>
        )}
      </div>

      <button
        className="recover-button"
        onClick={onRecoverClick}
        disabled={!canRecover || isRecovering}
      >
        {isRecovering ? 'Recovering...' : 'Recover Wallet with Current Identities'}
      </button>

      {latestLoginAttempt && (
        <div className={`result-box ${latestLoginAttempt.success ? 'success' : 'error'}`}>
          {latestLoginAttempt.success ? (
            <>
              <div className="result-header">✅ Recovery Successful</div>
              
              <div className="result-item">
                <strong>Recovered address:</strong>
                <code title={latestLoginAttempt.recoveredAddress}>
                  {latestLoginAttempt.recoveredAddress && truncateAddress(latestLoginAttempt.recoveredAddress)}
                </code>
              </div>
              
              <div className="result-item">
                <strong>Status:</strong> 
                <span className={latestLoginAttempt.matchesRegistered ? 'match' : 'no-match'}>
                  {latestLoginAttempt.matchesRegistered ? 'MATCHES' : 'DOES NOT MATCH'} registered address
                </span>
              </div>
              
              <div className="result-item">
                <strong>Providers used:</strong> 
                {latestLoginAttempt.usedProviders.map(p => PROVIDER_DISPLAY_NAMES[p]).join(', ')}
              </div>
            </>
          ) : (
            <>
              <div className="result-header">❌ Recovery Failed</div>
              
              <div className="result-item">
                <strong>Error:</strong> {latestLoginAttempt.error}
              </div>
              
              <div className="result-item">
                <strong>Providers attempted:</strong> 
                {latestLoginAttempt.usedProviders.map(p => PROVIDER_DISPLAY_NAMES[p]).join(', ')}
              </div>
              
              {registeredWallet && selectedProviders.length < registeredWallet.threshold && (
                <div className="hint">
                  💡 <strong>Hint:</strong> Select at least {registeredWallet.threshold} identities in panel 1 and try again.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};