import { Button } from "@/components/ui/button";
import { Loader2, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WalletButtonProps {
  isConnected: boolean;
  isLoading: boolean;
  address: string | null;
  onConnect: () => void;
}

export function WalletButton({ isConnected, isLoading, address, onConnect }: WalletButtonProps) {
  const { toast } = useToast();

  const handleClick = () => {
    if (isLoading) return;

    if (isConnected && address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
    } else {
      onConnect();
    }
  };

  return (
    <Button
      variant={isConnected ? "outline" : "default"}
      onClick={handleClick}
      disabled={isLoading}
      className="w-full sm:w-auto"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Wallet className="h-4 w-4 mr-2" />
      )}
      {isConnected
        ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
        : isLoading 
          ? "Connecting..." 
          : "Connect Wallet"}
    </Button>
  );
}