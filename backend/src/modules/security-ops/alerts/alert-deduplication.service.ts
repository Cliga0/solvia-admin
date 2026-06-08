import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";
import { PrismaService } from "@/prisma/prisma.service";
import { AlertType, AlertSeverity, Prisma } from "@prisma/client";

@Injectable()
export class AlertDeduplicationService {
  constructor(private readonly prisma: PrismaService) {}

  generateFingerprint(type: AlertType, metadata: Record<string, unknown>): string {
    const key = `${type}:${metadata.triggeringEvent ?? ""}`;
    return crypto.createHash("sha256").update(key).digest("hex").slice(0, 16);
  }

  async findOrIncrementExisting(
    fingerprint: string,
    type: AlertType,
    windowStart: Date,
  ): Promise<boolean> {
    const existing = await this.prisma.securityAlert.findFirst({
      where: {
        fingerprint,
        type,
        status: { in: ["OPEN", "INVESTIGATING"] },
        createdAt: { gte: windowStart },
      },
    });

    if (!existing) {
      return false;
    }

    await this.prisma.securityAlert.update({
      where: { id: existing.id },
      data: {
        occurrences: { increment: 1 },
        lastSeenAt: new Date(),
      },
    });

    return true;
  }

  buildCreateData(
    type: AlertType,
    severity: AlertSeverity,
    title: string,
    description: string,
    metadata: Record<string, unknown>,
    fingerprint: string,
  ) {
    return {
      type,
      severity,
      title,
      description,
      status: "OPEN" as const,
      metadata: metadata as Prisma.InputJsonValue,
      fingerprint,
      occurrences: 1,
      lastSeenAt: new Date(),
    };
  }
}
