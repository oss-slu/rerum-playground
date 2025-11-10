const MANIFEST_LINKS_KEY = 'storedManifestLinks';
const MANIFEST_OBJECTS_KEY = 'storedManifests';

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

/**
 * Save a manifest object to local storage and register a link for it.
 * Returns the data URL used as the link.
 */
export function saveManifest(manifest) {
    const json = JSON.stringify(manifest, null, 2);
    // create a data URL so it can be opened in a new tab
    const dataUrl = 'data:application/json;charset=utf-8,' + encodeURIComponent(json);

    // store the manifest JSON keyed by the dataUrl (so we can retrieve if needed)
    let stored = getStoredManifestObjects();
    stored[dataUrl] = json;
    localStorage.setItem(MANIFEST_OBJECTS_KEY, JSON.stringify(stored));

    // also store the link in the manifest links list for quick access
    storeManifestLink(dataUrl);

    return dataUrl;
}

/**
 * Return an object mapping stored data URLs to manifest JSON strings.
 */
export function getStoredManifestObjects() {
    const stored = localStorage.getItem(MANIFEST_OBJECTS_KEY);
    return stored ? JSON.parse(stored) : {};
}

/**
 * Return an array of { link, json } for stored manifests to simplify UI use.
 */
export function getStoredManifests() {
    const links = getStoredManifestLinks();
    const objs = getStoredManifestObjects();
    return links.map(link => ({ link, json: objs[link] || null }));
}