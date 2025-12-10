import { hkdf } from '@noble/hashes/hkdf';
import { sha256 } from '@noble/hashes/sha256';
import { keccak_256 } from '@noble/hashes/sha3';
import * as secp256k1 from '@noble/secp256k1';
import { bytesToHex, hexToBytes, utf8ToBytes } from '@noble/hashes/utils';
import { hashSha256 } from './utils.js';

export interface KeyDerivationParams {
  zkOutput: string;
  commitments: string[];
}

export interface DerivedKeyResult {
  privateKey: string; // hex
  address: string;    // 0x-prefixed EVM-style
}

export function deriveWalletKey(params: KeyDerivationParams): DerivedKeyResult {
  const { zkOutput, commitments } = params;

  // Create deterministic salt from commitments hash
  const commitmentsHash = hashSha256(JSON.stringify(commitments));
  const salt = hexToBytes(hashSha256(JSON.stringify({ commitmentsHash })));

  // HKDF key derivation
  const info = utf8ToBytes("veworld-zklogin-derivation-v1");
  const zkOutputBytes = hexToBytes(zkOutput);
  
  const okm = hkdf(sha256, zkOutputBytes, salt, info, 32);
  
  // Ensure valid secp256k1 scalar by taking mod curve order
  const order = secp256k1.CURVE.n;
  let scalar = BigInt('0x' + bytesToHex(okm));
  
  // Ensure scalar is non-zero and less than curve order
  if (scalar === 0n || scalar >= order) {
    scalar = scalar % order;
    if (scalar === 0n) scalar = 1n; // Fallback to 1 if still zero
  }

  const privateKey = scalar.toString(16).padStart(64, '0');

  // Derive public key and address
  const publicKeyPoint = secp256k1.getPublicKey(privateKey, false); // uncompressed
  
  // Remove the 0x04 prefix from uncompressed public key
  const publicKeyBytes = publicKeyPoint.slice(1);
  
  // Keccak256 hash and take last 20 bytes for address
  const addressHash = keccak_256(publicKeyBytes);
  const address = '0x' + bytesToHex(addressHash.slice(-20));

  return {
    privateKey,
    address
  };
}