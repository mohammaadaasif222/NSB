import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const ADMIN_CODE = ["@/app/admin/*", "@/components/admin/*", "@/lib/admin-*"];
const SITE_CODE = [
  "@/app/(site)/*",
  "@/components/site/*",
  "@/lib/catalog",
  "@/lib/flags",
  "@/lib/location",
  "@/lib/location-server",
  "@/lib/site-settings",
  "@/lib/site-url",
];

/** Keeps the admin panel movable to its own app: see docs/ADMIN-SEPARATION.md. */
const boundary = (files, group) => ({
  files,
  rules: {
    "no-restricted-imports": [
      "error",
      { patterns: [{ group, message: "Admin and site code stay separate. Move what both need to components/shared." }] },
    ],
  },
});

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  boundary(["src/app/\\(site\\)/**", "src/components/site/**"], ADMIN_CODE),
  boundary(["src/app/admin/**", "src/components/admin/**", "src/lib/admin-*"], SITE_CODE),
  boundary(["src/components/shared/**", "src/lib/api.ts", "src/lib/format.ts"], [...ADMIN_CODE, ...SITE_CODE]),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
