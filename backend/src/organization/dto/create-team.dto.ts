import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateTeamDto {
  @IsNotEmpty({ message: 'Tên đội nhóm không được để trống' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Phòng ban trực thuộc không được để trống' })
  @IsNumber()
  departmentId: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  leaderId?: number;
}
