import { Controller, Post, Body, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AUTH_THROTTLE } from "@/config";
import { Throttle } from "@nestjs/throttler";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { PasswordResetService } from "./password-reset.service";
import { TwoFactorService } from "./two-factor.service";
import {
  DisableTwoFactorDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  ResetPasswordDto,
  VerifyTwoFactorDto,
  VerifyTwoFactorLoginDto,
} from "./dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordResetService: PasswordResetService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  @Post("login")
  @Throttle(AUTH_THROTTLE.LOGIN)
  @ApiOperation({ summary: "Authenticate user and obtain tokens" })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Post("refresh")
  @Throttle(AUTH_THROTTLE.REFRESH)
  @ApiOperation({ summary: "Refresh access token" })
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @Post("logout")
  @Throttle(AUTH_THROTTLE.LOGOUT)
  @ApiOperation({ summary: "Invalidate refresh token and end session" })
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto);
  }

  @Post("forgot-password")
  @Throttle(AUTH_THROTTLE.FORGOT_PASSWORD)
  @ApiOperation({ summary: "Request a password reset email" })
  forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    return this.passwordResetService.forgotPassword(dto, req.ip);
  }

  @Post("reset-password")
  @Throttle(AUTH_THROTTLE.RESET_PASSWORD)
  @ApiOperation({ summary: "Reset password using a valid reset token" })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.passwordResetService.resetPassword(dto);
  }

  @Post("2fa/setup")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @Throttle(AUTH_THROTTLE.TWO_FACTOR_SETUP)
  @ApiOperation({ summary: "Generate 2FA secret and QR code" })
  setupTwoFactor(@Req() req: Request) {
    const user = req.user as { sub: string };
    return this.twoFactorService.setup(user.sub);
  }

  @Post("2fa/verify-setup")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @Throttle(AUTH_THROTTLE.TWO_FACTOR_VERIFY)
  @ApiOperation({ summary: "Verify 2FA setup and enable 2FA" })
  verifySetupTwoFactor(@Body() dto: VerifyTwoFactorDto, @Req() req: Request) {
    const user = req.user as { sub: string };
    return this.twoFactorService.verifySetup(user.sub, dto);
  }

  @Post("2fa/disable")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @Throttle(AUTH_THROTTLE.TWO_FACTOR_DISABLE)
  @ApiOperation({ summary: "Disable 2FA with password and TOTP code" })
  disableTwoFactor(@Body() dto: DisableTwoFactorDto, @Req() req: Request) {
    const user = req.user as { sub: string };
    return this.twoFactorService.disable(user.sub, dto);
  }

  @Post("2fa/verify")
  @Throttle(AUTH_THROTTLE.TWO_FACTOR_VERIFY)
  @ApiOperation({ summary: "Verify 2FA during login" })
  verifyTwoFactorLogin(@Body() dto: VerifyTwoFactorLoginDto) {
    return this.twoFactorService.verifyLogin(dto);
  }
}
