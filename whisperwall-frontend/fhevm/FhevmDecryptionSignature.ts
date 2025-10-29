import type { Signer } from "ethers";
import type { FhevmInstance } from "./fhevmTypes";
import type { GenericStringStorage } from "./GenericStringStorage";

const STORAGE_KEY_PREFIX = "fhevm.decryptionSignature";

export interface FhevmDecryptionSignature {
  privateKey: string;
  publicKey: string;
  signature: string;
  contractAddresses: `0x${string}`[];
  userAddress: `0x${string}`;
  startTimestamp: number;
  durationDays: number;
}

export class FhevmDecryptionSignature {
  static async loadOrSign(
    instance: FhevmInstance,
    contractAddresses: `0x${string}`[],
    signer: Signer,
    storage?: GenericStringStorage
  ): Promise<FhevmDecryptionSignature | null> {
    const userAddress = (await signer.getAddress()) as `0x${string}`;
    const sortedContractAddresses = [...contractAddresses].sort();
    const storageKey = `${STORAGE_KEY_PREFIX}.${userAddress}.${sortedContractAddresses.join(",")}`;

    // Try to load from storage
    if (storage) {
      try {
        const stored = storage.getItem(storageKey);
        if (stored) {
          const sig: FhevmDecryptionSignature = JSON.parse(stored);
          
          // Validate signature is still valid
          const now = Math.floor(Date.now() / 1000);
          const expiresAt = sig.startTimestamp + sig.durationDays * 24 * 60 * 60;
          
          if (now < expiresAt) {
            console.log("✅ Using cached decryption signature");
            return sig;
          } else {
            console.log("⏰ Cached signature expired, generating new one");
          }
        }
      } catch (e) {
        console.warn("Failed to load decryption signature from storage:", e);
      }
    }

    // Generate new signature using FHEVM SDK
    try {
      console.log("🔑 Generating new keypair and signature...");
      
      // Use FHEVM SDK's generateKeypair method
      const { publicKey, privateKey } = instance.generateKeypair();
      
      const startTimestamp = Math.floor(Date.now() / 1000);
      const durationDays = 30; // 30 days validity
      
      // Use FHEVM SDK's createEIP712 method to create the correct EIP-712 message
      const eip712 = instance.createEIP712(
        publicKey,
        sortedContractAddresses,
        startTimestamp,
        durationDays
      );
      
      console.log("📝 Requesting EIP-712 signature from wallet...");
      console.log("EIP-712 Domain:", eip712.domain);
      console.log("EIP-712 Types:", eip712.types);
      console.log("EIP-712 Message:", eip712.message);
      
      // Remove EIP712Domain from types as ethers.js handles it automatically
      const { EIP712Domain, ...typesWithoutDomain } = eip712.types;
      
      console.log("📝 Signing with types:", typesWithoutDomain);
      
      // Sign the EIP-712 message
      const signature = await signer.signTypedData(
        eip712.domain,
        typesWithoutDomain,
        eip712.message
      );
      
      const decryptionSig: FhevmDecryptionSignature = {
        privateKey,
        publicKey,
        signature,
        contractAddresses: sortedContractAddresses,
        userAddress,
        startTimestamp,
        durationDays,
      };
      
      // Save to storage
      if (storage) {
        try {
          storage.setItem(storageKey, JSON.stringify(decryptionSig));
          console.log("💾 Decryption signature saved to storage");
        } catch (e) {
          console.warn("Failed to save decryption signature to storage:", e);
        }
      }
      
      return decryptionSig;
    } catch (e) {
      console.error("Failed to generate decryption signature:", e);
      return null;
    }
  }
  
  static clear(userAddress: string, storage?: Storage): void {
    if (storage) {
      // Clear all signatures for this user
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(`${STORAGE_KEY_PREFIX}.${userAddress}`)) {
          storage.removeItem(key);
        }
      });
    }
  }
}

