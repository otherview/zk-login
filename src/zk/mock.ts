import type { ZkWitness, ZkPublicInputs, ZkProof, ZkProofResult } from '../types/index.js';
import { hashSha256 } from '../crypto/index.js';
import { ProofGenerationError, ProofVerificationError } from '../errors/index.js';

export function generateMockProof(
  witness: ZkWitness,
  publicInputs: ZkPublicInputs
): ZkProofResult {
  try {
    // Generate proof hash from witness + public inputs
    const proofHash = hashSha256(
      JSON.stringify({ witness, publicInputs, domain: "zklogin-mock-proof-v1" })
    );

    // Generate stable zkOutput for key derivation (depends ONLY on public inputs)
    const zkOutput = hashSha256(
      JSON.stringify({ publicInputs, domain: "zklogin-key-derivation-v1" })
    );

    // Generate public signals
    const commitmentsHash = hashSha256(JSON.stringify(publicInputs.commitments));
    const publicSignals = [commitmentsHash, String(publicInputs.threshold)];

    const proof: ZkProof = {
      proof: proofHash,
      publicSignals
    };

    return {
      proof,
      zkOutput
    };
  } catch (error) {
    throw new ProofGenerationError(
      `Failed to generate mock proof: ${error instanceof Error ? error.message : 'unknown error'}`
    );
  }
}

export function verifyMockProof(
  proof: ZkProof,
  publicInputs: ZkPublicInputs
): boolean {
  try {
    // For mock verification, we need to reconstruct witness from public inputs
    // In a real ZK system, this wouldn't be possible - that's the point of ZK!
    // For mock purposes, we'll just verify the public signals are consistent
    
    const expectedCommitmentsHash = hashSha256(JSON.stringify(publicInputs.commitments));
    const expectedThreshold = String(publicInputs.threshold);

    if (proof.publicSignals.length !== 2) {
      return false;
    }

    const [actualCommitmentsHash, actualThreshold] = proof.publicSignals;
    
    return (
      actualCommitmentsHash === expectedCommitmentsHash &&
      actualThreshold === expectedThreshold
    );
  } catch (error) {
    throw new ProofVerificationError(
      `Failed to verify mock proof: ${error instanceof Error ? error.message : 'unknown error'}`
    );
  }
}