"use client";

import type { SecurityIncident } from "@/types/security";
import { INCIDENT_STATUS_COLORS } from "@/types/security";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText } from "lucide-react";
import { useUpdateIncident } from "@/hooks/use-security";
import { toast } from "sonner";

interface Props {
  incidents: SecurityIncident[];
}

export function IncidentsCard({ incidents }: Props) {
  const updateMutation = useUpdateIncident();

  const handleStatusChange = (incidentId: string, newStatus: string) => {
    updateMutation.mutate(
      { id: incidentId, data: { status: newStatus } },
      {
        onSuccess: () => toast.success("Incident status updated"),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="size-4 text-primary-600" />
            Security Incidents
          </CardTitle>
          <Badge variant="secondary">{incidents.length} incidents</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {incidents.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">
            No security incidents
          </p>
        )}
        <div className="space-y-2">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium">
                  Incident {incident.id.slice(0, 8)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {incident.assignedTo ? `Assigned: ${incident.assignedTo.slice(0, 8)}` : "Unassigned"}
                  {" | "}
                  {formatTime(incident.createdAt)}
                </p>
                {incident.notes && (
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                    {incident.notes}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${INCIDENT_STATUS_COLORS[incident.status]}`}
                >
                  {incident.status}
                </span>
                {incident.status !== "RESOLVED" && (
                  <Select
                    value={incident.status}
                    onValueChange={(val) => { if (val) handleStatusChange(incident.id, val); }}
                  >
                    <SelectTrigger size="sm" className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="INVESTIGATING">Investigating</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function formatTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  } catch {
    return "";
  }
}
