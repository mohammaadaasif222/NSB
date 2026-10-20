import type { Enquiry } from '@nsb/shared';
import { enquiriesCsv } from './enquiry-csv.js';

const lead: Enquiry = {
  id: '7f9c2c1e-3b4a-4c5d-9e8f-0a1b2c3d4e5f',
  name: 'Asha "AK" Kapoor',
  mobile: '9876543210',
  email: 'asha@example.com',
  message: '=HYPERLINK("http://evil.test")',
  preferredDate: '2027-02-14',
  budget: '₹5 lakh',
  eventType: 'Wedding',
  listingId: null,
  listingName: 'Royal Banquet',
  categoryId: null,
  categoryName: 'Wedding Venues',
  createdAt: '2026-10-09T10:00:00.000Z',
  readAt: null,
};

describe('enquiriesCsv', () => {
  const [bomHeader, row] = enquiriesCsv([lead]).split('\r\n');

  it('keeps Name, Mobile and Email in their own columns, with a BOM for Excel', () => {
    expect(bomHeader.startsWith('﻿')).toBe(true);
    expect(bomHeader.slice(1)).toBe('"Received","Name","Mobile","Email","Event","Preferred date","Budget","Message","Listing","Category","Status"');
    expect(row).toContain('"Asha ""AK"" Kapoor","9876543210","asha@example.com","Wedding","2027-02-14","₹5 lakh"');
    expect(row.endsWith('"Royal Banquet","Wedding Venues","Unread"')).toBe(true);
  });

  it('stops spreadsheet formulas in visitor text', () => {
    expect(row).toContain(`"'=HYPERLINK(""http://evil.test"")"`);
  });
});
