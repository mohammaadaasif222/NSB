import { describe, expect, it } from "vitest";
import type { AdminCategory, AdminListing, ListingField } from "@nsb/shared";
import { draftFromProfile } from "@/components/admin/profile-sections-editor";
import { type ListingDraft, listingBody, listingPreview, listingProblems, nestedErrors, oldAreaOf, stepOfError, valuesOf } from "./listing-draft";

const fields: ListingField[] = [{ key: "venueType", label: "Venue type", type: "select", options: ["Lawn", "Hotel"] }];

const draft = (patch: Partial<ListingDraft["values"]> = {}, rest: Partial<ListingDraft> = {}): ListingDraft => ({
  values: { ...valuesOf(), name: "Royal Orchid", slug: "royal-orchid", area: "Noida", phone: "9876543210", ...patch },
  groups: [],
  details: {},
  quickInfo: [],
  gallery: [],
  videos: [],
  tags: [],
  profile: draftFromProfile(),
  ...rest,
});

describe("stepOfError", () => {
  it("finds the step of a field, and sends a category's own fields to Details", () => {
    expect(stepOfError("phone")).toBe(0);
    expect(stepOfError("videos.1.url")).toBe(1);
    expect(stepOfError("venueType")).toBe(2);
    expect(stepOfError("status")).toBe(3);
    expect(stepOfError("slug")).toBe(4);
  });
});

describe("nestedErrors", () => {
  it("keeps only the errors in list rows", () => {
    expect(nestedErrors({ name: "x", "gallery.0": "y", "serviceGroups.1.title": "z", services: "n" })).toEqual([
      ["gallery.0", "y"],
      ["serviceGroups.1.title", "z"],
    ]);
  });
});

describe("oldAreaOf", () => {
  it("returns only an area NSB does not cover", () => {
    expect(oldAreaOf({ area: "Sector 18, Noida" } as AdminListing)).toBe("Sector 18, Noida");
    expect(oldAreaOf({ area: "Noida" } as AdminListing)).toBeNull();
    expect(oldAreaOf()).toBeNull();
  });
});

describe("listingProblems", () => {
  const check = (patch: Partial<Parameters<typeof listingProblems>[0]>) =>
    listingProblems({ values: draft().values, topId: "top", subId: "sub", hasSubs: true, fields, ...patch });

  it("passes a complete listing", () => {
    expect(check({})).toEqual({});
  });

  it("asks for a category first, then a sub-category when the form needs one", () => {
    expect(check({ topId: "", subId: "" })).toEqual({ categoryId: "Choose a category" });
    expect(check({ subId: "" })).toEqual({ subId: "Choose a sub-category" });
    expect(check({ subId: "", hasSubs: false })).toEqual({});
    expect(check({ subId: "", fields: null })).toEqual({});
  });

  it("asks for the area", () => {
    expect(check({ values: draft({ area: "" }).values })).toEqual({ area: "Choose the area" });
  });

  it.each(["9876543210", "98765 43210", "98765-43210", "+919876543210", "+91 98765 43210", "919876543210", "09876543210"])("accepts %s", (phone) => {
    expect(check({ values: draft({ phone }).values })).toEqual({});
  });

  it.each(["", "12345", "5876543210", "98765432101", "+929876543210", "98765x4321"])("rejects %j", (phone) => {
    expect(check({ values: draft({ phone }).values })).toEqual({ phone: "Enter the 10-digit mobile number" });
  });

  it("leaves the phone of a free-form listing alone", () => {
    expect(check({ values: draft({ phone: "011 2345 678" }).values, fields: null })).toEqual({});
  });
});

