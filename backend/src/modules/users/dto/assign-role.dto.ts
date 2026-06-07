import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AssignRoleDto {
  @ApiProperty({ example: "uuid" })
  @IsString()
  @IsNotEmpty()
  roleId!: string;
}
