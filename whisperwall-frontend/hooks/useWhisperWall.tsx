"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { ethers, Contract, JsonRpcProvider } from "ethers";
import { useMetaMaskEthersSigner } from "./metamask/useMetaMaskEthersSigner";
import { WhisperWallABI } from "@/abi/WhisperWallABI";
import { WhisperWallAddresses } from "@/abi/WhisperWallAddresses";
import type { FhevmInstance } from "@/fhevm/fhevmTypes";

export type WhisperType = "PUBLIC" | "PRIVATE";
export type ContentMode = "PLAIN" | "ENCRYPTED";

export interface WhisperData {
  id: bigint;
  author: string;
  whisperType: number;
  contentMode: number;
  plainContent: string;
  encryptedContent: string;
  recipient: string;
  tag: string;
  timestamp: bigint;
  isAnonymous: boolean;
  isDeleted: boolean;
}

export function useWhisperWall() {
  const { signer, readonlyProvider, fhevmInstance, fhevmLoading } =
    useMetaMaskEthersSigner();

  const [chainId, setChainId] = useState<number | undefined>();
  const [contractAddress, setContractAddress] = useState<string | undefined>();
  const [isPosting, setIsPosting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 创建fallback provider（使用 useMemo 确保同步创建）
  const fallbackProvider = useMemo(() => {
    if (typeof window !== "undefined") {
      try {
        return new JsonRpcProvider("http://localhost:8545");
      } catch (error) {
        console.error("Failed to create fallback provider:", error);
        return null;
      }
    }
    return null;
  }, []); // 空依赖，只创建一次

  // 从signer、readonlyProvider或fallbackProvider获取chainId
  useEffect(() => {
    const getChainIdAndAddress = async () => {
      let provider = signer?.provider || readonlyProvider || fallbackProvider;
      
      console.log("🔍 useWhisperWall: Detecting chain", { 
        hasSigner: !!signer, 
        hasReadonlyProvider: !!readonlyProvider,
        hasFallbackProvider: !!fallbackProvider
      });

      if (provider) {
        try {
          const network = await provider.getNetwork();
          const cid = Number(network.chainId);
          console.log("✅ Detected chainId:", cid);
          
          setChainId(cid);
          const address =
            WhisperWallAddresses[
              cid.toString() as keyof typeof WhisperWallAddresses
            ]?.address;
          
          console.log("📍 Contract address for chain", cid, ":", address);
          setContractAddress(address);
        } catch (error) {
          console.error("❌ Failed to get network:", error);
        }
      } else {
        console.warn("⚠️ No provider available yet");
      }
    };

    getChainIdAndAddress();
  }, [signer, readonlyProvider, fallbackProvider]);

  const getContract = useCallback(
    (withSigner: boolean = false) => {
      console.log("🔧 getContract called", { 
        contractAddress, 
        withSigner, 
        hasSigner: !!signer, 
        hasReadonlyProvider: !!readonlyProvider,
        hasFallbackProvider: !!fallbackProvider
      });
      
      if (!contractAddress) {
        console.error("❌ No contract address");
        return null;
      }
      
      // If signer is required but not available, return null
      if (withSigner && !signer) {
        console.warn("⚠️ Signer required but not available (wallet not connected)");
        return null;
      }
      
      const provider = withSigner ? signer : (readonlyProvider || fallbackProvider);
      if (!provider) {
        console.error("❌ No provider available");
        return null;
      }

      console.log("✅ Creating contract instance");
      return new Contract(contractAddress, WhisperWallABI.abi, provider);
    },
    [contractAddress, signer, readonlyProvider, fallbackProvider]
  );

  const postWhisper = useCallback(
    async (params: {
      whisperType: WhisperType;
      contentMode: ContentMode;
      content: string;
      recipient?: string;
      tag: string;
      isAnonymous: boolean;
    }) => {
      if (!signer || !fhevmInstance || !contractAddress) {
        throw new Error("Wallet not connected or FHEVM not ready");
      }

      const contract = getContract(true);
      if (!contract) throw new Error("Contract not available");

      setIsPosting(true);

      try {
        const whisperTypeNum = params.whisperType === "PUBLIC" ? 0 : 1;
        const contentModeNum = params.contentMode === "PLAIN" ? 0 : 1;

        let encryptedContentHandle = ethers.ZeroHash;
        let inputProof = "0x";
        let plainContent = "";

        if (params.contentMode === "ENCRYPTED") {
          // Encrypt content
          const messageBytes = ethers.toUtf8Bytes(params.content);
          const messageBigInt = BigInt(
            "0x" + Buffer.from(messageBytes).toString("hex")
          );

          const encryptedInput = fhevmInstance.createEncryptedInput(
            contractAddress,
            await signer.getAddress()
          );
          encryptedInput.add256(messageBigInt);
          const encrypted = await encryptedInput.encrypt();

          // Convert Uint8Array to hex string if needed
          const handle = encrypted.handles[0];
          encryptedContentHandle = typeof handle === "string" ? handle : ethers.hexlify(handle);
          inputProof = typeof encrypted.inputProof === "string" ? encrypted.inputProof : ethers.hexlify(encrypted.inputProof);
        } else {
          plainContent = params.content;
        }

        const tx = await contract.postWhisper(
          whisperTypeNum,
          contentModeNum,
          plainContent,
          encryptedContentHandle,
          inputProof,
          params.recipient || ethers.ZeroAddress,
          params.tag,
          params.isAnonymous
        );

        await tx.wait();

        return tx.hash;
      } finally {
        setIsPosting(false);
      }
    },
    [signer, fhevmInstance, contractAddress, getContract]
  );

  const getPublicWhispers = useCallback(
    async (offset: number = 0, limit: number = 20): Promise<bigint[]> => {
      console.log("🔍 getPublicWhispers called", { offset, limit, contractAddress, chainId });
      const contract = getContract();
      
      if (!contract) {
        console.error("❌ No contract available");
        return [];
      }

      try {
        console.log("📞 Calling contract.getPublicWhispers...");
        const whisperIds = await contract.getPublicWhispers(offset, limit);
        console.log("✅ Contract returned:", whisperIds);
        return whisperIds;
      } catch (error) {
        console.error("❌ Failed to get public whispers:", error);
        return [];
      }
    },
    [getContract, contractAddress, chainId]
  );

  const getMyWhispers = useCallback(
    async (offset: number = 0, limit: number = 20): Promise<bigint[]> => {
      if (!signer) {
        console.warn("⚠️ getMyWhispers: Wallet not connected");
        return [];
      }

      const contract = getContract(true); // 使用 signer 而不是 readonlyProvider
      if (!contract) {
        console.warn("⚠️ getMyWhispers: Contract not available");
        return [];
      }

      try {
        const whisperIds = await contract.getMyWhispers(offset, limit);
        return whisperIds;
      } catch (error) {
        console.error("Failed to get my whispers:", error);
        return [];
      }
    },
    [signer, getContract]
  );

  const getPrivateInbox = useCallback(
    async (offset: number = 0, limit: number = 20): Promise<bigint[]> => {
      if (!signer) {
        console.warn("⚠️ getPrivateInbox: Wallet not connected");
        return [];
      }

      const contract = getContract(true); // 使用 signer 而不是 readonlyProvider
      if (!contract) {
        console.warn("⚠️ getPrivateInbox: Contract not available");
        return [];
      }

      try {
        const whisperIds = await contract.getPrivateInbox(offset, limit);
        return whisperIds;
      } catch (error) {
        console.error("Failed to get private inbox:", error);
        return [];
      }
    },
    [signer, getContract]
  );

  const getWhisper = useCallback(
    async (whisperId: bigint): Promise<WhisperData | null> => {
      const contract = getContract();
      if (!contract) return null;

      try {
        const whisper = await contract.getWhisper(whisperId);
        
        // Convert encryptedContent (euint256) to hex string
        let encryptedContentHex: string;
        const rawEncrypted = whisper[5];
        
        if (typeof rawEncrypted === 'bigint') {
          encryptedContentHex = '0x' + rawEncrypted.toString(16).padStart(64, '0');
        } else if (typeof rawEncrypted === 'number') {
          encryptedContentHex = '0x' + rawEncrypted.toString(16).padStart(64, '0');
        } else if (typeof rawEncrypted === 'string') {
          // Already a string, ensure it starts with 0x
          encryptedContentHex = rawEncrypted.startsWith('0x') ? rawEncrypted : '0x' + rawEncrypted;
        } else {
          // Fallback for other types (e.g., object with toHexString method)
          encryptedContentHex = String(rawEncrypted);
          if (!encryptedContentHex.startsWith('0x')) {
            encryptedContentHex = '0x' + encryptedContentHex;
          }
        }
        
        console.log("🔍 getWhisper result:", {
          id: whisper[0].toString(),
          contentMode: whisper[3],
          encryptedContentRaw: whisper[5],
          encryptedContentHex,
          plainContent: whisper[4],
        });
        
        return {
          id: whisper[0],
          author: whisper[1],
          whisperType: Number(whisper[2]), // Convert bigint to number
          contentMode: Number(whisper[3]), // Convert bigint to number
          plainContent: whisper[4],
          encryptedContent: encryptedContentHex,
          recipient: whisper[6],
          tag: whisper[7],
          timestamp: whisper[8],
          isAnonymous: whisper[9],
          isDeleted: whisper[10],
        };
      } catch (error) {
        console.error("Failed to get whisper:", error);
        return null;
      }
    },
    [getContract]
  );

  const deleteWhisper = useCallback(
    async (whisperId: bigint) => {
      if (!signer) throw new Error("Wallet not connected");

      const contract = getContract(true);
      if (!contract) throw new Error("Contract not available");

      const tx = await contract.deleteWhisper(whisperId);
      await tx.wait();

      return tx.hash;
    },
    [signer, getContract]
  );

  const getTotalWhisperCount = useCallback(async (): Promise<bigint> => {
    const contract = getContract();
    if (!contract) return BigInt(0);

    try {
      return await contract.getTotalWhisperCount();
    } catch (error) {
      console.error("Failed to get total whisper count:", error);
      return BigInt(0);
    }
  }, [getContract]);

  const getPublicWhisperCount = useCallback(async (): Promise<bigint> => {
    const contract = getContract();
    if (!contract) return BigInt(0);

    try {
      return await contract.getPublicWhisperCount();
    } catch (error) {
      console.error("Failed to get public whisper count:", error);
      return BigInt(0);
    }
  }, [getContract]);

  return {
    contractAddress,
    chainId,
    isPosting,
    isLoading,
    fhevmLoading,
    postWhisper,
    getPublicWhispers,
    getMyWhispers,
    getPrivateInbox,
    getWhisper,
    deleteWhisper,
    getTotalWhisperCount,
    getPublicWhisperCount,
  };
}

