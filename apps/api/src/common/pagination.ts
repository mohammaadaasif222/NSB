import { DEFAULT_PAGE_SIZE } from '@nsb/shared';

export function pageWindow(page: number, pageSize = DEFAULT_PAGE_SIZE) {
  return { page, pageSize, limit: pageSize, offset: (page - 1) * pageSize };
}
