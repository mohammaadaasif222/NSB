import { type Enquiry, type QuickInfoItem, parseService } from '@nsb/shared';

export interface EmailContent {
  subject: string;
  text: string;
  html: string;
}

/** The listing an enquiry was made on, as it was when the lead came in. */
export interface EnquiryListing {
  id: string;
  slug: string;
  area: string;
  quickInfo: QuickInfoItem[];
  services: string[];
  /** Null when the vendor has no email for leads. */
  vendorEmail: string | null;
  vendorPhone: string | null;
  /** Off: this vendor is not sent its leads. */
  notifyVendor: boolean;
  categorySlug: string;
  /** The category's parent (e.g. Wedding); null for a top-level category. */
  parent: { name: string; slug: string } | null;
  /** Site path of the page when it is not /vertical/category/slug, e.g. a real estate project. */
  path?: string;
}

interface Link {
  href: string;
  label: string;
}

/** One part of an email: a heading with label/value rows, or with a paragraph of visitor text. */
interface Block {
  heading?: string;
  rows?: [string, string][];
  text?: string;
}

/** Services listed in the admin email; the rest are summarised as "+N more". */
const MAX_SERVICES = 8;

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Visitor input in a subject: one line, bounded length. */
const oneLine = (value: string, max = 80) => value.replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);

const receivedAt = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' });
const dateOnly = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeZone: 'UTC' });

function render(title: string, blocks: Block[], links: Link[], footer: string): Omit<EmailContent, 'subject'> {
  const text = [
    title,
    '',
    ...blocks.flatMap((b) => [
      ...(b.heading ? [`${b.heading}:`] : []),
      ...(b.rows ?? []).map(([k, v]) => `${k}: ${v}`),
      ...(b.text !== undefined ? [b.text] : []),
      '',
    ]),
    ...links.map((l) => `${l.label}: ${l.href}`),
    ...(links.length ? [''] : []),
    footer,
  ].join('\n');

  const blockHtml = (b: Block) =>
    [
      b.heading ? `<p style="margin:20px 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:.06em">${escapeHtml(b.heading)}</p>` : '',
      b.rows?.length
        ? `<table cellpadding="6" style="border-collapse:collapse;font-size:14px">\n${b.rows
            .map(([k, v]) => `<tr><td style="color:#6b7280;vertical-align:top">${escapeHtml(k)}</td><td><b>${escapeHtml(v)}</b></td></tr>`)
            .join('\n')}\n</table>`
        : '',
      b.text !== undefined ? `<p style="margin:0;white-space:pre-line;font-size:14px">${escapeHtml(b.text)}</p>` : '',
    ].join('\n');

  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111827;line-height:1.5">
<h2 style="margin:0 0 16px;font-size:18px">${escapeHtml(title)}</h2>
${blocks.map(blockHtml).join('\n')}
${
  links.length
    ? `<p style="margin:24px 0">${links
        .map((l) => `<a href="${escapeHtml(l.href)}" style="display:inline-block;margin:0 8px 8px 0;background:#111827;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-size:14px">${escapeHtml(l.label)}</a>`)
        .join('')}</p>`
    : ''
}
<p style="margin-top:24px;color:#6b7280;font-size:12px">${escapeHtml(footer)}</p>
</body></html>`;
  return { text, html };
}

const leadRows = (e: Enquiry): [string, string][] => [
  ['Name', e.name],
  ['Mobile', `+91 ${e.mobile}`],
  ...(e.eventType ? [['Event', e.eventType] as [string, string]] : []),
  ...(e.preferredDate ? [['Preferred date', dateOnly.format(new Date(`${e.preferredDate}T00:00:00Z`))] as [string, string]] : []),
  // Real estate leads say which button they came from; vendor enquiries carry a budget.
  e.source ? ['Lead type', e.source] : ['Budget', e.budget || 'Not given'],
  ...(e.email ? [['Email', e.email] as [string, string]] : []),
];

/** Call and WhatsApp shortcuts to the customer, so whoever reads the email can reply in one tap. */
const contactLinks = (e: Enquiry): Link[] => [
  { href: `tel:+91${e.mobile}`, label: `Call +91 ${e.mobile}` },
  {
    href: `https://wa.me/91${e.mobile}?text=${encodeURIComponent(`Hi ${oneLine(e.name, 40)}, this is about your enquiry for ${e.listingName} on Noida Super Bazaar.`)}`,
    label: 'WhatsApp customer',
  },
];

