import { ArrowLeftRight, Banknote, CreditCard, Landmark, QrCode, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types/sale";

const METHODS: {
  value: PaymentMethod;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "debit", label: "Debit", icon: Landmark },
  { value: "credit_card", label: "Credit Card", icon: CreditCard },
  { value: "transfer", label: "Transfer", icon: ArrowLeftRight },
  { value: "qris", label: "QRIS", icon: QrCode },
  { value: "e_wallet", label: "E-Wallet", icon: Wallet },
];

type PaymentMethodSelectorProps = {
  value: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
};

export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {METHODS.map((method) => {
        const Icon = method.icon;
        const active = value === method.value;
        return (
          <button
            key={method.value}
            type="button"
            onClick={() => onChange(method.value)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-colors",
              active
                ? "border-primary bg-primary/10 text-primary shadow-brand"
                : "border-input hover:bg-accent",
            )}
          >
            <Icon className="size-5" />
            {method.label}
          </button>
        );
      })}
    </div>
  );
}
