import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type HardwareAlertInput } from "@shared/routes";

// GET /api/logs
export function useAlertLogs() {
  return useQuery({
    queryKey: [api.alerts.list.path],
    queryFn: async () => {
      const res = await fetch(api.alerts.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch logs");
      return api.alerts.list.responses[200].parse(await res.json());
    },
    // Refresh frequently for the "live dashboard" feel
    refetchInterval: 5000, 
  });
}

// POST /api/door-alert (Simulation)
export function useSimulateAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: HardwareAlertInput) => {
      const res = await fetch(api.alerts.receive.path, {
        method: api.alerts.receive.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to send signal");
      }
      return api.alerts.receive.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate logs so they update immediately
      queryClient.invalidateQueries({ queryKey: [api.alerts.list.path] });
    },
  });
}
