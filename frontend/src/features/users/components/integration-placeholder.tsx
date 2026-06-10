"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Construction } from "lucide-react";

interface IntegrationPlaceholderProps {
  title: string;
  description: string;
  endpoint: string;
  className?: string;
}

export function IntegrationPlaceholder({
  title,
  description,
  endpoint,
  className,
}: IntegrationPlaceholderProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          {title}
          <Badge variant="outline" className="text-[10px] gap-1">
            <Construction className="h-2.5 w-2.5" />
            Pending Integration
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-dashed p-6 text-center">
          <Construction className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-2">{description}</p>
          <code className="text-[10px] bg-muted px-2 py-1 rounded">{endpoint}</code>
        </div>
      </CardContent>
    </Card>
  );
}
