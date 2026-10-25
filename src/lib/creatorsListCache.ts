/** In-memory cache for GET /api/creators public listing. */

let cachedResponse: { at: number; body: unknown } | null = null;

export function getCreatorsListCache(): { at: number; body: unknown } | null {
  return cachedResponse;
}

export function setCreatorsListCache(body: unknown) {
  cachedResponse = { at: Date.now(), body };
}

export function invalidateCreatorsListCache() {
  cachedResponse = null;
}
