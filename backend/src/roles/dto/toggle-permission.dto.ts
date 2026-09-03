import { IsInt, IsNotEmpty, IsString, IsIn } from 'class-validator';

export class TogglePermissionDto {
  @IsInt()
  @IsNotEmpty()
  roleId: number;

  @IsInt()
  @IsNotEmpty()
  moduleId: number;

  @IsString()
  @IsIn(['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE'])
  action: string;
}
