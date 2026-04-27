import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { YoutubeApiService } from '../../shared/services/youtube-api.service';
import { SerpApiService } from '../../shared/services/serp-api.service';
import { LocalApiService } from '../../shared/services/local-api.service';
import { SearchCacheModule } from '../search-cache/search-cache.module';
import { VideoInfoModule } from '../video-info/video-info.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [SearchCacheModule, VideoInfoModule, SettingsModule],
  controllers: [SearchController],
  providers: [SearchService, YoutubeApiService, SerpApiService, LocalApiService],
})
export class SearchModule {}
