import { LISTING_FORMS, listingDetailsSchema, listingDetailsToQuickInfo, listingFormFor, listingPlace } from '@nsb/shared';

describe('listing forms', () => {
  it.each(Object.entries(LISTING_FORMS))('%s: field keys are unique within each sub-category form', (slug, form) => {
    for (const sub of Object.keys(form.subcategories)) {
      const keys = listingFormFor(sub, slug)!.fields.map((f) => f.key);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it('resolves category fields for a sub-category without a form of its own', () => {
    const form = listingFormFor('mehendi-artists', 'wedding')!;
    expect(form.subcategoryFields).toEqual([]);
    expect(form.categoryFields.length).toBeGreaterThan(0);
    expect(listingFormFor('cafe', 'cafes')).toBeNull();
  });

  const venues = listingFormFor('wedding-venues', 'wedding')!;
  const schema = listingDetailsSchema(venues.fields);

  it('requires the required fields and checks options', () => {
    const result = schema.safeParse({ venueType: 'Castle', minGuests: -1 });
    expect(result.success).toBe(false);
    const issues = Object.fromEntries(result.error!.issues.map((i) => [i.path.join('.'), i.message]));
    expect(issues).toMatchObject({ startingPrice: 'This field is required', maxGuests: 'This field is required', minGuests: 'Enter 0 or more' });
    expect(issues.venueType).toBeDefined();
  });

  it('drops answers the form does not ask for', () => {
    const result = schema.parse({ startingPrice: 85000, venueType: 'Lawn', maxGuests: 500, bridalMakeupPrice: 1 });
    expect(result).toEqual({ startingPrice: 85000, venueType: 'Lawn', maxGuests: 500 });
  });

  it('builds key info with highlighted fields first and only "yes" switches', () => {
    const info = listingDetailsToQuickInfo(venues.fields, {
      yearsInBusiness: 1,
      startingPrice: 150000,
      venueType: 'Banquet hall',
      maxGuests: 800,
      vegPrice: 1100,
      eventsCovered: ['Wedding', 'Reception'],
      parking: true,
      alcoholAllowed: false,
    });
    expect(info).toEqual([
      { label: 'Starting price', value: '₹1,50,000' },
      { label: 'Venue type', value: 'Banquet hall' },
      { label: 'Max guests', value: '800 guests' },
      { label: 'Years in business', value: '1 year' },
      { label: 'Events covered', value: 'Wedding, Reception' },
      { label: 'Veg price', value: '₹1,100 per plate' },
      { label: 'Parking available', value: 'Yes' },
    ]);
  });

  it('shows the locality before the area', () => {
    expect(listingPlace({ area: 'Noida', locality: 'Sector 18' })).toBe('Sector 18, Noida');
    expect(listingPlace({ area: 'Noida Extension', locality: null })).toBe('Noida Extension');
  });
});
