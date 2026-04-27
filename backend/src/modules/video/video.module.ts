import { Module, forwardRef } from '@nestjs/common';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { CacheModule } from '../cache/cache.module';
import { VideoInfoModule } from '../video-info/video-info.module';
import { SettingsModule } from '../settings/settings.module';
import { LocalApiService } from '../../shared/services/local-api.service';

@Module({
  imports: [forwardRef(() => CacheModule), VideoInfoModule, SettingsModule],
  controllers: [VideoController],
  providers: [VideoService, LocalApiService],
  exports: [VideoService],
})
export class VideoModule {}
