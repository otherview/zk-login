import { test } from 'node:test';
import { strictEqual, rejects } from 'node:assert';
import { 
  initZkLogin, 
  registerWallet, 
  zkLogin,
  createSignerFromProof,
  InsufficientIdentitiesError
} from '../index.js';
import type { SupportedIdentity } from '../types/index.js';

test('Full API Integration', async (t) => {
  // Initialize the system
  await initZkLogin({ provingSystem: 'mock' });

  await t.test('registerWallet → zkLogin with same address', async () => {
    // Create test identities
    const mockGooglePayload = btoa(JSON.stringify({
      sub: "google_user_123",
      email: "user@example.com"
    }));

    const identities: SupportedIdentity[] = [
      {
        provider: 'google',
        idToken: `eyJhbGciOiJSUzI1NiJ9.${mockGooglePayload}.signature`
      },
      {
        provider: 'github',
        accessToken: 'gho_test_token_456'
      },
      {
        provider: 'passkey',
        assertion: {
          credentialId: 'passkey_cred_789',
          clientDataJSON: '{"type":"webauthn.get"}',
          authenticatorData: 'auth_data',
          signature: 'sig_data'
        }
      }
    ];

    // Register wallet
    const registration = await registerWallet({
      identities,
      threshold: 2
    });

    strictEqual(typeof registration.address, 'string');
    strictEqual(registration.address.startsWith('0x'), true);
    strictEqual(registration.address.length, 42);
    strictEqual(registration.commitments.length, 3);
    strictEqual(typeof registration.salt, 'string');
    strictEqual(registration.privateKey, undefined); // Not exposed by default

    // Login with full identity set
    const loginFull = await zkLogin({
      identities,
      commitments: registration.commitments,
      salt: registration.salt,
      threshold: 2
    });

    strictEqual(loginFull.wallet.address, registration.address);
    strictEqual(typeof loginFull.proof.proof, 'string');
    strictEqual(loginFull.publicSignals.length, 2);
    strictEqual(loginFull.privateKey, undefined); // Not exposed by default

    // Test wallet functionality (address verification)
    strictEqual(typeof loginFull.wallet.address, 'string');
    strictEqual(loginFull.wallet.address.startsWith('0x'), true);
    strictEqual(loginFull.wallet.address.length, 42);

    // Login with subset that satisfies threshold
    const identitiesSubset = identities.slice(0, 2); // First 2 identities
    const loginSubset = await zkLogin({
      identities: identitiesSubset,
      commitments: registration.commitments,
      salt: registration.salt,
      threshold: 2
    });

    // Should derive the same address regardless of which identities used
    strictEqual(loginSubset.wallet.address, registration.address);
  });

  await t.test('threshold validation', async () => {
    const identities: SupportedIdentity[] = [
      {
        provider: 'google',
        idToken: `eyJhbGciOiJSUzI1NiJ9.${btoa(JSON.stringify({sub:"user123"}))}.sig`
      }
    ];

    // Add second identity for threshold test
    const identitiesForRegistration: SupportedIdentity[] = [
      ...identities,
      {
        provider: 'github',
        accessToken: 'gho_token_456'
      }
    ];

    // Register with threshold 2
    const registration = await registerWallet({
      identities: identitiesForRegistration,
      threshold: 2
    });

    // Try to login with only 1 identity (should fail)
    await rejects(
      zkLogin({
        identities, // Only 1 identity
        commitments: registration.commitments,
        salt: registration.salt,
        threshold: 2
      }),
      InsufficientIdentitiesError
    );
  });

  await t.test('exposePrivateKey option', async () => {
    const identities: SupportedIdentity[] = [
      {
        provider: 'google',
        idToken: `eyJhbGciOiJSUzI1NiJ9.${btoa(JSON.stringify({sub:"user123"}))}.sig`
      }
    ];

    // Register with exposePrivateKey: true
    const registration = await registerWallet({
      identities,
      threshold: 1,
      exposePrivateKey: true
    });

    strictEqual(typeof registration.privateKey, 'string');
    strictEqual(registration.privateKey!.length, 64); // hex private key

    // Login with exposePrivateKey: true
    const login = await zkLogin({
      identities,
      commitments: registration.commitments,
      salt: registration.salt,
      threshold: 1,
      exposePrivateKey: true
    });

    strictEqual(typeof login.privateKey, 'string');
    strictEqual(login.privateKey, registration.privateKey);
  });

  await t.test('deterministic behavior', async () => {
    const identities: SupportedIdentity[] = [
      {
        provider: 'google',
        idToken: `eyJhbGciOiJSUzI1NiJ9.${btoa(JSON.stringify({sub:"deterministic_user"}))}.sig`
      }
    ];

    // Register twice with same identities but different salts
    const registration1 = await registerWallet({
      identities,
      threshold: 1
    });

    const registration2 = await registerWallet({
      identities,
      threshold: 1
    });

    // Different salts should produce different addresses
    strictEqual(registration1.salt !== registration2.salt, true);
    strictEqual(registration1.address !== registration2.address, true);

    // But same salt should produce same address
    const loginWithSalt1 = await zkLogin({
      identities,
      commitments: registration1.commitments,
      salt: registration1.salt,
      threshold: 1
    });

    strictEqual(loginWithSalt1.wallet.address, registration1.address);
  });

  await t.test('createSignerFromProof utility', () => {
    const mockCommitments = [
      {
        claim: { provider: 'google', stableId: 'user123' },
        commitment: 'abc123...'
      }
    ];

    const mockProof = {
      proof: 'mock_proof_hash',
      publicSignals: ['commitments_hash', '1']
    };

    const { wallet } = createSignerFromProof(mockProof, mockCommitments);
    
    strictEqual(typeof wallet.address, 'string');
    strictEqual(wallet.address.startsWith('0x'), true);

    // Test with exposePrivateKey
    const { wallet: wallet2, privateKey } = createSignerFromProof(
      mockProof, 
      mockCommitments, 
      true
    );

    strictEqual(typeof privateKey, 'string');
    strictEqual(privateKey!.length, 64);
    strictEqual(wallet2.address, wallet.address); // Same inputs = same address
  });
});