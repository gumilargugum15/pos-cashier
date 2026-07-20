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
import { useCreateSupplier, useUpdateSupplier } from "@/hooks/use-suppliers";
import type { Supplier } from "@/types/supplier";

const supplierSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(255),
  contact_person: z.string().max(255).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  email: z.string().email("Format email tidak valid").max(255).optional().or(z.literal("")),
  address: z.string().max(1000).optional().or(z.literal("")),
  is_active: z.boolean(),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

type SupplierFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier | null;
};

export function SupplierFormDialog({ open, onOpenChange, supplier }: SupplierFormDialogProps) {
  const isEditing = !!supplier;
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const isSubmitting = createSupplier.isPending || updateSupplier.isPending;

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: supplier?.name ?? "",
        contact_person: supplier?.contact_person ?? "",
        phone: supplier?.phone ?? "",
        email: supplier?.email ?? "",
        address: supplier?.address ?? "",
        is_active: supplier?.is_active ?? true,
      });
    }
  }, [open, supplier, form]);

  async function onSubmit(values: SupplierFormValues) {
    const payload = {
      ...values,
      contact_person: values.contact_person || null,
      phone: values.phone || null,
      email: values.email || null,
      address: values.address || null,
    };

    if (isEditing && supplier) {
      await updateSupplier.mutateAsync({ id: supplier.id, payload });
    } else {
      await createSupplier.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Supplier" : "Tambah Supplier"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Perbarui detail supplier." : "Buat data supplier baru."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Supplier</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="mis. PT Sumber Makmur"
                      className="h-10 rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact_person"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Kontak</FormLabel>
                  <FormControl>
                    <Input placeholder="mis. Budi Santoso" className="h-10 rounded-xl" {...field} />
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
                    <Input placeholder="mis. 081234567890" className="h-10 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="mis. supplier@email.com"
                      className="h-10 rounded-xl"
                      {...field}
                    />
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
