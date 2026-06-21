import { apiKeysApi } from "@/api/apiKeys";
import { projectsApi } from "@/api/projects";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Check, Copy, Key, Plus } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";

function maskKey() {
  return "•••••••••••••" + "••••";
}

export default function ApiKeys() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id!);
  const qc = useQueryClient();
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: project } = useQuery({ queryKey: ["project", projectId], queryFn: () => projectsApi.get(projectId) });
  const { data: keys = [], isLoading } = useQuery({ queryKey: ["apiKeys", projectId], queryFn: () => apiKeysApi.list(projectId) });

  const createMutation = useMutation({
    mutationFn: () => apiKeysApi.create(projectId),
    onSuccess: (data) => { qc.invalidateQueries({ queryKey: ["apiKeys", projectId] }); setNewKey(data.key); },
  });

  const deleteMutation = useMutation({
    mutationFn: (keyId: number) => apiKeysApi.delete(keyId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["apiKeys", projectId] }),
  });

  const copyKey = () => {
    if (newKey) { navigator.clipboard.writeText(newKey); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  return (
    <div>
      <PageHeader
        title="API Keys"
        description={project?.name}
        action={
          <Button size="sm" onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="gap-1.5">
            <Plus size={13} /> Create Key
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton className="h-32 w-full rounded-lg" />
      ) : keys.length === 0 ? (
        <EmptyState icon={Key} title="No API keys" description="Create an API key to start sending events." />
      ) : (
        <div className="rounded-lg border border-border divide-y divide-border">
          {keys.map((k) => (
            <div key={k.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-4">
                <Key size={13} className="text-muted-foreground shrink-0" />
                <div>
                  <p className="font-mono text-xs text-foreground">{maskKey()}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Created {formatDistanceToNow(parseISO(k.created_at))} ago
                    {k.last_used_at && ` · Last used ${formatDistanceToNow(parseISO(k.last_used_at))} ago`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={k.is_active ? "outline" : "secondary"} className={k.is_active ? "border-green-500 text-green-500" : ""}>
                  {k.is_active ? "Active" : "Revoked"}
                </Badge>
                {k.is_active && (
                  <Button
                    variant="ghost" size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    onClick={() => deleteMutation.mutate(k.id)}
                    disabled={deleteMutation.isPending}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!newKey} onOpenChange={(o) => { if (!o) setNewKey(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-3">
            Copy this key now — it will never be shown again.
          </p>
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2">
            <code className="flex-1 font-mono text-xs break-all text-foreground">{newKey}</code>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={copyKey}>
              {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
            </Button>
          </div>
          <DialogFooter className="mt-2">
            <Button size="sm" onClick={() => setNewKey(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
