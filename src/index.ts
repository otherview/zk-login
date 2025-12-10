// Main API exports
export {
  initZkLogin,
  registerWallet,
  zkLogin,
  createSignerFromProof
} from './api/index.js';

// Type exports
export type {
  PasskeyAssertion,
  GoogleIdentity,
  GitHubIdentity,
  TwitterIdentity,
  PasskeyIdentity,
  SupportedIdentity,
  IdentityClaim,
  Commitment,
  ZkProof,
  ZkWitness,
  ZkPublicInputs,
  ZkProofResult,
  ZkWallet,
  ZkLoginConfig,
  RegisterWalletParams,
  RegisterWalletResult,
  ZkLoginParams,
  ZkLoginResult
} from './types/index.js';

// Error exports
export {
  InvalidIdentityTokenError,
  InsufficientIdentitiesError,
  ProofGenerationError,
  ProofVerificationError,
  ZkLoginNotInitializedError
} from './errors/index.js';

// Utility exports (for advanced usage)
export {
  extractIdentityClaim
} from './identity/index.js';

export {
  generateCommitments,
  computeCommitment,
  createRandomSalt,
  validateCommitment
} from './commitments/index.js';