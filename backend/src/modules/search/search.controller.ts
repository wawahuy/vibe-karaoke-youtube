import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @Query('q') query: string,
    @Query('pageToken') pageToken?: string,
    @Query('reload') reload?: string,
  ) {
    return this.searchService.search(query, pageToken, reload === 'true');
  }

  @Get('suggestions')
  async suggestions(@Query('q') query: string) {
    return this.searchService.getSuggestions(query);
  }

  @Get('db-match')
  async dbMatch(@Query('q') query: string) {
    return this.searchService.dbVideoMatch(query);
  }
}
