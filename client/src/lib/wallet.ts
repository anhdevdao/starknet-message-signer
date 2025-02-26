import { connect } from '@argent/get-starknet';

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  error: string | null;
}

export async function connectWallet(): Promise<WalletState> {
  try {
    // First check if a Starknet provider is available
    if (!window.starknet) {
      return {
        address: null,
        isConnected: false,
        error: "Please install ArgentX or Braavos wallet extension"
      };
    }

    const starknet = await connect();

    if (!starknet) {
      return {
        address: null,
        isConnected: false,
        error: "Failed to connect to wallet. Please try again."
      };
    }

    // Check if already connected
    if (starknet.isConnected && starknet.selectedAddress) {
      return {
        address: starknet.selectedAddress,
        isConnected: true,
        error: null
      };
    }

    try {
      const [address] = await starknet.enable();
      return {
        address,
        isConnected: true,
        error: null
      };
    } catch (enableError) {
      if (enableError instanceof Error && enableError.message.includes('User rejected')) {
        return {
          address: null,
          isConnected: false,
          error: "Connection rejected by user"
        };
      }
      throw enableError; // Re-throw other errors
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

export async function signMessage(message: string, address: string): Promise<string> {
  try {
    if (!window.starknet) {
      throw new Error("Wallet extension not found");
    }

    const starknet = await connect();
    if (!starknet) {
      throw new Error("Wallet not connected");
    }

    const signature = await starknet.account.signMessage({
      domain: {
        name: 'Starknet Message Signer',
        chainId: 'SN_MAIN',
        version: '0.0.1',
      },
      types: {
        Message: [
          { name: 'message', type: 'string' }
        ]
      },
      message: {
        message
      },
      primaryType: 'Message'
    });

    return signature;
  } catch (error) {
    console.error("Message signing error:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to sign message");
  }
}