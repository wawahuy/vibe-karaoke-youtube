import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Res,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { VideoService } from './video.service';
import { VideoCacheService } from '../cache/video-cache.service';
import { VideoInfoCacheService } from '../video-info/video-info-cache.service';

@Controller('video')
export class VideoController {
  constructor(
    private readonly videoService: VideoService,
    private readonly videoCacheService: VideoCacheService,
    private readonly videoInfoCache: VideoInfoCacheService,
  ) {}

  @Get(':videoId/info')
  async getVideoInfo(@Param('videoId') videoId: string) {
    return this.videoService.getVideoInfo(videoId);
  }

  @Post(':videoId/view')
  async incrementView(@Param('videoId') videoId: string) {
    await this.videoInfoCache.incrementView(videoId);
    return { ok: true };
  }

  @Get(':videoId/formats')
  async getFormats(@Param('videoId') videoId: string) {
    return this.videoService.getFormats(videoId);
  }

  @Get(':videoId/stream')
  async streamVideo(
    @Param('videoId') videoId: string,
    @Query('itag') itagQuery: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const itag = itagQuery ? Number(itagQuery) : undefined;
      const rangeHeader = req.headers.range;
      const cached = await this.videoCacheService.getCachedVideo(videoId, itag);

      if (cached && cached.isComplete) {
        return this.videoCacheService.serveFromCache(cached, rangeHeader, res);
      }

      const streamInfo = await this.videoService.getStreamUrl(videoId, itag);
      if (!streamInfo) {
        throw new HttpException('Stream not found', HttpStatus.NOT_FOUND);
      }

      await this.videoCacheService.proxyAndCache(
        videoId,
        streamInfo,
        rangeHeader,
        res,
      );
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      console.error(`Stream error for ${videoId}:`, error.message);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream video' });
      }
    }
  }
}
