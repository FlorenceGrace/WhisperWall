"use client";

import { useState, useEffect } from "react";
import { useWhisperWall, type WhisperData } from "@/hooks/useWhisperWall";
import { WhisperCard } from "@/components/WhisperCard";
import { PostWhisperModal } from "@/components/PostWhisperModal";
import { useMetaMaskProvider } from "@/hooks/metamask/useMetaMaskProvider";

export default function PublicWall() {
  const { getPublicWhispers, getWhisper, contractAddress } = useWhisperWall();
  const { isConnected } = useMetaMaskProvider();
  const [whispers, setWhispers] = useState<WhisperData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadWhispers = async (resetOffset = false) => {
    if (!contractAddress) {
      console.warn("⚠️ Contract address not available yet");
      return;
    }

    console.log("🔄 Loading whispers...", { resetOffset, contractAddress });
    setIsLoading(true);
    const currentOffset = resetOffset ? 0 : offset;
    
    try {
      console.log("📞 Calling getPublicWhispers with offset:", currentOffset);
      const whisperIds = await getPublicWhispers(currentOffset, 20);
      console.log("✅ Got whisper IDs:", whisperIds.length, whisperIds.map(id => id.toString()));
      
      if (whisperIds.length === 0) {
        console.warn("⚠️ No whisper IDs returned");
        setHasMore(false);
        setIsLoading(false);
        return;
      }

      console.log("📥 Fetching whisper details...");
      const whisperDataPromises = whisperIds.map((id) => getWhisper(id));
      const whisperData = (await Promise.all(whisperDataPromises)).filter(
        (w): w is WhisperData => w !== null && !w.isDeleted
      );
      console.log("✅ Got whisper data:", whisperData.length, "whispers");

      if (resetOffset) {
        setWhispers(whisperData);
        setOffset(20);
      } else {
        setWhispers([...whispers, ...whisperData]);
        setOffset(currentOffset + 20);
      }

      setHasMore(whisperIds.length === 20);
    } catch (error) {
      console.error("❌ Failed to load whispers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 等待 contractAddress 可用后再加载数据
    if (contractAddress) {
      console.log("✅ Contract address available, loading whispers...");
      loadWhispers(true);
    } else {
      console.log("⏳ Waiting for contract address...");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractAddress]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              🌐 Public Wall
            </h1>
            <p className="text-textSecondary mt-2">
              Browse public whispers from the community
            </p>
          </div>
          {isConnected && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary px-6 py-3 rounded-md font-semibold"
            >
              ✏️ New Whisper
            </button>
          )}
        </div>

        {/* Whispers Grid */}
        {whispers.length === 0 && !isLoading ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💭</div>
            <h3 className="text-xl font-semibold mb-2">No whispers yet</h3>
            <p className="text-textSecondary">
              Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whispers.map((whisper) => (
              <WhisperCard
                key={whisper.id.toString()}
                whisper={whisper}
                contractAddress={contractAddress}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && whispers.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={() => loadWhispers()}
              disabled={isLoading}
              className="btn-neu px-8 py-3 rounded-md font-semibold disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && whispers.length === 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-neu p-6 h-48 skeleton"></div>
            ))}
          </div>
        )}
      </div>

      <PostWhisperModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => loadWhispers(true)}
      />
    </div>
  );
}

