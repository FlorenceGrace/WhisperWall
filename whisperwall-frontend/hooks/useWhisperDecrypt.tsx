"use client";

import { useState, useCallback } from "react";
import { Contract } from "ethers";
import { useMetaMaskEthersSigner } from "./metamask/useMetaMaskEthersSigner";
import { WhisperWallABI } from "@/abi/WhisperWallABI";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";

export function useWhisperDecrypt(contractAddress: string | undefined) {
  const { signer, fhevmInstance, decryptionSignatureStorage } =
    useMetaMaskEthersSigner();
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isGranting, setIsGranting] = useState(false);

  const decryptContent = useCallback(
    async (whisperId: bigint, encryptedContentHandle: string): Promise<string | null> => {
      if (!signer || !fhevmInstance || !contractAddress) {
        throw new Error("Wallet not connected or FHEVM not ready");
      }

      setIsDecrypting(true);

      try {
        // Step 1: Request decrypt access from the contract
        console.log("🔑 Requesting decrypt access for whisper:", whisperId.toString());
        const contract = new Contract(
          contractAddress,
          WhisperWallABI.abi,
          signer
        );
        
        const requestTx = await contract.requestDecryptAccess(whisperId);
        await requestTx.wait();
        console.log("✅ Decrypt access granted");

        // Step 2: Get decryption signature
        const sig = await FhevmDecryptionSignature.loadOrSign(
          fhevmInstance,
          [contractAddress as `0x${string}`],
          signer,
          decryptionSignatureStorage
        );

        if (!sig) {
          throw new Error("Unable to build FHEVM decryption signature");
        }

        // Step 3: Decrypt the content
        console.log("🔓 Decrypting content...");
        const result = await fhevmInstance.userDecrypt(
          [{ handle: encryptedContentHandle, contractAddress }],
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays
        );

        const decrypted = result[encryptedContentHandle];
        
        if (typeof decrypted === "bigint") {
          // Convert bigint back to string
          const hex = decrypted.toString(16);
          const bytes = Buffer.from(hex.padStart(hex.length + (hex.length % 2), '0'), "hex");
          const text = bytes.toString("utf8").replace(/\0/g, "");
          console.log("✅ Decryption successful");
          return text;
        }

        console.log("✅ Decryption successful");
        return String(decrypted);
      } catch (error) {
        console.error("Failed to decrypt content:", error);
        return null;
      } finally {
        setIsDecrypting(false);
      }
    },
    [signer, fhevmInstance, contractAddress, decryptionSignatureStorage]
  );

  const grantDecryptAccess = useCallback(
    async (whisperId: bigint, targetAddress: string) => {
      if (!signer || !contractAddress) {
        throw new Error("Wallet not connected");
      }

      const contract = new Contract(
        contractAddress,
        WhisperWallABI.abi,
        signer
      );

      setIsGranting(true);

      try {
        const tx = await contract.grantDecryptAccess(whisperId, targetAddress);
        await tx.wait();

        return tx.hash;
      } finally {
        setIsGranting(false);
      }
    },
    [signer, contractAddress]
  );

  const revokeDecryptAccess = useCallback(
    async (whisperId: bigint, targetAddress: string) => {
      if (!signer || !contractAddress) {
        throw new Error("Wallet not connected");
      }

      const contract = new Contract(
        contractAddress,
        WhisperWallABI.abi,
        signer
      );

      const tx = await contract.revokeDecryptAccess(whisperId, targetAddress);
      await tx.wait();

      return tx.hash;
    },
    [signer, contractAddress]
  );

  return {
    isDecrypting,
    isGranting,
    decryptContent,
    grantDecryptAccess,
    revokeDecryptAccess,
  };
}

