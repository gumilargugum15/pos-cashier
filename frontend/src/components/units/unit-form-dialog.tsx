import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useCreateUnit, useUpdateUnit } from "@/hooks/use-units";
import type { Unit } from "@/types/unit";

const unitSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(255),
  symbol: z.string().min(1, "Simbol wajib diisi").max(20),
});

type UnitFormValues = z.infer<typeof unitSchema>;

type UnitFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit?: Unit | null;
};

export function UnitFormDialog({ open, onOpenChange, unit }: UnitFormDialogProps) {
  const isEditing = !!unit;
  const createUnit = useCreateUnit();
  const updateUnit = useUpdateUnit();
  const isSubmitting = createUnit.isPending || updateUnit.isPending;

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: { name: "", symbol: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: unit?.name ?? "", symbol: unit?.symbol ?? "" });
    }
  }, [open, unit, form]);

  async function onSubmit(values: UnitFormValues) {
    if (isEditing && unit) {
      await updateUnit.mutateAsync({ id: unit.id, payload: values });
    } else {
      await createUnit.mutateAsync(values);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Unit" : "Tambah Unit"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Perbarui detail unit." : "Buat unit satuan baru."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Unit</FormLabel>
                  <FormControl>
                    <Input placeholder="mis. Kilogram" className="h-10 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Simbol</FormLabel>
                  <FormControl>
                    <Input placeholder="mis. kg" className="h-10 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
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
