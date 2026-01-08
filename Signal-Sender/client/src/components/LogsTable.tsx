import { useAlertLogs } from "@/hooks/use-alerts";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogsTable() {
  const { data: logs, isLoading, refetch, isRefetching } = useAlertLogs();

  return (
    <Card className="dashboard-card col-span-1 lg:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-500/10 rounded-lg">
            <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <CardTitle>System Logs</CardTitle>
            <CardDescription>Recent hardware events and alerts</CardDescription>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          disabled={isRefetching}
          className="gap-2"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm">Loading logs...</p>
          </div>
        ) : logs && logs.length > 0 ? (
          <ScrollArea className="h-[400px] rounded-md border">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Notification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs">
                      {format(new Date(log.timestamp || new Date()), "MMM dd, HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          log.doorStatus === "open" 
                            ? "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30" 
                            : "border-green-500 text-green-600 bg-green-50 dark:bg-green-950/30"
                        }
                      >
                        {log.doorStatus.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.isAlert ? (
                        <div className="flex items-center text-destructive font-medium text-sm">
                          <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                          ALERT
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Info</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.duration ? `${log.duration}s` : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {log.emailSent ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-none">
                          Sent
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">Not sent</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
            <FileText className="h-10 w-10 mb-3 opacity-20" />
            <p>No logs recorded yet</p>
            <p className="text-xs mt-1">Simulate an event to see data here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
