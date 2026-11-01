/** Far past any real page, and safe to send to the API. */
const MAX_PAGE = 100_000;

/** The page number in a URL. Anything else, however long, means page 1 or the last possible page. */
export const pageParam = (value: string | undefined) => Math.min(MAX_PAGE, Math.max(1, Number.parseInt(value ?? "", 10) || 1));
