import type { Enquiry } from '@nsb/shared';

const receivedAt = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' });

/** Columns of the lead export, one field each (Name, Mobile and Email are never combined). */
const COLUMNS: [header: string, value: (e: Enquiry) => string][] = [
  ['Received', (e) => receivedAt.format(new Date(e.createdAt))],
  ['Name', (e) => e.name],
  ['Mobile', (e) => e.mobile],
  ['Email', (e) => e.email ?? ''],
  ['Event', (e) => e.eventType ?? ''],
  ['Preferred date', (e) => e.preferredDate],
  ['Budget', (e) => e.budget ?? ''],
  ['Message', (e) => e.message],
  ['Listing', (e) => e.listingName],
  ['Category', (e) => e.categoryName],
  ['Status', (e) => (e.readAt ? 'Read' : 'Unread')],
];

/**
 * One CSV cell. Quoted, with quotes doubled; a value starting with = + - @ (or a tab/return) gets
 * a leading apostrophe so Excel and Sheets show it as text instead of running it as a formula.
 */
function cell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** The leads as a CSV file that opens correctly in Excel (UTF-8 with BOM, so ₹ and Hindi text survive). */
export function enquiriesCsv(rows: Enquiry[]): string {
  const lines = [COLUMNS.map(([h]) => cell(h)).join(','), ...rows.map((e) => COLUMNS.map(([, v]) => cell(v(e))).join(','))];
  return `﻿${lines.join('\r\n')}\r\n`;
}
