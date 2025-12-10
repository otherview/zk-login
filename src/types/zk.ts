import type { IdentityClaim } from './identity.js';

export interface ZkProof {
  proof: string;
  publicSignals: string[];
}

export interface ZkWitness {
  identityClaims: IdentityClaim[];
  salt: string;
}

export interface ZkPublicInputs {
  commitments: string[];
  threshold: number;
}

export interface ZkProofResult {
  proof: ZkProof;
  zkOutput: string;
}