/** Public page of the listing, when the site address is known and the category sits under a vertical. */
const listingUrl = (l: EnquiryListing, siteUrl?: string) => {
  const path = l.path ?? (l.parent ? `/${l.parent.slug}/${l.categorySlug}/${l.slug}` : null);
  return siteUrl && path ? new URL(path, siteUrl).toString() : undefined;
};

/** Service names with their detail in brackets, e.g. "Catering (in-house only)". */
const serviceLabel = (service: string) => {
  const { title, detail } = parseService(service);
  return detail ? `${title} (${detail})` : title;
};

const servicesLine = (services: string[]) =>
  services.length > MAX_SERVICES
    ? `${services.slice(0, MAX_SERVICES).map(serviceLabel).join(', ')} +${services.length - MAX_SERVICES} more`
    : services.map(serviceLabel).join(', ');

/**
 * Alert for the NSB team: the lead, the listing it came from (category, area, key details,
 * services) and the vendor's private contact, with links to reply and to follow up in the admin panel.
 */
export function adminEnquiryEmail(e: Enquiry, listing: EnquiryListing | null, siteUrl?: string): EmailContent {
  const listingRows: [string, string][] = [
    ['Listing', e.listingName],
    ['Category', listing?.parent ? `${listing.parent.name} › ${e.categoryName}` : e.categoryName],
  ];
  if (listing) {
    listingRows.push(['Area', listing.area]);
    listingRows.push(...listing.quickInfo.map((q): [string, string] => [q.label, q.value]));
    if (listing.services.length) listingRows.push(['Services', servicesLine(listing.services)]);
  }

  const blocks: Block[] = [
    { rows: [...leadRows(e), ['Received', receivedAt.format(new Date(e.createdAt))]] },
    { heading: 'Message', text: e.message },
    { heading: 'Enquiry for', rows: listingRows },
  ];
  if (listing) {
    blocks.push({
      heading: 'Vendor contact (private)',
      rows: [
        ['Phone', listing.vendorPhone || 'Not on file'],
        ['Email', listing.vendorEmail || 'Not on file'],
        ['Leads to vendor', listing.notifyVendor && listing.vendorEmail ? 'Sent by email' : 'Not sent (NSB only)'],
      ],
    });
  }

  const url = listing ? listingUrl(listing, siteUrl) : undefined;
  const links: Link[] = [
    ...contactLinks(e),
    ...(url ? [{ href: url, label: 'View listing' }] : []),
    ...(siteUrl ? [{ href: new URL('/admin/enquiries?status=unread', siteUrl).toString(), label: 'Open in the admin panel' }] : []),
  ];

  const { text, html } = render(
    `New enquiry for ${e.listingName}`,
    blocks,
    links,
    'You receive this because your address is an enquiry recipient in Admin > Settings.',
  );
  return { subject: oneLine(`New enquiry: ${e.listingName} - ${e.categoryName} (${e.name})`, 120), text, html };
}

/** Lead for the vendor whose listing was enquired about. */
export function vendorEnquiryEmail(e: Enquiry): EmailContent {
  const { text, html } = render(
    `You have a new enquiry on Noida Super Bazaar`,
    [{ rows: [...leadRows(e), ['For', e.listingName]] }, { heading: 'Message', text: e.message }],
    contactLinks(e),
    'Please call the customer back soon. This enquiry came from your listing on Noida Super Bazaar.',
  );
  return { subject: oneLine(`New enquiry from ${e.name}`), text, html };
}
