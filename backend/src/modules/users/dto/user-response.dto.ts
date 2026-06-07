import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserStatus } from "../types";

export class UserDto {
  @ApiProperty() id!: string;
  @ApiProperty() email!: string;
  @ApiProperty({ enum: UserStatus }) status!: UserStatus;
  @ApiProperty() isActive!: boolean;
  @ApiProperty() twoFactorEnabled!: boolean;
  @ApiPropertyOptional() twoFactorEnabledAt?: Date | null;
  @ApiPropertyOptional() lastLoginAt?: Date | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class UserDetailsDto extends UserDto {
  @ApiProperty() roles!: {
    id: string;
    code: string;
    name: string;
    assignedAt: Date;
  }[];
}

export class UserPaginationDto {
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() total!: number;
  @ApiProperty() pages!: number;
}

export class UserSearchResponseDto {
  @ApiProperty({ type: [UserDto] }) data!: UserDto[];
  @ApiProperty() pagination!: UserPaginationDto;
}

export class UserSessionDto {
  @ApiProperty() id!: string;
  @ApiPropertyOptional() ip?: string | null;
  @ApiPropertyOptional() userAgent?: string | null;
  @ApiProperty() loginAt!: Date;
  @ApiPropertyOptional() logoutAt?: Date | null;
  @ApiProperty() lastActiveAt!: Date;
  @ApiProperty() isRevoked!: boolean;
}

export class UserSecurityProfileDto {
  @ApiProperty() twoFactorEnabled!: boolean;
  @ApiPropertyOptional() twoFactorEnabledAt?: Date | null;
  @ApiPropertyOptional() lastLoginAt?: Date | null;
  @ApiProperty({ type: [UserSessionDto] }) activeSessions!: UserSessionDto[];
}
