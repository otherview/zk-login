import type {
  SupportedIdentity,
  Commitment,
  ZkLoginConfig,
  RegisterWalletParams,
  RegisterWalletResult,
  ZkLoginParams,
  ZkLoginResult
} from '../../src/index.js';

// Provider types for demo (includes Twitter)
export type Provider = 'google' | 'github' | 'twitter' | 'passkey';

// Demo state interface
export interface DemoState {
  // Selected identities in Identity Panel
  selectedProviders: Provider[];
  
  // Registration threshold (K in K-of-N)
  threshold: number;
  
  // Registered wallet info (from registerWallet)
  registeredWallet?: {
    address: string;
    threshold: number;
    salt: string;
    commitments: Commitment[];
  };
  
  // Latest login/recovery attempt result
  latestLoginAttempt?: {
    usedProviders: Provider[];
    recoveredAddress?: string;
    matchesRegistered: boolean;
    success: boolean;
    error?: string;
  };
  
  // Loading states
  isRegistering: boolean;
  isRecovering: boolean;
  isInitialized: boolean;
}

// localStorage persistence interface
export interface StoredWalletData {
  address: string;
  threshold: number;
  salt: string;
  commitments: Commitment[];
  timestamp: number;
}

// Re-export library types for convenience
export type {
  Commitment,
  ZkLoginConfig,
  RegisterWalletParams,
  RegisterWalletResult,
  ZkLoginParams,
  ZkLoginResult
};