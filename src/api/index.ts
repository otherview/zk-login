import type {
  ZkLoginConfig,
  RegisterWalletParams,
  RegisterWalletResult,
  ZkLoginParams,
  ZkLoginResult,
  ZkWallet,
  ZkProof,
  Commitment
} from '../types/index.js';
import { extractIdentityClaim } from '../identity/index.js';
import { generateCommitments, createRandomSalt, validateCommitment } from '../commitments/index.js';
import { generateMockProof, verifyMockProof } from '../zk/index.js';
import { deriveWalletKey, createWalletFromPrivateKey, hashSha256 } from '../crypto/index.js';
import { 
  InsufficientIdentitiesError, 
  ProofVerificationError 
} from '../errors/index.js';
import { initializeZkLogin, getZkLoginConfig } from './state.js';

export async function initZkLogin(config: ZkLoginConfig): Promise<void> {
  // For mock implementation, just store the config
  // In real implementation, this would load WASM, proving keys, etc.
  initializeZkLogin(config);
}

export async function registerWallet(params: RegisterWalletParams): Promise<RegisterWalletResult> {
  getZkLoginConfig(); // Ensure initialized
  
  const { identities, threshold, exposePrivateKey = false } = params;

  // Step 1: Extract identity claims
  const claims = identities.map(extractIdentityClaim);

  // Step 2: Generate random salt
  const salt = createRandomSalt();

  // Step 3: Generate commitments
  const commitments = generateCommitments(claims, salt);

  // Step 4: Build public inputs and witness
  const publicInputs = {
    commitments: commitments.map(c => c.commitment),
    threshold
  };

  const witness = {
    identityClaims: claims,
    salt
  };

  // Step 5: Generate mock proof
  const { zkOutput } = generateMockProof(witness, publicInputs);

  // Step 6: Derive wallet key
  const { privateKey, address } = deriveWalletKey({
    zkOutput,
    commitments: publicInputs.commitments
  });

  // Step 7: Return result
  const result: RegisterWalletResult = {
    commitments,
    salt,
    address
  };

  if (exposePrivateKey) {
    result.privateKey = privateKey;
  }

  return result;
}

export async function zkLogin(params: ZkLoginParams): Promise<ZkLoginResult> {
  getZkLoginConfig(); // Ensure initialized
  
  const { identities, commitments, salt, threshold, exposePrivateKey = false } = params;

  // Step 1: Extract identity claims
  const claims = identities.map(extractIdentityClaim);

  // Step 2: Validate we have enough identities
  if (claims.length < threshold) {
    throw new InsufficientIdentitiesError(claims.length, threshold);
  }

  // Step 3: Validate that provided identities match stored commitments
  const matchingCommitments: string[] = [];
  for (const claim of claims) {
    const isValid = commitments.some(stored => 
      validateCommitment(claim, salt, stored.commitment)
    );
    if (!isValid) {
      throw new InsufficientIdentitiesError(
        0, threshold // No valid identities found
      );
    }
    
    // Find the matching commitment
    const matchingCommitment = commitments.find(stored =>
      validateCommitment(claim, salt, stored.commitment)
    );
    if (matchingCommitment) {
      matchingCommitments.push(matchingCommitment.commitment);
    }
  }

  // Step 4: Build public inputs using stored commitments in original order
  const storedCommitmentStrings = commitments.map(c => c.commitment);
  const publicInputs = {
    commitments: storedCommitmentStrings,
    threshold
  };

  const witness = {
    identityClaims: claims,
    salt
  };

  // Step 5: Generate mock proof
  const { proof, zkOutput } = generateMockProof(witness, publicInputs);

  // Step 6: Verify proof (even in mock mode for consistency)
  const isValid = verifyMockProof(proof, publicInputs);
  if (!isValid) {
    throw new ProofVerificationError('Mock proof verification failed');
  }

  // Step 7: Derive wallet key
  const { privateKey } = deriveWalletKey({
    zkOutput,
    commitments: publicInputs.commitments
  });

  // Step 8: Create wallet
  const wallet = createWalletFromPrivateKey(privateKey);

  // Step 9: Return result
  const result: ZkLoginResult = {
    proof,
    publicSignals: proof.publicSignals,
    wallet
  };

  if (exposePrivateKey) {
    result.privateKey = privateKey;
  }

  return result;
}

export function createSignerFromProof(
  _proof: ZkProof, 
  commitments: Commitment[], 
  exposePrivateKey?: boolean
): { wallet: ZkWallet; privateKey?: string } {
  // Extract zkOutput from proof for key derivation
  // In a real implementation, this would be more sophisticated
  // For mock implementation, we need to reconstruct the zkOutput
  const publicInputs = {
    commitments: commitments.map(c => c.commitment),
    threshold: 1 // We don't have threshold info, assume minimum
  };

  // Reconstruct zkOutput (this is a limitation of the mock system)
  const zkOutput = hashSha256(
    JSON.stringify({ publicInputs, domain: "zklogin-key-derivation-v1" })
  );

  const { privateKey } = deriveWalletKey({
    zkOutput,
    commitments: publicInputs.commitments
  });

  const wallet = createWalletFromPrivateKey(privateKey);

  const result: { wallet: ZkWallet; privateKey?: string } = { wallet };

  if (exposePrivateKey) {
    result.privateKey = privateKey;
  }

  return result;
}