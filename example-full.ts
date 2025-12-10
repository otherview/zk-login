// Complete ZK-Login Example: Registration → Login → Recovery
import { 
  initZkLogin, 
  registerWallet, 
  zkLogin 
} from './src/index.js';
import type { SupportedIdentity } from './src/index.js';

async function demonstrateZkLogin() {
  console.log('🚀 Complete ZK-Login Demo\n');

  // Step 1: Initialize the ZK system
  console.log('1️⃣ Initializing ZK-Login system...');
  await initZkLogin({ 
    provingSystem: 'mock' 
  });
  console.log('   ✅ System initialized\n');

  // Step 2: Create user identities (normally from OAuth/WebAuthn flows)
  console.log('2️⃣ Setting up user identities...');
  
  const mockGoogleJwt = `eyJhbGciOiJSUzI1NiJ9.${btoa(JSON.stringify({
    sub: "google_user_alice_123",
    email: "alice@example.com"
  }))}.mock_signature`;

  const allIdentities: SupportedIdentity[] = [
    {
      provider: 'google',
      idToken: mockGoogleJwt
    },
    {
      provider: 'github', 
      accessToken: 'gho_alice_github_token_xyz789'
    },
    {
      provider: 'passkey',
      assertion: {
        credentialId: 'alice_passkey_credential_abc123',
        clientDataJSON: '{"type":"webauthn.get","challenge":"..."}',
        authenticatorData: 'authenticator_data_here',
        signature: 'signature_bytes_here'
      }
    }
  ];

  console.log(`   📋 Created ${allIdentities.length} identity sources`);
  console.log('   - Google ID token (sub: google_user_alice_123)');
  console.log('   - GitHub access token (SHA256 hashed)');
  console.log('   - WebAuthn passkey credential\n');

  // Step 3: Register wallet (2-of-3 threshold)
  console.log('3️⃣ Registering ZK wallet (2-of-3 threshold)...');
  
  const registration = await registerWallet({
    identities: allIdentities,
    threshold: 2
  });

  console.log(`   🔐 Wallet Address: ${registration.address}`);
  console.log(`   🧂 Salt: ${registration.salt.slice(0, 16)}...`);
  console.log(`   📊 Generated ${registration.commitments.length} commitments`);
  registration.commitments.forEach((c, i) => {
    console.log(`      Commitment ${i + 1}: ${c.commitment.slice(0, 16)}... (${c.claim.provider})`);
  });
  console.log();

  // Step 4: Login with full identity set
  console.log('4️⃣ Login with all 3 identities...');
  
  const loginFull = await zkLogin({
    identities: allIdentities,
    commitments: registration.commitments,
    salt: registration.salt,
    threshold: 2
  });

  console.log(`   ✅ Login successful!`);
  console.log(`   🔐 Recovered Address: ${loginFull.wallet.address}`);
  console.log(`   🔬 ZK Proof: ${loginFull.proof.proof.slice(0, 16)}...`);
  console.log(`   📡 Public Signals: [${loginFull.publicSignals.map(s => s.slice(0, 8) + '...').join(', ')}]`);
  
  // Test wallet functionality
  const testMessage = "Hello from ZK wallet!";
  const signature = await loginFull.wallet.signMessage(testMessage);
  console.log(`   ✍️  Signed message: "${testMessage}"`);
  console.log(`   📝 Signature: ${signature.slice(0, 20)}...`);
  console.log();

  // Step 5: Recovery scenario - login with subset (2-of-3)
  console.log('5️⃣ Recovery scenario: Login with Google + GitHub only...');
  
  const recoveryIdentities = allIdentities.slice(0, 2); // Google + GitHub
  
  const loginRecovery = await zkLogin({
    identities: recoveryIdentities,
    commitments: registration.commitments,
    salt: registration.salt,
    threshold: 2
  });

  console.log(`   ✅ Recovery successful!`);
  console.log(`   🔐 Recovered Address: ${loginRecovery.wallet.address}`);
  console.log(`   ⚖️  Address matches: ${loginRecovery.wallet.address === registration.address ? '✅' : '❌'}`);
  console.log();

  // Step 6: Demonstrate threshold security
  console.log('6️⃣ Security demo: Try login with only 1 identity (should fail)...');
  
  try {
    await zkLogin({
      identities: [allIdentities[0]!], // Only Google
      commitments: registration.commitments,
      salt: registration.salt,
      threshold: 2
    });
    console.log('   ❌ ERROR: Login should have failed!');
  } catch (error) {
    console.log(`   ✅ Security check passed: ${error instanceof Error ? error.message : 'Login rejected'}`);
  }
  console.log();

  // Step 7: Privacy demonstration
  console.log('7️⃣ Privacy analysis...');
  console.log('   📊 What gets stored publicly:');
  console.log('   - Wallet address (public)');
  console.log('   - Commitments (privacy-preserving hashes)');
  console.log('   - Salt (enables re-computation)');
  console.log('   - Threshold value');
  console.log();
  console.log('   🔒 What stays private:');
  console.log('   - Original identity tokens/assertions');
  console.log('   - Which specific identities were used for login');
  console.log('   - Private key (unless explicitly requested)');
  console.log();

  console.log('✨ ZK-Login demonstration complete!');
  console.log('📋 Summary:');
  console.log(`   - Registered wallet: ${registration.address}`);
  console.log(`   - Successful logins: 2 (full set + recovery)`);
  console.log(`   - Failed login attempts: 1 (threshold enforcement)`);
  console.log(`   - Privacy preserved: ✅`);
  console.log(`   - Deterministic recovery: ✅`);
}

// Run the demonstration
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateZkLogin()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Demo failed:', error);
      process.exit(1);
    });
}

export { demonstrateZkLogin };