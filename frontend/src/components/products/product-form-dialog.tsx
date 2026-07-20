import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useCreateProduct, useUpdateProduct } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useBrands } from "@/hooks/use-brands";
import { useUnits } from "@/hooks/use-units";
import { useSettings } from "@/hooks/use-settings";
import type { Product } from "@/types/product";

const productSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(255),
  sku: z.string().min(1, "SKU wajib diisi").max(100),
  barcode: z.string().max(50).optional().or(z.literal("")),
  category_id: z.string().min(1, "Kategori wajib dipilih"),
  brand_id: z.string().min(1, "Brand wajib dipilih"),
  unit_id: z.string().min(1, "Unit wajib dipilih"),
  cost_price: z.number().min(0, "Harga pokok minimal Rp0"),
  price: z.number().min(0, "Harga jual minimal Rp0"),
  stock: z.number().int().min(0),
  min_stock: z.number().int().min(0),
  tax_percentage: z.number().min(0).max(100),
  discount_percentage: z.number().min(0).max(100),
  is_active: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

type ProductFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
};

export function ProductFormDialog({ open, onOpenChange, product }: ProductFormDialogProps) {
  const isEditing = !!product;
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const isSubmitting = createProduct.isPending || updateProduct.isPending;

  const { data: categoriesData } = useCategories({ per_page: 100, is_active: "1" });
  const { data: brandsData } = useBrands({ per_page: 100, is_active: "1" });
  const { data: unitsData } = useUnits({ per_page: 100 });
  const { data: settings } = useSettings();
  const defaultTaxPercentage = settings ? Number(settings.tax_percentage) : 11;

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      barcode: "",
      category_id: "",
      brand_id: "",
      unit_id: "",
      cost_price: 0,
      price: 0,
      stock: 0,
      min_stock: 0,
      tax_percentage: 11,
      discount_percentage: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: product?.name ?? "",
        sku: product?.sku ?? "",
        barcode: product?.barcode ?? "",
        category_id: product ? String(product.category_id) : "",
        brand_id: product ? String(product.brand_id) : "",
        unit_id: product ? String(product.unit_id) : "",
        cost_price: product?.cost_price ?? 0,
        price: product?.price ?? 0,
        stock: product?.stock ?? 0,
        min_stock: product?.min_stock ?? 0,
        tax_percentage: product?.tax_percentage ?? defaultTaxPercentage,
        discount_percentage: product?.discount_percentage ?? 0,
        is_active: product?.is_active ?? true,
      });
      setImageFile(null);
      setImagePreview(product?.image_url ?? null);
    }
  }, [open, product, form, defaultTaxPercentage]);

  function handleImageSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function onSubmit(values: ProductFormValues) {
    const payload = {
      name: values.name,
      sku: values.sku,
      barcode: values.barcode || null,
      category_id: Number(values.category_id),
      brand_id: Number(values.brand_id),
      unit_id: Number(values.unit_id),
      cost_price: values.cost_price,
      price: values.price,
      stock: values.stock,
      min_stock: values.min_stock,
      tax_percentage: values.tax_percentage,
      discount_percentage: values.discount_percentage,
      is_active: values.is_active,
      ...(imageFile ? { image: imageFile } : {}),
    };

    if (isEditing && product) {
      await updateProduct.mutateAsync({ id: product.id, payload });
    } else {
      await createProduct.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Perbarui detail produk." : "Buat produk baru di katalog."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="size-24 rounded-2xl bg-muted flex items-center justify-center overflow-hidden border border-dashed border-input hover:bg-accent transition"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="" className="size-full object-cover" />
                ) : (
                  <ImagePlus className="size-6 text-muted-foreground" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Produk</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="mis. Espresso Beans 250g"
                      className="h-10 rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="mis. BEV-014" className="h-10 rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barcode</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Otomatis jika kosong"
                        className="h-10 rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoriesData?.data.map((category) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="brand_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-10 rounded-xl">
                          <SelectValue placeholder="Pilih brand" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brandsData?.data.map((brand) => (
                          <SelectItem key={brand.id} value={String(brand.id)}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-10 rounded-xl">
                          <SelectValue placeholder="Pilih unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {unitsData?.data.map((unit) => (
                          <SelectItem key={unit.id} value={String(unit.id)}>
                            {unit.name} ({unit.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="cost_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga Pokok</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        value={field.value}
                        onChange={field.onChange}
                        className="h-10 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga Jual</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        value={field.value}
                        onChange={field.onChange}
                        className="h-10 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stok</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
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
                name="min_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stok Minimum</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
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

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="tax_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pajak (%)</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl border p-3">
                  <FormLabel className="cursor-pointer">Aktif</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

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
