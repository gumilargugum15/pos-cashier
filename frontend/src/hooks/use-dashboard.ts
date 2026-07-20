import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "@/api/dashboard";
import { useAuth } from "@/hooks/use-auth";

export function useDashboard() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
    enabled: isAuthenticated,
  });
}
