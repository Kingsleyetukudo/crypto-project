export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 10;

export function getPagination(query, options = {}) {
  const maxLimit = Number(options.maxLimit) || MAX_PAGE_SIZE;
  const defaultLimit = Number(options.defaultLimit) || DEFAULT_PAGE_SIZE;

  const page = Math.max(Number(query?.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query?.limit) || defaultLimit, 1), maxLimit);

  return { page, limit };
}
