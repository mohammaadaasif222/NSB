import { type Advertiser, bedroomsOf, type ProjectConfiguration, type ProjectInput, projectSlug } from '@nsb/shared';

/** A builder advertises as itself; each type keeps only its own "Listed by" fields. */
function advertiserOf(input: ProjectInput): Advertiser {
  const a = input.advertiser;
  return a.type === 'builder'
    ? { ...a, name: input.builder, firm: '', experienceYears: null, reraId: '' }
    : { ...a, established: null, projectsDelivered: null };
}

/**
 * Row values for a project, with the columns derived from it: the slug, the advertiser columns,
 * and the lowest price and bedroom counts the listing page sorts and filters on. Pure, so the
 * demo seed saves projects exactly as the API does.
 */
export function projectValues(input: ProjectInput) {
  const advertiser = advertiserOf(input);
  const prices = input.configurations.map((c) => c.price).filter((n): n is number => !!n);
  const bedrooms = [...new Set(input.configurations.map((c) => bedroomsOf(c.title)).filter((n): n is number => n !== null))];
  return {
    ...input,
    slug: input.slug ?? projectSlug(input.name, input.area),
    advertiser,
    advertiserName: advertiser.name,
    advertiserType: advertiser.type,
    minPrice: prices.length ? Math.min(...prices) : null,
    bedrooms,
  };
}

/** Photo and floor plan URLs, to release once they are replaced or the project is deleted. */
export const projectImages = (p: { photos: string[]; configurations: ProjectConfiguration[] }) => [
  ...p.photos,
  ...p.configurations.flatMap((c) => [c.plan2dUrl, c.plan3dUrl]),
];
