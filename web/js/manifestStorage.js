// manifestStorage.js

// Key shared by annotator + manifest generator
const MANIFEST_LINKS_KEY = 'storedManifestLinks';

// RERUM sandbox create endpoint (same as annotator)
const RERUM_SANDBOX_CREATE = 'https://tinydev.rerum.io/app/create';

/**
 * Get array of stored manifest links from localStorage.
 */
export function getStoredManifestLinks() {
  const manifestLinks = localStorage.getItem(MANIFEST_LINKS_KEY);
  return manifestLinks ? JSON.parse(manifestLinks) : [];
}

/**
 * Save the given manifest link to localStorage (deduplicated).
 */
export function storeManifestLink(manifestLink) {
  if (!manifestLink) return;

  let manifestLinks = getStoredManifestLinks();

  if (!manifestLinks.includes(manifestLink)) {
    manifestLinks.push(manifestLink);
  }

  localStorage.setItem(MANIFEST_LINKS_KEY, JSON.stringify(manifestLinks));
}

/**
 * Save a IIIF Manifest to the RERUM sandbox and return its URI.
 * Also stores the URI in localStorage via storeManifestLink.
 *
 * @param {object} manifest - IIIF Manifest object (Presentation API 3)
 * @returns {Promise<string>} - The URI of the stored manifest in RERUM
 */
export async function saveManifest(manifest) {
  let response;
  try {
    response = await fetch(RERUM_SANDBOX_CREATE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(manifest)
    });
  } catch (err) {
    throw new Error(`Network or fetch error while saving to RERUM: ${err.message}`);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`RERUM save failed: ${response.status} ${response.statusText} ${text}`);
  }

  const raw = await response.json(); // full RERUM response

  // Some RERUM endpoints return new_obj_state; prefer that, otherwise use raw.
  const stored = raw.new_obj_state || raw;

  // Try to determine the URI robustly
  const uri =
    stored.id ||
    stored['@id'] ||
    raw['@id'] ||
    response.headers.get('location');

  if (!uri) {
    throw new Error('RERUM did not return a URI for the stored manifest.');
  }

  // Reuse: keep this URI in the same list the annotator uses
  storeManifestLink(uri);

  return uri;
}