describe("listingBody", () => {
  const context = { categoryId: "cat", fields, profileSections: false };

  it("sends the profile sections only for a form that has them, dropping blank rows", () => {
    const profile = {
      ...draftFromProfile(),
      artistName: " Ritika ",
      stats: [{ value: "9 years", label: "Experience" }, { value: " ", label: "" }],
      highlights: "500+ brides\n\n Airbrush specialist ",
      faqs: [{ question: "Trial?", answer: "Yes" }, { question: "", answer: " " }],
      serviceArea: "  ",
      included: ["Hairstyling"],
    };
    const body = listingBody(draft({}, { profile }), { ...context, profileSections: true });
    expect(body.artist).toEqual({ name: "Ritika", role: null, note: null, stats: [{ value: "9 years", label: "Experience" }], highlights: ["500+ brides", "Airbrush specialist"], training: [] });
    expect(body.faqs).toEqual([{ question: "Trial?", answer: "Yes" }]);
    expect(body.serviceArea).toBeNull();
    expect(body.includedServices).toEqual(["Hairstyling"]);

    const other = listingBody(draft({}, { profile }), context);
    expect([other.artist, other.faqs, other.serviceArea, other.includedServices]).toEqual([null, [], null, []]);
  });

  it("turns package prices into rupees and drops blank packages and cards", () => {
    const profile = {
      ...draftFromProfile(),
      packages: [
        { name: " Bridal HD ", description: "", price: "25000", priceNote: " onwards ", duration: "3 hrs", imageUrl: null },
        { name: "Trial", description: "", price: " ", priceNote: "", duration: "", imageUrl: null },
        { name: " ", description: "", price: "", priceNote: "", duration: "", imageUrl: null },
      ],
      thingsToKnow: [{ title: "Booking", text: "Book early" }, { title: " ", text: "" }],
      serviceAreaChips: ["Noida"],
    };
    const body = listingBody(draft({}, { profile }), { ...context, profileSections: true });
    expect(body.packages).toEqual([
      { name: "Bridal HD", description: null, price: 25000, priceNote: "onwards", duration: "3 hrs", imageUrl: null },
      { name: "Trial", description: null, price: null, priceNote: null, duration: null, imageUrl: null },
    ]);
    expect(body.thingsToKnow).toEqual([{ title: "Booking", text: "Book early" }]);
    expect(body.serviceAreaChips).toEqual(["Noida"]);
  });

  it("leaves the artist out while every artist field is blank, and keeps a nameless one for the API to flag", () => {
    expect(listingBody(draft(), { ...context, profileSections: true }).artist).toBeNull();
    const nameless = listingBody(draft({}, { profile: { ...draftFromProfile(), training: "Diploma" } }), { ...context, profileSections: true });
    expect(nameless.artist?.name).toBe("");
  });

  it("normalises the phone of a form listing, and keeps a free-form one as typed", () => {
    expect(listingBody(draft({ phone: "+91 98765-43210" }), context).phone).toBe("9876543210");
    expect(listingBody(draft({ phone: "011 2345 678" }), { ...context, fields: null }).phone).toBe("011 2345 678");
  });

  it("saves answers on a form listing and key information on a free-form one", () => {
    const rest = { details: { venueType: "Lawn" }, quickInfo: [{ label: "Price", value: "" }, { label: " ", value: " " }] };
    const form = listingBody(draft({}, rest), context);
    expect(form.details).toEqual({ venueType: "Lawn" });
    expect(form).not.toHaveProperty("quickInfo");
    const free = listingBody(draft({}, rest), { ...context, fields: null });
    expect(free.quickInfo).toEqual([{ label: "Price", value: "" }]);
    expect(free).not.toHaveProperty("details");
  });

  it("clears a saved optional text, and leaves one that was never set unset", () => {
    expect(listingBody(draft({ locality: " " }), context).locality).toBeUndefined();
    expect(listingBody(draft({ locality: " " }), { ...context, listing: { locality: "Sector 18" } as AdminListing }).locality).toBe("");
  });

  it("splits services, parses ratings and drops blank videos", () => {
    const body = listingBody(draft({ services: " Catering \n\nDecor", googleRating: "4.5", googleReviewCount: " ", googleMapsUrl: " " }, { videos: [{ kind: "video", url: " https://youtu.be/x " }, { kind: "short", url: "  " }] }), context);
    expect(body).toMatchObject({ services: ["Catering", "Decor"], googleRating: 4.5, googleReviewCount: null, googleMapsUrl: null, videos: [{ kind: "video", url: "https://youtu.be/x" }] });
  });
});

describe("listingPreview", () => {
  const category = { id: "c1", name: "Venues", slug: "venues" } as AdminCategory;

  it("fills blanks with placeholders", () => {
    const card = listingPreview(draft({ name: " ", area: "" }), { fields: null });
    expect(card).toMatchObject({ id: "preview", name: "Business name", area: "Area", locality: null, rating: null, category: { id: "", name: "Category", slug: "" } });
  });

  it("prefers a typed Google rating to the saved one", () => {
    const listing = { rating: { average: 3, count: 2, source: "reviews" } } as unknown as AdminListing;
    expect(listingPreview(draft({ googleRating: "4.7", googleReviewCount: "12" }), { listing, category, fields: null }).rating).toEqual({ average: 4.7, count: 12, source: "google" });
    expect(listingPreview(draft({ googleRating: "abc" }), { listing, category, fields: null }).rating).toBe(listing.rating);
  });

  it("shows the first four complete key details, and joins services with group items", () => {
    const quickInfo = ["a", "b", "c", "d", "e"].map((label) => ({ label, value: "1" }));
    const card = listingPreview(draft({ services: "Catering" }, { quickInfo: [{ label: "x", value: "" }, ...quickInfo], groups: [{ title: "Decor", items: "Stage\nLights" }] }), { category, fields: null });
    expect(card.keyInfo.map((r) => r.label)).toEqual(["a", "b", "c", "d"]);
    expect(card.services).toEqual(["Catering", "Stage", "Lights"]);
    expect(card.category).toEqual({ id: "c1", name: "Venues", slug: "venues" });
  });
});
