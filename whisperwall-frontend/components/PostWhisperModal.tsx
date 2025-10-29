"use client";

import { useState } from "react";
import { useWhisperWall, type WhisperType, type ContentMode } from "@/hooks/useWhisperWall";
import { ethers } from "ethers";

interface PostWhisperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PostWhisperModal({
  isOpen,
  onClose,
  onSuccess,
}: PostWhisperModalProps) {
  const { isPosting, postWhisper } = useWhisperWall();
  const [content, setContent] = useState("");
  const [whisperType, setWhisperType] = useState<WhisperType>("PUBLIC");
  const [contentMode, setContentMode] = useState<ContentMode>("PLAIN");
  const [recipient, setRecipient] = useState("");
  const [tag, setTag] = useState("Random");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!content.trim()) {
      setError("Content is required");
      return;
    }

    if (whisperType === "PRIVATE" && !recipient.trim()) {
      setError("Recipient address is required for private messages");
      return;
    }

    if (whisperType === "PRIVATE" && !ethers.isAddress(recipient)) {
      setError("Invalid recipient address");
      return;
    }

    try {
      await postWhisper({
        whisperType,
        contentMode,
        content,
        recipient: whisperType === "PRIVATE" ? recipient : undefined,
        tag,
        isAnonymous,
      });

      // Reset form
      setContent("");
      setWhisperType("PUBLIC");
      setContentMode("PLAIN");
      setRecipient("");
      setTag("Random");
      setIsAnonymous(false);

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post whisper");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="card-neu max-w-2xl w-full p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary">✏️ New Whisper</h2>
          <button
            onClick={onClose}
            className="text-2xl text-textSecondary hover:text-text"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
              rows={5}
              className="input-neu w-full resize-none"
              placeholder="Share your thoughts..."
            />
            <div className="text-xs text-textSecondary mt-1 text-right">
              {content.length}/500
            </div>
          </div>

          {/* Whisper Type */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Whisper Type <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="PUBLIC"
                  checked={whisperType === "PUBLIC"}
                  onChange={(e) => setWhisperType(e.target.value as WhisperType)}
                  className="form-radio text-primary"
                />
                <span>🔓 Public</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="PRIVATE"
                  checked={whisperType === "PRIVATE"}
                  onChange={(e) => setWhisperType(e.target.value as WhisperType)}
                  className="form-radio text-primary"
                />
                <span>🔐 Private</span>
              </label>
            </div>
          </div>

          {/* Content Mode */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Content Mode <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="PLAIN"
                  checked={contentMode === "PLAIN"}
                  onChange={(e) => setContentMode(e.target.value as ContentMode)}
                  className="form-radio text-primary"
                />
                <span>📝 Plain Text</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="ENCRYPTED"
                  checked={contentMode === "ENCRYPTED"}
                  onChange={(e) => setContentMode(e.target.value as ContentMode)}
                  className="form-radio text-primary"
                />
                <span>🔒 Encrypted</span>
              </label>
            </div>
          </div>

          {/* Recipient (only for private) */}
          {whisperType === "PRIVATE" && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Recipient Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="input-neu w-full"
                placeholder="0x..."
              />
            </div>
          )}

          {/* Tag */}
          <div>
            <label className="block text-sm font-medium mb-2">Tag</label>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="input-neu w-full"
            >
              <option value="Confession">Confession</option>
              <option value="Appreciation">Appreciation</option>
              <option value="Secret">Secret</option>
              <option value="Random">Random</option>
            </select>
          </div>

          {/* Anonymous */}
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="form-checkbox text-primary"
              />
              <span className="text-sm">🎭 Post Anonymously</span>
            </label>
            <p className="text-xs text-textSecondary mt-1">
              Your address will be hidden in the UI (still on-chain)
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isPosting}
              className="btn-primary flex-1 py-3 rounded-md font-semibold disabled:opacity-50"
            >
              {isPosting ? "Posting..." : "Post Whisper"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-neu px-8 py-3 rounded-md font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

