import { Badge, BadgeVariant } from "@/components/ui/badge";
import { NotionSyncState } from "@/lib/types";

const copy: Record<NotionSyncState, { label: string; variant: BadgeVariant }> = {
  DISCONNECTED: { label: "Notion disconnected", variant: "warning" },
  SYNCING: { label: "Syncing to Notion", variant: "info" },
  SYNCED: { label: "Synced to Notion", variant: "success" },
  ERROR: { label: "Notion sync error", variant: "danger" },
};

export function NotionStatusBadge({ status }: { status: NotionSyncState }) {
  const { label, variant } = copy[status];
  return <Badge variant={variant}>{label}</Badge>;
}
