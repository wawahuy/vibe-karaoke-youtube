import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoCacheEntity } from './entities/video-cache.entity';
import { VideoCacheService } from './video-cache.service';
import { VideoModule } from '../video/video.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VideoCacheEntity]),
    forwardRef(() => VideoModule),
  ],
  providers: [VideoCacheService],
  exports: [VideoCacheService],
})
export class CacheModule {}
