'use client';

/**
 * Global Favourites Synchronization System
 * Synchronizes favourite creator state in real time across:
 * - Homepage
 * - Explore Creators page
 * - Book Session flow (steps 1 to 5)
 * - User Dashboard
 * - Cross-tab synchronization via storage events
 * - Optimistic UI updates with instant local feedback and server persistence
 */

export const FAVOURITES_STORAGE_KEY = 'reachly_favourite_creators';
export const FAVOURITES_EVENT_NAME = 'reachly:favourites_updated';

// In-memory cache for 0ms synchronous access
let memoryCache: string[] | null = null;
let activeFetchPromise: Promise<string[] | null> | null = null;

/**
 * Retrieve the current favourite creators synchronously.
 * Reads memory cache or localStorage.
 */
export function getStoredFavourites(): string[] {
  if (memoryCache !== null) {
    return memoryCache;
  }
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(FAVOURITES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          memoryCache = parsed;
          return memoryCache;
        }
      }
      // Check legacy session storage for initial migration
      const legacy = sessionStorage.getItem('reachly_fav_creators');
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy);
        if (Array.isArray(parsedLegacy)) {
          memoryCache = parsedLegacy;
          try {
            localStorage.setItem(FAVOURITES_STORAGE_KEY, JSON.stringify(parsedLegacy));
          } catch {}
          return memoryCache;
        }
      }
    } catch {
      // Fallback to empty array on parse or access error
    }
  }
  return [];
}

/**
 * Save favourites to storage and broadcast to all components in the current window.
 */
export function setStoredFavourites(list: string[], broadcast: boolean = true): void {
  const uniqueList = Array.from(new Set((list || []).map(s => String(s).trim()).filter(Boolean)));
  memoryCache = uniqueList;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(FAVOURITES_STORAGE_KEY, JSON.stringify(uniqueList));
      // Keep legacy sessionStorage updated for backward compatibility
      sessionStorage.setItem('reachly_fav_creators', JSON.stringify(uniqueList));
    } catch {}

    if (broadcast) {
      try {
        window.dispatchEvent(
          new CustomEvent(FAVOURITES_EVENT_NAME, {
            detail: { favourites: uniqueList },
          })
        );
      } catch {}
    }
  }
}

/**
 * Fetch the latest favourite creators from /api/user/favourite-creators.
 * If authenticated, updates storage and broadcasts to all listening components.
 */
export async function fetchFavourites(): Promise<string[] | null> {
  if (activeFetchPromise) {
    return activeFetchPromise;
  }

  activeFetchPromise = (async () => {
    try {
      const res = await fetch('/api/user/favourite-creators', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        const list: string[] = data.favouriteCreators || [];
        setStoredFavourites(list, true);
        return list;
      }
      return null;
    } catch {
      return null;
    } finally {
      activeFetchPromise = null;
    }
  })();

  return activeFetchPromise;
}

/**
 * Optimistically toggle favourite status for a creator username.
 * Instantly broadcasts the new state, calls the server API, and rolls back if unauthorized or failed.
 */
export async function toggleFavouriteApi(username: string): Promise<{
  success: boolean;
  isFavourite: boolean;
  favourites: string[];
  requiresAuth?: boolean;
}> {
  const target = String(username || '').trim();
  if (!target) {
    const current = getStoredFavourites();
    return { success: false, isFavourite: false, favourites: current };
  }

  const current = getStoredFavourites();
  const wasFav = current.includes(target);
  const nextFav = !wasFav;

  // 1. Optimistic Update (instant UI feedback everywhere)
  const optimistic = wasFav
    ? current.filter((u) => u !== target)
    : [...current, target];
  setStoredFavourites(optimistic, true);

  // 2. Network Call
  try {
    const res = await fetch('/api/user/favourite-creators', {
      method: wasFav ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: target }),
    });

    if (res.status === 401) {
      // Revert optimistic update
      setStoredFavourites(current, true);
      return {
        success: false,
        isFavourite: wasFav,
        favourites: current,
        requiresAuth: true,
      };
    }

    if (!res.ok) {
      // Revert optimistic update
      setStoredFavourites(current, true);
      return { success: false, isFavourite: wasFav, favourites: current };
    }

    const data = await res.json();
    const serverList: string[] = Array.isArray(data.favouriteCreators)
      ? data.favouriteCreators
      : optimistic;
    setStoredFavourites(serverList, true);
    return {
      success: true,
      isFavourite: serverList.includes(target),
      favourites: serverList,
    };
  } catch (err) {
    // Revert optimistic update on exception
    setStoredFavourites(current, true);
    return { success: false, isFavourite: wasFav, favourites: current };
  }
}

/**
 * Subscribe to favourites updates across all components in this window and across browser tabs.
 */
export function subscribeFavourites(callback: (favourites: string[]) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleCustomEvent = (event: Event) => {
    const customEvent = event as CustomEvent<{ favourites: string[] }>;
    if (customEvent.detail && Array.isArray(customEvent.detail.favourites)) {
      callback(customEvent.detail.favourites);
    }
  };

  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key === FAVOURITES_STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        if (Array.isArray(parsed)) {
          memoryCache = parsed;
          callback(parsed);
        }
      } catch {}
    }
  };

  window.addEventListener(FAVOURITES_EVENT_NAME, handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener(FAVOURITES_EVENT_NAME, handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
}
