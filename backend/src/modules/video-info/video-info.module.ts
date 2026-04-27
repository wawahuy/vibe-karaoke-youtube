import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoInfoEntity } from './entities/video-info.entity';
import { VideoInfoCacheService } from './video-info-cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([VideoInfoEntity])],
  providers: [VideoInfoCacheService],
  exports: [VideoInfoCacheService],
})
export class VideoInfoModule {}
