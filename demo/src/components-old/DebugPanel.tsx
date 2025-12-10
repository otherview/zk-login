import React, { useState } from 'react';
import type { DemoState } from '../types.js';

interface DebugPanelProps {
  state: DemoState;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ state }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const debugState = {
    selectedProviders: state.selectedProviders,
    threshold: state.threshold,
    wallet: state.registeredWallet ? {
      address: state.registeredWallet.address,
      threshold: state.registeredWallet.threshold,
      salt: state.registeredWallet.salt,
      commitments: state.registeredWallet.commitments.map(c => ({
        provider: c.claim.provider,
        stableId: c.claim.stableId,
        commitment: c.commitment
      }))
    } : null,
    latestLogin: state.latestLoginAttempt ? {
      usedProviders: state.latestLoginAttempt.usedProviders,
      recoveredAddress: state.latestLoginAttempt.recoveredAddress,
      matchesRegisteredAddress: state.latestLoginAttempt.matchesRegistered,
      success: state.latestLoginAttempt.success,
      error: state.latestLoginAttempt.error || null
    } : null,
    loadingStates: {
      isInitialized: state.isInitialized,
      isRegistering: state.isRegistering,
      isRecovering: state.isRecovering
    }
  };

  return (
    <div className="panel debug-panel">
      <div 
        className="debug-header" 
        onClick={() => setIsCollapsed(!isCollapsed)}
        role="button"
        tabIndex={0}
      >
        <h2>4. Debug / Internal State</h2>
        <span className="collapse-indicator">
          {isCollapsed ? '▶' : '▼'}
        </span>
      </div>
      
      {!isCollapsed && (
        <div className="debug-content">
          <p className="panel-description">
            Pretty-printed JSON view of internal state for verification:
          </p>
          
          <pre className="debug-json">
            <code>
              {JSON.stringify(debugState, null, 2)}
            </code>
          </pre>
          
          <div className="debug-notes">
            <h4>Verification Points:</h4>
            <ul>
              <li>✓ Commitments are stable across sessions</li>
              <li>✓ Threshold is used consistently</li>
              <li>✓ Recovery produces same address as registration</li>
              <li>✓ Error handling for insufficient identities</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};