import ExcelJS from 'exceljs';
import { type Enquiry, type LeadStatus, PROJECT_TYPE_LABELS } from '@nsb/shared';
import { type ProjectLeadAnswers, projectLeadAnswers } from './project-lead-message.js';

export type LeadSection = 'real-estate' | 'wedding' | undefined;

interface Column {
  header: string;
  /** In characters, as Excel measures it. */
  width: number;
  value: (e: Enquiry, answers: ProjectLeadAnswers) => string | Date | null;
  /** Excel number format for a date cell. */
  format?: string;
  /** Long text: wrapped inside the column instead of spilling over. */
  wrap?: boolean;
}

const FOLLOW_UP: Record<LeadStatus, string> = { new: 'New', contacted: 'Contacted', won: 'Won', lost: 'Lost' };
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Excel dates have no time zone, so the cell holds the time as read in India. */
const istWallTime = (iso: string) => new Date(new Date(iso).getTime() + IST_OFFSET_MS);
/** "9810012345" → "+91 98100 12345", kept as text so Excel neither reformats nor sums it. */
const mobile = (m: string) => (/^\d{10}$/.test(m) ? `+91 ${m.slice(0, 5)} ${m.slice(5)}` : m);

const START: Column[] = [
  { header: 'Received', width: 20, value: (e) => istWallTime(e.createdAt), format: 'dd mmm yyyy, h:mm AM/PM' },
  { header: 'Name', width: 22, value: (e) => e.name },
  { header: 'Mobile', width: 17, value: (e) => mobile(e.mobile) },
];
const END: Column[] = [
  { header: 'Follow-up', width: 12, value: (e) => FOLLOW_UP[e.leadStatus] },
  { header: 'Seen', width: 9, value: (e) => (e.readAt ? 'Read' : 'Unread') },
];

/** Real estate leads: the project, the button used, and the form's answers in their own columns. */
const REAL_ESTATE: Column[] = [
  ...START,
  { header: 'Project', width: 28, value: (e) => e.listingName, wrap: true },
  { header: 'Property type', width: 14, value: (e) => (e.projectType ? PROJECT_TYPE_LABELS[e.projectType] : '') },
  { header: 'Lead type', width: 14, value: (e) => e.source },
  { header: 'Property dealer', width: 10, value: (_, a) => a.isDealer },
  { header: 'Buying in', width: 12, value: (_, a) => a.buyWithin },
  { header: 'Home loan', width: 11, value: (_, a) => a.homeLoan },
  { header: 'Site visit', width: 10, value: (_, a) => a.siteVisit },
  { header: 'Visit date', width: 13, value: (e) => (e.preferredDate ? new Date(`${e.preferredDate}T00:00:00Z`) : null), format: 'dd mmm yyyy' },
  { header: 'Other date', width: 13, value: (_, a) => a.altVisitDate },
  { header: 'Message', width: 45, value: (_, a) => a.message, wrap: true },
  ...END,
];

const WEDDING: Column[] = [
  ...START,
  { header: 'Email', width: 26, value: (e) => e.email },
  { header: 'Category', width: 20, value: (e) => e.categoryName },
  { header: 'Listing', width: 28, value: (e) => e.listingName, wrap: true },
  { header: 'Event', width: 16, value: (e) => e.eventType },
  { header: 'Event date', width: 13, value: (e) => (e.preferredDate ? new Date(`${e.preferredDate}T00:00:00Z`) : null), format: 'dd mmm yyyy' },
  { header: 'Budget', width: 14, value: (e) => e.budget },
  { header: 'Message', width: 50, value: (e) => e.message, wrap: true },
  ...END,
];

/** Both sections in one sheet (an export without a section). */
const ALL: Column[] = [
  ...START,
  { header: 'Email', width: 26, value: (e) => e.email },
  { header: 'Section', width: 12, value: (e) => (e.source ? 'Real estate' : 'Wedding') },
  { header: 'Category', width: 20, value: (e) => e.categoryName },
  { header: 'Listing or project', width: 28, value: (e) => e.listingName, wrap: true },
  { header: 'Lead type', width: 14, value: (e) => e.source },
  { header: 'Message', width: 50, value: (e) => e.message, wrap: true },
  ...END,
];

const SHEETS = {
  'real-estate': { name: 'Real estate leads', columns: REAL_ESTATE },
  wedding: { name: 'Wedding leads', columns: WEDDING },
  all: { name: 'Leads', columns: ALL },
};

/**
 * The leads as an Excel workbook: one sheet with a bold, frozen header row, filters, set column
 * widths, real dates, and long text wrapped. Values are written as text, never as formulas.
 */
export async function enquiriesWorkbook(rows: Enquiry[], section: LeadSection): Promise<Buffer> {
  const { name, columns } = SHEETS[section ?? 'all'];
  const book = new ExcelJS.Workbook();
  book.creator = 'Noida Super Bazaar';
  const sheet = book.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 1 }] });
  sheet.columns = columns.map((c) => ({ header: c.header, width: c.width }));

  for (const e of rows) {
    const answers = projectLeadAnswers(e.message);
    sheet.addRow(columns.map((c) => c.value(e, answers) ?? ''));
  }

  columns.forEach((c, i) => {
    const column = sheet.getColumn(i + 1);
    if (c.format) column.numFmt = c.format;
    column.alignment = { vertical: 'top', wrapText: !!c.wrap };
  });

  const header = sheet.getRow(1);
  header.height = 22;
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    cell.alignment = { vertical: 'middle', wrapText: true };
  });
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };

  return Buffer.from(await book.xlsx.writeBuffer());
}
