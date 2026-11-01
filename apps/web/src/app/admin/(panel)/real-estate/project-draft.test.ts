import { describe, expect, it } from "vitest";
import { type AdminProject, PROJECT_AMENITIES } from "@nsb/shared";
import { bodyOf, completeness, digits, type Draft, draftEditors, draftOf, firstProblem, stepOfError, videoError } from "./project-draft";

/** A draft that passes every check. */
const valid = (patch: Partial<Draft> = {}): Draft => ({
  ...draftOf(),
  name: "Skyline Heights",
  builder: "Acme",
  locality: "Sector 150",
  configurations: [{ title: "2 BHK", price: "1,25,00,000", superArea: "1450", carpetArea: "", plan2dUrl: null, plan3dUrl: null }],
  ...patch,
});

describe("stepOfError", () => {
  it("finds the step of a field, and Basics for the rest", () => {
    expect(stepOfError("name")).toBe(0);
    expect(stepOfError("videos.0.url")).toBe(1);
    expect(stepOfError("highlights")).toBe(2);
    expect(stepOfError("configurations.1.price")).toBe(3);
    expect(stepOfError("specifications.walls")).toBe(4);
    expect(stepOfError("advertiser.name")).toBe(5);
    expect(stepOfError("slug")).toBe(6);
    expect(stepOfError("phone")).toBe(7);
  });
});

describe("draftOf", () => {
  it("starts a new project with one 2 BHK and one blank place", () => {
    const d = draftOf();
    expect(d).toMatchObject({ type: "apartments", area: "Noida", status: "draft", termMonths: "12", slug: "", advertiser: { type: "builder", name: "" } });
    expect(d.configurations.map((c) => c.title)).toEqual(["2 BHK"]);
    expect(d.nearby).toEqual([{ name: "", type: "", minutes: "", km: "" }]);
  });

  it("turns a saved project's numbers into text and splits its amenities", () => {
    const d = draftOf({
      area: "Noida",
      units: 640,
      towers: null,
      highlights: ["One", "Two"],
      configurations: [{ title: "3 BHK", price: 100, superArea: null, carpetArea: 80, plan2dUrl: null, plan3dUrl: null }],
      amenities: [PROJECT_AMENITIES[0], "Pet spa", "Rooftop"],
      nearby: [{ name: "Metro", type: "", minutes: 6, km: null }],
      advertiser: { type: "broker", name: "Asha", firm: "", experienceYears: 8, reraId: "", established: null, projectsDelivered: null, about: "" },
      advertiserType: "broker",
      specifications: { flooring: "", fittings: "", walls: "" },
      termMonths: 6,
      slug: "kept",
    } as unknown as AdminProject);
    expect(d).toMatchObject({ units: "640", towers: "", highlights: "One\nTwo", termMonths: "6", slug: "", amenities: [PROJECT_AMENITIES[0]], otherAmenities: "Pet spa, Rooftop" });
    expect(d.configurations[0]).toMatchObject({ price: "100", superArea: "", carpetArea: "80" });
    expect(d.nearby[0]).toMatchObject({ minutes: "6", km: "" });
    expect(d.advertiser).toMatchObject({ name: "Asha", experienceYears: "8", established: "" });
  });
});

describe("bodyOf", () => {
  it("drops blank rows, cleans numbers and joins amenities in the listed order", () => {
    const body = bodyOf(
      valid({
        highlights: "One\n\nTwo",
        amenities: [PROJECT_AMENITIES[1]!, PROJECT_AMENITIES[0]!],
        otherAmenities: " Pet spa, ,Rooftop ",
        configurations: [
          { title: "2 BHK", price: "₹1,25,00,000", superArea: "1,450", carpetArea: " 1080 ", plan2dUrl: null, plan3dUrl: null },
          { title: " ", price: "1", superArea: "1", carpetArea: "1", plan2dUrl: null, plan3dUrl: null },
        ],
        nearby: [{ name: " ", type: "", minutes: "", km: "" }],
        faqs: [{ question: "Q", answer: " " }],
        videos: [{ title: "T", url: " ", chapters: "" }],
        phone: "98765 43-210",
        termMonths: "6",
      }),
    );
    expect(body).toMatchObject({ highlights: ["One", "Two"], nearby: [], faqs: [], videos: [], phone: "9876543210", termMonths: 6 });
    expect(body.configurations).toEqual([{ title: "2 BHK", price: "12500000", superArea: "1450", carpetArea: "1080", plan2dUrl: null, plan3dUrl: null }]);
    expect(body.amenities).toEqual([PROJECT_AMENITIES[0], PROJECT_AMENITIES[1], "Pet spa", "Rooftop"]);
  });

  it("sends the slug and the other draft fields through unchanged", () => {
    expect(bodyOf(valid({ slug: "my-slug" }))).toMatchObject({ slug: "my-slug", otherAmenities: "", name: "Skyline Heights" });
  });
});

