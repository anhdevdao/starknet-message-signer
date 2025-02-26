import { connect } from '@argent/get-starknet';

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  error: string | null;
}

export async function connectWallet(): Promise<WalletState> {
  try {
    const starknet = await connect();

    if (!starknet) {
      return {
        address: null,
        isConnected: false,
        error: "No wallet found. Please install ArgentX or Braavos."
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

    const [address] = await starknet.enable();
    return {
      address,
      isConnected: true,
      error: null
    };
  } catch (error) {
    // Handle user rejection
    if (error instanceof Error && error.message.includes('User rejected')) {
      return {
        address: null,
        isConnected: false,
        error: "Connection rejected by user"
      };
    }

    return {
      address: null,
      isConnected: false,
      error: error instanceof Error ? error.message : "Failed to connect wallet"
    };
  }
}

export async function signMessage(message: string, address: string): Promise<string> {
  try {
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
    throw new Error(error instanceof Error ? error.message : "Failed to sign message");
  }
}