"use client";

import { useState, useEffect } from "react";
import { useWhisperWall, type WhisperData } from "@/hooks/useWhisperWall";
import { WhisperCard } from "@/components/WhisperCard";
import { useMetaMaskProvider } from "@/hooks/metamask/useMetaMaskProvider";

export default function PrivateMessages() {
  const { getPrivateInbox, getMyWhispers, getWhisper, contractAddress } =
    useWhisperWall();
  const { isConnected } = useMetaMaskProvider();
  const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");
  const [whispers, setWhispers] = useState<WhisperData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadInbox = async () => {
    setIsLoading(true);
    try {
      const whisperIds = await getPrivateInbox(0, 50);
      const whisperDataPromises = whisperIds.map((id) => getWhisper(id));
      const whisperData = (await Promise.all(whisperDataPromises)).filter(
        (w): w is WhisperData => w !== null && !w.isDeleted
      );
      setWhispers(whisperData);
    } catch (error) {
      console.error("Failed to load inbox:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSent = async () => {
    setIsLoading(true);
    try {
      const whisperIds = await getMyWhispers(0, 50);
      const whisperDataPromises = whisperIds.map((id) => getWhisper(id));
      const whisperData = (await Promise.all(whisperDataPromises)).filter(
        (w): w is WhisperData => w !== null && !w.isDeleted && w.whisperType === 1
      );
      setWhispers(whisperData);
    } catch (error) {
      console.error("Failed to load sent messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && contractAddress) {
      console.log("✅ Connected and contract address available, loading private messages...");
      if (activeTab === "inbox") {
        loadInbox();
      } else {
        loadSent();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isConnected, contractAddress]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2">Wallet Not Connected</h2>
          <p className="text-textSecondary">
            Please connect your wallet to view private messages
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
            📩 Private Messages
          </h1>
          <p className="text-textSecondary">
            Your encrypted private whispers
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8">
          <button
            onClick={() => setActiveTab("inbox")}
            className={`px-6 py-3 rounded-md font-medium transition-smooth ${
              activeTab === "inbox"
                ? "btn-primary shadow-lg"
                : "btn-neu hover:bg-surface"
            }`}
          >
            📥 Inbox {activeTab === "inbox" && "✓"}
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`px-6 py-3 rounded-md font-medium transition-smooth ${
              activeTab === "sent"
                ? "btn-primary shadow-lg"
                : "btn-neu hover:bg-surface"
            }`}
          >
            📤 Sent {activeTab === "sent" && "✓"}
          </button>
        </div>

        {/* Messages */}
        {whispers.length === 0 && !isLoading ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">
              {activeTab === "inbox" ? "📭" : "📬"}
            </div>
            <h3 className="text-xl font-semibold mb-2">
              No {activeTab === "inbox" ? "received" : "sent"} messages
            </h3>
            <p className="text-textSecondary">
              {activeTab === "inbox"
                ? "You haven't received any private whispers yet"
                : "You haven't sent any private whispers yet"}
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

