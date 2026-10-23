import { Module } from '@nestjs/common';
import { ListingsModule } from '../listings/listings.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { AdminEnquiriesController, EnquiriesController } from './enquiries.controller.js';
import { EnquiriesService } from './enquiries.service.js';

@Module({
  imports: [ListingsModule, ProjectsModule, NotificationsModule],
  controllers: [EnquiriesController, AdminEnquiriesController],
  providers: [EnquiriesService],
})
export class EnquiriesModule {}
