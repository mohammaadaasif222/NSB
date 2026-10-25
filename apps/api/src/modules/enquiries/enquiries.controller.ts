import { Body, Controller, ForbiddenException, Get, Param, ParseUUIDPipe, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
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
  type UnreadCount,
} from '@nsb/shared';
import { ZodPipe } from '../../common/zod.pipe.js';
import { AdminGuard, Allow, CurrentAdmin } from '../auth/admin.guard.js';
import type { CurrentAdminInfo } from '../auth/auth.service.js';
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

  /**
   * Real estate View Number form. Returns the advertiser's number (and brochure link): the
   * project page shows them only to visitors who leave their details.
   */
  @Post('project')
  createForProject(@Body(new ZodPipe(projectEnquiryInputSchema)) body: ProjectEnquiryInput): Promise<ProjectEnquiryResult> {
    return this.enquiries.createForProject(body);
  }
}

/** "9876543210" → "98XXXXXX10", for roles that may not see lead numbers. */
const maskMobile = (mobile: string) => `${mobile.slice(0, 2)}XXXXXX${mobile.slice(-2)}`;

/** Phone numbers a visitor typed into a message ("call me on 98765 43210"). */
const NUMBER_IN_TEXT = /(?:\+?91[\s-]?)?[6-9](?:[\s-]?\d){9}/g;

/** View only accounts see leads without their numbers or email addresses, in the fields or the message. */
const forRole = (admin: CurrentAdminInfo, e: Enquiry): Enquiry =>
  canDo(admin.role, 'leadContacts')
    ? e
    : { ...e, mobile: maskMobile(e.mobile), email: null, message: e.message.replace(NUMBER_IN_TEXT, (n) => maskMobile(n.replace(/\D/g, '').slice(-10))) };

@Controller('admin/enquiries')
@UseGuards(AdminGuard)
export class AdminEnquiriesController {
  constructor(private readonly enquiries: EnquiriesService) {}

  @Get()
  async list(@CurrentAdmin() admin: CurrentAdminInfo, @Query(new ZodPipe(enquiryQuerySchema)) query: EnquiryQuery): Promise<Paginated<Enquiry>> {
    const page = await this.enquiries.list(query, { contacts: canDo(admin.role, 'leadContacts') });
    return { ...page, items: page.items.map((e) => forRole(admin, e)) };
  }

  /** The leads matching the dashboard filters as a CSV download (opens in Excel or Google Sheets). */
  @Get('export')
  @Allow('leadContacts')
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
