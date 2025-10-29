"use client";

import { useState, useEffect } from "react";
import { useWhisperVote, type VoteType } from "@/hooks/useWhisperVote";

interface VoteButtonsProps {
  whisperId: bigint;
}

export function VoteButtons({ whisperId }: VoteButtonsProps) {
  const { isVoting, voteWhisper, getMyVote } = useWhisperVote();
  const [myVote, setMyVote] = useState<VoteType>("NONE");

  useEffect(() => {
    getMyVote(whisperId).then(setMyVote);
  }, [whisperId, getMyVote]);

  const handleVote = async (voteType: VoteType) => {
    try {
      await voteWhisper(whisperId, voteType);
      setMyVote(voteType);
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleVote(myVote === "LIKE" ? "NONE" : "LIKE")}
        disabled={isVoting}
        className={`btn-neu px-3 py-1 rounded-md text-sm transition-smooth ${
          myVote === "LIKE"
            ? "bg-primary text-white"
            : "hover:bg-surface"
        }`}
      >
        👍 Like
      </button>
      <button
        onClick={() => handleVote(myVote === "DISLIKE" ? "NONE" : "DISLIKE")}
        disabled={isVoting}
        className={`btn-neu px-3 py-1 rounded-md text-sm transition-smooth ${
          myVote === "DISLIKE"
            ? "bg-red-500 text-white"
            : "hover:bg-surface"
        }`}
      >
        👎 Dislike
      </button>
    </div>
  );
}


