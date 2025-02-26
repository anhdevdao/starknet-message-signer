import { useState, useEffect } from "react";
import { WalletButton } from "@/components/wallet-button";
import { MessageForm } from "@/components/message-form";
import { SignedMessage } from "@/components/signed-message";
import { connectWallet, signMessage, type WalletState } from "@/lib/wallet";
import { useToast } from "@/hooks/use-toast";

interface SignedMessageData {
  message: string;
  signature: string;
  timestamp: Date;
}

export default function Home() {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    error: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [signedMessages, setSignedMessages] = useState<SignedMessageData[]>([]);
  const { toast } = useToast();

  // Check wallet connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const state = await connectWallet();
        setWalletState(state);
      } catch (error) {
        console.error("Failed to check wallet connection:", error);
      }
    };
    checkConnection();
  }, []);

  const handleConnect = async () => {
    if (isConnecting) return;

    setIsConnecting(true);
    try {
      const state = await connectWallet();
      setWalletState(state);

      if (state.error) {
        toast({
          variant: "destructive",
          title: "Connection failed",
          description: state.error,
        });
      } else if (state.isConnected) {
        toast({
          title: "Wallet connected",
          description: "Successfully connected to your wallet",
        });
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      setWalletState({
        address: null,
        isConnected: false,
        error: error instanceof Error ? error.message : "Failed to connect wallet",
      });
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSign = async (message: string) => {
    if (!walletState.address) return;

    try {
      const signature = await signMessage(message, walletState.address);
      setSignedMessages((prev) => [
        {
          message,
          signature,
          timestamp: new Date(),
        },
        ...prev,
      ]);

      toast({
        title: "Message signed",
        description: "Your message has been successfully signed",
      });
    } catch (error) {
      console.error("Message signing error:", error);
      toast({
        variant: "destructive",
        title: "Signing failed",
        description: error instanceof Error ? error.message : "Failed to sign message",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-4xl font-bold">Starknet Message Signer</h1>
          <WalletButton
            isConnected={walletState.isConnected}
            isLoading={isConnecting}
            address={walletState.address}
            onConnect={handleConnect}
          />
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <MessageForm
              onSign={handleSign}
              isConnected={walletState.isConnected}
            />
          </div>

          <div className="space-y-4">
            {signedMessages.map((data, index) => (
              <SignedMessage key={index} {...data} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}