@AGENTS.md

# Engineering standards

Follow these whenever you build a new module or feature, inside the scope rules in `AGENTS.md`:

- Prioritize performance, scalability, and clean architecture.
- Use reusable components, hooks, and utility functions. Check for an existing one first.
- Use code splitting and lazy loading where they help. Next.js already splits each route.
- Keep API calls and database queries optimized, with proper indexes for what they filter and sort on.
- Debounce or throttle frequent user interactions, such as search-as-you-type (`useLiveSearch`).
- Prevent unnecessary re-renders, duplicate requests, and redundant code.
- Follow SOLID principles and keep the project structure consistent.
- Write readable, reusable, scalable, production-ready code.
- Keep admin and public code separate so the admin can become its own app (`docs/ADMIN-SEPARATION.md`). What both need goes in `components/shared`.
