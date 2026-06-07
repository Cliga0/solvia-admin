import { IsString, IsNotEmpty, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateRoleDto {
  @ApiProperty({ example: "MARKET_ADMIN" })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: "Marketplace Administrator" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: "Marketplace administrator" })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateRoleDto {
  @ApiPropertyOptional({ example: "Marketplace Administrator" })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: "Marketplace administrator" })
  @IsString()
  @IsOptional()
  description?: string;
}

export class AssignRoleDto {
  @ApiProperty({ example: "uuid" })
  @IsString()
  @IsNotEmpty()
  roleId!: string;
}

export class AssignPermissionDto {
  @ApiProperty({ example: "uuid" })
  @IsString()
  @IsNotEmpty()
  roleId!: string;

  @ApiProperty({ example: "uuid" })
  @IsString()
  @IsNotEmpty()
  permissionId!: string;
}
