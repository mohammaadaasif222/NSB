import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module.js';
import { ElitePlacesService } from './elite-places.service.js';
import { ListingCardsService } from './listing-cards.service.js';
import { ListingLocationsService } from './listing-locations.service.js';
import { AdminListingsController, ListingsController, LocationsController } from './listings.controller.js';
import { ListingsService } from './listings.service.js';
import { AdminReviewsController } from './reviews.controller.js';
import { ReviewsService } from './reviews.service.js';

@Module({
  imports: [MediaModule],
  controllers: [ListingsController, LocationsController, AdminListingsController, AdminReviewsController],
  providers: [ListingCardsService, ListingsService, ElitePlacesService, ListingLocationsService, ReviewsService],
  exports: [ListingsService],
})
export class ListingsModule {}
