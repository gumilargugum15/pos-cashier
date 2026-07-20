import { formatRupiah } from "@/lib/format-currency";
import type { Sale } from "@/types/sale";

const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

const PAYMENT_METHOD_LABELS: Record<Sale["payment_method"], string> = {
  cash: "Cash",
  debit: "Debit",
  credit_card: "Credit Card",
  transfer: "Transfer",
  qris: "QRIS",
  e_wallet: "E-Wallet",
};

/**
 * Minimal ESC/POS byte-stream builder for thermal receipt printers.
 * Covers only what a basic Rupiah receipt needs: init, align, bold, text, feed, cut.
 */
class EscPosBuilder {
  private bytes: number[] = [];

  init(): this {
    this.bytes.push(ESC, 0x40);
    return this;
  }

  align(mode: "left" | "center" | "right"): this {
    const n = mode === "center" ? 1 : mode === "right" ? 2 : 0;
    this.bytes.push(ESC, 0x61, n);
    return this;
  }

  bold(on: boolean): this {
    this.bytes.push(ESC, 0x45, on ? 1 : 0);
    return this;
  }

  text(line: string): this {
    for (let i = 0; i < line.length; i++) {
      const code = line.charCodeAt(i);
      // Keep to printable single-byte range; thermal printers commonly use a
      // single-byte code page, so anything outside it becomes a safe fallback.
      this.bytes.push(code < 256 ? code : 0x3f);
    }
    return this;
  }

  line(text = ""): this {
    return this.text(text).feed(1);
  }

  feed(lines = 1): this {
    for (let i = 0; i < lines; i++) this.bytes.push(LF);
    return this;
  }

  cut(): this {
    this.bytes.push(GS, 0x56, 0x00);
    return this;
  }

  build(): Uint8Array {
    return Uint8Array.from(this.bytes);
  }
}

function charWidth(paperSize: "58mm" | "80mm"): number {
  return paperSize === "58mm" ? 32 : 48;
}

function padLine(left: string, right: string, width: number): string {
  const truncatedLeft = left.length > width ? left.slice(0, width) : left;
  const space = Math.max(1, width - truncatedLeft.length - right.length);
  return truncatedLeft + " ".repeat(space) + right;
}

function centered(text: string, width: number): string {
  if (text.length >= width) return text.slice(0, width);
  const padding = Math.floor((width - text.length) / 2);
  return " ".repeat(padding) + text;
}

function divider(width: number): string {
  return "-".repeat(width);
}

export type ReceiptPrintSettings = {
  companyName: string;
  paperSize: "58mm" | "80mm";
};

export function buildReceiptEscPos(sale: Sale, settings: ReceiptPrintSettings): Uint8Array {
  const width = charWidth(settings.paperSize);
  const b = new EscPosBuilder().init();

  b.align("center");
  b.bold(true).line(settings.companyName).bold(false);
  b.line(new Date(sale.created_at).toLocaleString("id-ID"));
  b.line(sale.invoice_number);
  b.align("left");
  b.line(divider(width));
  b.line(`Kasir: ${sale.cashier_name ?? "-"}`);
  b.line(`Customer: ${sale.customer?.name ?? "Walk-in"}`);
  b.line(divider(width));

  for (const item of sale.items) {
    b.line(item.product_name);
    b.line(
      padLine(`${item.qty} x ${formatRupiah(item.price)}`, formatRupiah(item.subtotal), width),
    );
  }

  b.line(divider(width));
  b.line(padLine("Subtotal", formatRupiah(sale.subtotal), width));
  b.line(padLine("Diskon", `-${formatRupiah(sale.discount_amount)}`, width));
  b.line(padLine("Pajak", formatRupiah(sale.tax_amount), width));
  b.bold(true)
    .line(padLine("Total", formatRupiah(sale.grand_total), width))
    .bold(false);
  b.line(
    padLine(PAYMENT_METHOD_LABELS[sale.payment_method], formatRupiah(sale.paid_amount), width),
  );
  b.line(padLine("Kembalian", formatRupiah(sale.change_amount), width));
  b.line(divider(width));
  b.align("center");
  b.line("Terima kasih atas kunjungan Anda");
  b.feed(3);
  b.cut();

  return b.build();
}

export function buildTestPrintEscPos(paperSize: "58mm" | "80mm"): Uint8Array {
  const width = charWidth(paperSize);
  const b = new EscPosBuilder().init();

  b.align("center");
  b.bold(true).line(centered("TEST PRINT", width)).bold(false);
  b.line(divider(width));
  b.align("left");
  b.line("Printer Bluetooth berhasil");
  b.line("terhubung dan siap digunakan.");
  b.line(`Lebar kertas: ${paperSize}`);
  b.line(new Date().toLocaleString("id-ID"));
  b.feed(3);
  b.cut();

  return b.build();
}
