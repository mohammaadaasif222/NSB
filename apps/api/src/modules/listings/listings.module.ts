import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module.js';
import { AdminListingsController, ListingsController } from './listings.controller.js';
import { ListingsService } from './listings.service.js';
import { AdminReviewsController } from './reviews.controller.js';
import { ReviewsService } from './reviews.service.js';

@Module({
  imports: [MediaModule],
  controllers: [ListingsController, AdminListingsController, AdminReviewsController],
  providers: [ListingsService, ReviewsService],
  exports: [ListingsService],
})
export class ListingsModule {}
