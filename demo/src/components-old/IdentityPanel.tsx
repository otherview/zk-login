import React from 'react';
import type { Provider } from '../types.js';
import { PROVIDER_DISPLAY_NAMES, PROVIDER_MOCK_IDS } from '../utils.js';

interface IdentityPanelProps {
  selectedProviders: Provider[];
  onProviderToggle: (provider: Provider) => void;
}

const ALL_PROVIDERS: Provider[] = ['google', 'github', 'twitter', 'passkey'];

export const IdentityPanel: React.FC<IdentityPanelProps> = ({
  selectedProviders,
  onProviderToggle
}) => {
  return (
    <div className="panel">
      <h2>1. Identity Factors</h2>
      <p className="panel-description">
        Select which identities you "have" available in the current session:
      </p>
      
      <div className="identity-list">
        {ALL_PROVIDERS.map(provider => (
          <label key={provider} className="identity-item">
            <input
              type="checkbox"
              checked={selectedProviders.includes(provider)}
              onChange={() => onProviderToggle(provider)}
            />
            <div className="identity-info">
              <div className="identity-name">
                {PROVIDER_DISPLAY_NAMES[provider]}
              </div>
              <div className="identity-mock-id">
                → {PROVIDER_MOCK_IDS[provider]}
              </div>
            </div>
          </label>
        ))}
      </div>
      
      <div className="selection-summary">
        <strong>Selected:</strong> {selectedProviders.length} of {ALL_PROVIDERS.length} identities
      </div>
    </div>
  );
};