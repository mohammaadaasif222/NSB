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
  UseGuards,
} from '@nestjs/common';
import {
  type Banner,
  type BannerInput,
  bannerInputSchema,
  type BannerUpdate,
  bannerUpdateSchema,
  type OrderInput,
  orderSchema,
} from '@nsb/shared';
import { ZodPipe } from '../../common/zod.pipe.js';
import { AdminGuard } from '../auth/admin.guard.js';
import { BannersService } from './banners.service.js';

@Controller('banners')
export class BannersController {
  constructor(private readonly banners: BannersService) {}

  /** Active hero banners for the home page, in display order. */
  @Get()
  list(): Promise<Banner[]> {
    return this.banners.list({ activeOnly: true });
  }
}

@Controller('admin/banners')
@UseGuards(AdminGuard)
export class AdminBannersController {
  constructor(private readonly banners: BannersService) {}

  @Get()
  list(): Promise<Banner[]> {
    return this.banners.list({ activeOnly: false });
  }

  @Post()
  create(@Body(new ZodPipe(bannerInputSchema)) body: BannerInput): Promise<Banner> {
    return this.banners.create(body);
  }

  // Declared before ':id' so "order" isn't parsed as an id.
  @Put('order')
  reorder(@Body(new ZodPipe(orderSchema)) body: OrderInput): Promise<Banner[]> {
    return this.banners.reorder(body.ids);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodPipe(bannerUpdateSchema)) body: BannerUpdate,
  ): Promise<Banner> {
    return this.banners.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.banners.remove(id);
  }
}
