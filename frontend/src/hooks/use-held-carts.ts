import { useCallback, useEffect, useState } from "react";
import type { Customer } from "@/types/customer";
import type { Product } from "@/types/product";

export type HeldCartLine = { product: Product; qty: number };

export type HeldCart = {
  id: string;
  label: string;
  customer: Customer | null;
  lines: HeldCartLine[];
  createdAt: string;
};

const STORAGE_KEY = "nova_pos_held_carts";

function readStorage(): HeldCart[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HeldCart[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(carts: HeldCart[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(carts));
}

export function useHeldCarts() {
  const [heldCarts, setHeldCarts] = useState<HeldCart[]>(() => readStorage());

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) setHeldCarts(readStorage());
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const holdCart = useCallback((customer: Customer | null, lines: HeldCartLine[]) => {
    const cart: HeldCart = {
      id: `hold_${Math.random().toString(36).slice(2)}_${performance.now()}`,
      label: customer ? customer.name : "Walk-in",
      customer,
      lines,
      createdAt: new Date().toISOString(),
    };
    const next = [cart, ...readStorage()];
    writeStorage(next);
    setHeldCarts(next);
  }, []);

  const discardCart = useCallback((id: string) => {
    const next = readStorage().filter((c) => c.id !== id);
    writeStorage(next);
    setHeldCarts(next);
  }, []);

  return { heldCarts, holdCart, discardCart };
}
