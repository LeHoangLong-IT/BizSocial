import { IsString, IsEmail, IsInt, IsOptional, MinLength, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNotEmpty()
  @IsInt()
  roleId: number;

  @IsInt({ message: 'Department ID phải là số nguyên' })
  @IsOptional()
  departmentId?: number;

  @IsInt({ message: 'Team ID phải là số nguyên' })
  @IsOptional()
  teamId?: number;
}
