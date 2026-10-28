import ExcelJS from 'exceljs';
import type { Enquiry } from '@nsb/shared';
import { enquiriesWorkbook, type LeadSection } from './enquiry-sheet.js';
import { projectLeadAnswers, projectLeadMessage } from './project-lead-message.js';

const wedding: Enquiry = {
  id: '7f9c2c1e-3b4a-4c5d-9e8f-0a1b2c3d4e5f',
  name: 'Asha "AK" Kapoor',
  mobile: '9876543210',
  email: 'asha@example.com',
  message: '=HYPERLINK("http://evil.test")',
  preferredDate: '2027-02-14',
  budget: '₹5 lakh',
  eventType: 'Wedding',
  listingId: null,
  projectId: null,
  listingName: 'Royal Banquet',
  source: null,
  projectType: null,
  categoryId: null,
  categoryName: 'Wedding Venues',
  createdAt: '2026-10-09T10:00:00.000Z',
  readAt: null,
  leadStatus: 'new',
};

const realEstate: Enquiry = {
  ...wedding,
  email: null,
  preferredDate: null,
  budget: null,
  eventType: null,
  listingName: 'ATS Kingston Heath',
  source: 'Enquiry',
  projectType: 'apartments',
  categoryName: 'Real Estate',
  readAt: '2026-10-09T11:00:00.000Z',
  leadStatus: 'contacted',
  message: projectLeadMessage({
    name: 'Asha',
    mobile: '9876543210',
    source: 'Enquiry',
    isDealer: false,
    buyWithin: '3 months',
    homeLoan: true,
    siteVisit: false,
    message: 'Corner flat?\nHigh floor please',
    agreed: true,
  }),
};

async function read(rows: Enquiry[], section: LeadSection) {
  const book = new ExcelJS.Workbook();
  await book.xlsx.load((await enquiriesWorkbook(rows, section)) as unknown as ExcelJS.Buffer);
  const sheet = book.worksheets[0];
  const headers = (sheet.getRow(1).values as unknown[]).slice(1);
  const row = (n: number) => Object.fromEntries(headers.map((h, i) => [h, sheet.getRow(n).getCell(i + 1).value]));
  return { sheet, headers, row };
}

describe('enquiriesWorkbook', () => {
  it('gives wedding leads their own columns, with real dates and the mobile as text', async () => {
    const { sheet, headers, row } = await read([wedding], 'wedding');
    expect(sheet.name).toBe('Wedding leads');
    expect(headers).toEqual(['Received', 'Name', 'Mobile', 'Email', 'Category', 'Listing', 'Event', 'Event date', 'Budget', 'Message', 'Follow-up', 'Seen']);
    expect(row(2)).toMatchObject({ Name: 'Asha "AK" Kapoor', Mobile: '+91 98765 43210', Email: 'asha@example.com', Seen: 'Unread', 'Follow-up': 'New' });
    // 10:00 UTC is 3:30 pm in India.
    expect((row(2).Received as Date).toISOString()).toBe('2026-10-09T15:30:00.000Z');
    expect((row(2)['Event date'] as Date).toISOString()).toBe('2027-02-14T00:00:00.000Z');
    expect(sheet.views[0]).toMatchObject({ state: 'frozen', ySplit: 1 });
  });

  it('writes visitor text as text, never as a formula', async () => {
    const { row } = await read([wedding], 'wedding');
    expect(row(2).Message).toBe('=HYPERLINK("http://evil.test")');
  });

  it('splits a real estate lead’s answers into columns', async () => {
    const { headers, row } = await read([realEstate], 'real-estate');
    expect(headers).not.toContain('Email');
    expect(row(2)).toMatchObject({
      Project: 'ATS Kingston Heath',
      'Property type': 'Apartment / Flat',
      'Lead type': 'Enquiry',
      'Property dealer': 'No',
      'Buying in': '3 months',
      'Home loan': 'Yes',
      'Site visit': 'No',
      Message: 'Corner flat?\nHigh floor please',
      'Follow-up': 'Contacted',
      Seen: 'Read',
    });
  });

  it('reads back older lead messages without a visitor message', () => {
    expect(projectLeadAnswers('View Number request\nProperty dealer: No\nPlanning to buy in: Not given')).toMatchObject({
      isDealer: 'No',
      buyWithin: 'Not given',
      message: '',
    });
  });
});
