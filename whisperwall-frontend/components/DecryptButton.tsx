"use client";

import { useState } from "react";
import { useWhisperDecrypt } from "@/hooks/useWhisperDecrypt";

interface DecryptButtonProps {
  whisperId: bigint;
  encryptedContentHandle: string;
  contractAddress?: string;
  onDecrypted: (content: string) => void;
}

export function DecryptButton({
  whisperId,
  encryptedContentHandle,
  contractAddress,
  onDecrypted,
}: DecryptButtonProps) {
  const { isDecrypting, decryptContent } = useWhisperDecrypt(contractAddress);
  const [error, setError] = useState<string | null>(null);

  const handleDecrypt = async () => {
    setError(null);
    try {
      const decrypted = await decryptContent(whisperId, encryptedContentHandle);
      if (decrypted) {
        onDecrypted(decrypted);
      } else {
        setError("Failed to decrypt content");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Decryption failed");
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={handleDecrypt}
        disabled={isDecrypting || !contractAddress}
        className="btn-primary px-6 py-2 rounded-md font-medium disabled:opacity-50"
      >
        {isDecrypting ? "Decrypting..." : "🔓 Request Decrypt"}
      </button>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

