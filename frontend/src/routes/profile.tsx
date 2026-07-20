import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { useChangePassword, useUpdateProfile } from "@/hooks/use-profile";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "Profile · Nova POS" }],
  }),
  component: ProfilePage,
});

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const profileSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(255),
  phone: z.string().max(30).optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Password saat ini wajib diisi"),
    password: z.string().min(8, "Password baru minimal 8 karakter"),
    password_confirmation: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Konfirmasi password tidak cocok",
    path: ["password_confirmation"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Profile"
        description="Kelola informasi akun dan password Anda."
        crumbs={[{ label: "Home", to: "/" }, { label: "Profile" }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 rounded-2xl shadow-soft lg:col-span-1 h-fit">
          <div className="flex flex-col items-center text-center gap-3">
            <Avatar className="size-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
            <div className="flex flex-wrap justify-center gap-1">
              {user.roles.map((role) => (
                <span
                  key={role}
                  className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <ProfileForm />
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}

function ProfileForm() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      phone: user?.phone ?? "",
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    await updateProfile.mutateAsync({
      name: values.name,
      phone: values.phone || null,
    });
  }

  return (
    <Card className="p-5 rounded-2xl shadow-soft space-y-4">
      <h3 className="text-sm font-semibold">Informasi Akun</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input className="h-10 rounded-xl" {...field} />
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
                    <Input className="h-10 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              className="rounded-xl shadow-brand"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? "Menyimpan…" : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}

function PasswordForm() {
  const changePassword = useChangePassword();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
  });

  async function onSubmit(values: PasswordFormValues) {
    await changePassword.mutateAsync(values);
    form.reset();
  }

  return (
    <Card className="p-5 rounded-2xl shadow-soft space-y-4">
      <h3 className="text-sm font-semibold">Ubah Password</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="current_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password Saat Ini</FormLabel>
                <FormControl>
                  <Input type="password" className="h-10 rounded-xl" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password Baru</FormLabel>
                  <FormControl>
                    <Input type="password" className="h-10 rounded-xl" {...field} />
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
                  <FormLabel>Konfirmasi Password Baru</FormLabel>
                  <FormControl>
                    <Input type="password" className="h-10 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              className="rounded-xl shadow-brand"
              disabled={changePassword.isPending}
            >
              {changePassword.isPending ? "Menyimpan…" : "Ubah Password"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
