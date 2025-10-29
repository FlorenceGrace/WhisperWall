"use client";

import { useState, useCallback, useEffect } from "react";
import { Contract } from "ethers";
import { useMetaMaskEthersSigner } from "./metamask/useMetaMaskEthersSigner";
import { WhisperWallABI } from "@/abi/WhisperWallABI";
import { WhisperWallAddresses } from "@/abi/WhisperWallAddresses";

export type VoteType = "NONE" | "LIKE" | "DISLIKE";

export function useWhisperVote() {
  const { signer, readonlyProvider } = useMetaMaskEthersSigner();
  const [chainId, setChainId] = useState<number | undefined>();
  const [contractAddress, setContractAddress] = useState<string | undefined>();
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    if (signer) {
      signer.provider?.getNetwork().then((network) => {
        const cid = Number(network.chainId);
        setChainId(cid);
        const address =
          WhisperWallAddresses[
            cid.toString() as keyof typeof WhisperWallAddresses
          ]?.address;
        setContractAddress(address);
      });
    }
  }, [signer]);

  const getContract = useCallback(
    (withSigner: boolean = false) => {
      if (!contractAddress) return null;

      const provider = withSigner ? signer : readonlyProvider;
      if (!provider) return null;

      return new Contract(contractAddress, WhisperWallABI.abi, provider);
    },
    [contractAddress, signer, readonlyProvider]
  );

  const voteWhisper = useCallback(
    async (whisperId: bigint, voteType: VoteType) => {
      if (!signer) throw new Error("Wallet not connected");

      const contract = getContract(true);
      if (!contract) throw new Error("Contract not available");

      setIsVoting(true);

      try {
        const voteTypeNum =
          voteType === "NONE" ? 0 : voteType === "LIKE" ? 1 : 2;

        const tx = await contract.voteWhisper(whisperId, voteTypeNum);
        await tx.wait();

        return tx.hash;
      } finally {
        setIsVoting(false);
      }
    },
    [signer, getContract]
  );

  const getMyVote = useCallback(
    async (whisperId: bigint): Promise<VoteType> => {
      const contract = getContract();
      if (!contract) return "NONE";

      try {
        const voteTypeNum = await contract.getMyVote(whisperId);
        return voteTypeNum === 0
          ? "NONE"
          : voteTypeNum === 1
          ? "LIKE"
          : "DISLIKE";
      } catch (error) {
        console.error("Failed to get my vote:", error);
        return "NONE";
      }
    },
    [getContract]
  );

  const getWhisperVoteCount = useCallback(
    async (whisperId: bigint): Promise<{ likeCount: string; dislikeCount: string }> => {
      const contract = getContract();
      if (!contract) return { likeCount: "0", dislikeCount: "0" };

      try {
        const [likeCount, dislikeCount] = await contract.getWhisperVoteCount(
          whisperId
        );
        return {
          likeCount: likeCount.toString(),
          dislikeCount: dislikeCount.toString(),
        };
      } catch (error) {
        console.error("Failed to get vote count:", error);
        return { likeCount: "0", dislikeCount: "0" };
      }
    },
    [getContract]
  );

  return {
    contractAddress,
    chainId,
    isVoting,
    voteWhisper,
    getMyVote,
    getWhisperVoteCount,
  };
}


