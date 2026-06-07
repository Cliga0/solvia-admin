import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendPasswordResetEmail(
    _email: string,
    _resetToken: string,
  ): Promise<void> {
    this.logger.log("Password reset email queued (no-op implementation)");
  }
}
