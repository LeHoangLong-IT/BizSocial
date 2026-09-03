import { IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';

export class TransferMemberDto {
  @IsNotEmpty({ message: 'UserId không được để trống' })
  @IsNumber()
  userId: number;

  @IsOptional()
  @IsNumber()
  departmentId?: number | null;

  @IsOptional()
  @IsNumber()
  teamId?: number | null;

  @IsOptional()
  @IsString()
  reason?: string;
}
