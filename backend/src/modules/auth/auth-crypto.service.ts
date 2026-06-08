import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";

@Injectable()
export class AuthCryptoService {
  hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  deriveDeviceId(userAgent?: string): string | null {
    if (!userAgent) return null;

    return crypto
      .createHash("sha256")
      .update(userAgent)
      .digest("hex")
      .slice(0, 16);
  }
}
