import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useCreateUser, useUpdateUser } from "@/hooks/use-users";
import { useRoles } from "@/hooks/use-roles";
import type { User } from "@/types/auth";
import type { UserPayload } from "@/types/user";

function buildUserSchema(isEditing: boolean) {
  return z
    .object({
      name: z.string().min(1, "Nama wajib diisi").max(255),
      email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid").max(255),
      password: z.string().optional().or(z.literal("")),
      password_confirmation: z.string().optional().or(z.literal("")),
      phone: z.string().max(30).optional().or(z.literal("")),
      is_active: z.boolean(),
      roles: z.array(z.string()),
    })
    .refine((data) => isEditing || !!data.password, {
      message: "Password wajib diisi",
      path: ["password"],
    })
    .refine((data) => !data.password || data.password.length >= 8, {
      message: "Password minimal 8 karakter",
      path: ["password"],
    })
    .refine((data) => !data.password || data.password === data.password_confirmation, {
      message: "Konfirmasi password tidak cocok",
      path: ["password_confirmation"],
    });
}

type UserFormValues = {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  phone?: string;
  is_active: boolean;
  roles: string[];
};

type UserFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
};

export function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
  const isEditing = !!user;
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const { data: rolesData, isLoading: rolesLoading } = useRoles();
  const isSubmitting = createUser.isPending || updateUser.isPending;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(buildUserSchema(isEditing)),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      phone: "",
      is_active: true,
      roles: [],
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: user?.name ?? "",
        email: user?.email ?? "",
        password: "",
        password_confirmation: "",
        phone: user?.phone ?? "",
        is_active: user?.is_active ?? true,
        roles: user?.roles ?? [],
      });
    }
  }, [open, user, form]);

  async function onSubmit(values: UserFormValues) {
    const payload: UserPayload = {
      name: values.name,
      email: values.email,
      phone: values.phone || null,
      is_active: values.is_active,
      roles: values.roles,
    };

    if (values.password) {
      payload.password = values.password;
      payload.password_confirmation = values.password_confirmation;
    }

    if (isEditing && user) {
      await updateUser.mutateAsync({ id: user.id, payload });
    } else {
      await createUser.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit User" : "Tambah User"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Perbarui detail user dan role." : "Buat user baru dan atur role-nya."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input placeholder="mis. Budi Kasir" className="h-10 rounded-xl" {...field} />
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
                      placeholder="mis. budi@email.com"
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isEditing ? "Password Baru (opsional)" : "Password"}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
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
              name="password_confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konfirmasi Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
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
              name="roles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <div className="rounded-xl border p-3 space-y-2">
                    {rolesLoading ? (
                      <Skeleton className="h-5 w-full" />
                    ) : rolesData?.data.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Belum ada role.</p>
                    ) : (
                      rolesData?.data.map((role) => (
                        <div key={role.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`role-${role.id}`}
                            checked={field.value.includes(role.name)}
                            onCheckedChange={(checked) => {
                              field.onChange(
                                checked
                                  ? [...field.value, role.name]
                                  : field.value.filter((r) => r !== role.name),
                              );
                            }}
                          />
                          <Label htmlFor={`role-${role.id}`} className="text-sm font-normal cursor-pointer">
                            {role.name}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
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
