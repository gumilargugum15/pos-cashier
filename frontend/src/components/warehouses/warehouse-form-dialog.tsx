import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useCreateWarehouse, useUpdateWarehouse } from "@/hooks/use-warehouses";
import type { Warehouse } from "@/types/warehouse";

const warehouseSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(255),
  code: z.string().min(1, "Kode wajib diisi").max(50),
  phone: z.string().max(30).optional().or(z.literal("")),
  address: z.string().max(1000).optional().or(z.literal("")),
  is_active: z.boolean(),
});

type WarehouseFormValues = z.infer<typeof warehouseSchema>;

type WarehouseFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouse?: Warehouse | null;
};

export function WarehouseFormDialog({ open, onOpenChange, warehouse }: WarehouseFormDialogProps) {
  const isEditing = !!warehouse;
  const createWarehouse = useCreateWarehouse();
  const updateWarehouse = useUpdateWarehouse();
  const isSubmitting = createWarehouse.isPending || updateWarehouse.isPending;

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: "",
      code: "",
      phone: "",
      address: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: warehouse?.name ?? "",
        code: warehouse?.code ?? "",
        phone: warehouse?.phone ?? "",
        address: warehouse?.address ?? "",
        is_active: warehouse?.is_active ?? true,
      });
    }
  }, [open, warehouse, form]);

  async function onSubmit(values: WarehouseFormValues) {
    const payload = {
      ...values,
      phone: values.phone || null,
      address: values.address || null,
    };

    if (isEditing && warehouse) {
      await updateWarehouse.mutateAsync({ id: warehouse.id, payload });
    } else {
      await createWarehouse.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Gudang" : "Tambah Gudang"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Perbarui detail gudang." : "Buat data gudang baru."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Gudang</FormLabel>
                  <FormControl>
                    <Input placeholder="mis. Gudang Utama" className="h-10 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode Gudang</FormLabel>
                  <FormControl>
                    <Input placeholder="mis. WH-001" className="h-10 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telepon</FormLabel>
                  <FormControl>
                    <Input placeholder="mis. 021-5551234" className="h-10 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Alamat lengkap" className="rounded-xl" {...field} />
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
