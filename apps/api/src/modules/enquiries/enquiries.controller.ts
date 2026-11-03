import { randomUUID } from 'node:crypto';
import { Body, Controller, ForbiddenException, Get, Logger, Param, ParseUUIDPipe, Patch, Post, Query, Res, StreamableFile, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Response } from 'express';
import {
  canDo,
  type Enquiry,
  type EnquiryInput,
  enquiryInputSchema,
  type EnquiryQuery,
  enquiryQuerySchema,
  type EnquiryUpdate,
  enquiryUpdateSchema,
  type LeadSectionCounts,
  type Paginated,
  type ProjectEnquiryInput,
  projectEnquiryInputSchema,
  type ProjectEnquiryResult,
  todayInIndia,
  type UnreadCount,
} from '@nsb/shared';
import { ZodPipe } from '../../common/zod.pipe.js';
import { AdminGuard, Allow, CurrentAdmin } from '../auth/admin.guard.js';
import type { CurrentAdminInfo } from '../auth/auth.service.js';
import { forRole } from './enquiry-mapper.js';
import { enquiriesWorkbook } from './enquiry-sheet.js';
import { EnquiriesService } from './enquiries.service.js';

/** Leads a minute from one visitor. */
const LEAD_LIMIT = { default: { limit: 10, ttl: 60_000 } };

const logger = new Logger('EnquiriesController');

/** Logs a lead the honeypot dropped, so a real visitor's lost lead (e.g. a browser autofilled the field) shows up in the logs. */
const dropped = (form: string, about: string | null | undefined, website: string) =>
  logger.warn(`Honeypot dropped a ${form} lead (${about ?? 'no project'}): field had ${website.length} characters`);

@Controller('enquiries')
export class EnquiriesController {
  constructor(private readonly enquiries: EnquiriesService) {}

  /** Public enquiry form submission. Returns only the id — lead data stays private. */
  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle(LEAD_LIMIT)
  async create(@Body(new ZodPipe(enquiryInputSchema)) { website, ...body }: EnquiryInput): Promise<{ id: string }> {
    // A filled honeypot gets a normal reply, so the bot learns nothing, and nothing is saved.
    if (website) {
      dropped('listing', body.listingId, website);
      return { id: randomUUID() };
    }
    const { id } = await this.enquiries.create(body);
    return { id };
  }

  /**
   * Real estate View Number form. Returns the advertiser's number (and brochure link): the
   * project page shows them only to visitors who leave their details.
   */
  @Post('project')
  @UseGuards(ThrottlerGuard)
  @Throttle(LEAD_LIMIT)
  async createForProject(@Body(new ZodPipe(projectEnquiryInputSchema)) { website, ...body }: ProjectEnquiryInput): Promise<ProjectEnquiryResult> {
    if (website) {
      dropped('project', body.projectId, website);
      return { id: randomUUID(), advertiserName: null, phone: null, brochureUrl: null };
    }
    return this.enquiries.createForProject(body);
  }
}

@Controller('admin/enquiries')
@UseGuards(AdminGuard)
export class AdminEnquiriesController {
  constructor(private readonly enquiries: EnquiriesService) {}

  @Get()
  async list(@CurrentAdmin() admin: CurrentAdminInfo, @Query(new ZodPipe(enquiryQuerySchema)) query: EnquiryQuery): Promise<Paginated<Enquiry>> {
    const page = await this.enquiries.list(query, { contacts: canDo(admin.role, 'leadContacts') });
    return { ...page, items: page.items.map((e) => forRole(admin, e)) };
  }

  /** The leads matching the dashboard filters as an Excel download (also opens in Google Sheets). */
  @Get('export')
  @Allow('leadContacts')
  async export(@Query(new ZodPipe(enquiryQuerySchema)) query: EnquiryQuery, @Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    const day = todayInIndia();
    const file = await enquiriesWorkbook(await this.enquiries.exportRows(query), query.section);
    res.setHeader('Cache-Control', 'no-store');
    return new StreamableFile(file, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: `attachment; filename="nsb-${query.section ?? 'all'}-leads-${day}.xlsx"`,
    });
  }

  /** For the admin panel's notification badge; polled while the panel is open. */
  @Get('unread-count')
  unreadCount(): Promise<UnreadCount> {
    return this.enquiries.unreadCount();
  }

  /** New and unread leads per section, for the Leads tabs. */
  @Get('sections')
  sections(): Promise<LeadSectionCounts> {
    return this.enquiries.sectionCounts();
  }

  // Declared before ':id' so "read-all" isn't parsed as an id. Reading leads is open to every role.
  @Post('read-all')
  @Allow('view')
  markAllRead(): Promise<UnreadCount> {
    return this.enquiries.markAllRead();
  }

  /** Every role may mark a lead read (opening it does); changing its stage is follow-up work for editors. */
  @Patch(':id')
  @Allow('view')
  async update(
    @CurrentAdmin() admin: CurrentAdminInfo,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodPipe(enquiryUpdateSchema)) body: EnquiryUpdate,
  ): Promise<Enquiry> {
    if (body.leadStatus && !canDo(admin.role, 'edit')) throw new ForbiddenException('Only Admins can change a lead’s status.');
    return forRole(admin, await this.enquiries.update(id, body));
  }
}
