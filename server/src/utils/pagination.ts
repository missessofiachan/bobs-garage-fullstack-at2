/**
 * @author Bob's Garage Team
 * @purpose Pagination utility functions for calculating offsets and page metadata
 * @version 1.0.0
 */

/**
 * Calculate pagination offset and limit from page and limit parameters
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 20, max: 100)
 * @returns Object with offset and limit values
 */
export function calculatePaginationParams(
  page: number | string | undefined,
  limit: number | string | undefined
): { offset: number; limit: number } {
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 20;
  const actualLimit = Math.min(limitNum, 100); // Cap at 100 per page
  const offset = (pageNum - 1) * actualLimit;

  return { offset, limit: actualLimit };
}
