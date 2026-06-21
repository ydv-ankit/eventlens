import type { Event } from "@/types/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO } from "date-fns";

interface Props { event: Event | null; onClose: () => void }

export function EventDetailDrawer({ event, onClose }: Props) {
  if (!event) return null;
  return (
    <Sheet open={!!event} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent className="w-[480px] sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle className="font-mono text-sm">{event.event_name}</SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="h-8">
            <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
            <TabsTrigger value="metadata" className="text-xs">Metadata</TabsTrigger>
            <TabsTrigger value="raw" className="text-xs">Raw JSON</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="mt-4 space-y-3">
            {[
              { label: "Event",     value: event.event_name },
              { label: "User ID",   value: event.user_id ?? "—" },
              { label: "Project",   value: String(event.project_id) },
              { label: "Timestamp", value: format(parseISO(event.timestamp), "PPpp") },
              { label: "Ingested",  value: format(parseISO(event.created_at), "PPpp") },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] font-medium uppercase text-muted-foreground">{label}</p>
                <p className="font-mono text-xs text-foreground mt-0.5">{value}</p>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="metadata" className="mt-4">
            <div className="space-y-2">
              {Object.entries(event.metadata).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <span className="font-mono text-xs text-muted-foreground">{k}</span>
                  <span className="font-mono text-xs text-foreground truncate max-w-[60%]">
                    {JSON.stringify(v)}
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="raw" className="mt-4">
            <pre className="rounded-md bg-muted p-3 text-[11px] font-mono text-foreground overflow-auto max-h-[400px]">
              {JSON.stringify(event, null, 2)}
            </pre>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
