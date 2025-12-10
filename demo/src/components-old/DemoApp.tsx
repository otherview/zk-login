import React, { useState, useEffect } from 'react';
import { initZkLogin, registerWallet, zkLogin, InsufficientIdentitiesError } from '../../../src/index.js';
import type { Provider, DemoState } from '../types.js';
import { getSelectedIdentities, saveToLocalStorage, loadFromLocalStorage } from '../utils.js';

import { Header } from './Header.js';
import { IdentityPanel } from './IdentityPanel.js';
import { RegisterPanel } from './RegisterPanel.js';
import { RecoverPanel } from './RecoverPanel.js';
import { DebugPanel } from './DebugPanel.js';

export const DemoApp: React.FC = () => {
  const [state, setState] = useState<DemoState>({
    selectedProviders: [],
    threshold: 2,
    registeredWallet: undefined,
    latestLoginAttempt: undefined,
    isRegistering: false,
    isRecovering: false,
    isInitialized: false
  });

  // Initialize the app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize zk-login library
        await initZkLogin({ provingSystem: 'mock' });
        
        // Load persisted wallet data
        const storedWallet = loadFromLocalStorage();
        
        setState(prev => ({
          ...prev,
          registeredWallet: storedWallet ? {
            address: storedWallet.address,
            threshold: storedWallet.threshold,
            salt: storedWallet.salt,
            commitments: storedWallet.commitments
          } : undefined,
          isInitialized: true
        }));
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setState(prev => ({ ...prev, isInitialized: true }));
      }
    };

    initializeApp();
  }, []);

  // Handler: Toggle provider selection
  const handleProviderToggle = (provider: Provider) => {
    setState(prev => ({
      ...prev,
      selectedProviders: prev.selectedProviders.includes(provider)
        ? prev.selectedProviders.filter(p => p !== provider)
        : [...prev.selectedProviders, provider],
      // Clear login attempt when selection changes
      latestLoginAttempt: undefined
    }));
  };

  // Handler: Change threshold
  const handleThresholdChange = (threshold: number) => {
    setState(prev => ({ ...prev, threshold }));
  };

  // Handler: Register wallet
  const handleRegisterClick = async () => {
    const { selectedProviders, threshold } = state;
    
    // UI validation
    if (threshold > selectedProviders.length || selectedProviders.length === 0) {
      return;
    }
    
    setState(prev => ({ ...prev, isRegistering: true }));
    
    try {
      const identities = getSelectedIdentities(selectedProviders);
      const result = await registerWallet({ 
        identities, 
        threshold, 
        exposePrivateKey: true 
      });
      
      const walletData = {
        address: result.address,
        threshold,
        salt: result.salt,
        commitments: result.commitments
      };
      
      // Update state and persist
      setState(prev => ({ 
        ...prev, 
        registeredWallet: walletData, 
        isRegistering: false,
        // Clear any previous login attempts
        latestLoginAttempt: undefined
      }));
      saveToLocalStorage(walletData);
      
    } catch (error: any) {
      console.error('Registration failed:', error);
      setState(prev => ({ ...prev, isRegistering: false }));
      // Could add error state to show in UI
    }
  };

  // Handler: Recover wallet
  const handleRecoverClick = async () => {
    const { selectedProviders, registeredWallet } = state;
    
    if (!registeredWallet) return;
    
    setState(prev => ({ ...prev, isRecovering: true }));
    
    try {
      const identities = getSelectedIdentities(selectedProviders);
      const result = await zkLogin({
        identities,
        commitments: registeredWallet.commitments,
        salt: registeredWallet.salt,
        threshold: registeredWallet.threshold,
        exposePrivateKey: true
      });
      
      const loginAttempt = {
        usedProviders: selectedProviders,
        recoveredAddress: result.wallet.address,
        matchesRegistered: result.wallet.address === registeredWallet.address,
        success: true,
        error: undefined
      };
      
      setState(prev => ({ 
        ...prev, 
        latestLoginAttempt: loginAttempt,
        isRecovering: false 
      }));
      
    } catch (error: any) {
      console.error('Recovery failed:', error);
      
      let errorMessage: string;
      if (error instanceof InsufficientIdentitiesError || error.name === 'InsufficientIdentitiesError') {
        errorMessage = `Provided: ${selectedProviders.length}, Required: ${registeredWallet.threshold}`;
      } else {
        errorMessage = error.message || 'Unknown error occurred';
      }
      
      const loginAttempt = {
        usedProviders: selectedProviders,
        success: false,
        matchesRegistered: false,
        error: errorMessage
      };
      
      setState(prev => ({ 
        ...prev, 
        latestLoginAttempt: loginAttempt,
        isRecovering: false 
      }));
    }
  };

  if (!state.isInitialized) {
    return (
      <div className="loading">
        <div className="loading-spinner">⏳</div>
        <div>Initializing ZK-Login Demo...</div>
      </div>
    );
  }

  return (
    <div className="demo-app">
      <Header />
      
      <div className="main-grid">
        <IdentityPanel
          selectedProviders={state.selectedProviders}
          onProviderToggle={handleProviderToggle}
        />
        
        <RegisterPanel
          selectedProviders={state.selectedProviders}
          threshold={state.threshold}
          registeredWallet={state.registeredWallet}
          isRegistering={state.isRegistering}
          onThresholdChange={handleThresholdChange}
          onRegisterClick={handleRegisterClick}
        />
        
        <RecoverPanel
          selectedProviders={state.selectedProviders}
          registeredWallet={state.registeredWallet}
          latestLoginAttempt={state.latestLoginAttempt}
          isRecovering={state.isRecovering}
          onRecoverClick={handleRecoverClick}
        />
      </div>
      
      <DebugPanel state={state} />
    </div>
  );
};