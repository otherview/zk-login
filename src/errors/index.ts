export class InvalidIdentityTokenError extends Error {
  readonly provider: string;
  
  constructor(provider: string, reason?: string) {
    super(`Invalid ${provider} token: ${reason || 'token validation failed'}`);
    this.name = 'InvalidIdentityTokenError';
    this.provider = provider;
  }
}

export class InsufficientIdentitiesError extends Error {
  readonly provided: number;
  readonly required: number;
  
  constructor(provided: number, required: number) {
    super(`Insufficient identities: provided ${provided}, required ${required}`);
    this.name = 'InsufficientIdentitiesError';
    this.provided = provided;
    this.required = required;
  }
}

export class ProofGenerationError extends Error {
  constructor(reason?: string) {
    super(`Proof generation failed: ${reason || 'unknown error'}`);
    this.name = 'ProofGenerationError';
  }
}

export class ProofVerificationError extends Error {
  constructor(reason?: string) {
    super(`Proof verification failed: ${reason || 'invalid proof'}`);
    this.name = 'ProofVerificationError';
  }
}

export class ZkLoginNotInitializedError extends Error {
  constructor() {
    super('ZK Login system not initialized. Call initZkLogin() first.');
    this.name = 'ZkLoginNotInitializedError';
  }
}