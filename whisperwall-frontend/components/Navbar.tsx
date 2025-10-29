"use client";

import Link from "next/link";
import { useMetaMaskProvider } from "@/hooks/metamask/useMetaMaskProvider";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";

export function Navbar() {
  const { connect, disconnect, isConnected, accounts, chainId } =
    useMetaMaskProvider();
  const { fhevmLoading } = useMetaMaskEthersSigner();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 1:
        return "Ethereum";
      case 11155111:
        return "Sepolia";
      case 31337:
        return "Localhost";
      default:
        return `Chain ${chainId}`;
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-primary">
                WhisperWall
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-4">
              <Link
                href="/"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-surface transition-smooth"
              >
                Home
              </Link>
              <Link
                href="/public-wall"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-surface transition-smooth"
              >
                Public Wall
              </Link>
              {isConnected && (
                <>
                  <Link
                    href="/my-whispers"
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-surface transition-smooth"
                  >
                    My Whispers
                  </Link>
                  <Link
                    href="/private-messages"
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-surface transition-smooth"
                  >
                    Private Messages
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Side - Network & Wallet */}
          <div className="flex items-center space-x-4">
            {/* Network Indicator */}
            {isConnected && chainId && (
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-md bg-surface text-sm">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span>{getNetworkName(chainId)}</span>
              </div>
            )}

            {/* FHEVM Status */}
            {fhevmLoading && (
              <div className="text-sm text-textSecondary">
                Loading FHEVM...
              </div>
            )}

            {/* Wallet Button */}
            {!isConnected ? (
              <button
                onClick={handleConnect}
                className="btn-primary px-4 py-2 rounded-md font-medium"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="card-neu px-4 py-2 rounded-md text-sm font-medium">
                  {formatAddress(accounts[0])}
                </div>
                <button
                  onClick={disconnect}
                  className="btn-neu px-4 py-2 rounded-md text-sm hover:bg-red-50 transition-smooth"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

