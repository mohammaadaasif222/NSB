import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { type ListingReview, type ReviewInput, reviewInputSchema, type ReviewUpdate, reviewUpdateSchema } from '@nsb/shared';
import { ZodPipe } from '../../common/zod.pipe.js';
import { AdminGuard } from '../auth/admin.guard.js';
import { ReviewsService } from './reviews.service.js';

/** Admin: a listing's reviews. Public pages get them inside the listing (GET /api/listings/:slug). */
@Controller('admin')
@UseGuards(AdminGuard)
export class AdminReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get('listings/:id/reviews')
  list(@Param('id', ParseUUIDPipe) id: string): Promise<ListingReview[]> {
    return this.reviews.list(id);
  }

  @Post('listings/:id/reviews')
  create(@Param('id', ParseUUIDPipe) id: string, @Body(new ZodPipe(reviewInputSchema)) body: ReviewInput): Promise<ListingReview> {
    return this.reviews.create(id, body);
  }

  @Patch('reviews/:id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body(new ZodPipe(reviewUpdateSchema)) body: ReviewUpdate): Promise<ListingReview> {
    return this.reviews.update(id, body);
  }

  @Delete('reviews/:id')
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.reviews.remove(id);
  }
}
