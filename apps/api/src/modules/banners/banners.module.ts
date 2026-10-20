import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module.js';
import { AdminBannersController, BannersController } from './banners.controller.js';
import { BannersService } from './banners.service.js';

@Module({
  imports: [MediaModule],
  controllers: [BannersController, AdminBannersController],
  providers: [BannersService],
})
export class BannersModule {}
