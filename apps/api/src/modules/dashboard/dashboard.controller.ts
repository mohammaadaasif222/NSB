import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { type DashboardQuery, dashboardQuerySchema, type DashboardStats } from '@nsb/shared';
import { ZodPipe } from '../../common/zod.pipe.js';
import { AdminGuard } from '../auth/admin.guard.js';
import { DashboardService } from './dashboard.service.js';

@Controller('admin/dashboard')
@UseGuards(AdminGuard)
export class AdminDashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get()
  get(@Query(new ZodPipe(dashboardQuerySchema)) query: DashboardQuery): Promise<DashboardStats> {
    return this.dashboard.stats(query.days);
  }
}
