import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateDepartmentDto {
  @IsNotEmpty({ message: 'Tên phòng ban không được để trống' })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  managerId?: number;
}
