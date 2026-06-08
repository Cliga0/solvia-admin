import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { EngineType, EngineExecutionStatus } from "@prisma/client";
import { InputJsonValue } from "@prisma/client/runtime/library";

export interface EngineExecutionStart {
  id: string;
  engine: EngineType;
  startedAt: Date;
}

@Injectable()
export class EngineExecutionService {
  private readonly logger = new Logger(EngineExecutionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async startExecution(engine: EngineType): Promise<EngineExecutionStart> {
    const record = await this.prisma.securityEngineExecution.create({
      data: {
        engine,
        status: EngineExecutionStatus.RUNNING,
        startedAt: new Date(),
      },
    });

    this.logger.log(`ENGINE_EXECUTION_START engine=${engine} id=${record.id}`);

    return {
      id: record.id,
      engine: record.engine as EngineType,
      startedAt: record.startedAt,
    };
  }

  async completeExecution(
    id: string,
    result: {
      alertsCreated?: number;
      metadata?: Record<string, unknown>;
    } = {},
  ): Promise<void> {
    const execution = await this.prisma.securityEngineExecution.findUnique({
      where: { id },
    });

    if (!execution) {
      this.logger.warn(`ENGINE_EXECUTION_NOT_FOUND id=${id}`);
      return;
    }

    const completedAt = new Date();
    const durationMs =
      completedAt.getTime() - execution.startedAt.getTime();

    await this.prisma.securityEngineExecution.update({
      where: { id },
      data: {
        status: EngineExecutionStatus.COMPLETED,
        completedAt,
        durationMs,
        alertsCreated: result.alertsCreated ?? 0,
        metadata: result.metadata as InputJsonValue ?? undefined,
      },
    });

    this.logger.log(
      `ENGINE_EXECUTION_COMPLETE engine=${execution.engine} id=${id} duration=${durationMs}ms alertsCreated=${result.alertsCreated ?? 0}`,
    );
  }

  async failExecution(
    id: string,
    error: string,
  ): Promise<void> {
    const execution = await this.prisma.securityEngineExecution.findUnique({
      where: { id },
    });

    if (!execution) {
      this.logger.warn(`ENGINE_EXECUTION_NOT_FOUND id=${id}`);
      return;
    }

    const completedAt = new Date();
    const durationMs =
      completedAt.getTime() - execution.startedAt.getTime();

    await this.prisma.securityEngineExecution.update({
      where: { id },
      data: {
        status: EngineExecutionStatus.FAILED,
        completedAt,
        durationMs,
        metadata: { error },
      },
    });

    this.logger.warn(
      `ENGINE_EXECUTION_FAILED engine=${execution.engine} id=${id} duration=${durationMs}ms error=${error}`,
    );
  }

  async getLastSuccessfulRun(
    engine: EngineType,
  ): Promise<Date | null> {
    const record =
      await this.prisma.securityEngineExecution.findFirst({
        where: {
          engine,
          status: EngineExecutionStatus.COMPLETED,
        },
        orderBy: { completedAt: "desc" },
        select: { completedAt: true },
      });

    return record?.completedAt ?? null;
  }

  async getAlertsCreatedToday(): Promise<number> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const aggregations =
      await this.prisma.securityEngineExecution.aggregate({
        where: {
          engine: EngineType.ALERT_DETECTION,
          status: EngineExecutionStatus.COMPLETED,
          completedAt: { gte: todayStart },
        },
        _sum: { alertsCreated: true },
      });

    return aggregations._sum.alertsCreated ?? 0;
  }

  async getEngineStatus(engine: EngineType): Promise<{
    lastRun: Date | null;
    lastStatus: EngineExecutionStatus | null;
    isRunning: boolean;
  }> {
    const latest = await this.prisma.securityEngineExecution.findFirst({
      where: { engine },
      orderBy: { startedAt: "desc" },
      select: { startedAt: true, status: true, completedAt: true },
    });

    if (!latest) {
      return { lastRun: null, lastStatus: null, isRunning: false };
    }

    return {
      lastRun: latest.completedAt ?? latest.startedAt,
      lastStatus: latest.status as EngineExecutionStatus,
      isRunning: latest.status === EngineExecutionStatus.RUNNING,
    };
  }
}
