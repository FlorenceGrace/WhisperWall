"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type { Eip1193Provider } from "ethers";
import { createFhevmInstance, FhevmAbortError } from "./fhevm";
import type { FhevmInstance } from "./fhevmTypes";

type FhevmRelayerStatusType =
  | "sdk-loading"
  | "sdk-loaded"
  | "sdk-initializing"
  | "sdk-initialized"
  | "creating";

export function useFhevm(parameters: {
  provider: Eip1193Provider | undefined;
  mockChains?: Record<number, string>;
}) {
  const { provider, mockChains } = parameters;

  const [instance, setInstance] = useState<FhevmInstance | undefined>(
    undefined
  );
  const [status, setStatus] = useState<FhevmRelayerStatusType | undefined>(
    undefined
  );
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | undefined>(undefined);
  const providerRef = useRef<Eip1193Provider | undefined>(provider);

  providerRef.current = provider;

  const createInstance = useCallback(async () => {
    if (!providerRef.current) {
      return;
    }

    // Abort previous creation if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    setError(undefined);
    setStatus(undefined);

    try {
      const newInstance = await createFhevmInstance({
        provider: providerRef.current,
        mockChains,
        signal: abortController.signal,
        onStatusChange: (s) => {
          if (!abortController.signal.aborted) {
            setStatus(s);
          }
        },
      });

      if (!abortController.signal.aborted) {
        setInstance(newInstance);
        setIsLoading(false);
      }
    } catch (e) {
      if (!abortController.signal.aborted) {
        if (e instanceof FhevmAbortError) {
          console.log("FHEVM instance creation aborted");
        } else {
          console.error("Failed to create FHEVM instance:", e);
          setError(e as Error);
        }
        setIsLoading(false);
      }
    }
  }, [mockChains]);

  useEffect(() => {
    if (provider) {
      createInstance();
    } else {
      setInstance(undefined);
      setStatus(undefined);
      setError(undefined);
      setIsLoading(false);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [provider, createInstance]);

  return {
    instance,
    status,
    error,
    isLoading,
  };
}


