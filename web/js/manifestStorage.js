// manifestStorage.js
const MANIFEST_LINKS_KEY ='storedManifestLinks';

/**
 * Save the given manifest link to local storage.
 */
export function storeManifestLink(manifestLink) {
    let manifestLinks = getStoredManifestLinks();

    if (!manifestLinks.includes(manifestLink)) {
        manifestLinks.push(manifestLink);
    }

    // save updated links array to local storage
    localStorage.setItem(MANIFEST_LINKS_KEY, JSON.stringify(manifestLinks));
}

export function getStoredManifestLinks() {
    // get the stored links from local storage, or return an empty array if none are found
    const manifestLinks = localStorage.getItem(MANIFEST_LINKS_KEY);
    return manifestLinks ? JSON.parse(manifestLinks) : [];
}