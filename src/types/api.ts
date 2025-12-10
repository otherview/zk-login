import type { SupportedIdentity } from './identity.js';
import type { Commitment } from './commitment.js';
import type { ZkProof } from './zk.js';
import type { ZkWallet } from './wallet.js';

export interface ZkLoginConfig {
  provingSystem: 'mock' | 'plonk';
  wasmUrl?: string;
  zkeyUrl?: string;
}

export interface RegisterWalletParams {
  identities: SupportedIdentity[];
  threshold: number;
  exposePrivateKey?: boolean;
}

export interface RegisterWalletResult {
  commitments: Commitment[];
  salt: string;
  address: string;
  privateKey?: string;
}

export interface ZkLoginParams {
  identities: SupportedIdentity[];
  commitments: Commitment[];
  salt: string;
  threshold: number;
  exposePrivateKey?: boolean;
}

export interface ZkLoginResult {
  proof: ZkProof;
  publicSignals: string[];
  wallet: ZkWallet;
  privateKey?: string;
}