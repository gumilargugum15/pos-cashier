type FormatRupiahOptions = {
  decimalDigits?: number;
};

export function formatRupiah(value: number, options: FormatRupiahOptions = {}): string {
  const { decimalDigits = 0 } = options;

  const formatted = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: decimalDigits,
    maximumFractionDigits: decimalDigits,
  }).format(value);

  return `Rp${formatted}`;
}
