"use client";

import { useState, useEffect } from "react";
import { useWhisperWall, type WhisperData } from "@/hooks/useWhisperWall";
import { WhisperCard } from "@/components/WhisperCard";
import { useMetaMaskProvider } from "@/hooks/metamask/useMetaMaskProvider";

export default function MyWhispers() {
  const { getMyWhispers, getWhisper, deleteWhisper, contractAddress } =
    useWhisperWall();
  const { isConnected } = useMetaMaskProvider();
  const [whispers, setWhispers] = useState<WhisperData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadMyWhispers = async () => {
    setIsLoading(true);
    try {
      const whisperIds = await getMyWhispers(0, 50);
      const whisperDataPromises = whisperIds.map((id) => getWhisper(id));
      const whisperData = (await Promise.all(whisperDataPromises)).filter(
        (w): w is WhisperData => w !== null && !w.isDeleted
      );
      setWhispers(whisperData);
    } catch (error) {
      console.error("Failed to load my whispers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (whisperId: bigint) => {
    if (!confirm("Are you sure you want to delete this whisper?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteWhisper(whisperId);
      setWhispers(whispers.filter((w) => w.id !== whisperId));
    } catch (error) {
      console.error("Failed to delete whisper:", error);
      alert("Failed to delete whisper");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (isConnected && contractAddress) {
      console.log("✅ Connected and contract address available, loading my whispers...");
      loadMyWhispers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, contractAddress]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2">Wallet Not Connected</h2>
          <p className="text-textSecondary">
            Please connect your wallet to view your whispers
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            📝 My Whispers
          </h1>
          <p className="text-textSecondary">
            Manage your posted whispers
          </p>
        </div>

        {/* Whispers */}
        {whispers.length === 0 && !isLoading ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold mb-2">
              No whispers yet
            </h3>
            <p className="text-textSecondary">
              You haven't posted any whispers yet
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whispers.map((whisper) => (
              <div key={whisper.id.toString()} className="relative">
                <WhisperCard
                  whisper={whisper}
                  contractAddress={contractAddress}
                />
                <button
                  onClick={() => handleDelete(whisper.id)}
                  disabled={isDeleting}
                  className="absolute top-2 right-2 btn-neu px-3 py-1 rounded-md text-sm bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                >
                  🗑️ Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-neu p-6 h-48 skeleton"></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

