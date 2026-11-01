import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  type AdminListing,
  type AdminListingQuery,
  adminListingQuerySchema,
  type ListingCounts,
  type ListingCountsQuery,
  listingCountsQuerySchema,
  type ListingDetail,
  type ListingInput,
  listingInputSchema,
  type ListingQuery,
  listingQuerySchema,
  type ListingSummary,
  type ListingUpdate,
  listingUpdateSchema,
  type LocationOption,
  type Paginated,
  type SitemapListing,
  type TopListingsInput,
  topListingsInputSchema,
  type TopListingsQuery,
  topListingsQuerySchema,
} from '@nsb/shared';
import { ZodPipe } from '../../common/zod.pipe.js';
import { AdminGuard } from '../auth/admin.guard.js';
import { ElitePlacesService } from './elite-places.service.js';
import { ListingLocationsService } from './listing-locations.service.js';
import { ListingsService } from './listings.service.js';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listings: ListingsService) {}

  @Get()
  list(@Query(new ZodPipe(listingQuerySchema)) query: ListingQuery): Promise<Paginated<ListingSummary>> {
    return this.listings.list(query);
  }

  /** Every public listing's address, for /sitemap.xml. Declared before ':slug'. */
  @Get('sitemap')
  sitemap(): Promise<SitemapListing[]> {
    return this.listings.sitemap();
  }

  @Get(':slug')
  get(@Param('slug') slug: string): Promise<ListingDetail> {
    return this.listings.getBySlug(slug);
  }
}

/** The site's location filter: the areas and localities it offers, and listings per category in one. */
@Controller('locations')
export class LocationsController {
  constructor(private readonly locations: ListingLocationsService) {}

  @Get()
  list(): Promise<LocationOption[]> {
    return this.locations.locations();
  }

  @Get('counts')
  counts(@Query(new ZodPipe(listingCountsQuerySchema)) query: ListingCountsQuery): Promise<ListingCounts> {
    return this.locations.counts(query);
  }
}

@Controller('admin/listings')
@UseGuards(AdminGuard)
export class AdminListingsController {
  constructor(
    private readonly listings: ListingsService,
    private readonly elite: ElitePlacesService,
  ) {}

  @Get()
  list(@Query(new ZodPipe(adminListingQuerySchema)) query: AdminListingQuery): Promise<Paginated<ListingSummary>> {
    return this.listings.listAdmin(query);
  }

  @Get('top')
  top(@Query(new ZodPipe(topListingsQuerySchema)) query: TopListingsQuery): Promise<ListingSummary[]> {
    return this.elite.top(query.categoryId);
  }

  @Put('top')
  setTop(@Body(new ZodPipe(topListingsInputSchema)) body: TopListingsInput): Promise<ListingSummary[]> {
    return this.elite.setTop(body);
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<AdminListing> {
    return this.listings.getAdmin(id);
  }

  @Post()
  create(@Body(new ZodPipe(listingInputSchema)) body: ListingInput): Promise<AdminListing> {
    return this.listings.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodPipe(listingUpdateSchema)) body: ListingUpdate,
  ): Promise<AdminListing> {
    return this.listings.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.listings.remove(id);
  }
}
