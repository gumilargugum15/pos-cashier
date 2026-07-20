import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import { useCreateBrand, useUpdateBrand } from "@/hooks/use-brands";
import type { Brand } from "@/types/brand";

const brandSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(255),
  is_active: z.boolean(),
});

type BrandFormValues = z.infer<typeof brandSchema>;

type BrandFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: Brand | null;
};

export function BrandFormDialog({ open, onOpenChange, brand }: BrandFormDialogProps) {
  const isEditing = !!brand;
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const isSubmitting = createBrand.isPending || updateBrand.isPending;

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: { name: "", is_active: true },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: brand?.name ?? "", is_active: brand?.is_active ?? true });
    }
  }, [open, brand, form]);

  async function onSubmit(values: BrandFormValues) {
    if (isEditing && brand) {
      await updateBrand.mutateAsync({ id: brand.id, payload: values });
    } else {
      await createBrand.mutateAsync(values);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Brand" : "Tambah Brand"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Perbarui detail brand." : "Buat brand produk baru."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Brand</FormLabel>
                  <FormControl>
                    <Input placeholder="mis. Voltix" className="h-10 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
