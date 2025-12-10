import type { Provider, StoredWalletData, SupportedIdentity } from './types.js';

const STORAGE_KEY = 'zkDemoWallet';

// Create a mock Google JWT token for demo purposes
function createMockGoogleJWT(): string {
  // JWT format: header.payload.signature (all base64url encoded)
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: 'google-user-123',
    email: 'demo@example.com',
    name: 'Demo User',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  }));
  const signature = 'mock-signature-for-demo-purposes';
  
  return `${header}.${payload}.${signature}`;
}

// Hardcoded deterministic identity values (includes Twitter for demo)
const MOCK_IDENTITIES: Record<Provider, SupportedIdentity> = {
  google: {
    provider: 'google',
    idToken: createMockGoogleJWT()
  },
  github: {
    provider: 'github', 
    accessToken: 'github-user-abc'
  },
  twitter: {
    provider: 'twitter',
    accessToken: 'twitter-user-xyz'
  },
  passkey: {
    provider: 'passkey',
    assertion: {
      credentialId: 'passkey-device-001',
      clientDataJSON: 'mock-client-data-json',
      authenticatorData: 'mock-authenticator-data',
      signature: 'mock-signature'
    }
  }
};

// Display names for UI
export const PROVIDER_DISPLAY_NAMES: Record<Provider, string> = {
  google: 'Google',
  github: 'GitHub',
  twitter: 'Twitter',
  passkey: 'Passkey (device)'
};

// Display mock IDs for UI (showing what gets extracted)
export const PROVIDER_MOCK_IDS: Record<Provider, string> = {
  google: 'google-user-123', // extracted from JWT sub claim
  github: 'sha256(github:github-user-abc)',
  twitter: 'sha256(twitter:twitter-user-xyz)',
  passkey: 'passkey-device-001' // direct credentialId
};

// Helper function to convert selected providers to SupportedIdentity[]
export function getSelectedIdentities(selectedProviders: Provider[]): SupportedIdentity[] {
  return selectedProviders.map(provider => MOCK_IDENTITIES[provider]);
}

// Save to localStorage after successful registration
export function saveToLocalStorage(walletData: Omit<StoredWalletData, 'timestamp'>): void {
  const dataWithTimestamp: StoredWalletData = {
    ...walletData,
    timestamp: Date.now()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp));
}

// Load from localStorage on app init
export function loadFromLocalStorage(): StoredWalletData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// Clear localStorage (utility function)
export function clearStoredWallet(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Helper to truncate long strings for display
export function truncateAddress(address: string, length: number = 10): string {
  if (address.length <= length) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Helper to format threshold display
export function formatThreshold(threshold: number, total: number = 4): string {
  const descriptions: Record<number, string> = {
    1: 'very weak',
    2: 'balanced',
    3: 'strong',
    4: 'extreme'
  };
  return descriptions[threshold] || '';
}