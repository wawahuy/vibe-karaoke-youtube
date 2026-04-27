import * as path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { SearchModule } from './modules/search/search.module';
import { VideoModule } from './modules/video/video.module';
import { CacheModule } from './modules/cache/cache.module';
import { SettingsModule } from './modules/settings/settings.module';
import { VideoCacheEntity } from './modules/cache/entities/video-cache.entity';
import { SettingsEntity } from './modules/settings/settings.entity';
import { VideoInfoEntity } from './modules/video-info/entities/video-info.entity';
import { SearchCacheEntity } from './modules/search-cache/entities/search-cache.entity';

const dbPath = process.env.DATA_DIR
  ? path.join(process.env.DATA_DIR, 'youtube.db')
  : 'data/youtube.db';

const staticModules = process.env.FRONTEND_DIST
  ? [
      ServeStaticModule.forRoot({
        rootPath: process.env.FRONTEND_DIST,
        exclude: ['/api*'],
      }),
    ]
  : [];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: dbPath,
      entities: [VideoCacheEntity, SettingsEntity, VideoInfoEntity, SearchCacheEntity],
      synchronize: true,
    }),
    ...staticModules,
    SearchModule,
    VideoModule,
    CacheModule,
    SettingsModule,
  ],
})
export class AppModule {}
