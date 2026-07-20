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
import { useCreateCategory, useUpdateCategory } from "@/hooks/use-categories";
import type { Category } from "@/types/category";

const categorySchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(255),
  is_active: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

type CategoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
};

export function CategoryFormDialog({ open, onOpenChange, category }: CategoryFormDialogProps) {
  const isEditing = !!category;
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const isSubmitting = createCategory.isPending || updateCategory.isPending;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", is_active: true },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: category?.name ?? "", is_active: category?.is_active ?? true });
    }
  }, [open, category, form]);

  async function onSubmit(values: CategoryFormValues) {
    if (isEditing && category) {
      await updateCategory.mutateAsync({ id: category.id, payload: values });
    } else {
      await createCategory.mutateAsync(values);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Perbarui detail kategori." : "Buat kategori produk baru."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Kategori</FormLabel>
                  <FormControl>
                    <Input placeholder="mis. Minuman" className="h-10 rounded-xl" {...field} />
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
