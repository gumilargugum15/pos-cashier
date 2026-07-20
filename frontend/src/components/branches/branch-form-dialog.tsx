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
import { useCreateBranch, useUpdateBranch } from "@/hooks/use-branches";
import type { Branch } from "@/types/branch";

const branchSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(255),
  code: z.string().min(1, "Kode wajib diisi").max(50),
  phone: z.string().max(30).optional().or(z.literal("")),
  address: z.string().max(1000).optional().or(z.literal("")),
  is_active: z.boolean(),
});

type BranchFormValues = z.infer<typeof branchSchema>;

type BranchFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch?: Branch | null;
};

export function BranchFormDialog({ open, onOpenChange, branch }: BranchFormDialogProps) {
  const isEditing = !!branch;
  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();
  const isSubmitting = createBranch.isPending || updateBranch.isPending;

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
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
        name: branch?.name ?? "",
        code: branch?.code ?? "",
        phone: branch?.phone ?? "",
        address: branch?.address ?? "",
        is_active: branch?.is_active ?? true,
      });
    }
  }, [open, branch, form]);

  async function onSubmit(values: BranchFormValues) {
    const payload = {
      ...values,
      phone: values.phone || null,
      address: values.address || null,
    };

    if (isEditing && branch) {
      await updateBranch.mutateAsync({ id: branch.id, payload });
    } else {
      await createBranch.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Cabang" : "Tambah Cabang"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Perbarui detail cabang." : "Buat data cabang baru."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Cabang</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="mis. Cabang Jakarta Pusat"
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
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode Cabang</FormLabel>
                  <FormControl>
                    <Input placeholder="mis. BR-001" className="h-10 rounded-xl" {...field} />
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
