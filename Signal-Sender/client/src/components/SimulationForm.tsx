import { useState } from "react";
import { useSimulateAlert } from "@/hooks/use-alerts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Cpu, Send, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export function SimulationForm() {
  const [doorStatus, setDoorStatus] = useState("closed");
  const [isAlert, setIsAlert] = useState(false);
  const [duration, setDuration] = useState<string>("0");
  const { mutate: sendSignal, isPending } = useSimulateAlert();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    sendSignal({
      door_status: doorStatus,
      alert: isAlert,
      duration: parseInt(duration) || 0,
    }, {
      onSuccess: () => {
        toast({
          title: "Signal Sent",
          description: "Hardware signal simulation processed successfully.",
        });
      },
      onError: (err) => {
        toast({
          title: "Simulation Failed",
          description: err.message,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Card className="dashboard-card border-l-4 border-l-primary h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Cpu className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle>Hardware Simulator</CardTitle>
            <CardDescription>Simulate ESP8266 incoming signals</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Door Status</Label>
            <Select value={doorStatus} onValueChange={setDoorStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" /> Open
                  </div>
                </SelectItem>
                <SelectItem value="closed">
                  <div className="flex items-center gap-2 text-green-600">
                    <ShieldCheck className="h-4 w-4" /> Closed
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border">
            <div className="space-y-0.5">
              <Label className="text-base">Trigger Alert</Label>
              <p className="text-xs text-muted-foreground">Sets is_alert flag to true</p>
            </div>
            <Switch checked={isAlert} onCheckedChange={setIsAlert} />
          </div>

          <div className="space-y-2">
            <Label>Duration (seconds)</Label>
            <Input 
              type="number" 
              min="0"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="font-mono"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full relative overflow-hidden group"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            )}
            {isPending ? "Sending..." : "Transmit Signal"}
            
            {/* Subtle light sweep effect */}
            <motion.div
              className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"
              initial={false}
            />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
