import { useState, useEffect } from "react";
import { useRecipient, useRegisterEmail } from "@/hooks/use-email";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, CheckCircle2, Loader2, Save } from "lucide-react";

export function EmailConfigForm() {
  const { data: recipient, isLoading } = useRecipient();
  const { mutate: register, isPending } = useRegisterEmail();
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (recipient?.email) {
      setEmail(recipient.email);
    }
  }, [recipient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register({ email }, {
      onSuccess: () => {
        toast({
          title: "Configuration Saved",
          description: "Alert recipient has been updated successfully.",
        });
      },
      onError: (err) => {
        toast({
          title: "Update Failed",
          description: err.message,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Card className="dashboard-card h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Where alerts should be sent</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Recipient Email</Label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-10"
                />
                {recipient?.email === email && email !== "" && (
                  <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                )}
              </div>
            </div>
            
            <div className="pt-2">
              {recipient ? (
                <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Currently active: <span className="font-medium text-foreground">{recipient.email}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-4 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  No active recipient configured
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-slate-800 hover:bg-slate-700 text-white"
              disabled={isPending || (recipient?.email === email && !!email)}
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {recipient ? "Update Recipient" : "Register Email"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
