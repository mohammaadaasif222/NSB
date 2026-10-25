import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module.js';
import { AdminDashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

/** Admin dashboard figures: listings, projects and leads across every section. */
@Module({
  imports: [SettingsModule],
  controllers: [AdminDashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
