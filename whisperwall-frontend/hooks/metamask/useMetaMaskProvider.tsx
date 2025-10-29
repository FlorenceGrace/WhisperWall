"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import type { Eip1193Provider } from "ethers";
import { useEip6963 } from "./useEip6963";

interface MetaMaskContextType {
  provider: Eip1193Provider | undefined;
  chainId: number | undefined;
  accounts: string[];
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
}

const MetaMaskContext = createContext<MetaMaskContextType | undefined>(
  undefined
);

// 持久化键
const STORAGE_KEYS = {
  CONNECTED: "wallet.connected",
  LAST_ACCOUNTS: "wallet.lastAccounts",
  LAST_CHAIN_ID: "wallet.lastChainId",
  LAST_CONNECTOR_ID: "wallet.lastConnectorId",
};

export function MetaMaskProvider({ children }: { children: ReactNode }) {
  const { providers } = useEip6963();
  const [provider, setProvider] = useState<Eip1193Provider | undefined>();
  const [chainId, setChainId] = useState<number | undefined>();
  const [accounts, setAccounts] = useState<string[]>([]);
  const [isRestoring, setIsRestoring] = useState(true);

  const setupEventListeners = useCallback((walletProvider: Eip1193Provider) => {
    if ("on" in walletProvider && typeof walletProvider.on === "function") {
      walletProvider.on("accountsChanged", (newAccounts: unknown) => {
        const accts = newAccounts as string[];
        setAccounts(accts);
        if (accts.length > 0) {
          localStorage.setItem(STORAGE_KEYS.LAST_ACCOUNTS, JSON.stringify(accts));
        } else {
          // 用户断开了所有账户
          localStorage.removeItem(STORAGE_KEYS.CONNECTED);
          localStorage.removeItem(STORAGE_KEYS.LAST_ACCOUNTS);
          setProvider(undefined);
          setChainId(undefined);
        }
      });

      walletProvider.on("chainChanged", (newChainId: unknown) => {
        const cid = Number.parseInt(newChainId as string, 16);
        setChainId(cid);
        localStorage.setItem(STORAGE_KEYS.LAST_CHAIN_ID, cid.toString());
      });

      walletProvider.on("disconnect", () => {
        setProvider(undefined);
        setAccounts([]);
        setChainId(undefined);
        localStorage.removeItem(STORAGE_KEYS.CONNECTED);
        localStorage.removeItem(STORAGE_KEYS.LAST_ACCOUNTS);
        localStorage.removeItem(STORAGE_KEYS.LAST_CHAIN_ID);
        localStorage.removeItem(STORAGE_KEYS.LAST_CONNECTOR_ID);
      });
    }
  }, []);

  const connect = useCallback(async (silent = false) => {
    // Use first available provider
    const firstProvider = Array.from(providers.values())[0];
    if (!firstProvider) {
      throw new Error("No wallet provider found");
    }

    const walletProvider = firstProvider.provider;
    
    try {
      const requestedAccounts = silent
        ? await walletProvider.request({ method: "eth_accounts" })
        : await walletProvider.request({ method: "eth_requestAccounts" });

      if (!requestedAccounts || (requestedAccounts as string[]).length === 0) {
        return false;
      }

      const currentChainId = await walletProvider.request({
        method: "eth_chainId",
      });

      setProvider(walletProvider);
      setAccounts(requestedAccounts as string[]);
      setChainId(Number.parseInt(currentChainId as string, 16));

      // 持久化连接状态
      localStorage.setItem(STORAGE_KEYS.CONNECTED, "true");
      localStorage.setItem(STORAGE_KEYS.LAST_ACCOUNTS, JSON.stringify(requestedAccounts));
      localStorage.setItem(STORAGE_KEYS.LAST_CHAIN_ID, Number.parseInt(currentChainId as string, 16).toString());
      localStorage.setItem(STORAGE_KEYS.LAST_CONNECTOR_ID, firstProvider.info.uuid);

      // Set up event listeners
      setupEventListeners(walletProvider);

      return true;
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  }, [providers, setupEventListeners]);

  const disconnect = useCallback(() => {
    setProvider(undefined);
    setAccounts([]);
    setChainId(undefined);
    localStorage.removeItem(STORAGE_KEYS.CONNECTED);
    localStorage.removeItem(STORAGE_KEYS.LAST_ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.LAST_CHAIN_ID);
    localStorage.removeItem(STORAGE_KEYS.LAST_CONNECTOR_ID);
  }, []);

  // 自动重连逻辑
  useEffect(() => {
    const autoReconnect = async () => {
      if (typeof window === "undefined") {
        setIsRestoring(false);
        return;
      }

      const wasConnected = localStorage.getItem(STORAGE_KEYS.CONNECTED) === "true";
      
      if (!wasConnected) {
        setIsRestoring(false);
        return;
      }

      // 等待providers加载
      if (providers.size === 0) {
        return;
      }

      try {
        await connect(true); // 静默重连
      } catch (error) {
        console.error("Auto-reconnect failed:", error);
        // 清理持久化状态
        localStorage.removeItem(STORAGE_KEYS.CONNECTED);
      } finally {
        setIsRestoring(false);
      }
    };

    autoReconnect();
  }, [providers, connect]);

  const handleConnect = useCallback(async () => {
    await connect(false);
  }, [connect]);

  return (
    <MetaMaskContext.Provider
      value={{
        provider,
        chainId,
        accounts,
        connect: handleConnect,
        disconnect,
        isConnected: accounts.length > 0,
      }}
    >
      {children}
    </MetaMaskContext.Provider>
  );
}

export function useMetaMaskProvider() {
  const context = useContext(MetaMaskContext);
  if (!context) {
    throw new Error("useMetaMaskProvider must be used within MetaMaskProvider");
  }
  return context;
}

