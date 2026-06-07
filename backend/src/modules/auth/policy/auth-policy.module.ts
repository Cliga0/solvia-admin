import { Module } from "@nestjs/common";
import { AuthTokenPolicyService } from "./auth-token-policy.service";
import { AuthSessionPolicyService } from "./auth-session-policy.service";

@Module({
  providers: [AuthTokenPolicyService, AuthSessionPolicyService],
  exports: [AuthTokenPolicyService, AuthSessionPolicyService],
})
export class AuthPolicyModule {}