describe("firstProblem", () => {
  const duplicate = { id: "1", name: "x", area: "Noida", advertiserName: "Asha", status: "live" as const };

  it("passes a complete draft", () => {
    expect(firstProblem(valid(), null)).toBeNull();
  });

  it("reports each problem on its step, in order", () => {
    expect(firstProblem(valid({ name: " " }), null)).toEqual([0, "Enter the project name"]);
    expect(firstProblem(valid({ builder: "" }), null)).toEqual([0, "Enter the builder name"]);
    expect(firstProblem(valid({ locality: "" }), null)).toEqual([0, "Enter the sector or address"]);
    expect(firstProblem(valid({ advertiser: { ...draftOf().advertiser, type: "broker" } }), duplicate)).toEqual([5, "Enter the broker name"]);
    expect(firstProblem(valid(), duplicate)).toEqual([0, "Already listed by Asha. One project can have only one listing."]);
    expect(firstProblem(valid({ configurations: [{ ...valid().configurations[0]!, superArea: "" }] }), null)).toEqual([3, "Add at least one configuration with price and area"]);
  });

  it.each(["", "  ", "9876543210", "98765 43210", "98765-43210"])("accepts the number %j", (phone) => {
    expect(firstProblem(valid({ phone }), null)).toBeNull();
  });

  // Unlike the schema and the listing form, this form has never taken a prefix.
  it.each(["12345", "5876543210", "98765432101", "+919876543210", "919876543210", "09876543210"])("rejects the number %j", (phone) => {
    expect(firstProblem(valid({ phone }), null)).toEqual([7, "Enter a valid 10-digit contact number"]);
  });
});

describe("completeness", () => {
  it("marks the sections filled in", () => {
    const blank = Object.fromEntries(completeness(draftOf()));
    expect(blank).toEqual({ Photos: false, Pricing: false, "Floor plan": false, Video: false, Brochure: false });
    const full = valid({ photos: ["a", "b", "c"], videoUrl: "v", brochureUrl: "b", configurations: [{ ...valid().configurations[0]!, plan3dUrl: "p" }] });
    expect(completeness(full).every(([, ok]) => ok)).toBe(true);
  });
});

describe("small helpers", () => {
  it("digits strips commas, spaces and the rupee sign", () => {
    expect(digits("₹ 1,25,00,000")).toBe("12500000");
  });

  it("videoError flags only a filled-in link that is not YouTube", () => {
    expect(videoError(" ")).toBeFalsy();
    expect(videoError("https://youtu.be/dQw4w9WgXcQ")).toBeUndefined();
    expect(videoError("https://example.com/v")).toMatch(/YouTube link/);
  });
});

describe("draftEditors", () => {
  /** Runs the editor against a plain value in place of React state. */
  const apply = (start: Draft, run: (edit: ReturnType<typeof draftEditors>) => void) => {
    let state = start;
    run(draftEditors((next) => (state = typeof next === "function" ? next(state) : next)));
    return state;
  };

  it("edits, adds and removes rows without touching the others", () => {
    const start = valid({ faqs: [{ question: "a", answer: "1" }, { question: "b", answer: "2" }] });
    expect(apply(start, ({ setRow }) => setRow("faqs", 1, { answer: "x" })).faqs).toEqual([{ question: "a", answer: "1" }, { question: "b", answer: "x" }]);
    expect(apply(start, ({ removeRow }) => removeRow("faqs", 0)).faqs).toEqual([{ question: "b", answer: "2" }]);
    expect(apply(start, ({ addRow }) => addRow("faqs", { question: "c", answer: "" })).faqs).toHaveLength(3);
  });

  it("merges into the advertiser and specifications", () => {
    const start = valid();
    expect(apply(start, ({ setAdvertiser }) => setAdvertiser({ firm: "Prime" })).advertiser).toEqual({ ...start.advertiser, firm: "Prime" });
    expect(apply(start, ({ setSpec }) => setSpec("walls", "Paint")).specifications).toEqual({ ...start.specifications, walls: "Paint" });
  });
});
