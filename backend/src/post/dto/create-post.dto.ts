import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum, IsDateString } from 'class-validator';
import { PostStatus } from '@prisma/client';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  platforms: string[] | string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  mediaUrls?: string[] | string;

  @IsOptional()
  @IsString()
  hashtags?: string;
}
