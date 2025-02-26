import { Button } from "@/components/ui/button";
import { Loader2, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WalletButtonProps {
  isConnected: boolean;
  isLoading: boolean;
  address: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function WalletButton({ isConnected, isLoading, address, onConnect, onDisconnect }: WalletButtonProps) {
  const { toast } = useToast();

  const handleClick = () => {
    if (isLoading) return;

    if (isConnected && address) {
      onDisconnect();
    } else {
      onConnect();
    }
  };

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isConnected && address && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyAddress}
          className="hidden sm:flex"
        >
          {`${address.slice(0, 6)}...${address.slice(-4)}`}
        </Button>
      )}
      <Button
        variant={isConnected ? "destructive" : "default"}
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
          ? "Disconnect"
          : isLoading
            ? "Connecting..."
            : "Connect Wallet"}
      </Button>
    </div>
  );
}
