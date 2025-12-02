const RECENTLY_USED_KEY = 'recentlyUsedTools';

/**
 * Retrieve recently used tools from local storage.
 */
export function getRecentlyUsedTools() {
    const recentTools = localStorage.getItem(RECENTLY_USED_KEY);
    return recentTools ? JSON.parse(recentTools) : [];
}

/** 
 * Save recently used tools to local storage.
 */
export function saveRecentlyUsedTools(recentTools) {
    localStorage.setItem(RECENTLY_USED_KEY, JSON.stringify(recentTools));
}