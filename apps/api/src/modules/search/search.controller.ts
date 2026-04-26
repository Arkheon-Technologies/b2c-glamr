import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { AutocompleteQueryDto } from './dto/autocomplete-query.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /** GET /api/v1/search/autocomplete?q=<term> — public */
  @Get('autocomplete')
  async autocomplete(@Query() query: AutocompleteQueryDto) {
    const data = await this.searchService.autocomplete(query.q);
    return { ok: true, data };
  }

  /** GET /api/v1/search/featured — public, cached 10 min */
  @Get('featured')
  async featured() {
    const data = await this.searchService.getFeatured();
    return { ok: true, data };
  }

  /** GET /api/v1/search/trending — public */
  @Get('trending')
  async trending() {
    const data = await this.searchService.getTrending();
    return { ok: true, data };
  }
}
