import { createContext, useCallback, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

const ACTIVE_BRANCH_KEY = "nova_pos_active_branch_id";

type ActiveBranchContextValue = {
  /** The branch id that should scope list queries and new transactions, or null for "all branches". */
  effectiveBranchId: number | null;
  /** Whether the current user is free to switch branches (users with a home branch are locked to it). */
  canSwitchBranch: boolean;
  setActiveBranchId: (branchId: number | null) => void;
};

export const ActiveBranchContext = createContext<ActiveBranchContextValue | null>(null);

function readStoredBranchId(): number | null {
  const raw = localStorage.getItem(ACTIVE_BRANCH_KEY);
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

export function ActiveBranchProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(readStoredBranchId);

  const canSwitchBranch = !user?.branch_id;

  const setActiveBranchId = useCallback((branchId: number | null) => {
    setSelectedBranchId(branchId);
    if (branchId === null) {
      localStorage.removeItem(ACTIVE_BRANCH_KEY);
    } else {
      localStorage.setItem(ACTIVE_BRANCH_KEY, String(branchId));
    }
  }, []);

  const effectiveBranchId = user?.branch_id ?? (canSwitchBranch ? selectedBranchId : null);

  const value = useMemo(
    () => ({ effectiveBranchId, canSwitchBranch, setActiveBranchId }),
    [effectiveBranchId, canSwitchBranch, setActiveBranchId],
  );

  return (
    <ActiveBranchContext.Provider value={value}>{children}</ActiveBranchContext.Provider>
  );
}
