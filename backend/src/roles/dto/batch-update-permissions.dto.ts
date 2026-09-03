import { IsArray, IsInt, IsNotEmpty, IsString, IsIn } from 'class-validator';

export class PermissionItemDto {
  @IsInt()
  @IsNotEmpty()
  moduleId: number;

  @IsString()
  @IsIn(['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE'])
  action: string;
}

export class BatchUpdateRolePermissionsDto {
  @IsInt()
  @IsNotEmpty()
  roleId: number;

  @IsArray()
  permissions: PermissionItemDto[];
}
