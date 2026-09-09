import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { PostService } from './post.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostStatusDto } from './dto/status-post.dto.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  create(@Request() req: any, @Body() createPostDto: CreatePostDto) {
    return this.postService.create(req.user.id, createPostDto);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('platform') platform?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.postService.findAll({ status, platform, search, page, limit });
  }

  @Get('calendar')
  findCalendar() {
    return this.postService.findCalendar();
  }

  @Post('ai-generate')
  generateAiContent(
    @Body('topic') topic: string,
    @Body('platform') platform?: string,
  ) {
    return this.postService.generateAiContent(topic, platform);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() updateStatusDto: UpdatePostStatusDto,
  ) {
    return this.postService.updateStatus(id, req.user.id, updateStatusDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postService.delete(id);
  }
}
