import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="header">
      <h1>🔐 ZK-Login Wallet Demo</h1>
      <div className="demo-warning">
        🔐 <strong>Demo Mode:</strong> Private keys are derived and shown only for testing.
        This does not represent real wallet behavior.
      </div>
      <p className="description">
        Demonstrate seedless EOA wallet creation and recovery using K-of-N identity factors 
        (Google, GitHub, Passkey) with consistent EVM addresses.
      </p>
    </header>
  );
};