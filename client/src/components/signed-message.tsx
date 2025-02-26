import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { verifyMessage } from "@/lib/wallet";

interface SignedMessageProps {
  message: string;
  signature: Array<string>;
  timestamp: Date;
  address: string;
}

export function SignedMessage({ message, signature, timestamp, address }: SignedMessageProps) {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<boolean | null>(null);

  const copySignature = () => {
    navigator.clipboard.writeText(signature.join(","));
    toast({
      title: "Signature copied",
      description: "The signature has been copied to your clipboard",
    });
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const isValid = await verifyMessage(address, message, signature);
      setVerificationStatus(isValid);
      toast({
        title: isValid ? "Verification Successful" : "Verification Failed",
        description: isValid
          ? "The signature is valid and matches the message"
          : "The signature does not match the message",
        variant: isValid ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Failed to verify signature",
      });
      setVerificationStatus(false);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Signed Message</CardTitle>
            <CardDescription>
              {timestamp.toLocaleString()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {verificationStatus !== null && (
              <div className={`flex items-center gap-1 text-sm ${verificationStatus ? "text-green-500" : "text-red-500"}`}>
                {verificationStatus ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Valid</span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4" />
                    <span>Invalid</span>
                  </>
                )}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleVerify}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Verify"
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Message</h4>
          <p className="text-sm text-muted-foreground break-words">{message}</p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Signature</h4>
            <Button variant="ghost" size="sm" onClick={copySignature}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground break-all font-mono">
            {signature.join(",")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
