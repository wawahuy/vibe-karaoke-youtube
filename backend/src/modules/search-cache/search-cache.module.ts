import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchCacheEntity } from './entities/search-cache.entity';
import { SearchCacheService } from './search-cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([SearchCacheEntity])],
  providers: [SearchCacheService],
  exports: [SearchCacheService],
})
export class SearchCacheModule {}
