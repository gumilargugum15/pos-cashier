import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "./page-header";
import { Sparkles } from "lucide-react";

export function StubPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 md:p-8">
      <PageHeader title={title} description={description} crumbs={[{ label: "Home", to: "/" }, { label: title }]} />
      <Card className="p-10 md:p-16 rounded-2xl shadow-soft text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="size-7" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">{title} module</h2>
        <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
          This section is scaffolded and ready for content. The design system, layout, sidebar,
          and navigation are wired in — start adding your data tables, forms, and workflows here.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button className="rounded-xl">Get started</Button>
          <Button variant="outline" className="rounded-xl">View docs</Button>
        </div>
      </Card>
    </div>
  );
}
