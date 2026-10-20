import { z } from 'zod';
import type { QuickInfoItem } from './schemas.js';

/**
 * Structured listing forms. Every listing has the same basic details (name, area, contact,
 * photos); on top of that each top-level category has fields shared by all its listings, and
 * each sub-category adds its own. The admin form, the API's validation and the site's
 * "key info" all read these definitions, so adding a form is a change here only.
 *
 * Values are saved in `listings.details`, keyed by field key. Keys must be unique within one
 * category's fields plus any one of its sub-categories' fields, and must never be renamed once
 * listings use them (rename the label instead).
 */

interface BaseField {
  /** Stable storage key, camelCase. */
  key: string;
  label: string;
  required?: boolean;
  /** Shown first in the listing's key info, so it reaches the card. Form order otherwise. */
  highlight?: boolean;
}

export type ListingField =
  | (BaseField & { type: 'text'; placeholder?: string })
  /** A count or measure, shown with its unit: "500 guests". Use the plural; "1 guest" is derived. */
  | (BaseField & { type: 'number'; unit: string })
  /** Rupees, shown as "₹1,100 per plate". */
  | (BaseField & { type: 'price'; suffix?: string })
  | (BaseField & { type: 'select'; options: readonly string[] })
  | (BaseField & { type: 'multi'; options: readonly string[] })
  /** Yes/no switch; only "yes" is shown on the site. */
  | (BaseField & { type: 'bool' });

export type ListingFieldType = ListingField['type'];

export type ListingDetailValue = string | number | boolean | string[];
export type ListingDetails = Record<string, ListingDetailValue>;

export interface CategoryListingForm {
  /** Fields every listing in the category has. */
  fields: readonly ListingField[];
  /** Extra fields per sub-category, keyed by sub-category slug. */
  subcategories: Record<string, readonly ListingField[]>;
}

const R = { required: true } as const;
const H = { highlight: true } as const;

/** Areas a listing can be in. */
export const LISTING_AREAS = ['Noida', 'Greater Noida', 'Noida Extension'] as const;

/**
 * Forms by top-level category slug. Only categories listed here can get new listings from the
 * admin panel; add the others when their listings go live.
 */
export const LISTING_FORMS: Record<string, CategoryListingForm> = {
  wedding: {
    fields: [
      { key: 'startingPrice', label: 'Starting price', type: 'price', ...R, ...H },
      { key: 'yearsInBusiness', label: 'Years in business', type: 'number', unit: 'years' },
      { key: 'eventsCovered', label: 'Events covered', type: 'multi', options: ['Wedding', 'Engagement', 'Haldi & Mehendi', 'Reception', 'Sangeet'] },
    ],
    subcategories: {
      'wedding-venues': [
        { key: 'venueType', label: 'Venue type', type: 'select', options: ['Banquet hall', 'Lawn', 'Hotel', 'Farmhouse', 'Resort'], ...R, ...H },
        { key: 'minGuests', label: 'Min guests', type: 'number', unit: 'guests' },
        { key: 'maxGuests', label: 'Max guests', type: 'number', unit: 'guests', ...R, ...H },
        { key: 'vegPrice', label: 'Veg price', type: 'price', suffix: 'per plate' },
        { key: 'nonVegPrice', label: 'Non-veg price', type: 'price', suffix: 'per plate' },
        { key: 'rooms', label: 'Rooms available', type: 'number', unit: 'rooms' },
        { key: 'parking', label: 'Parking available', type: 'bool' },
        { key: 'alcoholAllowed', label: 'Alcohol allowed', type: 'bool' },
        { key: 'inHouseDecor', label: 'In-house decor', type: 'bool' },
      ],
      'makeup-beauty': [
        { key: 'bridalMakeupPrice', label: 'Bridal makeup', type: 'price', ...R, ...H },
        { key: 'partyMakeupPrice', label: 'Party makeup', type: 'price' },
        { key: 'brandsUsed', label: 'Brands used', type: 'multi', options: ['MAC', 'Huda Beauty', 'Kryolan', 'Bobbi Brown', 'NARS'] },
        // Labels avoid "Services": every listing already has a Services box in its basic details.
        { key: 'makeupServices', label: 'Also offers', type: 'multi', options: ['Bridal makeup', 'Hairstyling', 'Mehendi', 'Saree draping', 'Nail art'] },
        { key: 'travelsToVenue', label: 'Travels to venue', type: 'bool' },
        { key: 'trialAvailable', label: 'Trial available', type: 'bool' },
      ],
      'catering-halwai': [
        { key: 'cuisines', label: 'Cuisines', type: 'multi', options: ['North Indian', 'South Indian', 'Chinese', 'Continental', 'Mughlai', 'Rajasthani'], ...R, ...H },
        { key: 'vegPrice', label: 'Veg price', type: 'price', suffix: 'per plate', ...R, ...H },
        { key: 'nonVegPrice', label: 'Non-veg price', type: 'price', suffix: 'per plate' },
        { key: 'minGuests', label: 'Minimum guests', type: 'number', unit: 'guests' },
        { key: 'liveCounters', label: 'Live counters', type: 'bool' },
        { key: 'crockeryAndStaff', label: 'Crockery and staff included', type: 'bool' },
      ],
      'photography-films': [
        { key: 'photoServices', label: 'Shoot types', type: 'multi', options: ['Candid', 'Traditional', 'Cinematic film', 'Drone', 'Pre-wedding shoot'], ...R, ...H },
        { key: 'pricePerDay', label: 'Price', type: 'price', suffix: 'per day', ...R, ...H },
        { key: 'deliveryWeeks', label: 'Delivery time', type: 'number', unit: 'weeks' },
        { key: 'albumIncluded', label: 'Album included', type: 'bool' },
        { key: 'sameDayEdit', label: 'Same-day edit', type: 'bool' },
      ],
      'cards-invitations': [
        { key: 'cardTypes', label: 'Card types', type: 'multi', options: ['Printed cards', 'E-invites', 'Video invites', 'Gift hampers'], ...R, ...H },
        { key: 'pricePerCard', label: 'Cards from', type: 'price', suffix: 'per card', ...H },
        { key: 'minimumOrder', label: 'Minimum order', type: 'number', unit: 'cards' },
        { key: 'deliveryDays', label: 'Delivery time', type: 'number', unit: 'days' },
      ],
    },
  },
};

