import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type RegisterEmailInput } from "@shared/routes";

// GET /api/email
export function useRecipient() {
  return useQuery({
    queryKey: [api.email.get.path],
    queryFn: async () => {
      const res = await fetch(api.email.get.path, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch recipient");
      return api.email.get.responses[200].parse(await res.json());
    },
  });
}

// POST /api/register-email
export function useRegisterEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: RegisterEmailInput) => {
      const res = await fetch(api.email.register.path, {
        method: api.email.register.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
           const error = api.email.register.responses[400].parse(await res.json());
           throw new Error(error.message);
        }
        throw new Error("Failed to register email");
      }
      return api.email.register.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.email.get.path] });
    },
  });
}
