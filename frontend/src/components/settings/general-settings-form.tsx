import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { BluetoothPrinterSection } from "@/components/settings/bluetooth-printer-section";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import type { Settings } from "@/types/settings";

const TIMEZONES = ["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"];

const settingsSchema = z.object({
  company_name: z.string().min(1, "Nama perusahaan wajib diisi").max(255),
  company_address: z.string().max(1000).optional().or(z.literal("")),
  company_phone: z.string().max(30).optional().or(z.literal("")),
  company_email: z.string().email("Format email tidak valid").max(255).optional().or(z.literal("")),
  timezone: z.string().min(1),
  tax_percentage: z.coerce.number().min(0).max(100),
  currency_name: z.string().min(1).max(50),
  currency_code: z.string().min(1).max(10),
  currency_symbol: z.string().min(1).max(10),
  symbol_position: z.enum(["front", "back"]),
  decimal_digits: z.coerce.number().int().min(0).max(2),
  thousand_separator: z.string().max(1),
  decimal_separator: z.string().max(1),
  receipt_paper_size: z.enum(["58mm", "80mm"]),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function GeneralSettingsForm() {
  const { data: settings, isLoading } = useSettings();

  if (isLoading || !settings) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Memuat pengaturan…</div>;
  }

  // Mounts only once real data exists, using it directly as useForm's defaultValues —
  // no post-mount form.reset() race against Radix Select's internal item registration.
  return <GeneralSettingsFields settings={settings} />;
}

function GeneralSettingsFields({ settings }: { settings: Settings }) {
  const updateSettings = useUpdateSettings();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      company_name: settings.company_name,
      company_address: settings.company_address ?? "",
      company_phone: settings.company_phone ?? "",
      company_email: settings.company_email ?? "",
      timezone: settings.timezone,
      tax_percentage: Number(settings.tax_percentage),
      currency_name: settings.currency_name,
      currency_code: settings.currency_code,
      currency_symbol: settings.currency_symbol,
      symbol_position: settings.symbol_position,
      decimal_digits: Number(settings.decimal_digits),
      thousand_separator: settings.thousand_separator,
      decimal_separator: settings.decimal_separator,
      receipt_paper_size: settings.receipt_paper_size,
    },
  });

  async function onSubmit(values: SettingsFormValues) {
    await updateSettings.mutateAsync({
      ...values,
      company_address: values.company_address || null,
      company_phone: values.company_phone || null,
      company_email: values.company_email || null,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card className="p-5 rounded-2xl shadow-soft space-y-4">
          <h3 className="text-sm font-semibold">Profil Perusahaan</h3>
          <FormField
            control={form.control}
            name="company_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Perusahaan</FormLabel>
                <FormControl>
                  <Input className="h-10 rounded-xl" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alamat</FormLabel>
                <FormControl>
                  <Textarea className="rounded-xl" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="company_phone"
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
            <FormField
              control={form.control}
              name="company_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" className="h-10 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        <Card className="p-5 rounded-2xl shadow-soft space-y-4">
          <h3 className="text-sm font-semibold">Regional &amp; Pajak</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue>{field.value}</SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
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
              name="tax_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Pajak (%)</FormLabel>
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
        </Card>

        <Card className="p-5 rounded-2xl shadow-soft space-y-4">
          <h3 className="text-sm font-semibold">Mata Uang</h3>
          <p className="text-xs text-muted-foreground">
            Aplikasi tetap menggunakan Rupiah sebagai mata uang utama dan tidak mendukung multi
            currency — pengaturan ini bersifat referensi.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="currency_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Mata Uang</FormLabel>
                  <FormControl>
                    <Input className="h-10 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currency_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode</FormLabel>
                  <FormControl>
                    <Input className="h-10 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currency_symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Simbol</FormLabel>
                  <FormControl>
                    <Input className="h-10 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="symbol_position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Posisi Simbol</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue>{field.value === "back" ? "Belakang" : "Depan"}</SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="front">Depan</SelectItem>
                      <SelectItem value="back">Belakang</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="decimal_digits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Desimal</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={2}
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
              name="thousand_separator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Separator Ribuan</FormLabel>
                  <FormControl>
                    <Input maxLength={1} className="h-10 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="decimal_separator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Separator Desimal</FormLabel>
                  <FormControl>
                    <Input maxLength={1} className="h-10 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        <Card className="p-5 rounded-2xl shadow-soft space-y-4">
          <h3 className="text-sm font-semibold">Printer &amp; Struk</h3>
          <FormField
            control={form.control}
            name="receipt_paper_size"
            render={({ field }) => (
              <FormItem className="max-w-xs">
                <FormLabel>Ukuran Kertas Struk</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="h-10 rounded-xl">
                      <SelectValue>{field.value}</SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="58mm">58mm</SelectItem>
                    <SelectItem value="80mm">80mm</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <BluetoothPrinterSection />
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="rounded-xl shadow-brand"
            disabled={updateSettings.isPending}
          >
            {updateSettings.isPending ? "Menyimpan…" : "Simpan Pengaturan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
