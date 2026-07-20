import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettingsForm } from "@/components/settings/general-settings-form";
import { BranchSettingsTab } from "@/components/settings/branch-settings-tab";
import { WarehouseSettingsTab } from "@/components/settings/warehouse-settings-tab";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [{ title: "Settings · Nova POS" }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Settings"
        description="Profil perusahaan, pajak, mata uang, printer, cabang, dan gudang."
        crumbs={[{ label: "Home", to: "/" }, { label: "Settings" }]}
      />

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Umum</TabsTrigger>
          <TabsTrigger value="branches">Cabang</TabsTrigger>
          <TabsTrigger value="warehouses">Gudang</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettingsForm />
        </TabsContent>
        <TabsContent value="branches">
          <BranchSettingsTab />
        </TabsContent>
        <TabsContent value="warehouses">
          <WarehouseSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
