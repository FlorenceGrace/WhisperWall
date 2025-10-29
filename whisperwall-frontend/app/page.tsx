"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useWhisperWall } from "@/hooks/useWhisperWall";
import { useMetaMaskProvider } from "@/hooks/metamask/useMetaMaskProvider";
import { PostWhisperModal } from "@/components/PostWhisperModal";

export default function Home() {
  const { getTotalWhisperCount, getPublicWhisperCount, contractAddress } = useWhisperWall();
  const { connect, isConnected } = useMetaMaskProvider();
  const [totalCount, setTotalCount] = useState<bigint>(BigInt(0));
  const [publicCount, setPublicCount] = useState<bigint>(BigInt(0));
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // 等待 contractAddress 可用后再加载数据
    if (!contractAddress) {
      console.log("⏳ Home: Waiting for contract address...");
      return;
    }
    
    console.log("✅ Home: Contract address available, loading stats...");
    getTotalWhisperCount().then(setTotalCount);
    getPublicWhisperCount().then(setPublicCount);
  }, [contractAddress, getTotalWhisperCount, getPublicWhisperCount]);

  const handleConnectAndPost = async () => {
    if (!isConnected) {
      try {
        await connect();
      } catch (error) {
        console.error("Failed to connect:", error);
        return;
      }
    }
    setIsModalOpen(true);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8 text-center">
        <div className="float-animation">
          <h1 className="text-4xl font-bold text-primary mb-4">
            WhisperWall
          </h1>
          <p className="text-xl text-textSecondary mb-8">
            Your Secrets, Your Choice - Speak Freely, Speak Safely
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 my-12">
          <div className="card-neu p-6">
            <div className="text-3xl mb-2">🔐</div>
            <h3 className="font-bold mb-2">Privacy-First</h3>
            <p className="text-sm text-textSecondary">
              Encrypted messages, only visible to authorized users
            </p>
          </div>
          <div className="card-neu p-6">
            <div className="text-3xl mb-2">🌐</div>
            <h3 className="font-bold mb-2">Decentralized</h3>
            <p className="text-sm text-textSecondary">
              On-chain storage, permanent preservation
            </p>
          </div>
          <div className="card-neu p-6">
            <div className="text-3xl mb-2">🎭</div>
            <h3 className="font-bold mb-2">Anonymous</h3>
            <p className="text-sm text-textSecondary">
              Optional anonymous posting
            </p>
          </div>
          <div className="card-neu p-6">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-bold mb-2">Instant</h3>
            <p className="text-sm text-textSecondary">
              Instant on-chain, real-time feedback
            </p>
          </div>
        </div>

        <div className="space-x-4">
          <Link href="/public-wall">
            <button className="btn-neu px-8 py-3 font-semibold rounded-md">
              Explore Public Wall
            </button>
          </Link>
          <button
            onClick={handleConnectAndPost}
            className="btn-primary px-8 py-3 font-semibold rounded-md"
          >
            {isConnected ? "✏️ Post Whisper" : "Connect Wallet & Post"}
          </button>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-8 card-neu p-8">
          <div>
            <div className="text-2xl font-bold text-primary">
              {totalCount.toString()}
            </div>
            <div className="text-sm text-textSecondary">Total Messages</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              {publicCount.toString()}
            </div>
            <div className="text-sm text-textSecondary">Public Messages</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              {(totalCount - publicCount).toString()}
            </div>
            <div className="text-sm text-textSecondary">Private Messages</div>
          </div>
        </div>

        <p className="text-sm text-textSecondary mt-8">
          Powered by FHEVM - Fully Homomorphic Encryption
        </p>
      </div>

      <PostWhisperModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          getTotalWhisperCount().then(setTotalCount);
          getPublicWhisperCount().then(setPublicCount);
        }}
      />
    </main>
  );
}

