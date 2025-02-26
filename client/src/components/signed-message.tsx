import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SignedMessageProps {
  message: string;
  signature: string;
  timestamp: Date;
}

export function SignedMessage({ message, signature, timestamp }: SignedMessageProps) {
  const { toast } = useToast();

  const copySignature = () => {
    navigator.clipboard.writeText(signature);
    toast({
      title: "Signature copied",
      description: "The signature has been copied to your clipboard",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Signed Message</CardTitle>
        <CardDescription>
          {timestamp.toLocaleString()}
        </CardDescription>
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
            {signature}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
