import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PostStatus } from '@prisma/client';

export class UpdatePostStatusDto {
  @IsEnum(PostStatus)
  @IsNotEmpty()
  status: PostStatus;

  @IsOptional()
  @IsString()
  rejectReason?: string;
}
