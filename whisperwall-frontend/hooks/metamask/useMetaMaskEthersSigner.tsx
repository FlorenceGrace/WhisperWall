"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { useMetaMaskProvider } from "./useMetaMaskProvider";
import { useFhevm } from "@/fhevm/useFhevm";
import type { FhevmInstance } from "@/fhevm/fhevmTypes";
import type { GenericStringStorage } from "@/fhevm/GenericStringStorage";
import { createLocalStringStorage } from "@/fhevm/GenericStringStorage";

interface MetaMaskEthersSignerContextType {
  signer: JsonRpcSigner | undefined;
  readonlyProvider: BrowserProvider | undefined;
  fhevmInstance: FhevmInstance | undefined;
  fhevmLoading: boolean;
  decryptionSignatureStorage: GenericStringStorage;
}

const MetaMaskEthersSignerContext = createContext<
  MetaMaskEthersSignerContextType | undefined
>(undefined);

export function MetaMaskEthersSignerProvider({
  children,
  initialMockChains,
}: {
  children: ReactNode;
  initialMockChains?: Record<number, string>;
}) {
  const { provider, accounts, chainId } = useMetaMaskProvider();
  const [signer, setSigner] = useState<JsonRpcSigner | undefined>();
  const [readonlyProvider, setReadonlyProvider] = useState<
    BrowserProvider | undefined
  >();

  const { instance: fhevmInstance, isLoading: fhevmLoading } = useFhevm({
    provider,
    mockChains: initialMockChains,
  });

  const decryptionSignatureStorage = createLocalStringStorage();

  // 初始化只读Provider（不需要钱包连接）
  useEffect(() => {
    if (typeof window !== "undefined" && initialMockChains) {
      // 尝试使用本地节点作为只读Provider
      const localhostRpc = initialMockChains[31337];
      if (localhostRpc) {
        import("ethers").then(({ JsonRpcProvider }) => {
          const localProvider = new JsonRpcProvider(localhostRpc);
          // 只在没有连接钱包时使用本地Provider
          if (!provider && !readonlyProvider) {
            setReadonlyProvider(localProvider as any);
          }
        });
      }
    }
  }, [initialMockChains, provider, readonlyProvider]);

  useEffect(() => {
    if (provider && accounts.length > 0) {
      const browserProvider = new BrowserProvider(provider);
      browserProvider.getSigner(accounts[0]).then((s) => {
        setSigner(s);
        setReadonlyProvider(browserProvider);
      });
    } else {
      setSigner(undefined);
      // 不要清除readonlyProvider，保持只读访问
    }
  }, [provider, accounts]);

  return (
    <MetaMaskEthersSignerContext.Provider
      value={{
        signer,
        readonlyProvider,
        fhevmInstance,
        fhevmLoading,
        decryptionSignatureStorage,
      }}
    >
      {children}
    </MetaMaskEthersSignerContext.Provider>
  );
}

export function useMetaMaskEthersSigner() {
  const context = useContext(MetaMaskEthersSignerContext);
  if (!context) {
    throw new Error(
      "useMetaMaskEthersSigner must be used within MetaMaskEthersSignerProvider"
    );
  }
  return context;
}

