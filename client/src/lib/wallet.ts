import { connect } from "get-starknet";

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  error: string | null;
}

export async function connectWallet(): Promise<WalletState> {
  try {
    // Check if provider exists
    if (!window.starknet) {
      return {
        address: null,
        isConnected: false,
        error: "Please install ArgentX or Braavos wallet extension"
      };
    }

    // Connect to wallet
    const wallet = await connect();

    if (!wallet) {
      return {
        address: null,
        isConnected: false,
        error: "Failed to connect to wallet"
      };
    }

    // Check if already connected
    if (wallet.isConnected && wallet.selectedAddress) {
      return {
        address: wallet.selectedAddress,
        isConnected: true,
        error: null
      };
    }

    // Request connection
    try {
      await wallet.enable();
      return {
        address: wallet.selectedAddress || null,
        isConnected: true,
        error: null
      };
    } catch (enableError) {
      if (enableError instanceof Error && enableError.message.includes('reject')) {
        return {
          address: null,
          isConnected: false,
          error: "Connection rejected by user"
        };
      }
      throw enableError;
    }
  } catch (error) {
    console.error("Wallet connection error:", error);
    return {
      address: null,
      isConnected: false,
      error: error instanceof Error ? error.message : "Failed to connect wallet"
    };
  }
}

export async function signMessage(message: string): Promise<string> {
  try {
    if (!window.starknet) {
      throw new Error("Wallet extension not found");
    }

    const wallet = await connect();
    if (!wallet || !wallet.isConnected) {
      throw new Error("Wallet not connected");
    }

    try {
      // For Starknet.js v4, we need to pass an array of messages
      // The message should be a string without hex conversion
      const signature = await wallet.account.signMessage([message]);
      if (!signature) {
        throw new Error("No signature returned");
      }

      return Array.isArray(signature) ? signature[0] : signature;
    } catch (signError) {
      console.error("Signing error details:", {
        error: signError,
        wallet: wallet.isConnected,
        address: wallet.selectedAddress,
        message
      });
      throw signError;
    }
  } catch (error) {
    console.error("Message signing error:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error(error instanceof Error ? error.message : "Failed to sign message");
  }
}