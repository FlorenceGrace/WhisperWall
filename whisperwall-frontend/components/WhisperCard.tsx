"use client";

import { useState } from "react";
import type { WhisperData } from "@/hooks/useWhisperWall";
import { VoteButtons } from "./VoteButtons";
import { DecryptButton } from "./DecryptButton";

interface WhisperCardProps {
  whisper: WhisperData;
  contractAddress?: string;
}

export function WhisperCard({ whisper, contractAddress }: WhisperCardProps) {
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const isEncrypted = whisper.contentMode === 1;
  const isPrivate = whisper.whisperType === 1;
  const displayAuthor = whisper.isAnonymous
    ? "Anonymous"
    : formatAddress(whisper.author);

  // Check if encrypted content handle is valid (not zero hash)
  const zeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const hasEncryptedContent = isEncrypted && 
    whisper.encryptedContent && 
    whisper.encryptedContent.toLowerCase() !== zeroHash.toLowerCase() &&
    whisper.encryptedContent !== "0x0" &&
    whisper.encryptedContent !== "0";

  console.log("WhisperCard Debug:", {
    id: whisper.id.toString(),
    contentMode: whisper.contentMode,
    isEncrypted,
    encryptedContent: whisper.encryptedContent,
    encryptedContentType: typeof whisper.encryptedContent,
    encryptedContentLength: whisper.encryptedContent?.length,
    hasEncryptedContent,
    plainContent: whisper.plainContent,
    zeroHash,
  });

  return (
    <div className="card-neu p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="text-sm">
            <span className="font-medium">👤 {displayAuthor}</span>
            {whisper.tag && (
              <span className="ml-2 text-textSecondary">🏷️ #{whisper.tag}</span>
            )}
          </div>
        </div>
        <div className="text-xs text-textSecondary">
          ⏰ {formatTimestamp(whisper.timestamp)}
        </div>
      </div>

      {/* Content */}
      <div className="py-3">
        {hasEncryptedContent ? (
          <div className="space-y-3">
            {decryptedContent ? (
              <p className="text-base">{decryptedContent}</p>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 space-y-3 text-textSecondary">
                <div className="text-3xl">🔒</div>
                <p className="text-sm">Encrypted Content</p>
                <DecryptButton
                  whisperId={whisper.id}
                  encryptedContentHandle={whisper.encryptedContent}
                  contractAddress={contractAddress}
                  onDecrypted={setDecryptedContent}
                />
              </div>
            )}
          </div>
        ) : (
          <p className="text-base">{whisper.plainContent || "(No content)"}</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center space-x-4 text-sm text-textSecondary">
          <div className="flex items-center space-x-1">
            {isPrivate ? (
              <span>🔐 Private</span>
            ) : (
              <span>🔓 Public</span>
            )}
          </div>
          {isEncrypted && <span>🔒 Encrypted</span>}
        </div>

        <VoteButtons whisperId={whisper.id} />
      </div>

      {/* Private Message Recipient */}
      {isPrivate && whisper.recipient && (
        <div className="text-xs text-textSecondary pt-2 border-t border-border">
          📩 To: {formatAddress(whisper.recipient)}
        </div>
      )}
    </div>
  );
}