export interface ResolvedListingForm {
  categoryFields: readonly ListingField[];
  /** Empty when the sub-category has no form of its own (e.g. one added later in the admin panel). */
  subcategoryFields: readonly ListingField[];
  /** Category fields, then sub-category fields: the form's order. */
  fields: readonly ListingField[];
}

/**
 * The form for a listing filed under `categorySlug`. Pass the parent's slug when that is a
 * sub-category. Null when the category has no structured form.
 */
export function listingFormFor(categorySlug: string, parentSlug?: string | null): ResolvedListingForm | null {
  const form = LISTING_FORMS[parentSlug ?? categorySlug];
  if (!form) return null;
  const subcategoryFields = (parentSlug && form.subcategories[categorySlug]) || [];
  return { categoryFields: form.fields, subcategoryFields, fields: [...form.fields, ...subcategoryFields] };
}

const REQUIRED = 'This field is required';

function fieldSchema(field: ListingField): z.ZodType {
  const missing = (message: string) => ({ error: (issue: { input: unknown }) => (issue.input === undefined ? REQUIRED : message) });
  let schema: z.ZodType;
  switch (field.type) {
    case 'text':
      schema = z.string(missing('Enter text')).trim().max(200, 'Keep it under 200 characters');
      if (field.required) schema = (schema as z.ZodString).min(1, REQUIRED);
      break;
    case 'number':
    case 'price':
      schema = z.number(missing('Enter a number')).min(0, 'Enter 0 or more').max(1e10, 'That number is too large');
      break;
    case 'select':
      schema = z.enum(field.options as [string, ...string[]], missing('Choose one of the options'));
      break;
    case 'multi': {
      // Predefined options are suggestions; admins may also type in their own values.
      const item = z.string().trim().max(120, 'Keep it under 120 characters');
      const list = z.array(item, missing('Choose from the options'));
      schema = field.required ? list.min(1, 'Pick at least one') : list;
      break;
    }
    case 'bool':
      schema = z.boolean(missing('Choose yes or no'));
      break;
  }
  return field.required ? schema : schema.optional();
}

/** Validates a listing's details against its form. Keys that are not in the form are dropped. */
export function listingDetailsSchema(fields: readonly ListingField[]) {
  return z.object(Object.fromEntries(fields.map((f) => [f.key, fieldSchema(f)])));
}

/** Shape of `details` in requests; the API then checks it against the listing's form. */
export const listingDetailsInputSchema = z.record(
  z.string().regex(/^[a-zA-Z][a-zA-Z0-9]{0,39}$/),
  z.union([z.string().max(200), z.number(), z.boolean(), z.array(z.string().max(120)).max(40)]),
);

const inr = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

/**
 * A count or measure: grouped from 10,000 up ("12,000 sq ft"), plain below so 4-digit values
 * such as years read correctly ("2005", not "2,005").
 */
const plainNumber = (n: number) => (Math.abs(n) >= 10_000 ? n.toLocaleString('en-IN') : String(n));

/** A value that is clearly a calendar year rather than a count, e.g. 2005 typed into "Years in business". */
const looksLikeYear = (n: number) => Number.isInteger(n) && n >= 1900 && n <= new Date().getFullYear();

/** A detail as shown on the site, e.g. "₹1,100 per plate"; null when there is nothing to show. */
export function formatListingDetail(field: ListingField, value: ListingDetailValue | undefined): string | null {
  if (value === undefined || value === '') return null;
  switch (field.type) {
    case 'bool':
      return value === true ? 'Yes' : null;
    case 'multi':
      return Array.isArray(value) && value.length ? value.join(', ') : null;
    case 'price':
      return typeof value === 'number' ? `${inr(value)}${field.suffix ? ` ${field.suffix}` : ''}` : null;
    case 'number': {
      if (typeof value !== 'number') return null;
      if (field.unit === 'years' && looksLikeYear(value)) return `Since ${value}`;
      const unit = value === 1 ? field.unit.replace(/s$/, '') : field.unit;
      return `${plainNumber(value)}${unit === '%' ? '%' : ` ${unit}`}`;
    }
    default:
      return typeof value === 'string' ? value : null;
  }
}

/** Filled-in details as label/value pairs, highlighted fields first: the listing's key info. */
export function listingDetailsToQuickInfo(fields: readonly ListingField[], details: ListingDetails): QuickInfoItem[] {
  const ordered = [...fields.filter((f) => f.highlight), ...fields.filter((f) => !f.highlight)];
  return ordered.flatMap((field) => {
    const value = formatListingDetail(field, details[field.key]);
    return value === null ? [] : [{ label: field.label, value }];
  });
}

/** "Sector 18, Noida": the locality (when set) and the area. */
export const listingPlace = (listing: { area: string; locality?: string | null }) =>
  [listing.locality, listing.area].filter(Boolean).join(', ');
