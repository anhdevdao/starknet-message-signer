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

    // Convert message to hex format
    const messageToSign = "0x" + Buffer.from(message).toString('hex');

    // Using basic message signing with a timeout
    const signPromise = wallet.account.signMessage(messageToSign);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Signing timed out")), 60000)
    );

    const signature = await Promise.race([signPromise, timeoutPromise]);
    return Array.isArray(signature) ? signature[0] : signature;
  } catch (error) {
    console.error("Message signing error:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to sign message");
  }
}