import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import {
  type Enquiry,
  type EnquiryInput,
  enquiryInputSchema,
  type EnquiryQuery,
  enquiryQuerySchema,
  type EnquiryUpdate,
  enquiryUpdateSchema,
  type Paginated,
  type UnreadCount,
} from '@nsb/shared';
import { ZodPipe } from '../../common/zod.pipe.js';
import { AdminGuard } from '../auth/admin.guard.js';
import { enquiriesCsv } from './enquiry-csv.js';
import { EnquiriesService } from './enquiries.service.js';

@Controller('enquiries')
export class EnquiriesController {
  constructor(private readonly enquiries: EnquiriesService) {}

  /** Public enquiry form submission. Returns only the id — lead data stays private. */
  @Post()
  async create(@Body(new ZodPipe(enquiryInputSchema)) body: EnquiryInput): Promise<{ id: string }> {
    const { id } = await this.enquiries.create(body);
    return { id };
  }
}

@Controller('admin/enquiries')
@UseGuards(AdminGuard)
export class AdminEnquiriesController {
  constructor(private readonly enquiries: EnquiriesService) {}

  @Get()
  list(@Query(new ZodPipe(enquiryQuerySchema)) query: EnquiryQuery): Promise<Paginated<Enquiry>> {
    return this.enquiries.list(query);
  }

  /** The leads matching the dashboard filters as a CSV download (opens in Excel or Google Sheets). */
  @Get('export')
  async export(@Query(new ZodPipe(enquiryQuerySchema)) query: EnquiryQuery, @Res({ passthrough: true }) res: Response): Promise<string> {
    const day = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="nsb-enquiries-${day}.csv"`);
    res.setHeader('Cache-Control', 'no-store');
    return enquiriesCsv(await this.enquiries.exportRows(query));
  }

  /** For the admin panel's notification badge; polled while the panel is open. */
  @Get('unread-count')
  unreadCount(): Promise<UnreadCount> {
    return this.enquiries.unreadCount();
  }

  // Declared before ':id' so "read-all" isn't parsed as an id.
  @Post('read-all')
  markAllRead(): Promise<UnreadCount> {
    return this.enquiries.markAllRead();
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body(new ZodPipe(enquiryUpdateSchema)) body: EnquiryUpdate): Promise<Enquiry> {
    return this.enquiries.setRead(id, body.read);
  }
}
