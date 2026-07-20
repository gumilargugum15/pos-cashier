import { useQuery } from "@tanstack/react-query";
import { listRoles } from "@/api/roles";

export function useRoles() {
  return useQuery({
    queryKey: ["roles", "all"],
    queryFn: listRoles,
  });
}
