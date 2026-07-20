import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/currency-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SupplierCombobox, type SupplierOption } from "@/components/purchases/supplier-combobox";
import { ProductCombobox } from "@/components/purchases/product-combobox";
import { useCreatePurchase, useUpdatePurchase } from "@/hooks/use-purchases";
import { useSettings } from "@/hooks/use-settings";
import { formatRupiah } from "@/lib/format-currency";
import type { Product } from "@/types/product";
import type { Purchase } from "@/types/purchase";

const purchaseItemSchema = z.object({
  product_id: z.number(),
  product_name: z.string(),
  qty: z.number().int().min(1, "Min 1"),
  cost_price: z.number().min(0, "Min 0"),
});

const purchaseSchema = z.object({
  supplier_id: z.number().int().positive("Supplier wajib dipilih"),
  items: z.array(purchaseItemSchema).min(1, "Tambahkan minimal 1 produk"),
  discount_percentage: z.number().min(0).max(100),
  tax_percentage: z.number().min(0).max(100),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

type PurchaseFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchase?: Purchase | null;
};

export function PurchaseFormDialog({ open, onOpenChange, purchase }: PurchaseFormDialogProps) {
  const isEditing = !!purchase;
  const createPurchase = useCreatePurchase();
  const updatePurchase = useUpdatePurchase();
  const isSubmitting = createPurchase.isPending || updatePurchase.isPending;
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierOption | null>(null);
  const { data: settings } = useSettings();
  const defaultTaxPercentage = settings ? Number(settings.tax_percentage) : 11;

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      supplier_id: 0,
      items: [],
      discount_percentage: 0,
      tax_percentage: 11,
      notes: "",
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const items = form.watch("items");
  const discountPercentage = form.watch("discount_percentage");
  const taxPercentage = form.watch("tax_percentage");

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.cost_price, 0);
  const discountAmount = Math.round(subtotal * (discountPercentage / 100) * 100) / 100;
  const beforeTax = subtotal - discountAmount;
  const taxAmount = Math.round(beforeTax * (taxPercentage / 100) * 100) / 100;
  const grandTotal = beforeTax + taxAmount;

  useEffect(() => {
    if (!open) return;

    if (purchase) {
      setSelectedSupplier(purchase.supplier);
      form.reset({
        supplier_id: purchase.supplier?.id ?? 0,
        items: purchase.items.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          qty: item.qty,
          cost_price: item.cost_price,
        })),
        discount_percentage: purchase.discount_percentage,
        tax_percentage: purchase.tax_percentage,
        notes: purchase.notes ?? "",
      });
    } else {
      setSelectedSupplier(null);
      form.reset({
        supplier_id: 0,
        items: [],
        discount_percentage: 0,
        tax_percentage: defaultTaxPercentage,
        notes: "",
      });
    }
  }, [open, purchase, form, defaultTaxPercentage]);

  function handleSelectSupplier(supplier: SupplierOption) {
    setSelectedSupplier(supplier);
    form.setValue("supplier_id", supplier.id, { shouldValidate: true });
  }

  function handleAddProduct(product: Product) {
    const existingIndex = fields.findIndex((f) => f.product_id === product.id);
    if (existingIndex >= 0) {
      const existing = fields[existingIndex];
      update(existingIndex, { ...existing, qty: existing.qty + 1 });
      return;
    }
    append({
      product_id: product.id,
      product_name: product.name,
      qty: 1,
      cost_price: product.cost_price,
    });
  }

  async function onSubmit(values: PurchaseFormValues) {
    const payload = {
      supplier_id: values.supplier_id,
      items: values.items.map((item) => ({
        product_id: item.product_id,
        qty: item.qty,
        cost_price: item.cost_price,
      })),
      discount_percentage: values.discount_percentage,
      tax_percentage: values.tax_percentage,
      notes: values.notes || null,
    };

    if (isEditing && purchase) {
      await updatePurchase.mutateAsync({ id: purchase.id, payload });
    } else {
      await createPurchase.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Pembelian" : "Buat Pembelian"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Perbarui detail pesanan pembelian."
              : "Buat pesanan pembelian baru ke supplier."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="supplier_id"
              render={() => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <FormControl>
                    <SupplierCombobox value={selectedSupplier} onChange={handleSelectSupplier} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Produk</Label>
                <ProductCombobox onSelect={handleAddProduct} />
              </div>

              {fields.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Belum ada produk. Klik "Tambah Produk" untuk mulai.
                </div>
              ) : (
                <ul className="space-y-2">
                  {fields.map((field, index) => (
                    <li key={field.id} className="flex items-center gap-2 rounded-xl border p-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{field.product_name}</div>
                      </div>
                      <Input
                        type="number"
                        min={1}
                        className="h-9 w-16 rounded-lg text-center"
                        {...form.register(`items.${index}.qty`, { valueAsNumber: true })}
                      />
                      <Controller
                        control={form.control}
                        name={`items.${index}.cost_price`}
                        render={({ field: costField }) => (
                          <CurrencyInput
                            value={costField.value}
                            onChange={costField.onChange}
                            className="h-9 w-32 rounded-lg"
                          />
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-lg text-danger hover:text-danger"
                        onClick={() => remove(index)}
                        aria-label="Hapus"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              {form.formState.errors.items?.message && (
                <p className="text-sm text-destructive">{form.formState.errors.items.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="discount_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diskon (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        className="h-10 rounded-xl"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tax_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pajak / PPN (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        className="h-10 rounded-xl"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Catatan tambahan (opsional)"
                      className="rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-1.5 rounded-xl bg-muted/50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diskon</span>
                <span className="font-medium text-success">-{formatRupiah(discountAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pajak</span>
                <span className="font-medium">{formatRupiah(taxAmount)}</span>
              </div>
              <div className="flex justify-between border-t pt-1.5 text-base font-bold">
                <span>Grand Total</span>
                <span className="text-primary">{formatRupiah(grandTotal)}</span>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" className="rounded-xl shadow-brand" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan…" : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
