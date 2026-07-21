import { useContext } from "react";
import { ActiveBranchContext } from "@/contexts/active-branch-context";

export function useActiveBranch() {
  const context = useContext(ActiveBranchContext);

  if (!context) {
    throw new Error("useActiveBranch must be used within an ActiveBranchProvider");
  }

  return context;
}
