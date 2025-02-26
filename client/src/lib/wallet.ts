import { connect } from "get-starknet";

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  error: string | null;
}

export interface TypedData {
  domain: {
    name: string;
    version: string;
    chainId: string;
  };
  types: {
    StarkNetDomain: Array<{ name: string; type: string }>;
    Message: Array<{ name: string; type: string }>;
  };
  primaryType: string;
  message: {
    message: string;
  };
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

export async function signMessage(message: string): Promise<Array<string>> {
  try {
    if (!window.starknet) {
      throw new Error("Wallet extension not found");
    }

    const wallet = await connect();
    if (!wallet || !wallet.isConnected) {
      throw new Error("Wallet not connected");
    }

    try {
      // For Starknet.js v4, we need to pass just the message string
      const typedData = {
        domain: {
          name: 'Example DApp',
          version: '1',
          chainId: await wallet.provider.getChainId(),
        },
        types: {
          StarkNetDomain: [
            { name: 'name', type: 'felt' },
            { name: 'version', type: 'felt' },
            { name: 'chainId', type: 'felt' },
          ],
          Message: [
            { name: 'message', type: 'felt' },
          ],
        },
        primaryType: 'Message',
        message: {
          message: message,
        },
      };

      const signature = await wallet.account.signMessage(typedData);
      if (!signature) {
        throw new Error("No signature returned");
      }

      return Array.isArray(signature) ? signature : [signature];
    } catch (signError) {
      console.error("Signing error details:", {
        error: signError,
        wallet: wallet.isConnected,
        address: wallet.selectedAddress,
        message
      });

      if (signError instanceof Error) {
        if (signError.message.includes('timeout')) {
          throw new Error("Signing request timed out. Please try again.");
        }
        if (signError.message.includes('reject')) {
          throw new Error("User rejected the signing request");
        }
      }
      throw signError;
    }
  } catch (error) {
    console.error("Message signing error:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

export async function verifyMessage(address: string, message: string, signature: Array<string>): Promise<boolean> {
  console.log("🚀 ~ verifyMessage ~ signature:", signature)
  try {
    if (!window.starknet) {
      throw new Error("Wallet extension not found");
    }

    const wallet = await connect();
    if (!wallet) {
      throw new Error("Failed to connect to wallet");
    }

    const typedData: TypedData = {
      domain: {
        name: 'Example DApp',
        version: '1',
        chainId: await wallet.provider.getChainId(),
      },
      types: {
        StarkNetDomain: [
          { name: 'name', type: 'felt' },
          { name: 'version', type: 'felt' },
          { name: 'chainId', type: 'felt' },
        ],
        Message: [
          { name: 'message', type: 'felt' },
        ],
      },
      primaryType: 'Message',
      message: {
        message: message,
      },
    };

    const isValid = await wallet.account.verifyMessage(typedData, signature, address);
    return isValid;
  } catch (error) {
    console.error("Message verification error:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

export async function disconnectWallet(): Promise<WalletState> {
  try {
    if (!window.starknet) {
      return {
        address: null,
        isConnected: false,
        error: null
      };
    }

    return {
      address: null,
      isConnected: false,
      error: null
    };
  } catch (error) {
    console.error("Wallet disconnection error:", error);
    return {
      address: null,
      isConnected: false,
      error: error instanceof Error ? error.message : "Failed to disconnect wallet"
    };
  }
}
