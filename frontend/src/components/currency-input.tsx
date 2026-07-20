import { forwardRef, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CurrencyInputProps = {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
};

function formatDigits(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, className, placeholder, disabled }, ref) => {
    const [displayValue, setDisplayValue] = useState(() => formatDigits(value));

    useEffect(() => {
      setDisplayValue(formatDigits(value));
    }, [value]);

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      const digitsOnly = event.target.value.replace(/\D/g, "");
      const numeric = digitsOnly === "" ? 0 : Math.max(0, parseInt(digitsOnly, 10));
      setDisplayValue(formatDigits(numeric));
      onChange(numeric);
    }

    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          Rp
        </span>
        <Input
          ref={ref}
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn("pl-9", className)}
        />
      </div>
    );
  },
);
CurrencyInput.displayName = "CurrencyInput";
