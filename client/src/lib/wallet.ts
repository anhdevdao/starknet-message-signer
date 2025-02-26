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
        error: "Failed to connect wallet"
      };
    }

    const [address] = await starknet.enable();
    return {
      address,
      isConnected: true,
      error: null
    };
  } catch (error) {
    return {
      address: null,
      isConnected: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
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